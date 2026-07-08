# CLAUDE.md — Hotel Management & Booking API (v5 — + Wallet/Top-up & Multi Payment Method)

> Panduan kerja REST API Node.js + Express (tugas kelompok). Versi ini melanjutkan v4 (Discount/Voucher) dengan menambahkan **sistem Wallet (saldo internal) + Top-up**, **pilihan metode pembayaran saat booking** (`wallet` atau `midtrans`), serta **matriks peran** yang menjelaskan siapa boleh apa di seluruh sistem.

---

## 0. Ringkasan Cepat (TL;DR)

| Kebutuhan | Solusi |
|---|---|
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Auth | JWT + bcryptjs + Role-based Authorization |
| Validasi | Joi |
| Upload file | Multer → opsional Cloudinary |
| Payment / 3rd party wajib | Midtrans Snap API (pay-per-use, signature-verified, idempotent webhook) |
| **Saldo internal** | **Wallet per-user + ledger `WalletTransaction`, diisi lewat Top-up Midtrans** |
| **Metode bayar booking** | **`wallet` (potong saldo, atomik) atau `midtrans` (Snap token seperti biasa)** |
| 3rd party tambahan | Cloudinary / OpenWeatherMap |
| Dokumentasi API | Swagger + Postman Collection |
| Migration & Seeder | `migrate-mongo` + `seeders/` |
| Hosting | Render/Railway + MongoDB Atlas + health-check |
| Kreasi tambahan | Docker, CI/CD, Automated Testing (+cadangan) |
| Discount / Voucher | Master `Voucher` (percentage/fixed) diterapkan saat `POST /bookings`, validasi & pemakaian kuota dilakukan atomik |
| Base URL | `http://localhost:3000/api/v1` (lokal) / `https://<app>.onrender.com/api/v1` (production) |

---

## 1. Project Overview

- **Name**: Hotel Management & Booking API
- **Description**: REST API marketplace booking hotel. Hotel Manager daftar hotel & tipe kamar, Customer cari & booking kamar, bayar via saldo Wallet atau Midtrans langsung, check-in/check-out via QR Code.
- **Roles**: `Admin`, `HotelManager`, `Customer`
- **Version**: v5.0.0
- **Base URL**: `/api/v1`
- **Auth Header**: `Authorization: Bearer <token>` (semua endpoint kecuali yang ditandai **Public**)

---

## 2. Tech Stack

| Kategori | Pilihan |
|---|---|
| Runtime | Node.js (LTS) |
| Framework | Express.js |
| Database | MongoDB (Atlas) |
| ODM | Mongoose |
| Auth | JWT + bcryptjs |
| Validasi | Joi |
| Upload file | Multer |
| Payment | Midtrans Snap API (booking langsung + top-up wallet) |
| Dokumentasi | swagger-jsdoc + swagger-ui-express |
| Keamanan | helmet, cors, express-rate-limit |
| QR Code | `qrcode` |
| Testing | Jest + Supertest |
| Migration | `migrate-mongo` |
| Scheduler | `node-cron` (auto-expire booking & auto-expire top-up pending) |

---

## 3. Rekomendasi 3rd Party API

### 3.1 Wajib — Midtrans Snap API

Midtrans dipakai untuk **dua jenis transaksi**, dibedakan dari prefix `order_id` di satu webhook yang sama (`POST /payments/webhook`):

| Prefix `order_id` | Transaksi | Efek saat `settlement` |
|---|---|---|
| `BK-...` | Pembayaran booking langsung (metode `midtrans`) | Status booking → `confirmed` |
| `TOPUP-...` | Top-up saldo Wallet | Saldo Wallet user bertambah (atomik) |

Flow booking (metode `midtrans`): Booking dibuat (kuota dikurangi atomik) → Snap token dibuat → Customer bayar → webhook masuk dengan **signature diverifikasi** dan **idempotency check** → status booking diperbarui → kalau gagal/expired, kuota dikembalikan. Auto-expire lewat cron job kalau 30 menit belum ada pembayaran.

Flow top-up (lihat Bab 4.4 & Bab 16.11 untuk detail): Customer/HotelManager minta top-up jumlah tertentu → Snap token dibuat dengan `order_id: TOPUP-...` → bayar → webhook `settlement` → saldo Wallet bertambah atomik → auto-expire kalau 30 menit belum bayar (status `topup_expired`, tidak mempengaruhi saldo).

### 3.2 Opsional (kreasi)

| API | Fungsi |
|---|---|
| Cloudinary | Simpan foto hotel/kamar/profil di cloud |
| OpenWeatherMap | Cuaca kota hotel di halaman detail |

---

## 4. Payment Model

1. **Pay-per-use via Midtrans langsung** — 1 booking = 1 transaksi Midtrans (metode `midtrans`).
2. **Pay via Wallet (saldo internal)** — booking dipotong langsung dari saldo user (metode `wallet`), tanpa perlu redirect ke Midtrans. Lihat Bab 4.4 & Bab 16.6.
3. **Subscription (opsional)** — Hotel Manager: `FREE` (maks 2 hotel) vs `PRO` (unlimited + featured). Pembayaran subscription juga bisa lewat Wallet atau Midtrans langsung, mengikuti pola yang sama seperti booking.
4. **Cancel/Refund**:
   - Cancel sebelum bayar → otomatis, kuota kamar (dan kuota voucher jika dipakai) balik.
   - Cancel setelah bayar via `midtrans` (sebelum check-in) → status `refund_requested` → Admin proses lewat `PUT /bookings/:id/refund`, dana **dikreditkan ke Wallet Customer** (bukan transfer manual), tercatat sebagai `WalletTransaction` bertipe `refund`.
   - Cancel setelah bayar via `wallet` (sebelum check-in) → saldo otomatis dikembalikan ke Wallet Customer secara atomik (tanpa perlu proses Admin, karena dana memang berasal dari Wallet).
5. **Discount/Voucher**: opsional saat booking, mengurangi `totalAmount` sebelum dikirim ke Midtrans **atau** sebelum dipotong dari saldo Wallet — berlaku untuk kedua metode pembayaran. Lihat Bab 11.7 & Bab 16.3/16.6 untuk detail aturan dan endpoint.

### 4.4 Wallet & Top-up (baru di v5)

- Setiap user (`Customer` maupun `HotelManager`) memiliki satu dokumen `Wallet` (dibuat otomatis saat pertama kali diakses — lazy create/upsert).
- Saldo **tidak pernah** diubah langsung; semua perubahan (`topup`, `payment`, `refund`, `adjustment`) dicatat sebagai baris di `WalletTransaction` (ledger) dan saldo di-update via `$inc` atomik, sehingga saldo `Wallet.balance` selalu bisa direkonsiliasi dari total ledger.
- Top-up **hanya** bisa lewat Midtrans (tidak ada metode top-up lain di versi ini). Booking dan subscription bisa dibayar dari saldo hasil top-up ini.
- Saldo tidak boleh negatif — pemotongan saldo untuk pembayaran memakai pola atomik `findOneAndUpdate` dengan syarat `balance >= amount` (sama filosofinya dengan pengurangan kuota kamar di Bab 11.5), supaya aman dari race condition kalau user melakukan 2 booking bersamaan dari 2 device.

---

## 5. Commands

```bash
npm install
npm run dev
npm start

node seeders/index.js
npx migrate-mongo up
npx migrate-mongo down
npx migrate-mongo create <nama>

npm test
docker-compose up --build
```

---

## 6. Project Structure

```text
[root]/
  .github/workflows/ci.yml
  migrations/
  seeders/
  src/
    config/            # database, midtrans, cloudinary, swagger
    controllers/        # authController, userController, categoryController,
                          # hotelController, roomController, bookingController,
                          # paymentController, reviewController, healthController,
                          # voucherController, walletController
    middlewares/         # authMiddleware, roleMiddleware, uploadMiddleware,
                           # validateMiddleware, errorHandler, rateLimiter, requestId
    models/              # User, Category, Hotel, Booking, Review, Voucher,
                           # Wallet, WalletTransaction
    routes/               # 1 file routing per resource + index.js (termasuk
                           # voucherRoutes.js, walletRoutes.js)
    services/             # midtransService, emailService, qrService, bookingExpiryJob,
                           # voucherService.js (validasi & hitung diskon),
                           # walletService.js (potong/tambah saldo, buat ledger),
                           # topupExpiryJob.js
    utils/                 # response.js, generateToken.js, pagination.js
    validations/            # authValidation, hotelValidation, bookingValidation,
                             # voucherValidation, walletValidation
    app.js
    server.js
  public/uploads/
  tests/
  .env.example
  Dockerfile
  docker-compose.yml
  package.json
```

---

## 7. Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hotel_db
JWT_SECRET=ganti_dengan_string_acak_panjang
JWT_EXPIRES_IN=1d
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_IS_PRODUCTION=false
BOOKING_EXPIRY_MINUTES=30
TOPUP_EXPIRY_MINUTES=30
WALLET_MIN_TOPUP=10000
WALLET_MAX_TOPUP=10000000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=app_password_gmail
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 8. Naming Conventions

```text
Controllers   : camelCase   -> hotelController.js, walletController.js
Routes        : camelCase   -> hotelRoutes.js, walletRoutes.js
Models        : PascalCase  -> User.js, Hotel.js, Booking.js, Wallet.js, WalletTransaction.js
Variabel      : camelCase   -> hotelData, isPaid, walletBalance
Konstanta     : UPPER_SNAKE -> JWT_SECRET, WALLET_MIN_TOPUP
Fungsi        : camelCase   -> generateToken, checkRoomAvailability, deductWalletBalance
Model (DB)    : PascalCase  -> User, Hotel, Booking, Review, Wallet, WalletTransaction
Koleksi (DB)  : snake_case jamak -> users, hotels, bookings, reviews, wallets, wallet_transactions
```

---

## 9. HTTP Status Code Standar

| Code | Kapan dipakai |
|---|---|
| 200 OK | Berhasil ambil/update data |
| 201 Created | Berhasil membuat data baru |
| 400 Bad Request | Validasi Joi gagal / kuota penuh / saldo tidak cukup |
| 401 Unauthorized | Token tidak ada/expired/invalid |
| 403 Forbidden | Role tidak sesuai / bukan pemilik resource |
| 404 Not Found | Data tidak ditemukan |
| 409 Conflict | Data duplikat / state booking atau top-up tidak valid untuk aksi ini |
| 429 Too Many Requests | Kena rate limit |
| 500 Internal Server Error | Error server tak terduga |

---

## 10. Format Response Umum

**Sukses (single):**
```json
{ "success": true, "message": "Deskripsi sukses", "data": { } }
```

**Sukses (list + pagination):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data",
  "data": [ ],
  "meta": { "page": 1, "limit": 10, "totalData": 42, "totalPages": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [ { "field": "email", "message": "Email wajib diisi" } ]
}
```

---

## 11. Database, ODM, Migration & Seeder

1. Dilarang raw query, selalu Mongoose.
2. Embedded documents: `room_types` di `Hotel`, `details` di `Booking`.
3. **Soft delete**: `Hotel`, `Room`(dalam Hotel), `Booking` punya `isDeleted` + `deletedAt`. `DELETE` = update flag, bukan hapus dokumen. `Wallet` dan `WalletTransaction` **tidak** pakai soft delete (ledger keuangan tidak boleh dihapus sama sekali, hanya bisa ditambah baris baru bertipe `adjustment` kalau ada koreksi).
4. **Index**: `Hotel.city`, `Hotel.category`, `Hotel.room_types.pricePerNight`, `User.email` (unique), `Booking.status`, `Wallet.userId` (unique), `WalletTransaction.userId`, `WalletTransaction.referenceId`.
5. **Atomic quota update** (race-condition safe):
```javascript
const hotel = await Hotel.findOneAndUpdate(
  { _id: hotelId, "room_types._id": roomTypeId, "room_types.available_quota": { $gte: qty } },
  { $inc: { "room_types.$.available_quota": -qty } },
  { new: true }
);
if (!hotel) return next(new ApiError(400, "Kuota kamar tidak mencukupi"));
```
6. **Auto-expire booking**: cron tiap 5 menit, cari `status: 'pending_payment'` & `expiresAt < now`, ubah `expired`, kembalikan kuota (`$inc` positif). Kalau booking yang expired tadi pakai voucher, kuota voucher (`usedCount`) juga dikembalikan (`$inc: -1`). Kalau booking yang expired tadi dibayar dari `wallet` (jarang terjadi karena wallet biasanya instan, tapi tetap dijaga) saldo yang sudah terpotong dikembalikan.
7. **Voucher — model & aturan**:
   - Field utama: `code` (unik, uppercase), `type` (`percentage` | `fixed`), `value`, `maxDiscount` (khusus `percentage`, batas potongan maksimal), `minTransaction`, `quota` (total kupon bisa dipakai), `usedCount`, `startDate`, `expiredDate`, `hotelId` (opsional — `null` = berlaku global/semua hotel, diisi = hanya untuk hotel tsb, cocok untuk voucher promo milik Hotel Manager tertentu), `isActive`, `isDeleted`.
   - **Validasi saat dipakai** (di `voucherService.validateVoucher`): kode ada & `isActive: true` & belum `isDeleted` → tanggal sekarang di antara `startDate`–`expiredDate` → `usedCount < quota` → `subtotal >= minTransaction` → kalau `hotelId` diisi, harus cocok dengan hotel yang dibooking.
   - **Atomic usage increment** (race-condition safe, sama polanya dengan kuota kamar):
```javascript
const voucher = await Voucher.findOneAndUpdate(
  { code, isActive: true, isDeleted: false, startDate: { $lte: now }, expiredDate: { $gte: now }, $expr: { $lt: ["$usedCount", "$quota"] } },
  { $inc: { usedCount: 1 } },
  { new: true }
);
if (!voucher) return next(new ApiError(400, "Voucher tidak valid, kadaluarsa, atau kuota habis"));
```
   - Perhitungan diskon: `type: 'percentage'` → `discount = min(subtotal * value / 100, maxDiscount)`; `type: 'fixed'` → `discount = value` (tidak boleh melebihi `subtotal`). `totalAmount = subtotal - discount`, dan `totalAmount` inilah yang dikirim ke Midtrans **atau** dipotong dari saldo Wallet, tergantung `paymentMethod` yang dipilih.
8. **Wallet — model & aturan (baru di v5)**:
   - `Wallet`: `userId` (unique, ref `User`), `balance` (default `0`, tidak boleh negatif), `updatedAt`.
   - `WalletTransaction` (ledger, immutable): `userId`, `type` (`topup` | `payment` | `refund` | `adjustment`), `amount` (selalu positif, arah ditentukan oleh `type`), `balanceBefore`, `balanceAfter`, `referenceId` (id booking / id top-up / id refund terkait), `status` (`pending` | `success` | `failed` | `expired`), `createdAt`.
   - **Atomic top-up increment** (dipanggil dari webhook saat `order_id` berprefix `TOPUP-` dan status `settlement`):
```javascript
const wallet = await Wallet.findOneAndUpdate(
  { userId },
  { $inc: { balance: amount } },
  { new: true, upsert: true }
);
await WalletTransaction.findOneAndUpdate(
  { referenceId: topupId },
  { status: "success", balanceAfter: wallet.balance },
  { new: true }
);
```
   - **Atomic deduction saat bayar pakai `wallet`** (mencegah saldo negatif akibat race condition, pola sama seperti kuota kamar & voucher):
```javascript
const wallet = await Wallet.findOneAndUpdate(
  { userId, balance: { $gte: totalAmount } },
  { $inc: { balance: -totalAmount } },
  { new: true }
);
if (!wallet) return next(new ApiError(400, "Saldo wallet tidak mencukupi"));
```
   - Refund (dari cancel booking atau `PUT /bookings/:id/refund`) selalu masuk lewat pola `$inc` positif yang sama, dicatat sebagai `WalletTransaction` bertipe `refund`.
9. **Migration** (`migrate-mongo`): index unik `email`, index gabungan `city+category`, index `status` booking, index unik `Voucher.code`, index unik `Wallet.userId`, index `WalletTransaction.userId` + `WalletTransaction.referenceId`.
10. **Seeder**: categories → users (Admin, HotelManager, Customer) → hotels + room types → beberapa voucher contoh (1 global, 1 khusus hotel tertentu) → wallet awal tiap user (saldo `0`) + 1-2 contoh `WalletTransaction` bertipe `topup` berstatus `success` untuk keperluan demo.

---

## 12. Security & Validation Rules

- Password `bcryptjs` (salt ≥ 10).
- JWT di header `Authorization: Bearer <token>`.
- Role middleware `authorize([...])` + ownership check (Hotel Manager cuma bisa edit hotel miliknya sendiri, Customer cuma bisa lihat booking & wallet miliknya sendiri).
- Semua `req.body` divalidasi Joi, termasuk `walletValidation` untuk jumlah top-up (`WALLET_MIN_TOPUP` ≤ amount ≤ `WALLET_MAX_TOPUP`).
- Rate limit di endpoint auth, booking, dan top-up (mencegah spam Snap token).
- Helmet + CORS (whitelist origin per environment).
- Webhook Midtrans: verifikasi signature SHA512 + idempotency check by `transaction_id` — berlaku untuk **kedua** jenis transaksi (`BK-` dan `TOPUP-`) di satu handler webhook yang sama.
- Saldo Wallet tidak pernah ditulis langsung dari input user (`balance` bukan field yang bisa di-PUT); satu-satunya jalan mengubah saldo adalah lewat webhook top-up, potongan pembayaran, atau refund — semuanya lewat `walletService` dan tercatat di ledger.
- Tidak expose stack trace di production.

---

## 13. API Documentation

Swagger di `/api-docs`, Postman Collection di `docs/postman_collection.json`, dipisah folder per role (Admin / HotelManager / Customer), termasuk folder khusus **Wallet & Top-up**.

---

## 14. File Upload (Multer)

- Foto hotel/kamar/profil: `.jpg/.jpeg/.png`, max 2MB.
- `multer.memoryStorage()` (kalau lanjut Cloudinary) atau `diskStorage` (`public/uploads/`).

---

## 15. Pembagian Tugas Kelompok

| Anggota | Modul | Endpoint utama |
|---|---|---|
| A | Auth & User Master | register, login, profile, CRUD category |
| B | Hotel Master & Voucher | CRUD hotel, CRUD voucher |
| C | Room Type & Review | CRUD room type, availability, review |
| D | Booking, Payment & Wallet | booking (+apply voucher, pilih paymentMethod), cancel, refund, webhook (booking & top-up), cron expiry, check-in/out, wallet & top-up |

---

## 15bis. Matriks Peran & Izin (Role & Permission Matrix)

Ringkasan siapa boleh melakukan apa, supaya alur otorisasi di seluruh sistem jelas dalam satu tempat (detail per-endpoint tetap ada di Bab 16):

| Resource / Aksi | Admin | HotelManager | Customer |
|---|---|---|---|
| Kelola Category (CRUD) | Penuh | Read-only | Read-only |
| Kelola Hotel & Room Type | Penuh (semua hotel) | Hanya hotel miliknya sendiri | Read-only |
| Kelola Voucher | Penuh, voucher global | Hanya voucher miliknya, terikat 1 hotel | Read-only (via `GET /vouchers/validate`) |
| Booking | Lihat semua (untuk keperluan support) | Lihat booking di hotel miliknya | Buat, lihat, batalkan booking miliknya sendiri |
| Refund booking | Bisa proses refund (`PUT /bookings/:id/refund`) | Tidak bisa | Bisa minta cancel/refund untuk booking miliknya |
| Check-in / Check-out | Tidak relevan | Bisa (staff hotel) | Tidak bisa |
| Review | Tidak menulis, bisa moderasi (opsional) | Tidak menulis | Bisa menulis untuk booking `checked_out` miliknya |
| Wallet & Top-up | Punya wallet sendiri (mis. untuk keperluan internal), bisa lihat wallet siapa saja untuk audit | Punya wallet sendiri, dipakai bayar subscription `PRO` | Punya wallet sendiri, dipakai bayar booking |
| Webhook Payment | Tidak diakses lewat JWT (Public + signature Midtrans) | — | — |
| Health-check | Public | Public | Public |

Aturan umum: setiap role hanya bisa melihat/mengubah data miliknya sendiri kecuali `Admin`, yang punya akses lintas-tenant untuk keperluan moderasi dan audit (termasuk melihat wallet & ledger user lain, tapi tetap **tidak bisa** mengubah saldo secara manual — perubahan saldo tetap harus lewat `walletService` supaya ledger konsisten).

---

## 16. API Endpoint Reference (Task Breakdown + Request/Response Lengkap)

> Semua URL diawali `/api/v1`. Format tabel: **Method — Path** lalu detail Auth/Role, Request, Response.

### 16.1 Modul Auth

#### ✅ `POST /auth/register`
- **Auth**: Public
- **Deskripsi**: Registrasi user baru (Customer atau Hotel Manager). Wallet dengan saldo `0` otomatis dibuat untuk user baru.
- **Request Body**:
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!",
  "phone": "081234567890",
  "role": "Customer"
}
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": "665f1c2e...",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "Customer"
  }
}
```
- **Error**: `400` email/password tidak valid (Joi) · `409` email sudah terdaftar

#### ✅ `POST /auth/login`
- **Auth**: Public
- **Request Body**:
```json
{ "email": "budi@example.com", "password": "Password123!" }
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "665f1c2e...", "name": "Budi Santoso", "role": "Customer" }
  }
}
```
- **Error**: `400` field kosong · `401` email/password salah

#### ✅ `GET /users/profile`
- **Auth**: Wajib (semua role)
- **Response 200**:
```json
{
  "success": true,
  "message": "Berhasil mengambil profil",
  "data": {
    "id": "665f1c2e...", "name": "Budi Santoso", "email": "budi@example.com",
    "role": "Customer", "phone": "081234567890", "avatarUrl": null
  }
}
```
- **Error**: `401` token invalid/expired

#### ✅ `PUT /users/profile`
- **Auth**: Wajib (semua role)
- **Content-Type**: `multipart/form-data` (kalau sertakan foto)
- **Request Body**:
```json
{ "name": "Budi S.", "phone": "081298765432" }
```
(field `avatar` = file, opsional)
- **Response 200**:
```json
{ "success": true, "message": "Profil berhasil diperbarui", "data": { "id": "665f1c2e...", "name": "Budi S.", "avatarUrl": "https://.../avatar.jpg" } }
```
- **Error**: `400` validasi gagal / format file salah

---

### 16.2 Modul Category (CRUD Master #1)

#### ✅ `GET /categories`
- **Auth**: Public
- **Query**: `?page=1&limit=10&search=resort`
- **Response 200**: list + `meta` (lihat Bab 10)

#### ✅ `GET /categories/:id`
- **Auth**: Public
- **Response 200**: `{ "success": true, "data": { "id": "...", "name": "Resort", "description": "..." } }`
- **Error**: `404` tidak ditemukan

#### ✅ `POST /categories`
- **Auth**: `Admin`
- **Request Body**: `{ "name": "Resort", "description": "Hotel tepi pantai" }`
- **Response 201**: `{ "success": true, "message": "Kategori berhasil dibuat", "data": { "id": "...", "name": "Resort" } }`
- **Error**: `400` nama kosong · `403` bukan Admin · `409` nama sudah ada

#### ✅ `PUT /categories/:id`
- **Auth**: `Admin`
- **Request Body**: `{ "name": "Resort & Villa" }`
- **Response 200**: data ter-update
- **Error**: `404` tidak ditemukan

#### ✅ `DELETE /categories/:id`
- **Auth**: `Admin`
- **Response 200**: `{ "success": true, "message": "Kategori berhasil dihapus" }`
- **Error**: `404` tidak ditemukan · `409` masih dipakai oleh hotel aktif (opsional validasi)

---

### 16.3 Modul Voucher (CRUD Master #2 — Discount)

#### ✅ `GET /vouchers`
- **Auth**: `Admin`, `HotelManager` (hanya lihat voucher miliknya + voucher global)
- **Query**: `?page=1&limit=10&isActive=true`
- **Response 200**: list + `meta`
```json
{
  "success": true,
  "data": [
    { "id": "668c...", "code": "HEMAT50K", "type": "fixed", "value": 50000, "minTransaction": 300000, "quota": 100, "usedCount": 12, "expiredDate": "2026-12-31", "hotelId": null, "isActive": true }
  ],
  "meta": { "page": 1, "limit": 10, "totalData": 5, "totalPages": 1 }
}
```

#### ✅ `GET /vouchers/:id`
- **Auth**: `Admin`, `HotelManager` (pemilik)
- **Response 200**: detail 1 voucher
- **Error**: `404` tidak ditemukan

#### ✅ `POST /vouchers`
- **Auth**: `Admin` (voucher global) atau `HotelManager` (voucher untuk hotel miliknya sendiri)
- **Request Body (percentage)**:
```json
{
  "code": "DISKON20",
  "type": "percentage",
  "value": 20,
  "maxDiscount": 100000,
  "minTransaction": 500000,
  "quota": 50,
  "startDate": "2026-07-01",
  "expiredDate": "2026-08-31",
  "hotelId": null
}
```
- **Request Body (fixed, khusus 1 hotel)**:
```json
{
  "code": "MAWAR50K",
  "type": "fixed",
  "value": 50000,
  "minTransaction": 300000,
  "quota": 100,
  "startDate": "2026-07-01",
  "expiredDate": "2026-12-31",
  "hotelId": "666a..."
}
```
- **Response 201**: `{ "success": true, "message": "Voucher berhasil dibuat", "data": { "id": "668c...", "code": "DISKON20" } }`
- **Error**: `400` validasi Joi gagal (mis. `percentage` tanpa `maxDiscount`) · `403` HotelManager coba buat voucher untuk hotel orang lain · `409` kode voucher sudah ada

#### ✅ `PUT /vouchers/:id`
- **Auth**: `Admin`, `HotelManager` (pemilik)
- **Request Body**: `{ "quota": 150, "isActive": false }`
- **Response 200**: data ter-update
- **Error**: `403` bukan pemilik · `404` tidak ditemukan

#### ✅ `DELETE /vouchers/:id`
- **Auth**: `Admin`, `HotelManager` (pemilik)
- **Response 200**: `{ "success": true, "message": "Voucher berhasil dihapus" }` (soft delete)
- **Error**: `403` bukan pemilik · `404` tidak ditemukan

#### ✅ `GET /vouchers/validate`
- **Auth**: `Customer` (dipanggil dari halaman checkout sebelum submit booking, opsional tapi bagus untuk UX)
- **Query**: `?code=DISKON20&hotelId=666a...&subtotal=900000`
- **Response 200 (valid)**:
```json
{
  "success": true,
  "message": "Voucher valid",
  "data": { "code": "DISKON20", "type": "percentage", "discountAmount": 100000, "finalAmount": 800000 }
}
```
- **Response 200 (tidak valid, tetap 200 karena ini sifatnya pengecekan bukan error sistem)**:
```json
{ "success": false, "message": "Voucher sudah kadaluarsa" }
```
- **Error**: `404` kode voucher tidak ditemukan

---

### 16.4 Modul Hotel (CRUD Master #3)

#### ✅ `POST /hotels`
- **Auth**: `HotelManager`, `Admin`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
```json
{
  "name": "Hotel Mawar Indah",
  "description": "Hotel bintang 3 di pusat kota",
  "address": "Jl. Merdeka No.10",
  "city": "Surabaya",
  "categoryId": "665f...",
  "room_types": [
    { "name": "Deluxe", "pricePerNight": 450000, "totalQuota": 10, "capacity": 2 }
  ]
}
```
(field `photos` = file[], opsional)
- **Response 201**:
```json
{
  "success": true,
  "message": "Hotel berhasil dibuat",
  "data": {
    "id": "666a...", "name": "Hotel Mawar Indah", "city": "Surabaya",
    "room_types": [ { "id": "666a...r1", "name": "Deluxe", "pricePerNight": 450000, "available_quota": 10 } ]
  }
}
```
- **Error**: `400` validasi Joi gagal · `403` bukan HotelManager/Admin · `409` (jika `FREE` plan sudah 2 hotel)

#### ✅ `GET /hotels`
- **Auth**: Public
- **Query**: `?page=1&limit=10&city=Surabaya&category=Resort&minPrice=200000&maxPrice=1000000&sort=-rating`
- **Response 200**: list + `meta`
```json
{
  "success": true,
  "data": [
    { "id": "666a...", "name": "Hotel Mawar Indah", "city": "Surabaya", "rating": 4.5, "startingPrice": 450000, "thumbnail": "https://..." }
  ],
  "meta": { "page": 1, "limit": 10, "totalData": 23, "totalPages": 3 }
}
```

#### ✅ `GET /hotels/:id`
- **Auth**: Public
- **Response 200**: detail hotel lengkap + `room_types[]` + rata-rata rating
- **Error**: `404` tidak ditemukan / sudah dihapus (soft delete)

#### ✅ `PUT /hotels/:id`
- **Auth**: `HotelManager` (pemilik hotel saja) atau `Admin`
- **Request Body**: field yang mau diubah, contoh `{ "description": "Update deskripsi" }`
- **Response 200**: data ter-update
- **Error**: `403` bukan pemilik hotel · `404` tidak ditemukan

#### ✅ `DELETE /hotels/:id`
- **Auth**: `HotelManager` (pemilik) atau `Admin`
- **Response 200**: `{ "success": true, "message": "Hotel berhasil dihapus" }` (soft delete: `isDeleted=true`)
- **Error**: `403` bukan pemilik · `409` masih ada booking aktif (opsional validasi)

---

### 16.5 Modul Room Type (CRUD Master #4)

#### ✅ `POST /hotels/:hotelId/rooms`
- **Auth**: `HotelManager` (pemilik hotel), `Admin`
- **Request Body**:
```json
{ "name": "Suite", "pricePerNight": 800000, "totalQuota": 5, "capacity": 4, "facilities": ["AC", "TV", "Wifi"] }
```
- **Response 201**: room type baru ter-embed di hotel
- **Error**: `400` validasi gagal · `403` bukan pemilik · `404` hotel tidak ditemukan

#### ✅ `GET /hotels/:hotelId/rooms`
- **Auth**: Public
- **Response 200**: list tipe kamar dalam hotel tsb

#### ✅ `PUT /hotels/:hotelId/rooms/:roomId`
- **Auth**: `HotelManager` (pemilik), `Admin`
- **Request Body**: `{ "pricePerNight": 850000 }`
- **Response 200**: data ter-update
- **Error**: `404` room/hotel tidak ditemukan

#### ✅ `DELETE /hotels/:hotelId/rooms/:roomId`
- **Auth**: `HotelManager` (pemilik), `Admin`
- **Response 200**: `{ "success": true, "message": "Tipe kamar berhasil dihapus" }`
- **Error**: `409` masih ada booking aktif untuk tipe kamar ini

---

### 16.6 Modul Booking (Transaksi Header-Detail #1)

#### ✅ `POST /bookings`
- **Auth**: `Customer`
- **Deskripsi**: Membuat booking baru. Kuota kamar dikurangi **atomik** (Bab 11.5). Kalau `voucherCode` disertakan, sistem validasi & pakai kuota voucher secara atomik juga (Bab 11.7), lalu hitung `discountAmount`. Field baru `paymentMethod` menentukan cara bayar:
  - `"wallet"` → saldo Wallet dipotong atomik sejumlah `totalAmount` (Bab 11.8). Kalau saldo cukup, booking langsung `status: "confirmed"`, tidak perlu Snap token/webhook.
  - `"midtrans"` → alur seperti v4: `status: "pending_payment"`, `expiresAt` di-set `now + BOOKING_EXPIRY_MINUTES`, dan Snap token dibuat.
- **Request Body** (`voucherCode` opsional, `paymentMethod` wajib):
```json
{
  "hotelId": "666a...",
  "checkInDate": "2026-08-10",
  "checkOutDate": "2026-08-12",
  "details": [
    { "roomTypeId": "666a...r1", "quantity": 1 }
  ],
  "voucherCode": "DISKON20",
  "paymentMethod": "midtrans"
}
```
- **Response 201 (paymentMethod: "midtrans")**:
```json
{
  "success": true,
  "message": "Booking berhasil dibuat, silakan lakukan pembayaran",
  "data": {
    "id": "667b...",
    "bookingCode": "BK-20260708-0001",
    "status": "pending_payment",
    "paymentMethod": "midtrans",
    "checkInDate": "2026-08-10",
    "checkOutDate": "2026-08-12",
    "details": [ { "roomTypeName": "Deluxe", "pricePerNight": 450000, "quantity": 1, "nights": 2, "subtotal": 900000 } ],
    "subtotal": 900000,
    "voucherCode": "DISKON20",
    "discountAmount": 100000,
    "totalAmount": 800000,
    "expiresAt": "2026-07-08T10:30:00.000Z",
    "payment": { "snapToken": "66f2...", "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66f2..." }
  }
}
```
- **Response 201 (paymentMethod: "wallet")**:
```json
{
  "success": true,
  "message": "Booking berhasil dibuat dan dibayar dari saldo Wallet",
  "data": {
    "id": "667c...",
    "bookingCode": "BK-20260708-0002",
    "status": "confirmed",
    "paymentMethod": "wallet",
    "subtotal": 900000,
    "voucherCode": "DISKON20",
    "discountAmount": 100000,
    "totalAmount": 800000,
    "walletBalanceAfter": 1200000
  }
}
```
- **Error**: `400` tanggal tidak valid / kuota kamar tidak mencukupi / voucher tidak valid-kadaluarsa-kuota habis-tidak berlaku untuk hotel ini / **saldo wallet tidak mencukupi (khusus `paymentMethod: "wallet"`)** · `404` hotel/room type/voucher tidak ditemukan

> Catatan: kalau booking di-cancel/expired **setelah** memakai voucher, kuota voucher (`usedCount`) juga otomatis dikembalikan (lihat Bab 11.6). Kalau booking dibayar dari `wallet` lalu di-cancel, saldo juga otomatis dikembalikan (lihat Bab 4 poin 4 & Bab 11.8).

#### ✅ `GET /bookings/my-bookings`
- **Auth**: `Customer`
- **Query**: `?page=1&limit=10&status=confirmed`
- **Response 200**: list booking milik user yang login + `meta`

#### ✅ `GET /bookings/:id`
- **Auth**: `Customer` (pemilik booking) atau `HotelManager`/`Admin`
- **Response 200**: detail booking lengkap (termasuk `paymentMethod`)
- **Error**: `403` bukan pemilik booking · `404` tidak ditemukan

#### ✅ `PUT /bookings/:id/cancel`
- **Auth**: `Customer` (pemilik booking)
- **Deskripsi**: Cancel booking. Kalau `pending_payment` → kuota langsung dikembalikan otomatis. Kalau sudah `confirmed` dan `paymentMethod: "wallet"` → saldo langsung dikembalikan otomatis, status jadi `cancelled`. Kalau sudah `confirmed` dan `paymentMethod: "midtrans"` → status jadi `refund_requested` (lihat `PUT /bookings/:id/refund`).
- **Response 200**: `{ "success": true, "message": "Booking berhasil dibatalkan", "data": { "status": "cancelled" } }`
- **Error**: `403` bukan pemilik · `409` booking sudah `checked_in`/`checked_out`, tidak bisa dibatalkan

#### ✅ `PUT /bookings/:id/refund`
- **Auth**: `Admin`
- **Deskripsi**: Memproses booking berstatus `refund_requested` (hasil bayar via `midtrans`). Dana dikreditkan ke Wallet Customer secara atomik (Bab 11.8), dicatat sebagai `WalletTransaction` bertipe `refund`, status booking jadi `refunded`.
- **Response 200**:
```json
{
  "success": true,
  "message": "Refund berhasil diproses ke Wallet Customer",
  "data": { "bookingId": "667b...", "status": "refunded", "refundAmount": 800000 }
}
```
- **Error**: `403` bukan Admin · `404` booking tidak ditemukan · `409` booking bukan status `refund_requested`

---

### 16.7 Modul Payment (Midtrans Webhook)

#### ✅ `POST /payments/webhook`
- **Auth**: Public (tapi diverifikasi via signature Midtrans, bukan JWT)
- **Deskripsi**: Dipanggil otomatis oleh Midtrans setiap ada perubahan status transaksi. Signature diverifikasi (SHA512), dan `transaction_id` dicek supaya tidak diproses dobel (idempotent). Handler membaca prefix `order_id` untuk menentukan alur:
  - `BK-...` → update status booking (lihat Bab 3.1).
  - `TOPUP-...` → tambah saldo Wallet secara atomik (lihat Bab 11.8) dan update `WalletTransaction` terkait jadi `success`.
- **Request Body (dari Midtrans, contoh untuk booking)**:
```json
{
  "order_id": "BK-20260708-0001",
  "transaction_id": "8b1e...",
  "transaction_status": "settlement",
  "status_code": "200",
  "gross_amount": "900000.00",
  "signature_key": "a1b2c3..."
}
```
- **Request Body (dari Midtrans, contoh untuk top-up)**:
```json
{
  "order_id": "TOPUP-20260708-0007",
  "transaction_id": "9c2f...",
  "transaction_status": "settlement",
  "status_code": "200",
  "gross_amount": "500000.00",
  "signature_key": "d4e5f6..."
}
```
- **Response 200**: `{ "success": true, "message": "Webhook diproses" }`
- **Error**: `400` signature tidak valid → tolak request · `200` (tapi no-op) kalau `transaction_id` sudah pernah diproses

---

### 16.8 Modul Review (Nilai Tambahan)

#### ✅ `POST /hotels/:hotelId/reviews`
- **Auth**: `Customer` (hanya yang bookingnya `status: checked_out` di hotel tsb)
- **Request Body**: `{ "bookingId": "667b...", "rating": 5, "comment": "Kamar bersih, staff ramah" }`
- **Response 201**: review baru + rating rata-rata hotel ter-update
- **Error**: `403` belum pernah menginap di hotel ini · `409` sudah pernah review untuk booking ini

#### ✅ `GET /hotels/:hotelId/reviews`
- **Auth**: Public
- **Query**: `?page=1&limit=10`
- **Response 200**: list review + `meta`

---

### 16.9 Modul Check-in / Check-out (Nilai Tambahan)

#### ✅ `POST /bookings/:id/check-in`
- **Auth**: `HotelManager`/staff hotel
- **Deskripsi**: Scan QR Code booking, ubah status `confirmed` → `checked_in`
- **Request Body**: `{ "qrCode": "BK-20260708-0001-QR" }`
- **Response 200**: `{ "success": true, "message": "Check-in berhasil", "data": { "status": "checked_in" } }`
- **Error**: `409` booking belum dibayar / sudah check-in sebelumnya

#### ✅ `POST /bookings/:id/check-out`
- **Auth**: `HotelManager`/staff hotel
- **Response 200**: `{ "success": true, "message": "Check-out berhasil", "data": { "status": "checked_out" } }`
- **Error**: `409` belum check-in

---

### 16.10 Modul Health-Check (Nilai Tambahan)

#### ✅ `GET /health`
- **Auth**: Public
- **Deskripsi**: Untuk uptime monitoring (UptimeRobot dsb)
- **Response 200**: `{ "success": true, "message": "OK", "data": { "uptime": 12345, "dbStatus": "connected" } }`

---

### 16.11 Modul Wallet & Top-up (Baru di v5)

#### ✅ `GET /wallet`
- **Auth**: Wajib (`Customer`, `HotelManager`; `Admin` bisa lihat wallet siapa saja lewat `?userId=`)
- **Deskripsi**: Melihat saldo wallet milik sendiri (dibuat otomatis dengan saldo `0` kalau belum pernah ada).
- **Response 200**:
```json
{
  "success": true,
  "message": "Berhasil mengambil data wallet",
  "data": { "userId": "665f1c2e...", "balance": 1200000, "updatedAt": "2026-07-08T09:00:00.000Z" }
}
```
- **Error**: `401` token invalid

#### ✅ `GET /wallet/transactions`
- **Auth**: Wajib (pemilik wallet), `Admin` untuk audit
- **Query**: `?page=1&limit=10&type=topup&status=success`
- **Response 200**: list ledger + `meta`
```json
{
  "success": true,
  "data": [
    { "id": "669d...", "type": "topup", "amount": 500000, "balanceBefore": 700000, "balanceAfter": 1200000, "referenceId": "TOPUP-20260708-0007", "status": "success", "createdAt": "2026-07-08T09:00:00.000Z" },
    { "id": "669e...", "type": "payment", "amount": 800000, "balanceBefore": 2000000, "balanceAfter": 1200000, "referenceId": "667c...", "status": "success", "createdAt": "2026-07-08T08:30:00.000Z" }
  ],
  "meta": { "page": 1, "limit": 10, "totalData": 2, "totalPages": 1 }
}
```

#### ✅ `POST /wallet/topup`
- **Auth**: Wajib (`Customer`, `HotelManager`)
- **Deskripsi**: Meminta top-up saldo sejumlah `amount` (dibatasi `WALLET_MIN_TOPUP`–`WALLET_MAX_TOPUP`). Membuat `WalletTransaction` berstatus `pending` + Snap token Midtrans dengan `order_id: TOPUP-...`. Saldo baru bertambah **setelah** webhook `settlement` diterima (Bab 16.7), bukan langsung di response ini.
- **Request Body**:
```json
{ "amount": 500000 }
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Permintaan top-up dibuat, silakan lakukan pembayaran",
  "data": {
    "topupId": "TOPUP-20260708-0007",
    "amount": 500000,
    "status": "pending",
    "expiresAt": "2026-07-08T09:30:00.000Z",
    "payment": { "snapToken": "77g3...", "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/77g3..." }
  }
}
```
- **Error**: `400` `amount` di luar batas min/maks

#### ✅ `PUT /wallet/topup/:topupId/cancel`
- **Auth**: Wajib (pemilik top-up)
- **Deskripsi**: Membatalkan permintaan top-up yang masih `pending` (belum dibayar). Tidak mempengaruhi saldo karena saldo memang belum bertambah.
- **Response 200**: `{ "success": true, "message": "Top-up dibatalkan", "data": { "status": "cancelled" } }`
- **Error**: `409` top-up sudah `success`/`expired`, tidak bisa dibatalkan

> Catatan: auto-expire top-up jalan lewat cron yang sama semangatnya dengan auto-expire booking (Bab 11.6) — top-up `pending` yang lewat `TOPUP_EXPIRY_MINUTES` diubah jadi `topup_expired`, tanpa efek ke saldo.

---

## 17. Nilai Kreasi Tambahan (Target: 3, +15 poin — dengan cadangan)

1. **Docker & docker-compose** (+5)
2. **CI/CD GitHub Actions** (+5)
3. **Automated Testing (Jest + Supertest)** (+5) — termasuk test race condition (kuota kamar, voucher, **saldo wallet**) & webhook idempotency (booking & top-up)

**Cadangan**: Rating & review, auto-expire booking & top-up, health-check + uptime monitoring, structured logging (Winston + request-id).

---

## 18. Deployment / Hosting

| Komponen | Layanan |
|---|---|
| Backend API | Render / Railway |
| Database | MongoDB Atlas (free M0) |
| File storage | Cloudinary (opsional) |
| Uptime monitoring | UptimeRobot → ping `GET /api/v1/health` |

---

## 19. Checklist Mapping Nilai

| Kriteria | Poin | Status |
|---|---|---|
| GET/POST/PUT/DELETE | 10 | ✅ Bab 16 |
| HTTP code & error handling | 5 | ✅ Bab 9 |
| 3rd party API | 10 | ✅ Midtrans (booking + top-up) |
| Authentication & Authorization | 10 | ✅ Bab 15bis |
| Payment model | 10 | ✅ Bab 4 (Midtrans + Wallet) |
| API documentation | 10 | ✅ Swagger + Postman |
| Upload file (Multer) | 10 | ✅ |
| Input validation (Joi) | 5 | ✅ |
| Hosting | 5 | ✅ |
| Migration & Seeder | 10 | ✅ |
| **Subtotal wajib** | **85** | |
| Kreasi tambahan | 15 | ✅ |
| **Total** | **100** | |
| CRUD Master | - | ✅ Category, Voucher, Hotel, Room Type |
| Transaksi header-detail | - | ✅ Booking, Wallet Top-up |
| ODM wajib | - | ✅ |
| Endpoint per anggota (min 4/orang) | - | ✅ Bab 15 |

---

## 20. Roadmap Pengerjaan

1. Setup project + Atlas — hari 1
2. Auth + role middleware — hari 1-2
3. CRUD Category, Voucher, Hotel, Room Type + Joi + pagination + index — hari 2-3
4. Upload file — hari 3
5. Wallet: model + ledger + atomic deduction/increment (`walletService`) — hari 3-4
6. Booking: atomic quota update + embed detail + apply voucher (atomic usage + hitung diskon) + pilihan `paymentMethod` (`wallet`/`midtrans`) — hari 4
7. Midtrans + webhook tunggal untuk booking (`BK-`) dan top-up (`TOPUP-`), signature + idempotent, `totalAmount` setelah diskon — hari 4-5
8. Auto-expire booking & auto-expire top-up (cron) — hari 5
9. Refund ke Wallet (`PUT /bookings/:id/refund`) — hari 5
10. Review, QR check-in/out, email — hari 5-6
11. Migration + Seeder (termasuk wallet & contoh ledger) — hari 6
12. Swagger + Postman (isi sesuai Bab 16, termasuk folder Wallet & Top-up) — hari 6-7
13. Docker + CI/CD + Testing (termasuk race condition wallet) — hari 7
14. Deploy + health-check + review checklist Bab 19 sebelum submit

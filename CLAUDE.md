# CLAUDE.md — Hotel Management & Booking API

> Important Note: This `CLAUDE.md` is written to guide building a Node.js + Express REST API project for a university assignment. Always prioritize security, ODM (Mongoose) best practices, and the required project criteria.

---

## 1. Project Overview

- **Name** : Hotel Management & Booking API
- **Description** : REST API untuk platform booking hotel (seperti Traveloka/Agoda). Mendukung pendaftaran hotel dan tipe kamar oleh Hotel Manager, booking kamar oleh Customer, status pembayaran, serta check-in & check-out.
- **Goal** : Memenuhi semua kriteria web service (CRUD Master, Transaksi Header-Detail, NoSQL ODM) dengan performa tinggi.
- **Target Users**: Admin, Hotel Manager (Pihak Hotel), dan Customer (Tamu).
- **Version** : v1.0.0
- **Status** : Active development

---

## 2. Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : MongoDB (NoSQL)
- **ODM** : Mongoose
- **Authentication**: JWT (jsonwebtoken) & bcryptjs
- **Validation** : Joi
- **File Upload** : Multer
- **3rd Party API** : Midtrans (Payment Gateway) & Nodemailer (Email Notification)
- **Extra Libs** : qrcode, cors, helmet, morgan, express-rate-limit
- **Package Manager**: npm

---

## 3. Commands

```bash
# Development
npm run dev           # Jalankan dev server (nodemon)
npm start             # Jalankan production build

# Package Management
npm install [package] # Install package baru

# Database & Seeding
node seed.js          # Jalankan seeder database MongoDB (reset & input dummy)
```

---

## 4. Project Structure

Architecture: MVC / Layered Architecture untuk REST API

```text
[root]/
  src/
    config/         # Konfigurasi DB, Midtrans, dll (database.js)
    controllers/    # Logic utama API (Req/Res handling)
    middlewares/    # Auth, Role checker, Error handling, Multer, Validator
    models/         # Definisi schema database Mongoose (Role, User, Hotel, Booking, dll)
    routes/         # Definisi endpoint (Express Router)
    services/       # Business logic (opsional, misal untuk payment/email)
    utils/          # Helper (response format, generate token, qrcode)
    validations/    # Skema Joi untuk tiap input
    app.js          # Inisialisasi Express & Middleware
    server.js       # Entry point jalankan server
  public/
    uploads/        # Tempat menyimpan file upload (foto kamar/hotel/profil)
```

**Aturan Penempatan File:**
- Endpoint baru harus didaftarkan di `src/routes/`.
- Logic bisnis dan database queries selalu berada di `src/controllers/`.
- Schema database didefinisikan menggunakan Mongoose di `src/models/`.

---

## 5. Naming Conventions

```text
# File dan Folder
- Controllers   : camelCase contoh: authController.js, hotelController.js
- Routes        : camelCase contoh: authRoutes.js, hotelRoutes.js
- Models        : PascalCase contoh: User.js, Hotel.js, Booking.js
- Middlewares   : camelCase contoh: authMiddleware.js, uploadMiddleware.js

# Di dalam Kode
- Variabel      : camelCase contoh: hotelData, isPaid
- Konstanta     : UPPER_SNAKE contoh: JWT_SECRET, MONGODB_URI
- Fungsi        : camelCase contoh: generateToken, checkRoomAvailability
- Model (DB)    : PascalCase contoh: User, Hotel, Booking
- Koleksi (DB)  : snake_case (plural) contoh: users, hotels, bookings
```

---

## 6. Code Conventions

```text
# Pendekatan Coding
- Selalu gunakan try-catch di setiap Controller.
- Pindahkan logic validasi ke middleware terpisah (gunakan Joi).
- Hindari Callback Hell, selalu gunakan async/await.

# Standar HTTP Status Code
- 200 OK: Berhasil mengambil/mengupdate data.
- 201 Created: Berhasil membuat data baru (POST).
- 400 Bad Request: Gagal validasi Joi / Input salah.
- 401 Unauthorized: Token tidak ada / expired.
- 403 Forbidden: Role tidak sesuai (misal Customer akses menu Admin).
- 404 Not Found: Data (User/Hotel/Booking) tidak ditemukan.
- 500 Internal Server Error: Kesalahan server/database.
```

---

## 7. API Response & Error Handling

Selalu kembalikan format JSON yang konsisten di semua endpoint supaya mempermudah integrasi.

**Format Sukses:**
```javascript
res.status(200).json({
  success: true,
  message: "Deskripsi aksi sukses",
  data: { ... } // object atau array
});
```

**Format Error (Validation / Logic):**
```javascript
res.status(400).json({
  success: false,
  message: "Validation Error / Pesan spesifik",
  errors: [ ... ] // Opsional, array error field dari Joi
});
```

---

## 8. Database & ODM Rules (Mongoose)

1. **Wajib ODM**: Dilarang menulis raw query. Gunakan method Mongoose (`find`, `findOne`, `create`, `updateOne`, `deleteMany`, dll).
2. **Embedded Documents**: Tipe kamar (`room_types`) harus berada di dalam dokumen `Hotel` secara langsung, dan detail pemesanan (`details`) harus berada di dalam dokumen `Booking` secara langsung.
3. **Validasi Kuota Kamar**: Sebelum transaksi booking tersimpan, pastikan kuota kamar masih mencukupi (`booked_rooms < total_rooms`). Jika penuh, kembalikan status error 400.

---

## 9. Security & Validation Rules

- **Password**: Wajib di-hash menggunakan `bcryptjs` sebelum disimpan ke database (saat register/create user).
- **Auth**: Gunakan JWT. Simpan token di `Authorization: Bearer <token>`.
- **Role Control**: Buat middleware `authorize(['Admin', 'Hotel Manager'])` untuk membatasi akses endpoint tertentu.
- **Validasi Input**: Semua request `req.body` WAJIB divalidasi menggunakan Joi sebelum masuk ke database.

---

## 10. Features & Task Breakdown (Checklist)

Tandai dengan `[x]` jika sudah selesai. Jangan ubah fitur yang sudah `[x]`.

### Modul 1: Auth & Master Data (Statis)
- [ ] POST `/api/auth/register` (Joi validation, Hash password)
- [ ] POST `/api/auth/login` (Return JWT & Role)
- [ ] GET, PUT `/api/users/profile` (Update profil, Upload foto via Multer)
- [ ] CRUD `/api/categories` (Master Kategori Hotel)

### Modul 2: Hotel & Room Management
- [ ] POST `/api/hotels` (Buat hotel baru beserta tipe kamar awal, Auth: Hotel Manager/Admin)
- [ ] GET `/api/hotels` (Public, lihat semua hotel dengan filter kota & kategori)
- [ ] GET `/api/hotels/:id` (Detail hotel & tipe kamar di dalamnya)
- [ ] PUT `/api/hotels/:id` (Update data hotel/kamar)
- [ ] DELETE `/api/hotels/:id` (Hapus hotel)

### Modul 3: Room Type Management
- [ ] POST `/api/hotels/:hotelId/rooms` (Tambah tipe kamar baru pada hotel)
- [ ] PUT `/api/hotels/:hotelId/rooms/:roomId` (Update spesifikasi & harga kamar)
- [ ] DELETE `/api/hotels/:hotelId/rooms/:roomId` (Hapus tipe kamar dari hotel)

### Modul 4: Booking & Payment Gateway
- [ ] POST `/api/bookings` (Booking kamar, Cek ketersediaan kuota kamar, Embedded detail booking)
- [ ] GET `/api/bookings/my-bookings` (Riwayat booking Customer)
- [ ] Integrasi Midtrans API (Generate Payment Link/Token di booking)
- [ ] POST `/api/payments/webhook` (Update status booking otomatis dari Midtrans)

### Modul 5: Nilai Tambahan (Kreasi Ekstra)
- [ ] Generate QR Code check-in saat booking sukses dibayar
- [ ] POST `/api/bookings/check-in` (Proses check-in tamu oleh staff hotel menggunakan QR Code)
- [ ] POST `/api/bookings/check-out` (Proses check-out tamu & mengosongkan kembali kuota kamar)
- [ ] Kirim e-ticket check-in via Email (`nodemailer`) setelah bayar sukses
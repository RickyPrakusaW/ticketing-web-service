# CLAUDE.md — Event Ticketing Management API

> Important Note: This `CLAUDE.md` is written to guide Claude Code in building a Node.js + Express REST API project for a university assignment. Always prioritize security, ORM best practices, and the required project criteria.

---

## 1. Project Overview

- **Name** : Event Ticketing Management API
- **Description** : REST API untuk platform manajemen tiket event (seperti Loket.com). Mendukung sistem pay-per-use untuk customer dan subscription untuk organizer, lengkap dengan fitur QR Code dan E-ticket.
- **Goal** : Mendapatkan nilai maksimal (100) pada tugas web service dengan memenuhi semua kriteria wajib (CRUD Master, Transaksi Header-Detail, ORM) dan poin tambahan (3rd Party API, Email E-Ticket, QR Scan).
- **Target Users**: Admin, Organizer (Event Creator), dan Customer (Ticket Buyer).
- **Version** : v1.0.0
- **Status** : Active development

---

## 2. Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : MySQL
- **ORM** : Sequelize (dengan Sequelize CLI)
- **Authentication**: JWT (jsonwebtoken) & bcryptjs
- **Validation** : Joi
- **File Upload** : Multer
- **3rd Party API** : Midtrans (Payment Gateway) & Nodemailer/Mailgun (Email)
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

# Database & ORM (Sequelize CLI)
npx sequelize-cli db:migrate         # Jalankan migrasi database
npx sequelize-cli db:migrate:undo    # Undo migrasi terakhir
npx sequelize-cli db:seed:all        # Jalankan semua seeder
npx sequelize-cli db:seed:undo:all   # Undo semua seeder
npx sequelize-cli model:generate     # Generate model & migration baru
```

> **Catatan:** Selalu gunakan `npm` dan `npx`. Jangan gunakan `yarn` atau `pnpm`.

---

## 4. Project Structure

Architecture: MVC / Layered Architecture untuk REST API

```text
[root]/
  src/
    config/         # Konfigurasi DB, Midtrans, dll (database.js)
    controllers/    # Logic utama API (Req/Res handling)
    middlewares/    # Auth, Role checker, Error handling, Multer, Validator
    models/         # Definisi schema database Sequelize
    routes/         # Definisi endpoint (Express Router)
    services/       # Business logic (opsional, misal untuk payment/email)
    utils/          # Helper (response format, generate token, qrcode)
    validations/    # Skema Joi untuk tiap input
    app.js          # Inisialisasi Express & Middleware
    server.js       # Entry point jalankan server
  public/
    uploads/        # Tempat menyimpan file upload (poster/profile)
  migrations/       # File migrasi Sequelize (auto-generated)
  seeders/          # File seeder Sequelize (auto-generated)
```

**Aturan Penempatan File:**
- Endpoint baru harus didaftarkan di `src/routes/`.
- Logic bisnis dan database queries selalu berada di `src/controllers/`.
- Schema tabel Wajib dibuat menggunakan migration CLI, jangan buat manual di SQL.
- JANGAN ubah konfigurasi di folder `models/index.js` bawaan Sequelize.

---

## 5. Naming Conventions

```text
# File dan Folder
- Controllers   : camelCase contoh: authController.js, userController.js
- Routes        : camelCase contoh: authRoutes.js, eventRoutes.js
- Models        : camelCase contoh: user.js, orderHeader.js
- Middlewares   : camelCase contoh: authMiddleware.js, uploadMiddleware.js

# Di dalam Kode
- Variabel      : camelCase contoh: userData, isPaid
- Konstanta     : UPPER_SNAKE contoh: JWT_SECRET, MIDTRANS_SERVER_KEY
- Fungsi        : camelCase contoh: generateToken, checkStock
- Model (DB)    : PascalCase contoh: User, OrderDetail, TicketType
- Tabel (DB)    : snake_case (plural) contoh: users, order_details

# Git Branch
- Fitur baru    : feat/[nama-fitur]
- Bug fix       : fix/[nama-bug]
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
- 404 Not Found: Data (User/Event/Order) tidak ditemukan.
- 500 Internal Server Error: Kesalahan server/database.
```

---

## 7. API Response & Error Handling

Selalu kembalikan format JSON yang konsisten di semua endpoint supaya mempermudah pengecekan dan sesuai kriteria dosen.

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

## 8. Database & ORM Rules (Sequelize)

1. **Wajib ORM**: Dilarang menulis raw SQL query (`SELECT * FROM...`). Gunakan method Sequelize (`findAll`, `findOne`, `create`, `update`, `destroy`).
2. **Migration & Seeder**: Setiap ada perubahan tabel, WAJIB buat file migration baru. Jangan ubah database langsung via phpMyAdmin/DBeaver.
3. **Transaksi Master-Detail**: Saat membuat Order (Checkout), WAJIB gunakan `sequelize.transaction()` untuk memastikan `order_headers` dan `order_details` tersimpan bersamaan atau di-rollback jika error.
4. **Validasi Stok**: Sebelum insert transaksi, selalu cek kuota/stok tiket. Jika `quantity > quota - sold`, return error 400.

---

## 9. Security & Validation Rules

- **Password**: Wajib di-hash menggunakan `bcryptjs` sebelum disimpan ke database (saat register/create user).
- **Auth**: Gunakan JWT. Simpan token di `Authorization: Bearer <token>`.
- **Role Control**: Buat middleware `authorize(['Admin', 'Organizer'])` untuk membatasi akses endpoint tertentu.
- **Validasi Input**: Semua request `req.body` WAJIB divalidasi menggunakan Joi sebelum masuk ke database.

---

## 10. Git Rules

- Setiap kali Claude Code selesai membuat 1 endpoint atau 1 fitur, **langsung commit** sebelum lanjut ke pekerjaan lain.
- Format commit: `feat: add register logic and joi validation` atau `fix: resolve order transaction rollback`.
- **DILARANG** commit file `.env` atau folder `node_modules`.

---

## 11. Features & Task Breakdown (Checklist)

Tandai dengan `[x]` jika sudah selesai. Jangan ubah fitur yang sudah `[x]`.

### Modul 1: Auth & Master Data (Statis)
- [ ] POST `/api/auth/register` (Joi validation, Hash password)
- [ ] POST `/api/auth/login` (Return JWT & Role)
- [ ] GET, PUT `/api/users/profile` (Update profil, Upload foto via Multer)
- [ ] CRUD `/api/categories` (Master Data)
- [ ] CRUD `/api/venues` (Master Data)

### Modul 2: Event Management & File Upload
- [ ] POST `/api/events` (Upload Poster via Multer, Auth: Organizer)
- [ ] GET `/api/events` (Public, lihat event aktif)
- [ ] GET `/api/events/:id` (Detail event & jenis tiketnya)
- [ ] PUT `/api/events/:id` (Update event info)
- [ ] DELETE `/api/events/:id` (Hapus event)

### Modul 3: Ticket Types & Organizer Subscriptions
- [ ] CRUD `/api/ticket-types` (Master Data tiket dalam sebuah event)
- [ ] GET `/api/subscriptions/plans` (Lihat paket langganan Organizer)
- [ ] POST `/api/subscriptions/subscribe` (Organizer langganan paket)

### Modul 4: Transaksi (Header-Detail) & Payment Gateway
- [ ] POST `/api/orders` (Checkout tiket, Header-Detail Transaction, Cek Kuota)
- [ ] GET `/api/orders/my-tickets` (Riwayat pembelian Customer)
- [ ] Integrasi Midtrans API (Generate Payment Link/Token di order)
- [ ] POST `/api/payments/webhook` (Update status order otomatis dari Midtrans)

### Modul 5: Nilai Tambahan (Kreasi Ekstra)
- [ ] Generate QR Code (`qrcode`) saat tiket sukses dibayar
-[ ] POST `/api/tickets/check-in` (Validasi QR Code di venue)
- [ ] Kirim E-Ticket via Email (`nodemailer`) setelah bayar sukses

---

## 12. Do Not (SANGAT PENTING)

- **JANGAN** membuat tabel database secara manual tanpa file migration Sequelize.
- **JANGAN** menulis string koneksi database langsung di dalam controller. Gunakan file konfigurasi `.env`.
- **JANGAN** mengembalikan password user di response JSON mana pun.
- **JANGAN** pernah bypass validasi Joi jika user memasukkan data (seperti email/password) saat registrasi.
- **JANGAN** ubah struktur `order_headers` dan `order_details` menjadi satu tabel. Ini syarat wajib dosen (Header-Detail).
- Jika ada prompt yang ambigu tentang arsitektur, **TANYA DULU**. Jangan berasumsi.

---

## 13. Environment Variables (.env)

Selalu minta nilai ini ke file `.env` dan gunakan `process.env.NAMA_VAR`.

# Server & Environment
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database Access
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ticketing_event_db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Nodemailer (Email - Opsional untuk nilai tambahan)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailmu@gmail.com
SMTP_PASS=app_password
```
```

### Penjelasan Perubahan yang Saya Lakukan:
1. **Pembersihan Frontend:** Saya membuang aturan tentang Tailwind, Server vs Client Component (Next.js), dan React Hooks. Karena API ini murni Backend (Node.js/Express).
2. **Standar Kode Express & Sequelize:** Saya menambahkan aturan spesifik seperti pengunaan *try-catch*, `sequelize.transaction()` (syarat utama tugasmu), validasi Joi, dan struktur folder MVC (Controller, Route, Middleware).
3. **Format Standar API Response:** Saya mendefinisikan format response JSON `{ success, message, data }` yang menjadi standar industri dan pasti akan disukai dosenmu karena rapi.
4. **Checklist Sesuai Tugas:** Saya memasukkan rincian 5 modul dari catatan pembagian tugasmu agar Claude Code nantinya tahu fitur mana yang harus dikerjakan secara sistematis tanpa bertabrakan.
# CLAUDE.md — Event Ticketing Management API

> Important Note: This `CLAUDE.md` is written to guide Claude Code in building a Node.js + Express REST API project for a university assignment. Always prioritize security, ORM best practices, and the required project criteria.

---

## 1. Project Overview

- **Name** : Event Ticketing Management API
- **Description** : REST API untuk platform manajemen tiket event (seperti Loket.com). Mendukung sistem pay-per-use untuk customer dan subscription untuk organizer, lengkap dengan fitur QR Code dan E-ticket.
- **Goal** : Mendapatkan nilai maksimal (100) pada tugas web service dengan memenuhi semua kriteria wajib (CRUD Master, Transaksi Header-Detail, ORM) dan poin tambahan (3rd Party API, Email E-Ticket, QR Scan).
- **Target Users**: Admin, Organizer (Event Creator), dan Customer (Ticket Buyer).
- **Version** : v1.0.0
- **Status** : Active development

---

## 2. Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : MySQL
- **ORM** : Sequelize (dengan Sequelize CLI)
- **Authentication**: JWT (jsonwebtoken) & bcryptjs
- **Validation** : Joi
- **File Upload** : Multer
- **3rd Party API** : Midtrans (Payment Gateway) & Nodemailer/Mailgun (Email)
- **Extra Libs** : qrcode, cors, helmet, morgan, express-rate-limit
- **Package Manager**: npm

---

## 3. Commands

# Development
npm run dev           # Jalankan dev server (nodemon)
npm start             # Jalankan production build

# Package Management
npm install [package] # Install package baru

# Database & ORM (Sequelize CLI)
npx sequelize-cli db:migrate         # Jalankan migrasi database
npx sequelize-cli db:migrate:undo    # Undo migrasi terakhir
npx sequelize-cli db:seed:all        # Jalankan semua seeder
npx sequelize-cli db:seed:undo:all   # Undo semua seeder
npx sequelize-cli model:generate     # Generate model & migration baru

**Catatan:** Selalu gunakan `npm` dan `npx`. Jangan gunakan `yarn` atau `pnpm`.



## 4. Project Structure

Architecture: MVC / Layered Architecture untuk REST API

[root]/
  src/
    config/         # Konfigurasi DB, Midtrans, dll (database.js)
    controllers/    # Logic utama API (Req/Res handling)
    middlewares/    # Auth, Role checker, Error handling, Multer, Validator
    models/         # Definisi schema database Sequelize
    routes/         # Definisi endpoint (Express Router)
    services/       # Business logic (opsional, misal untuk payment/email)
    utils/          # Helper (response format, generate token, qrcode)
    validations/    # Skema Joi untuk tiap input
    app.js          # Inisialisasi Express & Middleware
    server.js       # Entry point jalankan server
  public/
    uploads/        # Tempat menyimpan file upload (poster/profile)
  migrations/       # File migrasi Sequelize (auto-generated)
  seeders/          # File seeder Sequelize (auto-generated)

**Aturan Penempatan File:**
- Endpoint baru harus didaftarkan di `src/routes/`.
- Logic bisnis dan database queries selalu berada di `src/controllers/`.
- Schema tabel Wajib dibuat menggunakan migration CLI, jangan buat manual di SQL.
- JANGAN ubah konfigurasi di folder `models/index.js` bawaan Sequelize.



## 5. Naming Conventions


# File dan Folder
- Controllers   : camelCase contoh: authController.js, userController.js
- Routes        : camelCase contoh: authRoutes.js, eventRoutes.js
- Models        : camelCase contoh: user.js, orderHeader.js
- Middlewares   : camelCase contoh: authMiddleware.js, uploadMiddleware.js

# Di dalam Kode
- Variabel      : camelCase contoh: userData, isPaid
- Konstanta     : UPPER_SNAKE contoh: JWT_SECRET, MIDTRANS_SERVER_KEY
- Fungsi        : camelCase contoh: generateToken, checkStock
- Model (DB)    : PascalCase contoh: User, OrderDetail, TicketType
- Tabel (DB)    : snake_case (plural) contoh: users, order_details

# Git Branch
- Fitur baru    : feat/[nama-fitur]
- Bug fix       : fix/[nama-bug]



## 6. Code Conventions
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
- 404 Not Found: Data (User/Event/Order) tidak ditemukan.
- 500 Internal Server Error: Kesalahan server/database.


## 7. API Response & Error Handling

Selalu kembalikan format JSON yang konsisten di semua endpoint supaya mempermudah pengecekan dan sesuai kriteria dosen.

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

## 8. Database & ORM Rules (Sequelize)

1. **Wajib ORM**: Dilarang menulis raw SQL query (`SELECT * FROM...`). Gunakan method Sequelize (`findAll`, `findOne`, `create`, `update`, `destroy`).
2. **Migration & Seeder**: Setiap ada perubahan tabel, WAJIB buat file migration baru. Jangan ubah database langsung via phpMyAdmin/DBeaver.
3. **Transaksi Master-Detail**: Saat membuat Order (Checkout), WAJIB gunakan `sequelize.transaction()` untuk memastikan `order_headers` dan `order_details` tersimpan bersamaan atau di-rollback jika error.
4. **Validasi Stok**: Sebelum insert transaksi, selalu cek kuota/stok tiket. Jika `quantity > quota - sold`, return error 400.

---

## 9. Security & Validation Rules

- **Password**: Wajib di-hash menggunakan `bcryptjs` sebelum disimpan ke database (saat register/create user).
- **Auth**: Gunakan JWT. Simpan token di `Authorization: Bearer <token>`.
- **Role Control**: Buat middleware `authorize(['Admin', 'Organizer'])` untuk membatasi akses endpoint tertentu.
- **Validasi Input**: Semua request `req.body` WAJIB divalidasi menggunakan Joi sebelum masuk ke database.

---

## 10. Git Rules

- Setiap kali Claude Code selesai membuat 1 endpoint atau 1 fitur, **langsung commit** sebelum lanjut ke pekerjaan lain.
- Format commit: `feat: add register logic and joi validation` atau `fix: resolve order transaction rollback`.
- **DILARANG** commit file `.env` atau folder `node_modules`.

---

## 11. Features & Task Breakdown (Checklist)

Tandai dengan `[x]` jika sudah selesai. Jangan ubah fitur yang sudah `[x]`.

### Modul 1: Auth & Master Data (Statis)
- [ ] POST `/api/auth/register` (Joi validation, Hash password)
- [ ] POST `/api/auth/login` (Return JWT & Role)
- [ ] GET, PUT `/api/users/profile` (Update profil, Upload foto via Multer)
- [ ] CRUD `/api/categories` (Master Data)
- [ ] CRUD `/api/venues` (Master Data)

### Modul 2: Event Management & File Upload
- [ ] POST `/api/events` (Upload Poster via Multer, Auth: Organizer)
- [ ] GET `/api/events` (Public, lihat event aktif)
- [ ] GET `/api/events/:id` (Detail event & jenis tiketnya)
- [ ] PUT `/api/events/:id` (Update event info)
- [ ] DELETE `/api/events/:id` (Hapus event)

### Modul 3: Ticket Types & Organizer Subscriptions
- [ ] CRUD `/api/ticket-types` (Master Data tiket dalam sebuah event)
- [ ] GET `/api/subscriptions/plans` (Lihat paket langganan Organizer)
- [ ] POST `/api/subscriptions/subscribe` (Organizer langganan paket)

### Modul 4: Transaksi (Header-Detail) & Payment Gateway
- [ ] POST `/api/orders` (Checkout tiket, Header-Detail Transaction, Cek Kuota)
- [ ] GET `/api/orders/my-tickets` (Riwayat pembelian Customer)
- [ ] Integrasi Midtrans API (Generate Payment Link/Token di order)
- [ ] POST `/api/payments/webhook` (Update status order otomatis dari Midtrans)

### Modul 5: Nilai Tambahan (Kreasi Ekstra)
- [ ] Generate QR Code (`qrcode`) saat tiket sukses dibayar
-[ ] POST `/api/tickets/check-in` (Validasi QR Code di venue)
- [ ] Kirim E-Ticket via Email (`nodemailer`) setelah bayar sukses

---

## 12. Do Not (SANGAT PENTING)

- **JANGAN** membuat tabel database secara manual tanpa file migration Sequelize.
- **JANGAN** menulis string koneksi database langsung di dalam controller. Gunakan file konfigurasi `.env`.
- **JANGAN** mengembalikan password user di response JSON mana pun.
- **JANGAN** pernah bypass validasi Joi jika user memasukkan data (seperti email/password) saat registrasi.
- **JANGAN** ubah struktur `order_headers` dan `order_details` menjadi satu tabel. Ini syarat wajib dosen (Header-Detail).
- Jika ada prompt yang ambigu tentang arsitektur, **TANYA DULU**. Jangan berasumsi.

---

## 13. Environment Variables (.env)

Selalu minta nilai ini ke file `.env` dan gunakan `process.env.NAMA_VAR`.

# Server & Environment
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001

# Database Access
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ticketing_event_db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Nodemailer (Email - Opsional untuk nilai tambahan)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailmu@gmail.com
SMTP_PASS=app_password

### Penjelasan Perubahan yang Saya Lakukan:
1. **Pembersihan Frontend:** Saya membuang aturan tentang Tailwind, Server vs Client Component (Next.js), dan React Hooks. Karena API ini murni Backend (Node.js/Express).
2. **Standar Kode Express & Sequelize:** Saya menambahkan aturan spesifik seperti pengunaan *try-catch*, `sequelize.transaction()` (syarat utama tugasmu), validasi Joi, dan struktur folder MVC (Controller, Route, Middleware).
3. **Format Standar API Response:** Saya mendefinisikan format response JSON `{ success, message, data }` yang menjadi standar industri dan pasti akan disukai dosenmu karena rapi.
4. **Checklist Sesuai Tugas:** Saya memasukkan rincian 5 modul dari catatan pembagian tugasmu agar Claude Code nantinya tahu fitur mana yang harus dikerjakan secara sistematis tanpa bertabrakan.
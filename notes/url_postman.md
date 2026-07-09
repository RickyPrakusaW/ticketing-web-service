# Dokumentasi API - Modul Auth & Verifikasi OTP (Gmail SMTP)

Berikut adalah daftar endpoint API untuk registrasi, verifikasi OTP, pengiriman ulang OTP, dan login beserta contoh request dan response.

Semua request menggunakan header `Content-Type: application/json`.

---

## 1. Register User Baru
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/auth/register` (contoh: `http://localhost:3000/api/v1/auth/register`)
* **Deskripsi**: Mendaftarkan pengguna baru dengan status awal belum terverifikasi (`isVerified: false`). Sistem akan otomatis men-generate kode OTP 6 digit dan mengirimkannya ke email pendaftar via Gmail SMTP. **OTP berlaku selama 2 menit**.

### Request Body (JSON)
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!",
  "phone": "08123456789",
  "role": "Customer"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Registrasi berhasil. Silakan cek email Anda untuk kode OTP verifikasi.",
  "data": {
    "id": "665f1c2eb8c8a...",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "Customer",
    "isVerified": false,
    "otpExpiresAt": "2026-07-08T14:04:36.123Z"
  }
}
```

---

## 2. Verifikasi Kode OTP
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/auth/verify-otp`
* **Deskripsi**: Memverifikasi kode OTP yang dikirimkan ke email pengguna. Jika berhasil, status pengguna berubah menjadi aktif (`isVerified: true`).

### Request Body (JSON)
```json
{
  "email": "budi@example.com",
  "otpCode": "123456"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Akun berhasil diverifikasi. Silakan masuk (login).",
  "data": {
    "email": "budi@example.com",
    "isVerified": true
  }
}
```

### Response Gagal - OTP Salah (400 Bad Request)
```json
{
  "success": false,
  "message": "Kode OTP salah",
  "data": null
}
```

### Response Gagal - OTP Kedaluwarsa (400 Bad Request)
```json
{
  "success": false,
  "message": "Kode OTP telah kedaluwarsa, silakan minta kode OTP baru",
  "data": null
}
```

---

## 3. Kirim Ulang OTP (Resend OTP)
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/auth/resend-otp`
* **Deskripsi**: Men-generate ulang kode OTP baru yang **berlaku selama 2 menit** dan mengirimkannya kembali ke email pengguna. Pengguna tidak bisa melakukan spam permintaan kirim ulang sebelum masa berlaku OTP sebelumnya habis (respons 429 Too Many Requests).

### Request Body (JSON)
```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Kode OTP baru telah dikirim ke email Anda",
  "data": {
    "email": "budi@example.com",
    "isVerified": false,
    "otpExpiresAt": "2026-07-08T14:05:40.456Z"
  }
}
```

### Response Gagal - Password Salah (401 Unauthorized)
```json
{
  "success": false,
  "message": "Password salah",
  "data": null
}
```

### Response Gagal - Spam Resend (429 Too Many Requests)
```json
{
  "success": false,
  "message": "Silakan tunggu 112 detik lagi sebelum meminta OTP baru",
  "data": null
}
```

---

## 4. Login User
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/auth/login`
* **Deskripsi**: Masuk ke aplikasi menggunakan email dan password. User wajib terverifikasi OTP terlebih dahulu sebelum bisa login.

### Request Body (JSON)
```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "665f1c2eb8c8a...",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "Customer"
    }
  }
}
```

### Response Gagal - Akun Belum Terverifikasi (403 Forbidden)
```json
{
  "success": false,
  "message": "Akun Anda belum terverifikasi. Silakan verifikasi OTP terlebih dahulu.",
  "data": {
    "email": "budi@example.com",
    "isVerified": false
  }
}
```

### Response Gagal - Password Salah (401 Unauthorized)
```json
{
  "success": false,
  "message": "Password salah",
  "data": null
}
```

---

## 5. Get Profile User
* **Method**: `GET`
* **URL**: `{{BASE_URL}}/api/v1/users/profile`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Mengambil detail profil user yang sedang login menggunakan token JWT. Semua role diperbolehkan.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Berhasil mengambil profil",
  "data": {
    "id": "665f1c2eb8c8a...",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "Customer",
    "phone": null,
    "avatarUrl": null
  }
}
```

### Response Gagal - Token Invalid/Expired (401 Unauthorized)
```json
{
  "success": false,
  "message": "Token tidak valid atau telah kedaluwarsa",
  "data": null
}
```

---

## 6. Request Top-Up Saldo
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/wallets/topup`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Meminta pembuatan transaksi top-up saldo baru. Mengintegrasikan Midtrans Snap API untuk membuat token pembayaran. Jumlah minimal top-up adalah Rp10.000 dan maksimal Rp10.000.000.

### Request Body (JSON)
```json
{
  "amount": 100000
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Permintaan top-up dibuat, silakan lakukan pembayaran",
  "data": {
    "topupId": "TOPUP-20260708-1783525937387-3860",
    "amount": 100000,
    "status": "pending",
    "expiresAt": "2026-07-08T16:22:17.387Z",
    "payment": {
      "snapToken": "dbd362c9-374e-4b16-b2ac-808a94c92c7e",
      "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/dbd362c9-374e-4b16-b2ac-808a94c92c7e"
    }
  }
}
```

---

## 7. Get Wallet & History
* **Method**: `GET`
* **URL**: `{{BASE_URL}}/api/v1/wallets`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Mengambil saldo wallet saat ini beserta seluruh riwayat transaksi (mutasi ledger) diurutkan dari yang terbaru.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Berhasil mengambil data wallet",
  "data": {
    "user": {
      "id": "6a4e79f7d269611e25699002",
      "name": "Budi Santoso",
      "email": "budi@example.com"
    },
    "balance": 150000,
    "transactions": [
      {
        "id": "6a4e5f70d4bfaca2...",
        "type": "topup",
        "amount": 50000,
        "balanceBefore": 100000,
        "balanceAfter": 150000,
        "referenceId": "TOPUP-20260708-1783525937387-3860",
        "status": "success",
        "createdAt": "2026-07-08T15:47:44.000Z"
      }
    ]
  }
}
```

---

## 8. Midtrans Webhook (Notifikasi Status)
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/payments/webhook`
* **Headers**: *Public (Tidak membutuhkan JWT, dikirim langsung oleh Midtrans)*
* **Deskripsi**: Endpoint publik untuk menerima status transaksi dari Midtrans. Memvalidasi Signature Key (SHA-512) secara ketat. Mendukung penambahan saldo wallet secara atomik untuk prefix `TOPUP-`.

### Request Body (dari Midtrans - JSON)
```json
{
  "transaction_time": "2026-07-08 14:47:44",
  "transaction_status": "settlement",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "SHA512_hash_here",
  "payment_type": "credit_card",
  "order_id": "TOPUP-20260708-1783525937387-3860",
  "merchant_id": "M448140254",
  "gross_amount": "50000.00",
  "fraud_status": "accept"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 9. Cancel Top-Up
* **Method**: `PUT`
* **URL**: `{{BASE_URL}}/api/v1/wallets/topup/:topupId/cancel`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Membatalkan permintaan top-up yang berstatus pending.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Top-up dibatalkan",
  "data": {
    "status": "cancelled"
  }
}
```

---

## 10. Upload / Update Foto Profil (Avatar)
* **Method**: `PUT`
* **URL**: `{{BASE_URL}}/api/v1/users/profile/avatar`
* **Headers**: `Authorization: Bearer <token_jwt>`, `Content-Type: multipart/form-data`
* **Body (form-data)**: 
  * Key: `avatar` (type: File, value: select image file)
* **Deskripsi**: Mengunggah foto profil baru untuk pengguna yang sedang login. Format gambar yang didukung: JPEG, JPG, PNG, GIF, WEBP. Batas ukuran maksimal file adalah 2MB.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Foto profil berhasil diperbarui",
  "data": {
    "avatarUrl": "http://localhost:3000/public/uploads/avatar-665f1c2eb8c8a-1783528677770.jpg"
  }
}
```

### Response Gagal - File Tidak Dilampirkan (400 Bad Request)
```json
{
  "success": false,
  "message": "File gambar profile wajib dilampirkan",
  "data": null
}
```

### Response Gagal - Format Tidak Valid (400 Bad Request)
```json
{
  "success": false,
  "message": "Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan!"
}
```

### Response Gagal - Ukuran Melebihi Batas (400 Bad Request)
```json
{
  "success": false,
  "message": "Ukuran file gambar terlalu besar (maksimal 2MB)"
}
```

---

## 11. Hapus Foto Profil (Avatar)
* **Method**: `DELETE`
* **URL**: `{{BASE_URL}}/api/v1/users/profile/avatar`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Menghapus foto profil saat ini. Menyetel kembali `avatarUrl` menjadi `null` dan menghapus berkas gambarnya secara fisik dari direktori server.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Foto profil berhasil dihapus",
  "data": null
}
```

---

## 12. Hapus / Menonaktifkan Akun User (Soft Delete)
* **Method**: `DELETE`
* **URL**: `{{BASE_URL}}/api/v1/users/profile`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Deskripsi**: Menonaktifkan akun pengguna saat ini (soft delete). Menyetel `isDeleted` menjadi `true`. Setelah dihapus, pengguna tidak akan bisa melakukan login kembali.

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Akun profil Anda berhasil dinonaktifkan (dihapus)",
  "data": null
}
```




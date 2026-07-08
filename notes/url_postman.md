# Dokumentasi API - Modul Auth & Verifikasi OTP (Gmail SMTP)

Berikut adalah daftar endpoint API untuk registrasi, verifikasi OTP, pengiriman ulang OTP, dan login beserta contoh request dan response.

Semua request menggunakan header `Content-Type: application/json`.

---

## 1. Register User Baru
* **Method**: `POST`
* **URL**: `{{BASE_URL}}/api/v1/auth/register` (contoh: `http://localhost:3000/api/v1/auth/register`)
* **Deskripsi**: Mendaftarkan pengguna baru dengan status awal belum terverifikasi (`isVerified: false`). Sistem akan otomatis men-generate kode OTP 6 digit dan mengirimkannya ke email pendaftar via Gmail SMTP. **OTP berlaku selama 1 menit**.

### Request Body (JSON)
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!",
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
* **Deskripsi**: Men-generate ulang kode OTP baru yang **berlaku selama 1 menit** dan mengirimkannya kembali ke email pengguna.

### Request Body (JSON)
```json
{
  "email": "budi@example.com"
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

# Tabel Spesifikasi Endpoint API (URL & Skenario)

Dokumen ini berisi pemetaan lengkap seluruh endpoint API beserta skenario uji coba, parameter request, kode status HTTP, dan response yang diharapkan dalam bentuk tabel.

---

### 1. POST /api/v1/auth/register (Pendaftaran Akun Baru)

| Skenario | Request Body (JSON) | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | <pre>{<br>  "name": "Budi Santoso",<br>  "email": "budi@example.com",<br>  "password": "Password123!",<br>  "phone": "08123456789",<br>  "role": "Customer"<br>}</pre> | 201 | <pre>{<br>  "success": true,<br>  "message": "Registrasi berhasil...",<br>  "data": {<br>    "id": "665f1c2e...",<br>    "name": "Budi Santoso",<br>    "email": "budi@example.com",<br>    "role": "Customer",<br>    "isVerified": false,<br>    "otpExpiresAt": "2026-07-08T14:04..."<br>  }<br>}</pre> |

---

### 2. POST /api/v1/auth/verify-otp (Verifikasi OTP Gmail)

| Skenario | Request Body (JSON) | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | <pre>{<br>  "email": "budi@example.com",<br>  "otpCode": "123456"<br>}</pre> | 200 | <pre>{<br>  "success": true,<br>  "message": "Akun berhasil diverifikasi...",<br>  "data": {<br>    "email": "budi@example.com",<br>    "isVerified": true<br>  }<br>}</pre> |
| **Error (OTP Salah)** | <pre>{<br>  "email": "budi@example.com",<br>  "otpCode": "000000"<br>}</pre> | 400 | <pre>{<br>  "success": false,<br>  "message": "Kode OTP salah",<br>  "data": null<br>}</pre> |
| **Error (OTP Kedaluwarsa)** | <pre>{<br>  "email": "budi@example.com",<br>  "otpCode": "123456"<br>}</pre> | 400 | <pre>{<br>  "success": false,<br>  "message": "Kode OTP telah kedaluwarsa...",<br>  "data": null<br>}</pre> |

---

### 3. POST /api/v1/auth/resend-otp (Kirim Ulang OTP)

| Skenario | Request Body (JSON) | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "Password123!"<br>}</pre> | 200 | <pre>{<br>  "success": true,<br>  "message": "Kode OTP baru telah dikirim...",<br>  "data": {<br>    "email": "budi@example.com",<br>    "isVerified": false,<br>    "otpExpiresAt": "2026-07-08T14:05..."<br>  }<br>}</pre> |
| **Error (Password Salah)** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "WrongPassword!"<br>}</pre> | 401 | <pre>{<br>  "success": false,<br>  "message": "Password salah",<br>  "data": null<br>}</pre> |
| **Error (Spam Resend)** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "Password123!"<br>}</pre> | 429 | <pre>{<br>  "success": false,<br>  "message": "Silakan tunggu 112 detik lagi...",<br>  "data": null<br>}</pre> |

---

### 4. POST /api/v1/auth/login (Masuk Aplikasi)

| Skenario | Request Body (JSON) | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "Password123!"<br>}</pre> | 200 | <pre>{<br>  "success": true,<br>  "message": "Login berhasil",<br>  "data": {<br>    "token": "eyJhbGciOiJIUzI1Ni...",<br>    "user": {<br>      "id": "665f1c2e...",<br>      "name": "Budi Santoso",<br>      "email": "budi@example.com",<br>      "role": "Customer"<br>    }<br>  }<br>}</pre> |
| **Error (Belum Verifikasi)** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "Password123!"<br>}</pre> | 403 | <pre>{<br>  "success": false,<br>  "message": "Akun Anda belum terverifikasi...",<br>  "data": {<br>    "email": "budi@example.com",<br>    "isVerified": false<br>  }<br>}</pre> |
| **Error (Password Salah)** | <pre>{<br>  "email": "budi@example.com",<br>  "password": "WrongPassword!"<br>}</pre> | 401 | <pre>{<br>  "success": false,<br>  "message": "Password salah",<br>  "data": null<br>}</pre> |

---

### 5. GET /api/v1/users/profile (Mengambil Detail Profil User)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `GET`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>` | 200 | <pre>{<br>  "success": true,<br>  "message": "Berhasil mengambil profil",<br>  "data": {<br>    "id": "665f1c2e...",<br>    "name": "Budi Santoso",<br>    "email": "budi@example.com",<br>    "role": "Customer",<br>    "phone": "0812345...",<br>    "avatarUrl": null<br>  }<br>}</pre> |
| **Error (Token Expired/Invalid)** | **Method**: `GET`<br>**Headers**:<br>`Authorization: Bearer <invalid_token>` | 401 | <pre>{<br>  "success": false,<br>  "message": "Token tidak valid...",<br>  "data": null<br>}</pre> |

---

### 6. POST /api/v1/wallets/topup (Meminta Token Snap Pembayaran Top-Up)

| Skenario | Headers & Body | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Headers**:<br>`Authorization: Bearer <token_jwt>`<br>**Body (JSON)**:<br><pre>{<br>  "amount": 100000<br>}</pre> | 201 | <pre>{<br>  "success": true,<br>  "message": "Permintaan top-up dibuat...",<br>  "data": {<br>    "topupId": "TOPUP-20260708...",<br>    "amount": 100000,<br>    "status": "pending",<br>    "expiresAt": "2026-07-08T16:22...",<br>    "payment": {<br>      "snapToken": "dbd362c9...",<br>      "redirectUrl": "https://app.sandbox..."<br>    }<br>  }<br>}</pre> |
| **Error (Di bawah minimal)** | **Headers**:<br>`Authorization: Bearer <token_jwt>`<br>**Body (JSON)**:<br><pre>{<br>  "amount": 5000<br>}</pre> | 400 | <pre>{<br>  "success": false,<br>  "message": "Validation Error",<br>  "errors": [<br>    {<br>      "field": "amount",<br>      "message": "Jumlah top-up minimal adalah Rp10.000"<br>    }<br>  ]<br>}</pre> |

---

### 7. GET /api/v1/wallets (Mengambil Saldo & Riwayat Transaksi Wallet)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `GET`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>` | 200 | <pre>{<br>  "success": true,<br>  "message": "Berhasil mengambil data wallet",<br>  "data": {<br>    "user": {<br>      "id": "6a4e79f7...",<br>      "name": "Budi Santoso",<br>      "email": "budi@example.com"<br>    },<br>    "balance": 150000,<br>    "transactions": [<br>      {<br>        "id": "6a4e5f70...",<br>        "type": "topup",<br>        "amount": 50000,<br>        "balanceBefore": 100000,<br>        "balanceAfter": 150000,<br>        "referenceId": "TOPUP-20260708...",<br>        "status": "success",<br>        "createdAt": "2026-07-08T15:47..."<br>      }<br>    ]<br>  }<br>}</pre> |

---

### 8. POST /api/v1/payments/webhook (Notifikasi Pembayaran Server Midtrans)

| Skenario | Request Body (JSON) | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses (Settlement)** | <pre>{<br>  "transaction_status": "settlement",<br>  "status_code": "200",<br>  "signature_key": "SHA512_hash...",<br>  "order_id": "TOPUP-20260708...",<br>  "gross_amount": "50000.00",<br>  "fraud_status": "accept"<br>}</pre> | 200 | <pre>{<br>  "success": true,<br>  "message": "Webhook processed successfully"<br>}</pre> |
| **Error (Invalid Signature)** | <pre>{<br>  "transaction_status": "settlement",<br>  "status_code": "200",<br>  "signature_key": "WRONG_SIGNATURE_key",<br>  "order_id": "TOPUP-20260708...",<br>  "gross_amount": "50000.00"<br>}</pre> | 403 | <pre>{<br>  "success": false,<br>  "message": "Invalid signature key"<br>}</pre> |

---

### 9. PUT /api/v1/wallets/topup/:topupId/cancel (Membatalkan Top-Up Pending)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `PUT`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>`<br>**Params**: `topupId = TOPUP-20260708...` | 200 | <pre>{<br>  "success": true,<br>  "message": "Top-up dibatalkan",<br>  "data": {<br>    "status": "cancelled"<br>  }<br>}</pre> |
| **Error (Status Bukan Pending)** | **Method**: `PUT`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>`<br>**Params**: `topupId = TOPUP-20260708...` | 409 | <pre>{<br>  "success": false,<br>  "message": "Top-up sudah memiliki status 'success'...",<br>  "data": null<br>}</pre> |

---

### 10. PUT /api/v1/users/profile/avatar (Upload Foto Profil)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `PUT`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>`<br>`Content-Type: multipart/form-data`<br>**Body**: Key `avatar` (File) | 200 | <pre>{<br>  "success": true,<br>  "message": "Foto profil berhasil diperbarui",<br>  "data": {<br>    "avatarUrl": "http://localhost:3000/public/uploads/avatar..."<br>  }<br>}</pre> |
| **Error (Format Tidak Valid)** | **Method**: `PUT`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>`<br>`Content-Type: multipart/form-data`<br>**Body**: Key `avatar` (File non-gambar) | 400 | <pre>{<br>  "success": false,<br>  "message": "Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan!"<br>}</pre> |
| **Error (Ukuran Kebesaran)** | **Method**: `PUT`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>`<br>`Content-Type: multipart/form-data`<br>**Body**: Key `avatar` (File > 2MB) | 400 | <pre>{<br>  "success": false,<br>  "message": "Ukuran file gambar terlalu besar (maksimal 2MB)"<br>}</pre> |

---

### 11. DELETE /api/v1/users/profile/avatar (Menghapus Foto Profil)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `DELETE`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>` | 200 | <pre>{<br>  "success": true,<br>  "message": "Foto profil berhasil dihapus",<br>  "data": null<br>}</pre> |

---

### 12. DELETE /api/v1/users/profile (Hapus/Menonaktifkan Akun User)

| Skenario | Headers & Request | Status | Expected Response (JSON) |
| :--- | :--- | :---: | :--- |
| **Sukses** | **Method**: `DELETE`<br>**Headers**:<br>`Authorization: Bearer <token_jwt>` | 200 | <pre>{<br>  "success": true,<br>  "message": "Akun profil Anda berhasil dinonaktifkan (dihapus)",<br>  "data": null<br>}</pre> |

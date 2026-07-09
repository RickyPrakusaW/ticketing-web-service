# 🗺️ Peta Seluruh Routing API (v5 Final)

Dokumen ini memetakan seluruh routing URL yang terdaftar di dalam server API Hotel Management Web Service. Semua endpoint dikelompokkan secara rapi berdasarkan kategori/modul, lengkap dengan metode HTTP, syarat autentikasi, otorisasi peran, deskripsi rute, serta status pengerjaannya.

---

## 1. Modul Autentikasi (Auth)

Mengelola alur registrasi, verifikasi email menggunakan kode OTP via Gmail SMTP, pengiriman ulang kode OTP dengan batas anti-spam, dan proses masuk aplikasi (*login*).

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/auth/register` | 🔓 | Semua | Mendaftarkan pengguna baru dan mengirim kode OTP ke email. | ✅ Selesai |
| `POST` | `/api/v1/auth/verify-otp` | 🔓 | Semua | Memverifikasi akun menggunakan kode OTP 6 digit. | ✅ Selesai |
| `POST` | `/api/v1/auth/resend-otp` | 🔓 | Semua | Mengirim ulang kode OTP (wajib input password, batasan 2 menit). | ✅ Selesai |
| `POST` | `/api/v1/auth/login` | 🔓 | Semua | Masuk ke sistem untuk mendapatkan token JWT Bearer. | ✅ Selesai |

---

## 2. Modul Profil Pengguna (User Profile)

Mengelola informasi akun, pengunggahan foto profil (*avatar*) dengan sistem filter keamanan local Multer, dan penonaktifkan akun.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `GET` | `/api/v1/users/profile` | 🔒 | Semua | Mengambil informasi detail profil user yang sedang aktif. | ✅ Selesai |
| `PUT` | `/api/v1/users/profile/avatar` | 🔒 | Semua | Mengunggah/memperbarui foto profil (Multer, maks 2MB, jpg/png/webp). | ✅ Selesai |
| `DELETE` | `/api/v1/users/profile/avatar` | 🔒 | Semua | Menghapus foto profil saat ini secara permanen dari server lokal. | ✅ Selesai |
| `DELETE` | `/api/v1/users/profile` | 🔒 | Semua | Menonaktifkan akun pengguna saat ini secara aman (Soft Delete). | ✅ Selesai |

---

## 3. Modul E-Wallet & Pembayaran (Top-Up)

Mengambil data saldo dompet digital pengguna, memicu permintaan pengisian saldo (Top-up) terintegrasi API Midtrans Snap, dan memproses pembatalan top-up.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `GET` | `/api/v1/wallets` | 🔒 | Semua | Melihat detail saldo dompet digital dan riwayat mutasi mutakhir. | ✅ Selesai |
| `POST` | `/api/v1/wallets/topup` | 🔒 | Semua | Meminta Token Snap dan URL Pembayaran Midtrans Sandbox untuk Top-up. | ✅ Selesai |
| `PUT` | `/api/v1/wallets/topup/:topupId/cancel` | 🔒 | Semua | Membatalkan permintaan top-up yang masih berstatus pending. | ✅ Selesai |

---

## 4. Modul Payment (Midtrans Webhook)

Endpoint publik khusus yang dipanggil langsung oleh server Midtrans untuk notifikasi otomatis status transaksi pembayaran top-up atau booking.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/payments/webhook` | 🔓 | Publik | Menerima status pembayaran (Settlement/Cancel/Expire) dari Midtrans. | ✅ Selesai |

---

## 5. Modul Kategori Hotel (Category - CRUD Master #1)

Mengelola kategori klasifikasi hotel (misal: Bintang 5, Resort, Villa, Budget).

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/categories` | 🔒 | Admin, HotelManager | Membuat kategori hotel baru. | ⏳ Rute Siap |
| `GET` | `/api/v1/categories` | 🔓 | Semua | Melihat daftar seluruh kategori hotel yang tersedia. | ⏳ Rute Siap |
| `PUT` | `/api/v1/categories/:id` | 🔒 | Admin, HotelManager | Memperbarui nama atau detail kategori hotel. | ⏳ Rute Siap |
| `DELETE` | `/api/v1/categories/:id` | 🔒 | Admin, HotelManager | Menghapus kategori hotel. | ⏳ Rute Siap |

---

## 6. Modul Voucher Diskon (Voucher - CRUD Master #2)

Mengatur promosi pemotongan harga (diskon nominal/persentase) untuk ditawarkan kepada pelanggan saat melakukan pemesanan kamar hotel.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/vouchers` | 🔒 | Admin, HotelManager | Membuat voucher diskon baru. | ⏳ Rute Siap |
| `GET` | `/api/v1/vouchers` | 🔒 | Admin, HotelManager | Melihat daftar seluruh voucher diskon di sistem. | ⏳ Rute Siap |
| `GET` | `/api/v1/vouchers/:code` | 🔒 | Customer | Memvalidasi dan mengecek masa aktif kode voucher. | ⏳ Rute Siap |
| `PUT` | `/api/v1/vouchers/:id` | 🔒 | Admin, HotelManager | Mengubah batas kuota, nominal, atau durasi aktif voucher. | ⏳ Rute Siap |
| `DELETE` | `/api/v1/vouchers/:id` | 🔒 | Admin, HotelManager | Menghapus voucher diskon dari sistem. | ⏳ Rute Siap |

---

## 7. Modul Hotel (Hotel - CRUD Master #3)

Mengelola data dasar identitas hotel di sistem (alamat, nama, rating, fasilitas utama, deskripsi).

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/hotels` | 🔒 | Admin, HotelManager | Menambahkan data hotel baru ke sistem. | ⏳ Rute Siap |
| `GET` | `/api/v1/hotels` | 🔓 | Semua | Mengambil daftar semua hotel (mendukung filter & pagination). | ⏳ Rute Siap |
| `GET` | `/api/v1/hotels/:id` | 🔓 | Semua | Mengambil detail informasi lengkap suatu hotel berdasarkan ID. | ⏳ Rute Siap |
| `PUT` | `/api/v1/hotels/:id` | 🔒 | Admin, HotelManager | Memperbarui data informasi atau fasilitas hotel. | ⏳ Rute Siap |
| `DELETE` | `/api/v1/hotels/:id` | 🔒 | Admin, HotelManager | Menghapus hotel (Soft Delete atau Hard Delete). | ⏳ Rute Siap |

---

## 8. Modul Tipe Kamar (Room Type - CRUD Master #4)

Mengelola variasi kamar di suatu hotel (misal: Deluxe, Suite, Standard) termasuk harga per malam, foto kamar, kapasitas kasur, dan batas jumlah kuota kamar.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/hotels/:hotelId/rooms` | 🔒 | Admin, HotelManager | Menambahkan tipe kamar baru pada hotel tertentu. | ⏳ Rute Siap |
| `GET` | `/api/v1/hotels/:hotelId/rooms` | 🔓 | Semua | Melihat daftar semua tipe kamar pada hotel tertentu. | ⏳ Rute Siap |
| `PUT` | `/api/v1/hotels/:hotelId/rooms/:roomId` | 🔒 | Admin, HotelManager | Memperbarui harga, kuota, atau fasilitas tipe kamar. | ⏳ Rute Siap |
| `DELETE` | `/api/v1/hotels/:hotelId/rooms/:roomId` | 🔒 | Admin, HotelManager | Menghapus tipe kamar dari hotel. | ⏳ Rute Siap |

---

## 9. Modul Pemesanan (Booking - Transaksi Utama)

Mengelola proses transaksi pemesanan kamar hotel oleh Customer baik menggunakan metode saldo E-Wallet maupun pembayaran langsung Midtrans Snap, serta manajemen pembatalan & pengembalian dana.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/bookings` | 🔒 | Customer | Membuat reservasi kamar baru (potong saldo / token Midtrans). | ⏳ Rute Siap |
| `GET` | `/api/v1/bookings` | 🔒 | Semua | Mengambil daftar riwayat reservasi (sesuai peran masing-masing). | ⏳ Rute Siap |
| `GET` | `/api/v1/bookings/:id` | 🔒 | Semua | Mengambil rincian detail data suatu pemesanan kamar. | ⏳ Rute Siap |
| `PUT` | `/api/v1/bookings/:id/cancel` | 🔒 | Semua | Membatalkan pemesanan kamar yang berstatus pending/paid. | ⏳ Rute Siap |
| `PUT` | `/api/v1/bookings/:id/refund` | 🔒 | Admin | Menyetujui pengembalian dana booking dibatalkan ke E-Wallet. | ⏳ Rute Siap |

---

## 10. Modul Check-In, Check-Out & Ulasan (Review - Nilai Tambahan)

Mengelola proses pencatatan check-in/out tamu di lokasi hotel dan penulisan rating ulasan dari tamu pasca menginap.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `PUT` | `/api/v1/bookings/:id/checkin` | 🔒 | Admin, HotelManager | Mencatat waktu kedatangan check-in tamu (mengubah status kamar). | ⏳ Rute Siap |
| `PUT` | `/api/v1/bookings/:id/checkout` | 🔒 | Admin, HotelManager | Mencatat kepulangan check-out tamu (mengosongkan kuota kamar). | ⏳ Rute Siap |
| `POST` | `/api/v1/bookings/:bookingId/reviews` | 🔒 | Customer | Mengirimkan ulasan, rating bintang, dan feedback teks. | ⏳ Rute Siap |
| `GET` | `/api/v1/hotels/:hotelId/reviews` | 🔓 | Semua | Mengambil seluruh riwayat review/ulasan tamu pada hotel tertentu. | ⏳ Rute Siap |

---

## 11. Modul Kesehatan Sistem (Health Check - Nilai Tambahan)

Endpoint diagnostik untuk mengecek integritas server, uptime, dan status koneksi database.

| Method | URL Path | Auth | Roles Allowed | Deskripsi Rute | Status |
| :---: | :--- | :---: | :---: | :--- | :---: |
| `GET` | `/api/v1/health` | 🔓 | Publik | Mengembalikan status kesehatan server dan waktu hidup runtime. | ✅ Selesai |

---

> [!NOTE]
> *   🔓 = Rute Publik (Bebas diakses tanpa headers token JWT).
> *   🔒 = Rute Terproteksi (Wajib menyertakan header `Authorization: Bearer <token_jwt>`).
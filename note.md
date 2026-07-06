# 📖 Panduan Menggunakan MongoDB & Mongoose (Hotel Booking & Management)

Halo! Catatan ini dibuat khusus untuk mempermudah pemahaman mengenai cara kerja **MongoDB** dan **Mongoose ODM** di dalam project Hotel Booking & Management Web Service setelah migrasi dari sistem ticketing.

---

## 🎯 Konsep Dasar NoSQL (MongoDB)

Di MongoDB, kita tidak mengenal baris (*row*) dan kolom (*column*), melainkan:
1. **Document:** Data tunggal berformat JSON (BSON).
2. **Collection:** Wadah berkumpulnya Dokumen (seperti Tabel di SQL).

Salah satu kekuatan MongoDB adalah kita bisa menyematkan data (*embedded/nested docs*) secara langsung.
> **Contoh:** Tipe Kamar (`room_types`) dan Detail Transaksi (`details`) tidak lagi disimpan di tabel terpisah dengan relasi rumit, melainkan menjadi array di dalam dokumen **Hotel** dan **Booking** secara langsung.

---

## 🚀 Langkah Menyiapkan Database & Menjalankan Seeder

### 1. Pastikan MongoDB Sudah Berjalan
Pastikan layanan database MongoDB sudah menyala di lokal komputermu (default port: `27017`).
Jika kamu menggunakan MongoDB Compass, kamu bisa melihat isi databasemu secara visual di alamat `mongodb://localhost:27017`.

### 2. Konfigurasi .env
Periksa file `.env` di root folder project, pastikan terdapat baris ini:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_management_db
```

### 3. Jalankan Seeder MongoDB
Untuk mengisi database dengan data dummy awal (Roles, Users, Categories, Hotels, Bookings, dll) agar website bisa langsung dites, jalankan perintah berikut di terminal:

```bash
node seed.js
```

Perintah di atas akan otomatis:
- Mengosongkan data lama di database `hotel_management_db`.
- Membuat koleksi baru.
- Memasukkan data default & dummy (termasuk membuat password ter-hash `password123`).

---

## 🛠️ Cara Menggunakan Mongoose di Controller

Berikut beberapa contoh penulisan query menggunakan Mongoose khusus untuk sistem Hotel:

### 1. Mencari Satu Data (findOne)
```javascript
// Cari user berdasarkan email
const user = await User.findOne({ email });
```

### 2. Mencari Semua Data + Mempopulasikan Relasi (JOIN)
```javascript
// Mengambil semua hotel beserta nama manajernya dan nama kategorinya
const hotels = await Hotel.find()
  .populate('manager_id', 'full_name email')
  .populate('category_id', 'name');
```

### 3. Membuat Data Baru (create)
```javascript
const newHotel = await Hotel.create({
  name: 'Hotel Grand Hyatt',
  description: 'Hotel mewah bintang 5 di pusat kota.',
  address: 'Jl. M.H. Thamrin No.1',
  city: 'Jakarta',
  manager_id: '645a8df2f3e4c489c7d41f02', // Menggunakan ObjectId Manager
  category_id: '645a8df2f3e4c489c7d41f03', // Menggunakan ObjectId Kategori
  room_types: [
    {
      name: 'Deluxe Room',
      description: 'Kamar nyaman dengan pemandangan kota.',
      price: 1500000,
      capacity: 2,
      total_rooms: 20,
      booked_rooms: 0,
      facilities: ['Free WiFi', 'AC', 'Breakfast'],
      status: 'available'
    }
  ]
});
```

---

## 🏁 Akun Dummy untuk Pengujian

Setelah menjalankan `node seed.js`, kamu bisa masuk ke aplikasi menggunakan akun-akun berikut (semua password adalah: `password123`):

1.  **Super Admin:** `admin@hotel.com` (role Admin)
2.  **Hotel Manager:** `manager.grand@hotel.com` atau `manager.aston@hotel.com` (role Hotel Manager)
3.  **Customer:** `budi@gmail.com`, `siti@gmail.com`, atau `rendi@gmail.com` (role Customer)

Selamat belajar dan mencoba MongoDB! 🎉
Jika ada kendala koneksi, pastikan service MongoDB lokal kamu sudah aktif.

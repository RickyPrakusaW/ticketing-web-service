# 📖 Panduan Menggunakan MongoDB & Mongoose (Event Ticketing)

Halo! Catatan ini dibuat khusus untuk mempermudah pemahaman mengenai cara kerja **MongoDB** dan **Mongoose ODM** di dalam project Ticketing Event Web Service kita setelah migrasi dari SQL.

---

## 🎯 Konsep Dasar NoSQL (MongoDB)

Di MongoDB, kita tidak mengenal baris (*row*) dan kolom (*column*), melainkan:
1. **Document:** Data tunggal berformat JSON (BSON).
2. **Collection:** Wadah berkumpulnya Dokumen (seperti Tabel di SQL).

Salah satu kekuatan MongoDB adalah kita bisa menyematkan data (*embedded/nested docs*) secara langsung.
> **Contoh:** Tiket (`ticket_types`) dan Detail Transaksi (`details`) tidak lagi disimpan di tabel terpisah dengan relasi rumit, melainkan menjadi array di dalam dokumen Event dan Order secara langsung.

---

## 🚀 Langkah Menyiapkan Database & Menjalankan Seeder

### 1. Pastikan MongoDB Sudah Berjalan
Pastikan layanan database MongoDB sudah menyala di lokal komputermu (default port: `27017`).
Jika kamu menggunakan MongoDB Compass, kamu bisa melihat isi databasemu secara visual di alamat `mongodb://localhost:27017`.

### 2. Konfigurasi .env
Periksa file `.env` di root folder project, pastikan terdapat baris ini:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/ticketing_event_db
```

### 3. Jalankan Seeder MongoDB
Untuk mengisi database dengan data dummy awal (Roles, Users, Categories, Venues, Events, dll) agar website bisa langsung dites, jalankan perintah berikut di terminal:

```bash
node seed.js
```

Perintah di atas akan otomatis:
- Mengosongkan data lama di database `ticketing_event_db`.
- Membuat koleksi baru.
- Memasukkan data default & dummy (termasuk membuat password ter-hash `password123`).

---

## 🛠️ Cara Menggunakan Mongoose di Controller

Berikut beberapa contoh perbandingan penulisan kode antara Sequelize (lama) dengan Mongoose (baru):

### 1. Mencari Satu Data (findOne)
*   **Sequelize (Lama):**
    ```javascript
    const user = await User.findOne({ where: { email: email } });
    ```
*   **Mongoose (Baru):**
    ```javascript
    const user = await User.findOne({ email });
    ```

### 2. Mencari Semua Data + Mempopulasikan Relasi (JOIN)
*   **Sequelize (Lama):**
    ```javascript
    const users = await User.findAll({
      include: [{ model: Role, as: 'Role' }]
    });
    ```
*   **Mongoose (Baru):**
    ```javascript
    const users = await User.find().populate('role_id');
    ```

### 3. Membuat Data Baru (create)
Syntax pembuatan data baru hampir sama persis:
```javascript
const newUser = await User.create({
  full_name: 'Budi Santoso',
  email: 'budi@gmail.com',
  password: hashedPassword,
  role_id: '645a8df2f3e4c489c7d41f02' // Menggunakan ObjectId MongoDB
});
```

---

## 🏁 Akun Dummy untuk Pengujian
Setelah menjalankan `node seed.js`, kamu bisa masuk ke aplikasi menggunakan akun-akun berikut (semua password adalah: `password123`):

1.  **Super Admin:** `admin@event.com` (role Admin)
2.  **Organizer:** `info@javajazz.com` atau `contact@techconf.id` (role Organizer)
3.  **Customer:** `budi@gmail.com`, `siti@gmail.com`, atau `rendi@gmail.com` (role Customer)

Selamat belajar dan mencoba MongoDB! 🎉
Jika ada kendala koneksi, pastikan service MongoDB lokal kamu sudah aktif.

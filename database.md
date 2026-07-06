# EVENT TICKETING MANAGEMENT DATABASE - DOKUMENTASI LENGKAP (MONGODB)

Dokumentasi ini menjelaskan rancangan database sistem manajemen tiket event berbasis NoSQL menggunakan **MongoDB** dan ODM **Mongoose**.

---

## 📊 KONSEP PERANCANGAN NOSQL (MONGODB VS SQL)

Berbeda dengan database relasional (SQL) yang memecah data ke banyak tabel terpisah demi normalisasi, perancangan di MongoDB memanfaatkan keunggulan dokumen JSON yang fleksibel:

1. **Embedded Documents (Skema Bersarang):**
   - **Ticket Types:** Jenis-jenis tiket didefinisikan langsung di dalam dokumen `Event` sebagai array subdokumen. Ini menghemat operasi JOIN yang lambat saat melihat halaman event beserta kuota tiketnya.
   - **Order Details:** Item-item pembelian tiket (detail qty, subtotal, kode e-ticket) langsung di-embed di dalam dokumen `Order`. Tidak perlu memisahkan `OrderHeader` dan `OrderDetail`.

2. **References (Relasi Referensi):**
   - Menggunakan `ObjectId` untuk menunjuk dokumen pada koleksi lain (mirip Foreign Key), misalnya `role_id` di koleksi `User` yang merujuk ke koleksi `Role`.

---

## 📂 DAFTAR KOLEKSI (11 Koleksi Utama)

### 1. **roles**
Menyimpan peran/otoritas pengguna dalam sistem.

```json
{
  "_id": "ObjectId",
  "name": "String",        // "Admin", "Organizer", "Customer"
  "description": "String", // Deskripsi hak akses role
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 2. **users**
Menyimpan data pengguna (Admin, Organizer, Customer).

```json
{
  "_id": "ObjectId",
  "role_id": "ObjectId",   // Referensi -> roles._id
  "full_name": "String",   // Nama lengkap user
  "email": "String",       // Email unik (Index: Unique)
  "password": "String",    // Password ter-hash (bcryptjs)
  "phone": "String",       // Nomor telepon
  "profile_image": "String",// URL/Path foto profil
  "bio": "String",         // Deskripsi profil singkat
  "is_active": "Boolean",  // Status aktif/nonaktif (default: true)
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 3. **categories**
Menyimpan kategori event (Musik, Seminar, Olahraga, dll).

```json
{
  "_id": "ObjectId",
  "name": "String",        // Nama kategori (Index: Unique)
  "description": "String", // Deskripsi kategori
  "icon_url": "String",    // URL icon representasi
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 4. **venues**
Menyimpan data lokasi/tempat penyelenggaraan event.

```json
{
  "_id": "ObjectId",
  "name": "String",          // Nama gedung/lokasi
  "address": "String",       // Alamat lengkap
  "city": "String",          // Kota
  "latitude": "Number",      // Koordinat lintang (opsional)
  "longitude": "Number",     // Koordinat bujur (opsional)
  "capacity": "Number",      // Kapasitas maksimum pengunjung
  "contact_person": "String",// Nama penanggung jawab venue
  "contact_phone": "String", // Nomor telepon penanggung jawab
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 5. **events**
Menyimpan data event yang dibuat oleh Organizer beserta informasi jenis tiket.

```json
{
  "_id": "ObjectId",
  "organizer_id": "ObjectId", // Referensi -> users._id
  "category_id": "ObjectId",  // Referensi -> categories._id
  "venue_id": "ObjectId",     // Referensi -> venues._id
  "title": "String",          // Judul/Nama event
  "description": "String",    // Deskripsi detail event
  "event_date": "Date",       // Tanggal mulai
  "event_end_date": "Date",   // Tanggal berakhir
  "poster_image": "String",   // URL poster event
  "status": "String",         // "draft", "published", "closed", "cancelled"
  "is_free": "Boolean",       // Flag event gratis (default: false)
  "ticket_types": [           // EMBEDDED SUBDOCUMENTS
    {
      "_id": "ObjectId",
      "name": "String",       // "VIP", "Festival", "Early Bird"
      "description": "String",// Deskripsi benefit/fasilitas tiket
      "price": "Number",      // Harga tiket (0 jika gratis)
      "quota": "Number",      // Jumlah kuota maksimal
      "sold": "Number",       // Jumlah tiket terjual (default: 0)
      "status": "String"      // "available", "sold_out", "disabled"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 6. **subscription_plans**
Menyimpan paket langganan bagi Organizer.

```json
{
  "_id": "ObjectId",
  "name": "String",          // "Free", "Pro", "Enterprise"
  "description": "String",   // Deskripsi fitur
  "price": "Number",         // Harga langganan bulanan
  "duration_days": "Number", // Durasi aktif (default: 30 hari)
  "event_limit": "Number",   // Maksimal event yang dapat dibuat
  "is_active": "Boolean",    // Status keaktifan paket
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 7. **organizer_subscriptions**
Menyimpan riwayat transaksi langganan dari Organizer.

```json
{
  "_id": "ObjectId",
  "organizer_id": "ObjectId",         // Referensi -> users._id
  "subscription_plan_id": "ObjectId", // Referensi -> subscription_plans._id
  "start_date": "Date",               // Tanggal mulai aktif
  "end_date": "Date",                 // Tanggal berakhir
  "status": "String",                 // "active", "expired", "cancelled"
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 8. **orders**
Menyimpan data pesanan tiket (menggabungkan Order Header dan Detail).

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",      // Referensi -> users._id (Customer)
  "order_code": "String",     // Kode pemesanan unik (Index: Unique)
  "event_id": "ObjectId",     // Referensi -> events._id
  "total_amount": "Number",   // Total harga pesanan
  "payment_status": "String", // "pending", "processing", "paid", "failed", "cancelled"
  "payment_method": "String", // Metode bayar ("Transfer BCA", "GoPay")
  "notes": "String",          // Catatan pembeli
  "expired_at": "Date",       // Batas waktu pembayaran
  "paid_at": "Date",          // Tanggal sukses bayar
  "details": [                // EMBEDDED SUBDOCUMENTS (Order Details)
    {
      "_id": "ObjectId",
      "ticket_type_id": "ObjectId", // ID ticket_type di dalam dokumen Event
      "ticket_code": "String",      // Kode unik tiket (Index: Unique)
      "qty": "Number",              // Jumlah tiket yang dibeli
      "price": "Number",            // Harga tiket saat dibeli
      "subtotal": "Number",         // qty * price
      "status": "String",           // "active", "used", "cancelled"
      "qr_code": "String",          // String QR Code (Base64) untuk e-ticket
      "checked_in_at": "Date"       // Tanggal penukaran tiket di venue
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 9. **payments**
Menyimpan log transaksi terintegrasi dengan Payment Gateway (seperti Midtrans).

```json
{
  "_id": "ObjectId",
  "order_id": "ObjectId",       // Referensi -> orders._id
  "provider": "String",         // "Midtrans", "Xendit", dll
  "transaction_id": "String",   // ID transaksi dari payment gateway (Index: Unique)
  "gross_amount": "Number",     // Total dana diterima
  "payment_status": "String",   // "pending", "settlement", "deny", "cancel", "expire"
  "payment_type": "String",     // "credit_card", "bank_transfer", "gopay"
  "paid_at": "Date",            // Tanggal sukses bayar
  "raw_response": "String",     // Log response JSON lengkap dari gateway
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 10. **uploaded_files**
Menyimpan file yang diunggah ke sistem server.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",   // Referensi -> users._id (nullable)
  "event_id": "ObjectId",  // Referensi -> events._id (nullable)
  "file_name": "String",   // Nama file asli
  "file_path": "String",   // Path/URL penyimpanan file
  "file_type": "String",   // e.g., "jpg", "png", "webp"
  "file_size": "Number",   // Ukuran byte
  "upload_type": "String", // "poster", "profile", "bukti_bayar", "other"
  "createdAt": "Date"
}
```

---

### 11. **payment_methods**
Menyimpan opsi metode pembayaran yang tersedia di sistem.

```json
{
  "_id": "ObjectId",
  "name": "String",        // "Transfer Bank", "E-Wallet"
  "description": "String", // Detail instruksi
  "provider": "String",    // "BCA", "GoPay", "Midtrans"
  "is_active": "Boolean",  // Status aktif/nonaktif
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 📈 INDEXING STRATEGY (MONGODB)

Untuk menjaga performa pencarian yang tinggi, indeks MongoDB diterapkan pada kolom berikut:

1. **Unique Indexes:**
   - `users.email`
   - `categories.name`
   - `orders.order_code`
   - `orders.details.ticket_code`
   - `payments.transaction_id`
   - `roles.name`

2. **Query Filtering Indexes:**
   - `events.status`
   - `orders.payment_status`
   - `users.role_id`

---

## 🔄 REPLIKA DARI SQL VIEWS MENGGUNAKAN MONGO AGGREGATION

Dalam SQL sebelumnya terdapat Views untuk laporan. Di MongoDB kita dapat menggunakan **Aggregation Pipelines** untuk mendapatkan output serupa:

### 1. Event dengan Info Organizer
Menggabungkan data Event, User (Organizer), Category, dan Venue.

```javascript
db.events.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "organizer_id",
      foreignField: "_id",
      as: "organizer"
    }
  },
  { $unwind: "$organizer" },
  {
    $lookup: {
      from: "categories",
      localField: "category_id",
      foreignField: "_id",
      as: "category"
    }
  },
  { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "venues",
      localField: "venue_id",
      foreignField: "_id",
      as: "venue"
    }
  },
  { $unwind: { path: "$venue", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      title: 1,
      event_date: 1,
      status: 1,
      organizer_name: "$organizer.full_name",
      organizer_email: "$organizer.email",
      category_name: "$category.name",
      venue_name: "$venue.name"
    }
  }
]);
```

### 2. Summary Laporan Penjualan Tiket per Event
Mengambil ringkasan kuota dan penjualan tiket dari subdokumen `ticket_types` yang bersarang.

```javascript
db.events.aggregate([
  { $unwind: "$ticket_types" },
  {
    $project: {
      event_name: "$title",
      ticket_type: "$ticket_types.name",
      quota: "$ticket_types.quota",
      sold: "$ticket_types.sold",
      remaining: { $subtract: ["$ticket_types.quota", "$ticket_types.sold"] },
      price: "$ticket_types.price",
      total_revenue: { $multiply: ["$ticket_types.price", "$ticket_types.sold"] }
    }
  }
]);
```
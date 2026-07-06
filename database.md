# HOTEL BOOKING MANAGEMENT DATABASE - DOKUMENTASI LENGKAP (MONGODB)

Dokumentasi ini menjelaskan rancangan database sistem manajemen booking hotel berbasis NoSQL menggunakan **MongoDB** dan ODM **Mongoose**.

---

## 📊 KONSEP PERANCANGAN NOSQL (MONGODB VS SQL)

Berbeda dengan database relasional (SQL) yang memecah data ke banyak tabel terpisah demi normalisasi, perancangan di MongoDB memanfaatkan keunggulan dokumen JSON yang fleksibel:

1. **Embedded Documents (Skema Bersarang):**
   - **Room Types:** Jenis-jenis kamar didefinisikan langsung di dalam dokumen `Hotel` sebagai array subdokumen. Ini menghemat operasi JOIN yang lambat saat melihat halaman hotel beserta tipe kamar dan ketersediaannya.
   - **Booking Details:** Item-item pemesanan kamar (detail qty, harga per malam, subtotal, nama tamu) langsung di-embed di dalam dokumen `Booking`. Tidak perlu memisahkan `BookingHeader` dan `BookingDetail`.

2. **References (Relasi Referensi):**
   - Menggunakan `ObjectId` untuk menunjuk dokumen pada koleksi lain (mirip Foreign Key), misalnya `role_id` di koleksi `User` yang merujuk ke koleksi `Role`.

---

## 📂 DAFTAR KOLEKSI (7 Koleksi Utama)

### 1. **roles**
Menyimpan peran/otoritas pengguna dalam sistem.

```json
{
  "_id": "ObjectId",
  "name": "String",        // "Admin", "Hotel Manager", "Customer"
  "description": "String", // Deskripsi hak akses role
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 2. **users**
Menyimpan data pengguna (Admin, Hotel Manager, Customer).

```json
{
  "_id": "ObjectId",
  "role_id": "ObjectId",   // Referensi -> roles._id
  "full_name": "String",   // Nama lengkap user
  "email": "String",       // Email unik (Index: Unique)
  "password": "String",    // Password ter-hash (bcryptjs)
  "phone": "String",       // Nomor telepon
  "profile_image": "String",// URL/Path foto profil
  "is_active": "Boolean",  // Status aktif/nonaktif (default: true)
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 3. **categories**
Menyimpan kategori hotel (Resort, Business Hotel, Boutique Hotel, Budget Hotel, Villa, dll).

```json
{
  "_id": "ObjectId",
  "name": "String",        // Nama kategori (Index: Unique)
  "description": "String", // Deskripsi kategori
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 4. **hotels**
Menyimpan data hotel beserta tipe-tipe kamar yang tersedia.

```json
{
  "_id": "ObjectId",
  "manager_id": "ObjectId",   // Referensi -> users._id (Hotel Manager)
  "category_id": "ObjectId",  // Referensi -> categories._id
  "name": "String",           // Nama hotel
  "description": "String",    // Deskripsi detail hotel
  "address": "String",        // Alamat lengkap hotel
  "city": "String",           // Kota lokasi hotel
  "latitude": "Number",       // Koordinat lintang (opsional)
  "longitude": "Number",      // Koordinat bujur (opsional)
  "rating": "Number",         // Rating hotel (0-5, default: 0)
  "images": ["String"],       // Array URL/Path gambar-gambar hotel
  "room_types": [             // EMBEDDED SUBDOCUMENTS
    {
      "_id": "ObjectId",
      "name": "String",       // "Standard", "Deluxe", "VIP Suite"
      "description": "String",// Deskripsi detail/kelebihan tipe kamar
      "price": "Number",      // Harga per malam
      "capacity": "Number",   // Kapasitas tamu per kamar
      "total_rooms": "Number",// Jumlah total kamar tipe ini yang dimiliki hotel
      "booked_rooms": "Number",// Jumlah kamar yang sedang ter-booking (default: 0)
      "facilities": ["String"],// Fasilitas kamar (e.g. ["Free WiFi", "AC", "Breakfast"])
      "status": "String"      // "available", "sold_out", "disabled"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 5. **bookings**
Menyimpan data pesanan booking kamar hotel (menggabungkan Booking Header dan Detail).

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",       // Referensi -> users._id (Customer)
  "booking_code": "String",    // Kode booking unik (Index: Unique)
  "hotel_id": "ObjectId",      // Referensi -> hotels._id
  "check_in_date": "Date",     // Tanggal Check-in
  "check_out_date": "Date",    // Tanggal Check-out
  "total_nights": "Number",    // Jumlah malam menginap
  "total_amount": "Number",    // Total biaya booking
  "payment_status": "String",  // "pending", "paid", "failed", "cancelled"
  "payment_method": "String",  // Metode bayar ("Transfer BCA", "GoPay")
  "notes": "String",           // Catatan tambahan dari tamu
  "expired_at": "Date",        // Batas waktu pembayaran
  "paid_at": "Date",           // Tanggal sukses bayar
  "details": [                 // EMBEDDED SUBDOCUMENTS (Booking Details)
    {
      "_id": "ObjectId",
      "room_type_id": "ObjectId", // ID room_type di dalam dokumen Hotel
      "qty_rooms": "Number",      // Jumlah kamar yang dipesan
      "price_per_night": "Number",// Harga per malam saat dipesan
      "subtotal": "Number",       // qty_rooms * price_per_night * total_nights
      "guest_names": ["String"],  // Nama-nama tamu yang menginap
      "status": "String"          // "active", "checked_in", "checked_out", "cancelled"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 6. **payments**
Menyimpan log transaksi pembayaran terintegrasi dengan Payment Gateway (seperti Midtrans).

```json
{
  "_id": "ObjectId",
  "booking_id": "ObjectId",     // Referensi -> bookings._id
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

### 7. **payment_methods**
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
   - `bookings.booking_code`
   - `payments.transaction_id`
   - `roles.name`

2. **Query Filtering Indexes:**
   - `hotels.city`
   - `bookings.payment_status`
   - `users.role_id`

---

## 🔄 REPLIKA MENGGUNAKAN MONGO AGGREGATION

Dalam SQL sebelumnya terdapat Views untuk laporan. Di MongoDB kita dapat menggunakan **Aggregation Pipelines** untuk mendapatkan output serupa:

### 1. Hotel dengan Info Manager dan Kategori
Menggabungkan data Hotel, User (Manager), dan Category.

```javascript
db.hotels.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "manager_id",
      foreignField: "_id",
      as: "manager"
    }
  },
  { $unwind: "$manager" },
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
    $project: {
      name: 1,
      city: 1,
      rating: 1,
      manager_name: "$manager.full_name",
      manager_email: "$manager.email",
      category_name: "$category.name"
    }
  }
]);
```

### 2. Summary Laporan Penjualan Kamar per Hotel
Mengambil ringkasan kuota dan penjualan kamar dari subdokumen `room_types` yang bersarang.

```javascript
db.hotels.aggregate([
  { $unwind: "$room_types" },
  {
    $project: {
      hotel_name: "$name",
      room_type: "$room_types.name",
      total_rooms: "$room_types.total_rooms",
      booked_rooms: "$room_types.booked_rooms",
      available_rooms: { $subtract: ["$room_types.total_rooms", "$room_types.booked_rooms"] },
      price: "$room_types.price",
      estimated_revenue: { $multiply: ["$room_types.price", "$room_types.booked_rooms"] }
    }
  }
]);
```
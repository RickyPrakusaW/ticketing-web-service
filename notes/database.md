================================================================
HOTEL MANAGEMENT & BOOKING API — DATABASE SCHEMA + SEEDERS (v2)
================================================================
Stack: MongoDB Atlas + Mongoose
Perubahan dari v1: menambahkan model Wallet & WalletTransaction
(sesuai CLAUDE.md v5), update Booking (field paymentMethod,
status baru "refunded"), migration index tambahan, dan seeder
dengan data dummy minimal 5 record per koleksi (termasuk wallet
& ledger wallet).
Cara pakai: copy tiap bagian ke path yang tertulis di header komentar.
================================================================


// ================================================================
// FILE: src/models/User.js
// ================================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['Admin', 'HotelManager', 'Customer'],
      default: 'Customer',
    },
    avatarUrl: { type: String, default: null },
    // dipakai kalau role = HotelManager
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'PRO'],
      default: 'FREE',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


// ================================================================
// FILE: src/models/Category.js
// ================================================================
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);


// ================================================================
// FILE: src/models/Voucher.js
// ================================================================
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    // wajib diisi kalau type percentage, batas potongan maksimal
    maxDiscount: { type: Number, default: null },
    minTransaction: { type: Number, default: 0 },
    quota: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    expiredDate: { type: Date, required: true },
    // null = voucher global (dibuat Admin), diisi = milik hotel tertentu (HotelManager)
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

voucherSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Voucher', voucherSchema);


// ================================================================
// FILE: src/models/Hotel.js
// ================================================================
const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  totalQuota: { type: Number, required: true, min: 0 },
  available_quota: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  facilities: [{ type: String }],
  photos: [{ type: String }],
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photos: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    room_types: [roomTypeSchema],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

hotelSchema.index({ city: 1 });
hotelSchema.index({ categoryId: 1 });
hotelSchema.index({ 'room_types.pricePerNight': 1 });

module.exports = mongoose.model('Hotel', hotelSchema);


// ================================================================
// FILE: src/models/Booking.js
// (v2: + paymentMethod, + status "refunded", + walletTransactionId)
// ================================================================
const mongoose = require('mongoose');

const bookingDetailSchema = new mongoose.Schema({
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  roomTypeName: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  nights: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    details: [bookingDetailSchema],
    subtotal: { type: Number, required: true },
    voucherCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    // metode bayar: "wallet" = potong saldo Wallet atomik, "midtrans" = Snap token seperti biasa
    paymentMethod: { type: String, enum: ['wallet', 'midtrans'], required: true, default: 'midtrans' },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'expired',
        'cancelled',
        'refund_requested',
        'refunded',
        'checked_in',
        'checked_out',
      ],
      default: 'pending_payment',
    },
    expiresAt: { type: Date, required: true },
    payment: {
      snapToken: { type: String, default: null },
      redirectUrl: { type: String, default: null },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    // relasi opsional ke baris ledger WalletTransaction (pembayaran atau refund lewat wallet)
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },
    qrCode: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1 });
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ bookingCode: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);


// ================================================================
// FILE: src/models/Review.js
// ================================================================
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);


// ================================================================
// FILE: src/models/Wallet.js  (BARU di v2)
// ================================================================
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // saldo tidak pernah ditulis langsung dari input user, hanya lewat walletService
    balance: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);


// ================================================================
// FILE: src/models/WalletTransaction.js  (BARU di v2)
// Ledger immutable: setiap perubahan saldo Wallet dicatat sebagai
// satu baris di sini. balanceBefore/balanceAfter membuat saldo
// bisa direkonsiliasi kapan saja dari total ledger per user.
// ================================================================
const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['topup', 'payment', 'refund', 'adjustment'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    // topup: order_id Midtrans (mis. "TOPUP-20260708-0007")
    // payment/refund: bookingCode terkait (mis. "BK-20260708-0001")
    referenceId: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'expired'],
      default: 'pending',
    },
    note: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);


// ================================================================
// FILE: migrations/20260708000000-add-indexes.js
// ================================================================
module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });
    await db.collection('hotels').createIndex({ city: 1, categoryId: 1 });
    await db.collection('hotels').createIndex({ 'room_types.pricePerNight': 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ bookingCode: 1 }, { unique: true });
    await db.collection('vouchers').createIndex({ code: 1 }, { unique: true });
  },

  async down(db) {
    await db.collection('users').dropIndex('email_1');
    await db.collection('categories').dropIndex('name_1');
    await db.collection('hotels').dropIndex('city_1_categoryId_1');
    await db.collection('hotels').dropIndex('room_types.pricePerNight_1');
    await db.collection('bookings').dropIndex('status_1');
    await db.collection('bookings').dropIndex('bookingCode_1');
    await db.collection('vouchers').dropIndex('code_1');
  },
};


// ================================================================
// FILE: migrations/20260709000000-add-wallet-indexes.js  (BARU di v2)
// ================================================================
module.exports = {
  async up(db) {
    await db.collection('wallets').createIndex({ userId: 1 }, { unique: true });
    await db.collection('wallettransactions').createIndex({ userId: 1 });
    await db.collection('wallettransactions').createIndex({ referenceId: 1 });
    await db.collection('bookings').createIndex({ paymentMethod: 1 });
  },

  async down(db) {
    await db.collection('wallets').dropIndex('userId_1');
    await db.collection('wallettransactions').dropIndex('userId_1');
    await db.collection('wallettransactions').dropIndex('referenceId_1');
    await db.collection('bookings').dropIndex('paymentMethod_1');
  },
};


// ================================================================
// FILE: seeders/index.js
// Jalankan dengan: node seeders/index.js
// Urutan seeding: categories -> users -> hotels -> vouchers ->
//                 bookings -> wallets -> wallet transactions -> reviews
// (wallets & ledger disusun setelah bookings supaya baris
// "payment"/"refund" bisa mereferensikan bookingCode yang nyata)
// ================================================================
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Category = require('../src/models/Category');
const User = require('../src/models/User');
const Hotel = require('../src/models/Hotel');
const Voucher = require('../src/models/Voucher');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Terhubung ke MongoDB, mulai seeding...');

  await Promise.all([
    Category.deleteMany({}),
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Voucher.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Wallet.deleteMany({}),
    WalletTransaction.deleteMany({}),
  ]);

  // ---------------- Categories (5) ----------------
  const categories = await Category.insertMany([
    { name: 'Resort', description: 'Hotel tepi pantai atau alam terbuka' },
    { name: 'Bintang 5', description: 'Hotel mewah dengan fasilitas lengkap' },
    { name: 'Bintang 3', description: 'Hotel nyaman dengan harga terjangkau' },
    { name: 'Budget / Backpacker', description: 'Penginapan hemat untuk solo traveler' },
    { name: 'Boutique', description: 'Hotel dengan desain unik dan personal' },
  ]);

  // ---------------- Users (5: 1 admin, 2 hotel manager, 2 customer) ----------------
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = await User.insertMany([
    {
      name: 'Admin Utama',
      email: 'admin@hotelapp.com',
      password: hashedPassword,
      phone: '081100000001',
      role: 'Admin',
    },
    {
      name: 'Siti Hotel Manager',
      email: 'siti.manager@hotelapp.com',
      password: hashedPassword,
      phone: '081100000002',
      role: 'HotelManager',
      subscriptionPlan: 'PRO',
    },
    {
      name: 'Andi Hotel Manager',
      email: 'andi.manager@hotelapp.com',
      password: hashedPassword,
      phone: '081100000003',
      role: 'HotelManager',
      subscriptionPlan: 'FREE',
    },
    {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: hashedPassword,
      phone: '081234567890',
      role: 'Customer',
    },
    {
      name: 'Rina Wijaya',
      email: 'rina@example.com',
      password: hashedPassword,
      phone: '081234567891',
      role: 'Customer',
    },
  ]);

  const admin = users[0];
  const managerSiti = users[1];
  const managerAndi = users[2];
  const customerBudi = users[3];
  const customerRina = users[4];

  // ---------------- Hotels (5, tiap hotel punya beberapa room_types) ----------------
  const hotels = await Hotel.insertMany([
    {
      name: 'Hotel Mawar Indah',
      description: 'Hotel bintang 3 di pusat kota Surabaya',
      address: 'Jl. Merdeka No. 10',
      city: 'Surabaya',
      categoryId: categories[2]._id, // Bintang 3
      ownerId: managerSiti._id,
      rating: 4.5,
      reviewCount: 2,
      room_types: [
        { name: 'Deluxe', pricePerNight: 450000, totalQuota: 10, available_quota: 10, capacity: 2, facilities: ['AC', 'TV', 'Wifi'] },
        { name: 'Suite', pricePerNight: 800000, totalQuota: 5, available_quota: 5, capacity: 4, facilities: ['AC', 'TV', 'Wifi', 'Bathtub'] },
      ],
    },
    {
      name: 'Bali Beach Resort',
      description: 'Resort tepi pantai dengan pemandangan sunset',
      address: 'Jl. Pantai Kuta No. 88',
      city: 'Badung',
      categoryId: categories[0]._id, // Resort
      ownerId: managerSiti._id,
      rating: 4.8,
      reviewCount: 1,
      isFeatured: true,
      room_types: [
        { name: 'Garden View', pricePerNight: 650000, totalQuota: 8, available_quota: 8, capacity: 2, facilities: ['AC', 'Wifi', 'Kolam Renang'] },
        { name: 'Ocean View Villa', pricePerNight: 1500000, totalQuota: 4, available_quota: 4, capacity: 4, facilities: ['AC', 'Wifi', 'Private Pool'] },
      ],
    },
    {
      name: 'Grand Jakarta Hotel',
      description: 'Hotel bintang 5 di jantung kota Jakarta',
      address: 'Jl. Sudirman No. 1',
      city: 'Jakarta',
      categoryId: categories[1]._id, // Bintang 5
      ownerId: managerAndi._id,
      rating: 4.7,
      reviewCount: 1,
      isFeatured: true,
      room_types: [
        { name: 'Executive Room', pricePerNight: 1200000, totalQuota: 15, available_quota: 15, capacity: 2, facilities: ['AC', 'TV', 'Wifi', 'Minibar'] },
        { name: 'Presidential Suite', pricePerNight: 3500000, totalQuota: 2, available_quota: 2, capacity: 4, facilities: ['AC', 'TV', 'Wifi', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Backpacker Homy Malang',
      description: 'Penginapan hemat dekat kampus dan wisata Malang',
      address: 'Jl. Ijen No. 25',
      city: 'Malang',
      categoryId: categories[3]._id, // Budget
      ownerId: managerAndi._id,
      rating: 4.2,
      reviewCount: 0,
      room_types: [
        { name: 'Shared Dorm', pricePerNight: 120000, totalQuota: 20, available_quota: 20, capacity: 1, facilities: ['Wifi', 'Locker'] },
        { name: 'Private Room', pricePerNight: 250000, totalQuota: 10, available_quota: 10, capacity: 2, facilities: ['AC', 'Wifi'] },
      ],
    },
    {
      name: 'Yogya Heritage Boutique',
      description: 'Hotel boutique bernuansa Jawa klasik dekat Malioboro',
      address: 'Jl. Malioboro No. 45',
      city: 'Yogyakarta',
      categoryId: categories[4]._id, // Boutique
      ownerId: managerSiti._id,
      rating: 4.6,
      reviewCount: 0,
      room_types: [
        { name: 'Joglo Room', pricePerNight: 550000, totalQuota: 6, available_quota: 6, capacity: 2, facilities: ['AC', 'Wifi', 'Dekorasi Tradisional'] },
      ],
    },
  ]);

  // ---------------- Vouchers (5: 3 global oleh Admin, 2 khusus hotel oleh HotelManager) ----------------
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const vouchers = await Voucher.insertMany([
    {
      code: 'DISKON20',
      type: 'percentage',
      value: 20,
      maxDiscount: 100000,
      minTransaction: 500000,
      quota: 50,
      usedCount: 5,
      startDate: now,
      expiredDate: threeMonthsLater,
      hotelId: null,
      createdBy: admin._id,
    },
    {
      code: 'HEMAT50K',
      type: 'fixed',
      value: 50000,
      minTransaction: 300000,
      quota: 100,
      usedCount: 12,
      startDate: now,
      expiredDate: threeMonthsLater,
      hotelId: null,
      createdBy: admin._id,
    },
    {
      code: 'NEWUSER15',
      type: 'percentage',
      value: 15,
      maxDiscount: 75000,
      minTransaction: 200000,
      quota: 200,
      usedCount: 30,
      startDate: now,
      expiredDate: oneMonthLater,
      hotelId: null,
      createdBy: admin._id,
    },
    {
      code: 'MAWAR50K',
      type: 'fixed',
      value: 50000,
      minTransaction: 300000,
      quota: 100,
      usedCount: 1,
      startDate: now,
      expiredDate: threeMonthsLater,
      hotelId: hotels[0]._id, // Hotel Mawar Indah
      createdBy: managerSiti._id,
    },
    {
      code: 'BALIVACATION',
      type: 'percentage',
      value: 10,
      maxDiscount: 150000,
      minTransaction: 600000,
      quota: 40,
      usedCount: 0,
      startDate: now,
      expiredDate: threeMonthsLater,
      hotelId: hotels[1]._id, // Bali Beach Resort
      createdBy: managerSiti._id,
    },
  ]);

  // ---------------- Bookings (6, berbagai status & paymentMethod) ----------------
  const checkIn1 = new Date('2026-08-10');
  const checkOut1 = new Date('2026-08-12');
  const nights1 = 2;
  const subtotal1 = hotels[0].room_types[0].pricePerNight * nights1; // 900.000
  const discount1 = Math.min((subtotal1 * 20) / 100, 100000); // 100.000
  const total1 = subtotal1 - discount1; // 800.000

  const checkIn2 = new Date('2026-09-01');
  const checkOut2 = new Date('2026-09-04');
  const nights2 = 3;
  const subtotal2 = hotels[1].room_types[1].pricePerNight * nights2; // 4.500.000

  const checkIn6 = new Date('2026-07-15');
  const checkOut6 = new Date('2026-07-17');
  const nights6 = 2;
  const subtotal6 = hotels[3].room_types[1].pricePerNight * nights6; // Private Room 250.000 x 2 = 500.000

  const bookings = await Booking.insertMany([
    {
      // Dibayar dari saldo Wallet (paymentMethod: "wallet") -> langsung confirmed, tanpa Snap token
      bookingCode: 'BK-20260708-0001',
      customerId: customerBudi._id,
      hotelId: hotels[0]._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      details: [
        {
          roomTypeId: hotels[0].room_types[0]._id,
          roomTypeName: hotels[0].room_types[0].name,
          pricePerNight: hotels[0].room_types[0].pricePerNight,
          quantity: 1,
          nights: nights1,
          subtotal: subtotal1,
        },
      ],
      subtotal: subtotal1,
      voucherCode: 'DISKON20',
      discountAmount: discount1,
      totalAmount: total1,
      paymentMethod: 'wallet',
      status: 'confirmed',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      payment: { transactionId: null, paidAt: now },
    },
    {
      // Dibayar via Midtrans langsung, sudah checked_out
      bookingCode: 'BK-20260708-0002',
      customerId: customerRina._id,
      hotelId: hotels[1]._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      details: [
        {
          roomTypeId: hotels[1].room_types[1]._id,
          roomTypeName: hotels[1].room_types[1].name,
          pricePerNight: hotels[1].room_types[1].pricePerNight,
          quantity: 1,
          nights: nights2,
          subtotal: subtotal2,
        },
      ],
      subtotal: subtotal2,
      voucherCode: null,
      discountAmount: 0,
      totalAmount: subtotal2,
      paymentMethod: 'midtrans',
      status: 'checked_out',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      payment: { transactionId: 'TXN-0002', paidAt: now },
    },
    {
      // Masih menunggu pembayaran Midtrans (Snap token aktif)
      bookingCode: 'BK-20260708-0003',
      customerId: customerBudi._id,
      hotelId: hotels[2]._id,
      checkInDate: new Date('2026-10-05'),
      checkOutDate: new Date('2026-10-06'),
      details: [
        {
          roomTypeId: hotels[2].room_types[0]._id,
          roomTypeName: hotels[2].room_types[0].name,
          pricePerNight: hotels[2].room_types[0].pricePerNight,
          quantity: 1,
          nights: 1,
          subtotal: hotels[2].room_types[0].pricePerNight,
        },
      ],
      subtotal: hotels[2].room_types[0].pricePerNight,
      voucherCode: null,
      discountAmount: 0,
      totalAmount: hotels[2].room_types[0].pricePerNight,
      paymentMethod: 'midtrans',
      status: 'pending_payment',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      payment: { snapToken: '66f2-dummy-snap-token', redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/66f2-dummy' },
    },
    {
      // Kuota sudah balik karena lewat batas waktu bayar
      bookingCode: 'BK-20260708-0004',
      customerId: customerRina._id,
      hotelId: hotels[3]._id,
      checkInDate: new Date('2026-07-20'),
      checkOutDate: new Date('2026-07-21'),
      details: [
        {
          roomTypeId: hotels[3].room_types[0]._id,
          roomTypeName: hotels[3].room_types[0].name,
          pricePerNight: hotels[3].room_types[0].pricePerNight,
          quantity: 2,
          nights: 1,
          subtotal: hotels[3].room_types[0].pricePerNight * 2,
        },
      ],
      subtotal: hotels[3].room_types[0].pricePerNight * 2,
      voucherCode: null,
      discountAmount: 0,
      totalAmount: hotels[3].room_types[0].pricePerNight * 2,
      paymentMethod: 'midtrans',
      status: 'expired',
      expiresAt: new Date(now.getTime() - 60 * 60 * 1000),
    },
    {
      // Dibatalkan sebelum bayar (pending_payment -> cancelled), tidak ada dana yang perlu dikembalikan
      bookingCode: 'BK-20260708-0005',
      customerId: customerBudi._id,
      hotelId: hotels[4]._id,
      checkInDate: new Date('2026-11-01'),
      checkOutDate: new Date('2026-11-03'),
      details: [
        {
          roomTypeId: hotels[4].room_types[0]._id,
          roomTypeName: hotels[4].room_types[0].name,
          pricePerNight: hotels[4].room_types[0].pricePerNight,
          quantity: 1,
          nights: 2,
          subtotal: hotels[4].room_types[0].pricePerNight * 2,
        },
      ],
      subtotal: hotels[4].room_types[0].pricePerNight * 2,
      voucherCode: null,
      discountAmount: 0,
      totalAmount: hotels[4].room_types[0].pricePerNight * 2,
      paymentMethod: 'midtrans',
      status: 'cancelled',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    },
    {
      // BARU di v2: sudah bayar via Midtrans, dibatalkan setelah bayar -> refund_requested -> diproses
      // Admin (PUT /bookings/:id/refund) -> dana masuk ke Wallet Rina -> status "refunded"
      bookingCode: 'BK-20260708-0006',
      customerId: customerRina._id,
      hotelId: hotels[3]._id,
      checkInDate: checkIn6,
      checkOutDate: checkOut6,
      details: [
        {
          roomTypeId: hotels[3].room_types[1]._id,
          roomTypeName: hotels[3].room_types[1].name,
          pricePerNight: hotels[3].room_types[1].pricePerNight,
          quantity: 1,
          nights: nights6,
          subtotal: subtotal6,
        },
      ],
      subtotal: subtotal6,
      voucherCode: null,
      discountAmount: 0,
      totalAmount: subtotal6,
      paymentMethod: 'midtrans',
      status: 'refunded',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      payment: { transactionId: 'TXN-0006', paidAt: now },
    },
  ]);

  const booking0001 = bookings[0]; // dibayar dari wallet Budi
  const booking0006 = bookings[5]; // di-refund ke wallet Rina

  // ---------------- Wallets (5, satu per user) + Wallet Transactions (7, ledger) ----------------
  // Disusun manual secara berurutan per user supaya balanceBefore/balanceAfter konsisten,
  // meniru hasil akhir dari operasi atomik $inc yang dijelaskan di CLAUDE.md Bab 11.8.

  const walletTxs = [];

  // --- Budi: topup lalu bayar booking BK-0001 dari saldo wallet ---
  walletTxs.push({
    userId: customerBudi._id,
    type: 'topup',
    amount: 2000000,
    balanceBefore: 0,
    balanceAfter: 2000000,
    referenceId: 'TOPUP-20260701-0001',
    status: 'success',
    note: 'Top-up awal via Midtrans (settlement)',
  });
  walletTxs.push({
    userId: customerBudi._id,
    type: 'payment',
    amount: total1, // 800.000
    balanceBefore: 2000000,
    balanceAfter: 2000000 - total1, // 1.200.000
    referenceId: booking0001.bookingCode,
    status: 'success',
    note: 'Pembayaran booking dari saldo Wallet',
  });
  const budiFinalBalance = 2000000 - total1; // 1.200.000

  // --- Rina: topup, lalu menerima refund dari booking BK-0006 ---
  walletTxs.push({
    userId: customerRina._id,
    type: 'topup',
    amount: 1500000,
    balanceBefore: 0,
    balanceAfter: 1500000,
    referenceId: 'TOPUP-20260702-0002',
    status: 'success',
    note: 'Top-up awal via Midtrans (settlement)',
  });
  walletTxs.push({
    userId: customerRina._id,
    type: 'refund',
    amount: subtotal6, // 500.000
    balanceBefore: 1500000,
    balanceAfter: 1500000 + subtotal6, // 2.000.000
    referenceId: booking0006.bookingCode,
    status: 'success',
    note: 'Refund booking yang dibatalkan setelah bayar, diproses Admin',
  });
  const rinaFinalBalance = 1500000 + subtotal6; // 2.000.000

  // --- Siti (HotelManager PRO): topup lalu bayar biaya subscription PRO ---
  walletTxs.push({
    userId: managerSiti._id,
    type: 'topup',
    amount: 1000000,
    balanceBefore: 0,
    balanceAfter: 1000000,
    referenceId: 'TOPUP-20260703-0003',
    status: 'success',
    note: 'Top-up untuk biaya langganan Hotel Manager',
  });
  walletTxs.push({
    userId: managerSiti._id,
    type: 'payment',
    amount: 500000,
    balanceBefore: 1000000,
    balanceAfter: 500000,
    referenceId: 'SUBSCRIPTION-PRO-20260703',
    status: 'success',
    note: 'Pembayaran biaya langganan plan PRO dari saldo Wallet',
  });
  const sitiFinalBalance = 500000;

  // --- Andi (HotelManager FREE): baru mengajukan top-up, belum dibayar ---
  walletTxs.push({
    userId: managerAndi._id,
    type: 'topup',
    amount: 300000,
    balanceBefore: 0,
    balanceAfter: 0, // saldo belum bertambah karena masih pending
    referenceId: 'TOPUP-20260708-0004',
    status: 'pending',
    note: 'Menunggu pembayaran Snap token, belum settlement',
  });
  const andiFinalBalance = 0;

  // --- Admin: contoh koreksi saldo manual (adjustment) ---
  walletTxs.push({
    userId: admin._id,
    type: 'adjustment',
    amount: 10000,
    balanceBefore: 0,
    balanceAfter: 10000,
    referenceId: 'ADJ-20260708-0001',
    status: 'success',
    note: 'Koreksi selisih pembulatan promo Juli 2026',
  });
  const adminFinalBalance = 10000;

  await WalletTransaction.insertMany(walletTxs);

  const wallets = await Wallet.insertMany([
    { userId: admin._id, balance: adminFinalBalance },
    { userId: managerSiti._id, balance: sitiFinalBalance },
    { userId: managerAndi._id, balance: andiFinalBalance },
    { userId: customerBudi._id, balance: budiFinalBalance },
    { userId: customerRina._id, balance: rinaFinalBalance },
  ]);

  // Simpan referensi ledger pembayaran/refund ke booking terkait (opsional, memudahkan audit)
  const budiPaymentTx = walletTxs[1];
  const rinaRefundTx = walletTxs[3];
  await Booking.updateOne(
    { bookingCode: booking0001.bookingCode },
    { $set: { walletTransactionId: (await WalletTransaction.findOne({ referenceId: booking0001.bookingCode }))._id } }
  );
  await Booking.updateOne(
    { bookingCode: booking0006.bookingCode },
    { $set: { walletTransactionId: (await WalletTransaction.findOne({ referenceId: booking0006.bookingCode }))._id } }
  );

  // ---------------- Reviews (5, hanya untuk booking checked_out/confirmed) ----------------
  await Review.insertMany([
    {
      hotelId: hotels[0]._id,
      customerId: customerBudi._id,
      bookingId: bookings[0]._id,
      rating: 5,
      comment: 'Kamar bersih, staff ramah, lokasi strategis di pusat kota.',
    },
    {
      hotelId: hotels[1]._id,
      customerId: customerRina._id,
      bookingId: bookings[1]._id,
      rating: 5,
      comment: 'Pemandangan pantai luar biasa, sarapan enak, worth it!',
    },
    {
      hotelId: hotels[0]._id,
      customerId: customerRina._id,
      bookingId: bookings[1]._id,
      rating: 4,
      comment: 'Nyaman tapi parkir agak sempit.',
    },
    {
      hotelId: hotels[2]._id,
      customerId: customerBudi._id,
      bookingId: bookings[2]._id,
      rating: 5,
      comment: 'Pelayanan bintang 5 beneran, kamar luas dan mewah.',
    },
    {
      hotelId: hotels[1]._id,
      customerId: customerBudi._id,
      bookingId: bookings[0]._id,
      rating: 4,
      comment: 'Resort bagus, hanya saja wifi agak lambat di malam hari.',
    },
  ]);

  console.log('Seeding selesai!');
  console.log(`- ${categories.length} categories`);
  console.log(`- ${users.length} users`);
  console.log(`- ${hotels.length} hotels`);
  console.log(`- ${vouchers.length} vouchers`);
  console.log(`- ${bookings.length} bookings`);
  console.log(`- ${wallets.length} wallets`);
  console.log(`- ${walletTxs.length} wallet transactions`);
  console.log('- 5 reviews');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding gagal:', err);
  process.exit(1);
});

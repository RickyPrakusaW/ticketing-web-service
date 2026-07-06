require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  Role,
  User,
  Category,
  Hotel,
  Booking,
  Payment,
  PaymentMethod
} = require('./src/models');

const seedDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management_db';
  console.log(`Connecting to database at ${mongoURI}...`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB.');

  try {
    // 1. Clear existing data
    console.log('Clearing old database records...');
    await Role.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Hotel.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await PaymentMethod.deleteMany({});
    console.log('All collections cleared successfully.');

    // 2. Insert Roles
    console.log('Seeding Roles...');
    const roles = await Role.insertMany([
      { name: 'Admin', description: 'Kelola sistem hotel secara keseluruhan' },
      { name: 'Hotel Manager', description: 'Kelola pendaftaran hotel, kamar, dan check-in tamu' },
      { name: 'Customer', description: 'Melakukan pemesanan/booking kamar hotel' }
    ]);
    const roleAdmin = roles.find(r => r.name === 'Admin');
    const roleManager = roles.find(r => r.name === 'Hotel Manager');
    const roleCustomer = roles.find(r => r.name === 'Customer');

    // 3. Insert Users (Password is hashed)
    console.log('Seeding Users...');
    const hashedPass = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { role_id: roleAdmin._id, full_name: 'Super Admin', email: 'admin@hotel.com', password: hashedPass, phone: '081122334455', is_active: true },
      { role_id: roleManager._id, full_name: 'Manager Grand Hyatt', email: 'manager.grand@hotel.com', password: hashedPass, phone: '08123456789', is_active: true },
      { role_id: roleManager._id, full_name: 'Manager Aston Hotel', email: 'manager.aston@hotel.com', password: hashedPass, phone: '08129876543', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Budi Santoso', email: 'budi@gmail.com', password: hashedPass, phone: '085511223344', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Siti Aminah', email: 'siti@gmail.com', password: hashedPass, phone: '085544332211', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Rendi Wijaya', email: 'rendi@gmail.com', password: hashedPass, phone: '085599887766', is_active: true }
    ]);
    const userManagerGrand = users.find(u => u.email === 'manager.grand@hotel.com');
    const userManagerAston = users.find(u => u.email === 'manager.aston@hotel.com');
    const userCustomerBudi = users.find(u => u.email === 'budi@gmail.com');
    const userCustomerSiti = users.find(u => u.email === 'siti@gmail.com');
    const userCustomerRendi = users.find(u => u.email === 'rendi@gmail.com');

    // 4. Insert Categories
    console.log('Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Resort', description: 'Hotel peristirahatan dengan fasilitas rekreasi lengkap' },
      { name: 'Business Hotel', description: 'Hotel penunjang aktivitas bisnis di pusat kota' },
      { name: 'Boutique Hotel', description: 'Hotel bertema unik dengan estetika khusus' },
      { name: 'Budget Hotel', description: 'Hotel ekonomis untuk perjalanan hemat' },
      { name: 'Villa', description: 'Penginapan privat berukuran besar' }
    ]);
    const catResort = categories.find(c => c.name === 'Resort');
    const catBusiness = categories.find(c => c.name === 'Business Hotel');
    const catBoutique = categories.find(c => c.name === 'Boutique Hotel');
    const catBudget = categories.find(c => c.name === 'Budget Hotel');

    // 5. Insert Hotels (with embedded RoomTypes)
    console.log('Seeding Hotels with embedded RoomTypes...');
    const hotels = await Hotel.insertMany([
      {
        manager_id: userManagerGrand._id,
        category_id: catBusiness._id,
        name: 'Grand Hyatt Jakarta',
        description: 'Hotel mewah bintang 5 yang terletak strategis di jantung kota Jakarta, terhubung langsung dengan Grand Indonesia.',
        address: 'Jl. M.H. Thamrin No.1',
        city: 'Jakarta',
        latitude: -6.1950,
        longitude: 106.8230,
        rating: 4.8,
        images: ['https://via.placeholder.com/600x400/hyatt1', 'https://via.placeholder.com/600x400/hyatt2'],
        room_types: [
          {
            name: 'Deluxe King',
            description: 'Kamar Deluxe seluas 45m2 dengan tempat tidur ukuran King, pemandangan kota, AC, TV, Wifi, Bathtub, dan gratis sarapan.',
            price: 1800000,
            capacity: 2,
            total_rooms: 30,
            booked_rooms: 1,
            facilities: ['Free WiFi', 'AC', 'Bathtub', 'Flat Screen TV', 'Breakfast'],
            status: 'available'
          },
          {
            name: 'Grand Suite',
            description: 'Kamar tipe Suite seluas 90m2 dengan ruang tamu terpisah, tempat tidur King, mini bar premium, jacuzzi privat, dan sarapan buffet.',
            price: 4500000,
            capacity: 3,
            total_rooms: 10,
            booked_rooms: 0,
            facilities: ['Free WiFi', 'AC', 'Bathtub', 'Flat Screen TV', 'Living Room', 'Mini Bar', 'Breakfast'],
            status: 'available'
          }
        ]
      },
      {
        manager_id: userManagerAston._id,
        category_id: catBudget._id,
        name: 'Aston Favehotel Solo',
        description: 'Hotel budget modern dan stylish di pusat kota Solo yang menyajikan kenyamanan dengan harga ekonomis.',
        address: 'Jl. Adisucipto No.60',
        city: 'Solo',
        latitude: -7.5562,
        longitude: 110.8021,
        rating: 4.2,
        images: ['https://via.placeholder.com/600x400/fave1'],
        room_types: [
          {
            name: 'Standard Room',
            description: 'Kamar Standard seluas 18m2 dengan tempat tidur Queen, AC, TV satelit, Wifi kencang, dan kamar mandi pancuran (shower).',
            price: 400000,
            capacity: 2,
            total_rooms: 50,
            booked_rooms: 2,
            facilities: ['Free WiFi', 'AC', 'Shower', 'Flat Screen TV'],
            status: 'available'
          },
          {
            name: 'Superior Room',
            description: 'Kamar Superior seluas 24m2 dengan pilihan tempat tidur Twin atau Double, AC, teh/kopi maker, Wifi, dan kulkas kecil.',
            price: 600000,
            capacity: 2,
            total_rooms: 20,
            booked_rooms: 0,
            facilities: ['Free WiFi', 'AC', 'Shower', 'Flat Screen TV', 'Coffee Maker', 'Mini Fridge'],
            status: 'available'
          }
        ]
      }
    ]);
    const hotelHyatt = hotels.find(h => h.name === 'Grand Hyatt Jakarta');
    const hotelAston = hotels.find(h => h.name === 'Aston Favehotel Solo');

    // 6. Insert Payment Methods
    console.log('Seeding PaymentMethods...');
    const payMethods = await PaymentMethod.insertMany([
      { name: 'Transfer Bank', description: 'Manual Bank Transfer via BCA/Mandiri', provider: 'BCA', is_active: true },
      { name: 'E-Wallet', description: 'Instant payment via GoPay/OVO', provider: 'GoPay', is_active: true },
      { name: 'Virtual Account', description: 'Automatic Bank Transfer Virtual Account', provider: 'BNI', is_active: true },
      { name: 'Credit Card', description: 'Visa / Mastercard via Payment Gateway', provider: 'Midtrans', is_active: true }
    ]);

    // 7. Insert Bookings (using embedded details)
    console.log('Seeding Bookings...');
    const roomHyattDeluxe = hotelHyatt.room_types.find(r => r.name === 'Deluxe King');
    const roomAstonStandard = hotelAston.room_types.find(r => r.name === 'Standard Room');
    const roomAstonSuperior = hotelAston.room_types.find(r => r.name === 'Superior Room');

    // Booking Dates helpers
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // Check-in time 14:00

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    dayAfterTomorrow.setHours(12, 0, 0, 0); // Check-out time 12:00

    const inFiveDays = new Date();
    inFiveDays.setDate(inFiveDays.getDate() + 5);
    inFiveDays.setHours(14, 0, 0, 0);

    const inSixDays = new Date();
    inSixDays.setDate(inSixDays.getDate() + 6);
    inSixDays.setHours(12, 0, 0, 0);

    await Booking.insertMany([
      {
        user_id: userCustomerBudi._id,
        booking_code: 'BKG-GHJ-001',
        hotel_id: hotelHyatt._id,
        check_in_date: tomorrow,
        check_out_date: dayAfterTomorrow,
        total_nights: 2,
        total_amount: 3600000, // 1 Room * 1.800.000 * 2 Nights
        payment_status: 'paid',
        payment_method: 'Transfer BCA',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paid_at: new Date(),
        details: [
          {
            room_type_id: roomHyattDeluxe._id,
            qty_rooms: 1,
            price_per_night: 1800000,
            subtotal: 3600000,
            guest_names: ['Budi Santoso', 'Andi Santoso'],
            status: 'active'
          }
        ]
      },
      {
        user_id: userCustomerSiti._id,
        booking_code: 'BKG-AFS-002',
        hotel_id: hotelAston._id,
        check_in_date: inFiveDays,
        check_out_date: inSixDays,
        total_nights: 1,
        total_amount: 800000, // 2 Rooms * 400.000 * 1 Night
        payment_status: 'pending',
        payment_method: 'GoPay',
        expired_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours expiry
        details: [
          {
            room_type_id: roomAstonStandard._id,
            qty_rooms: 2,
            price_per_night: 400000,
            subtotal: 800000,
            guest_names: ['Siti Aminah', 'Aisyah Aminah'],
            status: 'active'
          }
        ]
      },
      {
        user_id: userCustomerRendi._id,
        booking_code: 'BKG-AFS-003',
        hotel_id: hotelAston._id,
        check_in_date: inFiveDays,
        check_out_date: inSixDays,
        total_nights: 1,
        total_amount: 600000, // 1 Room * 600.000 * 1 Night
        payment_status: 'cancelled',
        payment_method: 'Transfer Bank',
        expired_at: new Date(Date.now() - 60 * 60 * 1000), // expired 1 hour ago
        details: [
          {
            room_type_id: roomAstonSuperior._id,
            qty_rooms: 1,
            price_per_night: 600000,
            subtotal: 600000,
            guest_names: ['Rendi Wijaya'],
            status: 'cancelled'
          }
        ]
      }
    ]);

    console.log('Database successfully seeded with Hotel dummy data! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDB();

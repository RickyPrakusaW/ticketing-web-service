require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  Role,
  User,
  Category,
  Venue,
  Event,
  SubscriptionPlan,
  OrganizerSubscription,
  Order,
  Payment,
  UploadedFile,
  PaymentMethod
} = require('./src/models');

const seedDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticketing_event_db';
  console.log(`Connecting to database at ${mongoURI}...`);
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB.');

  try {
    // 1. Clear existing data
    console.log('Clearing old database records...');
    await Role.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Venue.deleteMany({});
    await Event.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await OrganizerSubscription.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await UploadedFile.deleteMany({});
    await PaymentMethod.deleteMany({});
    console.log('All collections cleared successfully.');

    // 2. Insert Roles
    console.log('Seeding Roles...');
    const roles = await Role.insertMany([
      { name: 'Admin', description: 'Kelola sistem' },
      { name: 'Organizer', description: 'Buat event' },
      { name: 'Customer', description: 'Beli tiket' }
    ]);
    const roleAdmin = roles.find(r => r.name === 'Admin');
    const roleOrganizer = roles.find(r => r.name === 'Organizer');
    const roleCustomer = roles.find(r => r.name === 'Customer');

    // 3. Insert Users (Password is hashed)
    console.log('Seeding Users...');
    const hashedPass = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { role_id: roleAdmin._id, full_name: 'Super Admin', email: 'admin@event.com', password: hashedPass, phone: '081122334455', is_active: true },
      { role_id: roleOrganizer._id, full_name: 'Java Jazz Group', email: 'info@javajazz.com', password: hashedPass, phone: '08123456789', is_active: true },
      { role_id: roleOrganizer._id, full_name: 'Tech Conference Organizer', email: 'contact@techconf.id', password: hashedPass, phone: '08129876543', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Budi Santoso', email: 'budi@gmail.com', password: hashedPass, phone: '085511223344', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Siti Aminah', email: 'siti@gmail.com', password: hashedPass, phone: '085544332211', is_active: true },
      { role_id: roleCustomer._id, full_name: 'Rendi Wijaya', email: 'rendi@gmail.com', password: hashedPass, phone: '085599887766', is_active: true }
    ]);
    const userOrganizerJazz = users.find(u => u.email === 'info@javajazz.com');
    const userOrganizerTech = users.find(u => u.email === 'contact@techconf.id');
    const userCustomerBudi = users.find(u => u.email === 'budi@gmail.com');
    const userCustomerSiti = users.find(u => u.email === 'siti@gmail.com');
    const userCustomerRendi = users.find(u => u.email === 'rendi@gmail.com');

    // 4. Insert Categories
    console.log('Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Musik & Konser', description: 'Konser musik live dan festival' },
      { name: 'Seminar & Workshop', description: 'Kegiatan edukasi dan sharing session' },
      { name: 'Olahraga', description: 'Pertandingan dan kompetisi olahraga' },
      { name: 'Seni & Budaya', description: 'Pameran seni, wayang, dan teater' },
      { name: 'Teknologi & IT', description: 'Seminar dan expo dunia teknologi' }
    ]);
    const catMusik = categories.find(c => c.name === 'Musik & Konser');
    const catTech = categories.find(c => c.name === 'Teknologi & IT');
    const catArt = categories.find(c => c.name === 'Seni & Budaya');
    const catSeminar = categories.find(c => c.name === 'Seminar & Workshop');
    const catSport = categories.find(c => c.name === 'Olahraga');

    // 5. Insert Venues
    console.log('Seeding Venues...');
    const venues = await Venue.insertMany([
      { name: 'JIExpo Kemayoran', city: 'Jakarta', address: 'Jl. Benyamin Suaeb', capacity: 5000, contact_person: 'Mr. John', contact_phone: '081223344' },
      { name: 'ICE BSD', city: 'Tangerang', address: 'BSD City', capacity: 10000, contact_person: 'Mrs. Jane', contact_phone: '081334455' },
      { name: 'Stadion Utama GBK', city: 'Jakarta', address: 'Senayan', capacity: 75000, contact_person: 'Mr. Budi', contact_phone: '081445566' },
      { name: 'Balai Kartini', city: 'Jakarta', address: 'Jl. Gatot Subroto', capacity: 3500, contact_person: 'Mrs. Ani', contact_phone: '081556677' },
      { name: 'Jatim Expo', city: 'Surabaya', address: 'Jl. Ahmad Yani', capacity: 5000, contact_person: 'Mr. Dedi', contact_phone: '081667788' }
    ]);
    const venueJIExpo = venues.find(v => v.name === 'JIExpo Kemayoran');
    const venueICE = venues.find(v => v.name === 'ICE BSD');
    const venueGBK = venues.find(v => v.name === 'Stadion Utama GBK');
    const venueKartini = venues.find(v => v.name === 'Balai Kartini');
    const venueJatim = venues.find(v => v.name === 'Jatim Expo');

    // 6. Insert Events (with embedded TicketTypes)
    console.log('Seeding Events with embedded TicketTypes...');
    const events = await Event.insertMany([
      {
        organizer_id: userOrganizerJazz._id,
        category_id: catMusik._id,
        venue_id: venueJIExpo._id,
        title: 'Jakarta Jazz Night 2024',
        description: 'Malam spektakuler penuh irama jazz bersama musisi legendaris.',
        event_date: new Date('2024-08-15T19:00:00Z'),
        event_end_date: new Date('2024-08-15T23:00:00Z'),
        poster_image: 'https://via.placeholder.com/300x400',
        status: 'published',
        is_free: false,
        ticket_types: [
          { name: 'Festival A', description: 'Area berdiri di depan stage', price: 250000, quota: 500, sold: 3 },
          { name: 'VIP', description: 'Kursi baris depan, free merchandise', price: 750000, quota: 50, sold: 0 }
        ]
      },
      {
        organizer_id: userOrganizerTech._id,
        category_id: catTech._id,
        venue_id: venueICE._id,
        title: 'AI Future Summit',
        description: 'Membahas masa depan kecerdasan buatan dan implikasinya pada industri.',
        event_date: new Date('2024-09-10T09:00:00Z'),
        event_end_date: new Date('2024-09-10T17:00:00Z'),
        poster_image: 'https://via.placeholder.com/300x400',
        status: 'published',
        is_free: false,
        ticket_types: [
          { name: 'Early Bird', description: 'Akses penuh harga miring', price: 150000, quota: 100, sold: 1 }
        ]
      },
      {
        organizer_id: userOrganizerJazz._id,
        category_id: catArt._id,
        venue_id: venueKartini._id,
        title: 'Wayang Heritage Show',
        description: 'Pergelaran wayang kulit spektakuler semalam suntuk.',
        event_date: new Date('2024-08-20T20:00:00Z'),
        event_end_date: new Date('2024-08-21T04:00:00Z'),
        poster_image: 'https://via.placeholder.com/300x400',
        status: 'published',
        is_free: false,
        ticket_types: [
          { name: 'Reguler', description: 'Tiket masuk standar', price: 100000, quota: 300, sold: 1 }
        ]
      },
      {
        organizer_id: userOrganizerTech._id,
        category_id: catSeminar._id,
        venue_id: venueJatim._id,
        title: 'Digital Marketing 101',
        description: 'Belajar strategi pemasaran digital dasar dari praktisi berpengalaman.',
        event_date: new Date('2024-10-05T10:00:00Z'),
        event_end_date: new Date('2024-10-05T15:00:00Z'),
        poster_image: 'https://via.placeholder.com/300x400',
        status: 'published',
        is_free: false,
        ticket_types: [
          { name: 'Online Access', description: 'Akses streaming zoom', price: 50000, quota: 1000, sold: 1 }
        ]
      },
      {
        organizer_id: userOrganizerJazz._id,
        category_id: catSport._id,
        venue_id: venueGBK._id,
        title: 'Indonesia Marathon 2024',
        description: 'Lari bersama puluhan ribu pelari nasional dan internasional.',
        event_date: new Date('2024-11-12T05:00:00Z'),
        event_end_date: new Date('2024-11-12T12:00:00Z'),
        poster_image: 'https://via.placeholder.com/300x400',
        status: 'draft',
        is_free: true,
        ticket_types: []
      }
    ]);
    const eventJazz = events.find(e => e.title === 'Jakarta Jazz Night 2024');
    const eventAI = events.find(e => e.title === 'AI Future Summit');
    const eventWayang = events.find(e => e.title === 'Wayang Heritage Show');
    const eventMarketing = events.find(e => e.title === 'Digital Marketing 101');

    // 7. Insert Subscription Plans
    console.log('Seeding SubscriptionPlans...');
    const plans = await SubscriptionPlan.insertMany([
      { name: 'Free', description: 'Paket gratis untuk mencoba', price: 0, duration_days: 30, event_limit: 1, is_active: true },
      { name: 'Pro', description: 'Untuk organizer profesional', price: 99000, duration_days: 30, event_limit: 10, is_active: true },
      { name: 'Enterprise', description: 'Tanpa batas event, support premium', price: 299000, duration_days: 30, event_limit: 999, is_active: true },
      { name: 'Starter', description: 'Memulai dengan 3 event', price: 49000, duration_days: 30, event_limit: 3, is_active: true },
      { name: 'Annual VIP', description: 'Langganan tahunan enterprise', price: 2500000, duration_days: 365, event_limit: 9999, is_active: true }
    ]);

    // 8. Insert Payment Methods
    console.log('Seeding PaymentMethods...');
    const payMethods = await PaymentMethod.insertMany([
      { name: 'Transfer Bank', description: 'Manual Bank Transfer', provider: 'BCA', is_active: true },
      { name: 'E-Wallet', description: 'Pembayaran instan e-wallet', provider: 'GoPay', is_active: true },
      { name: 'Virtual Account', description: 'BNI Virtual Account', provider: 'BNI', is_active: true },
      { name: 'Credit Card', description: 'Kartu kredit via gateway', provider: 'Midtrans', is_active: true },
      { name: 'Retail', description: 'Bayar via minimarket terdekat', provider: 'Alfamart', is_active: true }
    ]);

    // 9. Insert Orders (using embedded Details, matching SQL seeds total amounts)
    console.log('Seeding Orders...');
    const ticketA = eventJazz.ticket_types.find(t => t.name === 'Festival A');
    const ticketEarly = eventAI.ticket_types.find(t => t.name === 'Early Bird');
    const ticketWayang = eventWayang.ticket_types.find(t => t.name === 'Reguler');
    const ticketOnline = eventMarketing.ticket_types.find(t => t.name === 'Online Access');

    await Order.insertMany([
      {
        user_id: userCustomerBudi._id,
        order_code: 'ORD-001',
        event_id: eventJazz._id,
        total_amount: 250000,
        payment_status: 'paid',
        payment_method: 'Transfer BCA',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paid_at: new Date(),
        details: [
          {
            ticket_type_id: ticketA._id,
            ticket_code: 'TIX-001-AAA',
            qty: 1,
            price: 250000,
            subtotal: 250000,
            status: 'active'
          }
        ]
      },
      {
        user_id: userCustomerSiti._id,
        order_code: 'ORD-002',
        event_id: eventJazz._id,
        total_amount: 500000,
        payment_status: 'pending',
        payment_method: 'GoPay',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        details: [
          {
            ticket_type_id: ticketA._id,
            ticket_code: 'TIX-002-BBB',
            qty: 2,
            price: 250000,
            subtotal: 500000,
            status: 'active'
          }
        ]
      },
      {
        user_id: userCustomerRendi._id,
        order_code: 'ORD-003',
        event_id: eventAI._id,
        total_amount: 150000,
        payment_status: 'paid',
        payment_method: 'Virtual Account',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paid_at: new Date(),
        details: [
          {
            ticket_type_id: ticketEarly._id,
            ticket_code: 'TIX-003-CCC',
            qty: 1,
            price: 150000,
            subtotal: 150000,
            status: 'active'
          }
        ]
      },
      {
        user_id: userCustomerBudi._id,
        order_code: 'ORD-004',
        event_id: eventWayang._id,
        total_amount: 100000,
        payment_status: 'cancelled',
        payment_method: 'OVO',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        details: [
          {
            ticket_type_id: ticketWayang._id,
            ticket_code: 'TIX-004-DDD',
            qty: 1,
            price: 100000,
            subtotal: 100000,
            status: 'cancelled'
          }
        ]
      },
      {
        user_id: userCustomerSiti._id,
        order_code: 'ORD-005',
        event_id: eventMarketing._id,
        total_amount: 50000,
        payment_status: 'paid',
        payment_method: 'Kartu Kredit',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paid_at: new Date(),
        details: [
          {
            ticket_type_id: ticketOnline._id,
            ticket_code: 'TIX-005-EEE',
            qty: 1,
            price: 50000,
            subtotal: 50000,
            status: 'active'
          }
        ]
      }
    ]);

    console.log('Database successfully seeded! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDB();

const mongoose = require('mongoose');

const BookingDetailSchema = new mongoose.Schema({
  room_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  qty_rooms: {
    type: Number,
    required: true,
    min: 1
  },
  price_per_night: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  guest_names: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'checked_in', 'checked_out', 'cancelled']
  }
});

const BookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking_code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  check_in_date: {
    type: Date,
    required: true
  },
  check_out_date: {
    type: Date,
    required: true
  },
  total_nights: {
    type: Number,
    required: true,
    min: 1
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'cancelled']
  },
  payment_method: {
    type: String
  },
  notes: {
    type: String
  },
  expired_at: {
    type: Date,
    required: true
  },
  paid_at: {
    type: Date
  },
  details: [BookingDetailSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);

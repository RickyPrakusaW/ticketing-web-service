const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  provider: {
    type: String,
    required: true,
    default: 'Midtrans'
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  gross_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    required: true
  },
  payment_type: {
    type: String
  },
  paid_at: {
    type: Date
  },
  raw_response: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);

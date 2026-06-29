const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  ticket_type_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  ticket_code: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  status: { type: String, enum: ['active', 'used', 'cancelled'], default: 'active' },
  qr_code: { type: String },
  checked_in_at: { type: Date }
});

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_code: { type: String, required: true, unique: true, index: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  total_amount: { type: Number, required: true },
  payment_status: { type: String, enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'], default: 'pending' },
  payment_method: { type: String },
  notes: { type: String },
  expired_at: { type: Date },
  paid_at: { type: Date },
  details: [orderDetailSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

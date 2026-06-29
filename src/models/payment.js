const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  provider: { type: String, required: true },
  transaction_id: { type: String, required: true, unique: true, index: true },
  gross_amount: { type: Number, required: true },
  payment_status: { type: String, enum: ['pending', 'settlement', 'deny', 'cancel', 'expire'], default: 'pending' },
  payment_type: { type: String },
  paid_at: { type: Date },
  raw_response: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
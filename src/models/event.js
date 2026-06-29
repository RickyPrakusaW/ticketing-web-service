const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, default: 0 },
  quota: { type: Number, required: true },
  sold: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['available', 'sold_out', 'disabled'], default: 'available' }
});

const eventSchema = new mongoose.Schema({
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  venue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  title: { type: String, required: true },
  description: { type: String },
  event_date: { type: Date, required: true },
  event_end_date: { type: Date },
  poster_image: { type: String },
  status: { type: String, enum: ['draft', 'published', 'closed', 'cancelled'], default: 'draft' },
  is_free: { type: Boolean, default: false },
  ticket_types: [ticketTypeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
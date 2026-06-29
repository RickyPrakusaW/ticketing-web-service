const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  capacity: { type: Number, required: true },
  contact_person: { type: String },
  contact_phone: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema);
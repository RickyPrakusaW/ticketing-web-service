const mongoose = require('mongoose');

const RoomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  total_rooms: {
    type: Number,
    required: true,
    min: 0
  },
  booked_rooms: {
    type: Number,
    default: 0,
    min: 0
  },
  facilities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    default: 'available',
    enum: ['available', 'sold_out', 'disabled']
  }
});

const HotelSchema = new mongoose.Schema({
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  images: [{
    type: String
  }],
  room_types: [RoomTypeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', HotelSchema);

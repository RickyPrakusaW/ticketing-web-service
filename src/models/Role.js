const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Admin', 'Hotel Manager', 'Customer']
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', RoleSchema);

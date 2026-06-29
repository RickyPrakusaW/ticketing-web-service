const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  file_name: { type: String, required: true },
  file_path: { type: String, required: true },
  file_type: { type: String },
  file_size: { type: Number },
  upload_type: { type: String, enum: ['poster', 'profile', 'bukti_bayar', 'other'] }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
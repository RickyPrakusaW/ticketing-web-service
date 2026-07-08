const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  totalQuota: { type: Number, required: true, min: 0 },
  available_quota: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  facilities: [{ type: String }],
  photos: [{ type: String }],
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photos: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    room_types: [roomTypeSchema],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

hotelSchema.index({ city: 1 });
hotelSchema.index({ categoryId: 1 });
hotelSchema.index({ "room_types.pricePerNight": 1 });

module.exports = mongoose.model("Hotel", hotelSchema);

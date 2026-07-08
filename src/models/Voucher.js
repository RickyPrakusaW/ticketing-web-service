const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    // wajib diisi kalau type percentage, batas potongan maksimal
    maxDiscount: { type: Number, default: null },
    minTransaction: { type: Number, default: 0 },
    quota: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    expiredDate: { type: Date, required: true },
    // null = voucher global (dibuat Admin), diisi = milik hotel tertentu (HotelManager)
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", voucherSchema);

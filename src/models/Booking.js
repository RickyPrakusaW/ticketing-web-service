const mongoose = require("mongoose");

const bookingDetailSchema = new mongoose.Schema({
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  roomTypeName: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  nights: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    details: [bookingDetailSchema],
    subtotal: { type: Number, required: true },
    voucherCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    // metode bayar: "wallet" = potong saldo Wallet atomik, "midtrans" = Snap token seperti biasa
    paymentMethod: {
      type: String,
      enum: ["wallet", "midtrans"],
      required: true,
      default: "midtrans",
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "expired",
        "cancelled",
        "refund_requested",
        "refunded",
        "checked_in",
        "checked_out",
      ],
      default: "pending_payment",
    },
    expiresAt: { type: Date, required: true },
    payment: {
      snapToken: { type: String, default: null },
      redirectUrl: { type: String, default: null },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    // relasi opsional ke baris ledger WalletTransaction (pembayaran atau refund lewat wallet)
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
      default: null,
    },
    qrCode: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookingSchema.index({ status: 1 });
bookingSchema.index({ customerId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

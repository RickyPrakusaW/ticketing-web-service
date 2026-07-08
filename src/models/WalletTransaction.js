const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["topup", "payment", "refund", "adjustment"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    // topup: order_id Midtrans (mis. "TOPUP-20260708-0007")
    // payment/refund: bookingCode terkait (mis. "BK-20260708-0001")
    referenceId: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "expired"],
      default: "pending",
    },
    note: { type: String, trim: true, default: null },
  },
  { timestamps: true },
);

walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);

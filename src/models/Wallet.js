const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // saldo tidak pernah ditulis langsung dari input user, hanya lewat walletService
    balance: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

walletSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Wallet", walletSchema);

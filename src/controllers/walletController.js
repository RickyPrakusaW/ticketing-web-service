const { WalletTransaction } = require("../models");
const walletService = require("../services/walletService");
const midtransService = require("../services/midtransService");

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Ambil atau inisialisasi wallet user
    const wallet = await walletService.getOrCreateWallet(userId);

    // 2. Ambil riwayat mutasi transaksi wallet user
    const transactions = await WalletTransaction.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data wallet",
      data: {
        balance: wallet.balance,
        transactions: transactions.map((tx) => ({
          id: tx._id,
          type: tx.type,
          amount: tx.amount,
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          referenceId: tx.referenceId,
          status: tx.status,
          createdAt: tx.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error Get Wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.requestTopup = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // 1. Buat transaksi topup berstatus pending di ledger
    const transaction = await walletService.createTopupTransaction(
      userId,
      amount,
    );

    // 2. Generate snap token dari Midtrans
    const userDetails = {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
    };

    let payment;
    try {
      payment = await midtransService.createSnapToken(
        transaction.referenceId,
        amount,
        userDetails,
      );
    } catch (midtransError) {
      console.error("Error creating Midtrans payment token:", midtransError);
      return res.status(502).json({
        success: false,
        message: "Gagal menghubungkan ke payment gateway Midtrans",
        error: midtransError.message,
      });
    }

    // 3. Hitung tanggal kadaluarsa top-up
    const expiryMinutes = parseInt(
      process.env.TOPUP_EXPIRY_MINUTES || "30",
      10,
    );
    const expiresAt = new Date(
      transaction.createdAt.getTime() + expiryMinutes * 60 * 1000,
    );

    return res.status(201).json({
      success: true,
      message: "Permintaan top-up dibuat, silakan lakukan pembayaran",
      data: {
        topupId: transaction.referenceId,
        amount,
        status: transaction.status,
        expiresAt: expiresAt.toISOString(),
        payment,
      },
    });
  } catch (error) {
    console.error("Error Request Topup:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.cancelTopup = async (req, res) => {
  try {
    const { topupId } = req.params;
    const userId = req.user._id;

    // 1. Cari WalletTransaction berdasarkan referenceId dan userId
    const transaction = await WalletTransaction.findOne({
      referenceId: topupId,
      userId,
      type: "topup",
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Permintaan top-up tidak ditemukan",
        data: null,
      });
    }

    // 2. Jika status bukan pending, return 409 Conflict
    if (transaction.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Top-up sudah memiliki status '${transaction.status}' dan tidak bisa dibatalkan`,
        data: null,
      });
    }

    // 3. Ubah status di DB menjadi failed
    transaction.status = "failed";
    transaction.note = "Dibatalkan oleh pengguna";
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Top-up dibatalkan",
      data: {
        status: "cancelled",
      },
    });
  } catch (error) {
    console.error("Error Cancel Topup:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

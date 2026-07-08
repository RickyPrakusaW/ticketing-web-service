const crypto = require("crypto");
const walletService = require("../services/walletService");

exports.handleWebhook = async (req, res) => {
  try {
    const body = req.body;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    console.log(
      `[Midtrans Webhook] Menerima notifikasi untuk order_id: ${order_id}, status: ${transaction_status}`,
    );

    // 1. Verifikasi Signature Key Midtrans untuk keamanan
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxxxxxxx";
    // Rumus: SHA512(order_id + status_code + gross_amount + ServerKey)
    const computedHash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (computedHash !== signature_key) {
      console.error(
        `[Midtrans Webhook] Verifikasi signature GAGAL untuk order_id: ${order_id}`,
      );
      return res.status(403).json({
        success: false,
        message: "Invalid signature key",
      });
    }

    console.log(
      `[Midtrans Webhook] Signature berhasil diverifikasi untuk order_id: ${order_id}`,
    );

    // 2. Tentukan status pembayaran sukses/gagal
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isFailure =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire";

    // 3. Proses berdasarkan prefix order_id
    if (order_id.startsWith("TOPUP-")) {
      if (isSuccess) {
        const amount = parseFloat(gross_amount);
        await walletService.processTopupSuccess(order_id, amount);
        console.log(
          `[Midtrans Webhook] Top-up ${order_id} berhasil diproses dan saldo ditambahkan.`,
        );
      } else if (isFailure) {
        const { WalletTransaction } = require("../models");
        const statusDb = transaction_status === "expire" ? "expired" : "failed";
        await WalletTransaction.updateOne(
          { referenceId: order_id, status: "pending" },
          {
            status: statusDb,
            note: `Pembayaran dinyatakan ${transaction_status} oleh Midtrans`,
          },
        );
        console.log(
          `[Midtrans Webhook] Top-up ${order_id} diperbarui statusnya menjadi: ${statusDb}`,
        );
      }
    } else if (order_id.startsWith("BK-")) {
      // Log info untuk Booking (akan dihubungkan penuh di modul Booking)
      console.log(
        `[Midtrans Webhook] Menerima notifikasi pembayaran Booking untuk order_id: ${order_id}. Sukses: ${isSuccess}`,
      );
    }

    // Kirim response 200 OK ke Midtrans
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Error Midtrans Webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses webhook",
      error: error.message,
    });
  }
};

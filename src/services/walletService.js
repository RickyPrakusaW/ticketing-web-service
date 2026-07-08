const { Wallet, WalletTransaction } = require("../models");

/**
 * Mengambil atau membuat wallet baru untuk user jika belum ada (lazy creation)
 * @param {string} userId - ID Pengguna
 */
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
};

/**
 * Membuat baris baru di WalletTransaction dengan status pending dan order_id unik
 * @param {string} userId - ID Pengguna
 * @param {number} amount - Nominal topup
 */
const createTopupTransaction = async (userId, amount) => {
  const wallet = await getOrCreateWallet(userId);

  // Generate unique referenceId (order ID)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timestamp = Date.now();
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const referenceId = `TOPUP-${dateStr}-${timestamp}-${randomId}`;

  // Log pending WalletTransaction
  const transaction = await WalletTransaction.create({
    userId,
    type: "topup",
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance + amount,
    referenceId,
    status: "pending",
    note: `Top-up saldo via Midtrans sebesar Rp${amount.toLocaleString("id-ID")}`,
  });

  return transaction;
};

/**
 * Memproses topup sukses (settlement/capture dari webhook)
 * @param {string} orderId - ID order / referenceId
 * @param {number} amount - Nominal yang dibayar
 */
const processTopupSuccess = async (orderId, amount) => {
  // Cari transaksi berdasarkan referenceId
  const transaction = await WalletTransaction.findOne({ referenceId: orderId });
  if (!transaction) {
    throw new Error(`Transaksi top-up dengan ID ${orderId} tidak ditemukan`);
  }

  // Hanya proses jika status masih pending
  if (transaction.status === "pending") {
    // 1. Dapatkan wallet user
    const wallet = await getOrCreateWallet(transaction.userId);

    // 2. Simpan saldo sebelum update
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // 3. Update saldo secara atomik
    wallet.balance = balanceAfter;
    await wallet.save();

    // 4. Update ledger transaksi
    transaction.status = "success";
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceAfter;
    await transaction.save();

    console.log(
      `[Wallet] Top-up sukses untuk user ${transaction.userId}. Saldo bertambah Rp${amount}. Saldo sekarang: Rp${balanceAfter}`,
    );
    return { wallet, transaction };
  }

  return null;
};

module.exports = {
  getOrCreateWallet,
  createTopupTransaction,
  processTopupSuccess,
};

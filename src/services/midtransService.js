const snap = require("../config/midtrans");

/**
 * Membuat snap token & redirect url dari Midtrans Snap API
 * @param {string} orderId - ID order unik (prefix TOPUP- atau BK-)
 * @param {number} amount - Jumlah nominal pembayaran
 * @param {object} userDetails - Detail user { name, email, phone }
 */
exports.createSnapToken = async (orderId, amount, userDetails) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: userDetails.name,
      email: userDetails.email,
      phone: userDetails.phone || "",
    },
  };

  // Gunakan fallback dummy jika key masih default/placeholder untuk memudahkan testing
  const isPlaceholderKey =
    !process.env.MIDTRANS_SERVER_KEY ||
    process.env.MIDTRANS_SERVER_KEY.includes("xxxxxxxx");

  if (isPlaceholderKey) {
    return {
      token: `${orderId}-dummy-snap-token`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${orderId}-dummy`,
    };
  }

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    // Jika gagal di development karena key salah, kembalikan dummy token
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Gagal menghubungi Midtrans, menggunakan token dummy untuk testing:",
        error.message,
      );
      return {
        token: `${orderId}-dummy-snap-token`,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${orderId}-dummy`,
      };
    }
    throw error;
  }
};

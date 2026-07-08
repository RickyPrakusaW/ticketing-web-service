const midtransClient = require("midtrans-client");

// Inisialisasi SDK midtrans-client (Snap) menggunakan key dari .env
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxxxxxxx",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxxxxxxx",
});

module.exports = snap;

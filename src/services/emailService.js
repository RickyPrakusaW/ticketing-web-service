const nodemailer = require("nodemailer");

// Konfigurasi Transporter khusus Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Menggunakan Sandi Aplikasi Google (16 karakter)
  },
});

/**
 * Mengirimkan email OTP ke pengguna yang baru mendaftar menggunakan Gmail SMTP
 * @param {string} email - Email tujuan
 * @param {string} otpCode - Kode OTP 6 digit
 * @param {string} name - Nama pengguna (opsional)
 */
exports.sendOTP = async (email, otpCode, name = "Pengguna") => {
  try {
    const mailOptions = {
      from: `"Hotel Management System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verifikasi Akun - Kode OTP Anda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
          <h2 style="color: #4A90E2; text-align: center;">Verifikasi Akun</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar di Hotel Management System. Untuk mengaktifkan akun Anda, silakan gunakan kode OTP di bawah ini:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; background-color: #eef4fc; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4A90E2;">
              ${otpCode}
            </span>
          </div>
          <p style="color: #e03a3a; font-weight: bold; text-align: center;">Kode OTP ini berlaku selama 1 menit.</p>
          <p>Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan email ini.</p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Hotel Management & Booking API System</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email OTP terkirim via Gmail ke ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Gagal mengirim email OTP via Gmail:", error);
    throw error;
  }
};


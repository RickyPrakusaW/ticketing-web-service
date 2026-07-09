const fs = require("fs");
const path = require("path");
const { User } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil profil",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (error) {
    console.error("Error Get Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    // 1. Pastikan file gambar dilampirkan
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File gambar profile wajib dilampirkan",
        data: null,
      });
    }

    // 2. Cari user di database
    const user = await User.findById(req.user._id);
    if (!user) {
      // Hapus file baru jika user tidak ditemukan untuk mencegah file sampah
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Gagal menghapus file baru setelah error:",
            err.message,
          );
      });
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    // 3. Jika user sudah memiliki avatar sebelumnya, hapus berkas lama secara fisik
    if (user.avatarUrl) {
      const oldFilename = user.avatarUrl.split("/").pop();
      const oldFilepath = path.join(
        __dirname,
        "../../public/uploads",
        oldFilename,
      );

      fs.unlink(oldFilepath, (err) => {
        if (err) {
          console.error(
            "Gagal menghapus foto profil lama dari disk:",
            err.message,
          );
        } else {
          console.log("Berhasil menghapus foto profil lama dari disk.");
        }
      });
    }

    // 4. Buat URL statis untuk gambar yang baru
    const host = req.get("host");
    const protocol = req.protocol;
    const avatarUrl = `${protocol}://${host}/public/uploads/${req.file.filename}`;

    user.avatarUrl = avatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Foto profil berhasil diperbarui",
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error Update Avatar:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    if (user.avatarUrl) {
      // Hapus file fisik dari public/uploads secara aman
      const filename = user.avatarUrl.split("/").pop();
      const filepath = path.join(__dirname, "../../public/uploads", filename);

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error(
            "Gagal menghapus file gambar profil dari disk:",
            err.message,
          );
        } else {
          console.log("Berhasil menghapus file gambar profil dari disk.");
        }
      });

      user.avatarUrl = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Foto profil berhasil dihapus",
      data: null,
    });
  } catch (error) {
    console.error("Error Delete Avatar:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Gunakan updateOne secara langsung untuk mengubah isDeleted ke true secara aman
    const result = await User.updateOne(
      { _id: req.user._id },
      { isDeleted: true },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Akun profil Anda berhasil dinonaktifkan (dihapus)",
      data: null,
    });
  } catch (error) {
    console.error("Error Delete Account:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

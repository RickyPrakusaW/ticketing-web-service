const Hotel = require("../models/Hotel");
const Category = require("../models/Category");

exports.createHotel = async (req, res) => {
  try {
    const { name, description, address, city, categoryId, photos, isFeatured } =
      req.body;

    // 2. Cek apakah kategori ada di database
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists || categoryExists.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan atau sudah dihapus",
        data: null,
      });
    }

    // 3. Buat hotel baru. ownerId otomatis diambil dari user yang sedang login (token)
    const newHotel = await Hotel.create({
      name,
      description,
      address,
      city,
      categoryId,
      ownerId: req.user._id, // Didapat dari authMiddleware
      photos: photos || [],
      isFeatured: isFeatured || false,
    });

    return res.status(201).json({
      success: true,
      message: "Berhasil membuat data hotel",
      data: newHotel,
    });
  } catch (error) {
    console.error("Error Create Hotel:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getHotels = async (req, res) => {
  try {
    // Ambil semua hotel yang belum dihapus (Soft Delete filter)
    // .populate digunakan untuk mengambil detail kategori dan owner (tidak hanya ID-nya saja)
    const hotels = await Hotel.find({ isDeleted: false })
      .populate("categoryId", "name")
      .populate("ownerId", "name email");

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar hotel",
      data: hotels,
    });
  } catch (error) {
    console.error("Error Get Hotels:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, isDeleted: false })
      .populate("categoryId", "name")
      .populate("ownerId", "name email");

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail hotel",
      data: hotel,
    });
  } catch (error) {
    console.error("Error Get Hotel By ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;

    // Cari hotel yang belum dihapus
    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel tidak ditemukan",
        data: null,
      });
    }

    // Keamanan Tambahan: Pastikan yang edit adalah admin ATAU owner hotel itu sendiri
    if (
      req.user.role === "HotelManager" &&
      hotel.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan pemilik hotel ini.",
        data: null,
      });
    }

    // Update data hotel
    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { $set: req.body }, // Mengupdate field yang dikirim di req.body saja
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil memperbarui data hotel",
      data: updatedHotel,
    });
  } catch (error) {
    console.error("Error Update Hotel:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel tidak ditemukan",
        data: null,
      });
    }

    if (
      req.user.role === "HotelManager" &&
      hotel.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan pemilik hotel ini.",
        data: null,
      });
    }

    // Terapkan Soft Delete sesuai skema temanmu
    hotel.isDeleted = true;
    hotel.deletedAt = new Date();
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Berhasil menghapus hotel",
      data: null,
    });
  } catch (error) {
    console.error("Error Delete Hotel:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ROOM TYPE CRUD (Master #4)

exports.createRoomType = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, pricePerNight, totalQuota, capacity, facilities, photos } =
      req.body;

    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel tidak ditemukan", data: null });
    }

    // Tambahkan data kamar baru ke dalam array room_types
    const newRoom = {
      name,
      pricePerNight,
      totalQuota,
      available_quota: totalQuota, // Awal dibuat, kuota tersedia = total kuota
      capacity,
      facilities: facilities || [],
      photos: photos || [],
    };

    hotel.room_types.push(newRoom);
    await hotel.save();

    return res.status(201).json({
      success: true,
      message: "Berhasil menambahkan tipe kamar",
      data: hotel.room_types[hotel.room_types.length - 1], // Mengembalikan kamar yang baru di-push
    });
  } catch (error) {
    console.error("Error Create Room Type:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getRoomTypes = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.hotelId,
      isDeleted: false,
    });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel tidak ditemukan", data: null });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar tipe kamar",
      data: hotel.room_types,
    });
  } catch (error) {
    console.error("Error Get Room Types:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.updateRoomType = async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel tidak ditemukan", data: null });
    }

    // Cari spesifik kamar menggunakan sub-dokumen Mongoose (.id)
    const room = hotel.room_types.id(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Tipe kamar tidak ditemukan",
        data: null,
      });
    }

    // Timpa data kamar yang lama dengan data dari req.body
    room.set(req.body);
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Berhasil memperbarui tipe kamar",
      data: room,
    });
  } catch (error) {
    console.error("Error Update Room Type:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.deleteRoomType = async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel tidak ditemukan", data: null });
    }

    const room = hotel.room_types.id(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Tipe kamar tidak ditemukan",
        data: null,
      });
    }

    // Hapus kamar dari array
    hotel.room_types.pull(roomId);
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Berhasil menghapus tipe kamar",
      data: null,
    });
  } catch (error) {
    console.error("Error Delete Room Type:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

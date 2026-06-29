const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Menggunakan hardcode JWT_SECRET karena ini project kuliah dan diminta mudah dipahami
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role_id } = req.body;

    // 1. Validasi manual (sederhana & mudah dipahami)
    if (!full_name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi (full_name, email, password, role_id)',
        data: null
      });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan, silakan gunakan email lain',
        data: null
      });
    }

    // 3. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke database
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role_id
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        role_id: newUser.role_id
      }
    });
  } catch (error) {
    console.error('Error Register:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
        data: null
      });
    }

    // 2. Cari user di database beserta rolenya
    const user = await User.findOne({ email }).populate('role_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
        data: null
      });
    }

    // 3. Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password salah',
        data: null
      });
    }

    // 4. Buat Token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        role_id: user.role_id ? user.role_id._id : null,
        role_name: user.role_id ? user.role_id.name : 'Unknown' 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id ? user.role_id._id : null
        }
      }
    });

  } catch (error) {
    console.error('Error Login:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

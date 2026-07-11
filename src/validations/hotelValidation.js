const Joi = require("joi");

const hotelSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Nama hotel tidak boleh kosong",
    "any.required": "Nama hotel wajib diisi",
  }),
  description: Joi.string().allow("", null),
  address: Joi.string().required().messages({
    "string.empty": "Alamat hotel tidak boleh kosong",
    "any.required": "Alamat hotel wajib diisi",
  }),
  city: Joi.string().required().messages({
    "string.empty": "Kota tidak boleh kosong",
    "any.required": "Kota wajib diisi",
  }),
  categoryId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Format ID Kategori tidak valid",
    "string.length": "Format ID Kategori tidak valid",
    "any.required": "Kategori wajib diisi",
  }),
  isFeatured: Joi.boolean().default(false),
});

const roomSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama tipe kamar tidak boleh kosong",
    "any.required": "Nama tipe kamar wajib diisi",
  }),
  pricePerNight: Joi.number().min(0).required().messages({
    "number.base": "Harga harus berupa angka",
    "number.min": "Harga tidak boleh minus",
    "any.required": "Harga per malam wajib diisi",
  }),
  totalQuota: Joi.number().integer().min(1).required().messages({
    "number.min": "Minimal kuota adalah 1",
    "any.required": "Total kuota wajib diisi",
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    "any.required": "Kapasitas tamu wajib diisi",
  }),
  // Membolehkan input berupa array (banyak) atau string tunggal (kalau cuma 1 fasilitas di urlencoded)
  facilities: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
});

module.exports = {
  hotelSchema,
  roomSchema,
};

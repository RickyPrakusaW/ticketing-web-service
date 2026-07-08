const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Nama tidak boleh kosong",
    "string.min": "Nama minimal harus 2 karakter",
    "any.required": "Nama wajib diisi",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password tidak boleh kosong",
    "string.min": "Password minimal harus 6 karakter",
    "any.required": "Password wajib diisi",
  }),
  role: Joi.string()
    .valid("Admin", "HotelManager", "Customer")
    .default("Customer")
    .messages({
      "any.only":
        "Role harus salah satu dari: Admin, HotelManager, atau Customer",
    }),
  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Nomor telepon harus berupa angka",
      "string.min": "Nomor telepon minimal 10 digit",
      "string.max": "Nomor telepon maksimal 15 digit",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password tidak boleh kosong",
    "any.required": "Password wajib diisi",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};

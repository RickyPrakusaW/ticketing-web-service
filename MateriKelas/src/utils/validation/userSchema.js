const Joi = require("joi");

/**
 * https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
 *
 *
 * https://regexr.com/
 *
 * hati2 untuk backslash, di kodingan regexp harus dikasi \\
 */
const userSchema = Joi.object({
  pengguna_username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .label("Nama Pengguna")
    .messages({
      "any.required": "{{#label}} harus diisi yaa",
      "string.alphanum": "{{#label}} harus dalam bentuk alphanumeric saja",
      "string.min": "{{#label}} harus lebih dari 3 karakter",
      "string.max": "{{#label}} harus kurang dari 30 karakter",
    }),

  pengguna_email: Joi.string()
    .email({ tlds: { allow: ["edu", "com"] } })
    .required()
    .label("Email Pengguna")
    .messages({
      "string.required": "{{#label}} harus diisi yaa",
      "string.email": "{{#label}} hanya boleh diisi .edu atau .com",
    }),

  pengguna_password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    )
    .required()
    .label("Password Pengguna")
    .messages({
      "string.pattern.base":
        "{{#label}} harus diisi dengan minimal 1 huruf kecil, 1 huruf besar, 1 angka dan 1 simbol, dengan panjang minimal 8 karakter",
    }),

  pengguna_konfirmasi_password: Joi.any()
    .equal(Joi.ref("pengguna_password"))
    .label("Konfirmasi Password")
    .messages({ "any.only": "{{#label}} harus sama dengan password" }),

  pengguna_birthday: Joi.date()
    .greater("1970-01-01")
    .less("now")
    .label("Birthday Pengguna")
    .iso()
    .messages({
      "date.greater": "{{#label}} harus lebih dari 1 Januari 1970",
      "date.less": "{{#label}} harus kurang dari now",
      "date.iso": "{{#label}} harus dalam format YYYY-MM-DD",
    }),

  pengguna_umur: Joi.number()
    .integer()
    .default(17)
    .min(17)
    .max(100)
    .label("Umur Pengguna")
    .messages({
      "number.min": "{{#label}} harus dalam bentuk angka antara 17-100",
      "number.max": "{{#label}} harus dalam bentuk angka antara 17-100",
    }),
  pengguna_deskripsi: Joi.any(),
  app_name: Joi.any().label("Application Name"),
  app_token: Joi.any().label("Application Token"),
})
  .with("app_name", "app_token")
  .messages({
    "object.with":
      "{{#mainWithLabel}} harus dikirim bersama dengan {{#peerWithLabel}}",
  });

module.exports = userSchema;

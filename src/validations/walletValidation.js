const Joi = require("joi");

const minTopup = parseInt(process.env.WALLET_MIN_TOPUP || "10000", 10);
const maxTopup = parseInt(process.env.WALLET_MAX_TOPUP || "10000000", 10);

const topupSchema = Joi.object({
  amount: Joi.number()
    .integer()
    .min(minTopup)
    .max(maxTopup)
    .required()
    .messages({
      "number.base": "Jumlah top-up harus berupa angka",
      "number.integer": "Jumlah top-up harus berupa bilangan bulat",
      "number.min": `Jumlah top-up minimal adalah Rp${minTopup.toLocaleString("id-ID")}`,
      "number.max": `Jumlah top-up maksimal adalah Rp${maxTopup.toLocaleString("id-ID")}`,
      "any.required": "Jumlah top-up wajib diisi",
    }),
});

module.exports = {
  topupSchema,
};

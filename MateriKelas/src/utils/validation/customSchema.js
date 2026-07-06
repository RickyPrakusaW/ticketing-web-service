const Joi = require("joi");

const cekInvoice = (value, helpers) => {
  if (value === "-") {
    return helpers.error("any.invalid");
  }

  if (value.length !== 9) {
    throw new Error("Panjang invoice tidak betul");
  }

  if (value.substr(0, 3) !== "INV") {
    throw new Error("Harus diawali dengan INV");
  }

  // kalau semua pengecekan berhasil (inputan tidak error) kembalikan valuenya
  return value.toUpperCase();
};

const customSchema = Joi.object({
  kode_invoice: Joi.string().custom(cekInvoice),
});

module.exports = customSchema;

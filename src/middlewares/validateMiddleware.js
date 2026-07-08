/**
 * Middleware untuk memvalidasi payload request body menggunakan skema Joi
 * @param {Joi.ObjectSchema} schema - Skema validasi Joi
 */
module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Kumpulkan semua error, jangan langsung berhenti di error pertama
      stripUnknown: true, // Hapus field yang tidak didefinisikan di skema Joi
    });

    if (error) {
      // Tandai sebagai Joi error agar ditangkap dengan benar oleh errorHandler global
      error.isJoi = true;
      return next(error);
    }

    // Ganti req.body dengan data yang sudah bersih dan ter-cast oleh Joi
    req.body = value;
    next();
  };
};

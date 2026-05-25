const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware
 * Harus dipasang TERAKHIR di express app
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error dari Multer (upload file)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'Ukuran file terlalu besar. Maksimal 5MB', 400);
  }

  if (err.message && err.message.includes('file gambar')) {
    return errorResponse(res, err.message, 400);
  }

  // Error dari Sequelize - validation
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return errorResponse(res, 'Validasi gagal', 422, messages);
  }

  // Error dari Sequelize - unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return errorResponse(res, 'Data duplikat', 409, messages);
  }

  // Error dari Sequelize - foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Data referensi tidak ditemukan', 400);
  }

  // Error custom dengan status code
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // Error default
  return errorResponse(res, 'Terjadi kesalahan pada server', 500);
};

module.exports = errorHandler;

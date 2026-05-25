const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token
    const decoded = verifyToken(token);

    // Cek apakah user masih ada di database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'Akses ditolak. User tidak ditemukan', 401);
    }

    // Attach user ke request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token sudah kadaluarsa, silakan login ulang', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token tidak valid', 401);
    }
    return errorResponse(res, 'Autentikasi gagal', 401);
  }
};

module.exports = authMiddleware;

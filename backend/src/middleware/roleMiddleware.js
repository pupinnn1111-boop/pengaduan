const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk cek role user
 * @param  {...string} roles - Role yang diperbolehkan
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akses ditolak. Silakan login terlebih dahulu', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses ditolak. Hanya ${roles.join(', ')} yang dapat mengakses endpoint ini`,
        403
      );
    }

    next();
  };
};

module.exports = roleMiddleware;

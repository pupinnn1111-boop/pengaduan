const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc  Register user baru
 * @route POST /auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar', 409);
    }

    // Cek apakah username sudah digunakan
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return errorResponse(res, 'Username sudah digunakan', 409);
    }

    // Buat user baru (password di-hash otomatis lewat hook model)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
    });

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return successResponse(
      res,
      'Registrasi berhasil',
      { user, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Login user
 * @route POST /auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const rawUser = await User.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'role', 'created_at'],
    });

    if (!rawUser) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    // Cek password
    const isMatch = await rawUser.checkPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    // Generate token
    const token = generateToken({
      id: rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
    });

    // Ambil data user tanpa password
    const userData = await User.findByPk(rawUser.id);

    return successResponse(res, 'Login berhasil', { user: userData, token });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get profil user yang sedang login
 * @route GET /auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    return successResponse(res, 'Data profil berhasil diambil', user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
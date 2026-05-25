const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc  Get semua users
 * @route GET /users
 * @access super_admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['created_at', 'DESC']],
    });
    return successResponse(res, 'Data users berhasil diambil', users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get user by ID
 * @route GET /users/:id
 * @access super_admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    return successResponse(res, 'Data user berhasil diambil', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Buat user baru (oleh super_admin)
 * @route POST /users
 * @access super_admin
 */
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return errorResponse(res, 'Email sudah digunakan', 409);

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return errorResponse(res, 'Username sudah digunakan', 409);

    const user = await User.create({ username, email, password, role });
    return successResponse(res, 'User berhasil dibuat', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update user
 * @route PUT /users/:id
 * @access super_admin
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    const { username, email, password, role } = req.body;

    // Cek email duplikat (kecuali milik sendiri)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return errorResponse(res, 'Email sudah digunakan', 409);
    }

    // Cek username duplikat
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) return errorResponse(res, 'Username sudah digunakan', 409);
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
      password: password || user.password,
      role: role || user.role,
    });

    const updated = await User.findByPk(user.id);
    return successResponse(res, 'User berhasil diupdate', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Hapus user
 * @route DELETE /users/:id
 * @access super_admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User tidak ditemukan', 404);

    // Cegah hapus diri sendiri
    if (user.id === req.user.id) {
      return errorResponse(res, 'Tidak dapat menghapus akun sendiri', 400);
    }

    await user.destroy();
    return successResponse(res, 'User berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };

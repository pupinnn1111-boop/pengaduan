const { Op } = require('sequelize');
const { Laporan, User, Category, Comment } = require('../models');
const { successResponse, errorResponse, paginateResponse } = require('../utils/response');
const path = require('path');
const fs = require('fs');

/**
 * @desc  Get semua laporan (dengan pagination, search, filter)
 * @route GET /laporan
 * @access Private
 */
const getAllLaporan = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    // Filter berdasarkan role
    // user biasa hanya bisa lihat laporan miliknya
    if (req.user.role === 'user') {
      where.user_id = req.user.id;
    }

    // Filter status
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    // Search berdasarkan title
    if (search.trim()) {
      where.title = { [Op.like]: `%${search.trim()}%` };
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return paginateResponse(res, 'Data laporan berhasil diambil', rows, {
      total: count,
      total_pages: totalPages,
      current_page: parseInt(page),
      per_page: parseInt(limit),
      has_next: parseInt(page) < totalPages,
      has_prev: parseInt(page) > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get laporan by ID
 * @route GET /laporan/:id
 * @access Private
 */
const getLaporanById = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }],
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    // User biasa hanya bisa lihat laporan miliknya
    if (req.user.role === 'user' && laporan.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak. Bukan laporan Anda', 403);
    }

    return successResponse(res, 'Data laporan berhasil diambil', laporan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Buat laporan baru
 * @route POST /laporan
 * @access user, admin, super_admin
 */
const createLaporan = async (req, res, next) => {
  try {
    console.log('CONTENT TYPE:', req.headers['content-type']);
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const { category_id, title, description } = req.body;

    // Cek kategori ada
    const category = await Category.findByPk(category_id);
    if (!category) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    // Nama file gambar jika ada upload
    const image = req.file ? req.file.filename : null;

    const laporan = await Laporan.create({
      user_id: req.user.id,
      category_id,
      title,
      description,
      image,
      status: 'pending',
    });

    const result = await Laporan.findByPk(laporan.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    return successResponse(res, 'Laporan berhasil dibuat', result, 201);
  } catch (error) {
    // Hapus file yang terlanjur upload jika terjadi error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    next(error);
  }
};

/**
 * @desc  Update laporan
 * @route PUT /laporan/:id
 * @access user (milik sendiri), admin (update status), super_admin
 */
const updateLaporan = async (req, res, next) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    const { role } = req.user;

    // User biasa hanya bisa edit laporan miliknya
    if (role === 'user' && laporan.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak. Bukan laporan Anda', 403);
    }

    // User biasa tidak boleh ubah status
    if (role === 'user' && req.body.status) {
      return errorResponse(res, 'Anda tidak punya izin mengubah status laporan', 403);
    }

    const { category_id, title, description, status } = req.body;

    // Cek kategori jika diganti
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) return errorResponse(res, 'Kategori tidak ditemukan', 404);
    }

    // Update gambar jika ada upload baru
    let image = laporan.image;
    if (req.file) {
      // Hapus gambar lama
      if (laporan.image) {
        const oldPath = path.join(__dirname, '../../uploads', laporan.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = req.file.filename;
    }

    await laporan.update({
      category_id: category_id || laporan.category_id,
      title: title || laporan.title,
      description: description || laporan.description,
      image,
      status: status || laporan.status,
    });

    const updated = await Laporan.findByPk(laporan.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    return successResponse(res, 'Laporan berhasil diupdate', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Hapus laporan
 * @route DELETE /laporan/:id
 * @access user (milik sendiri), super_admin
 */
const deleteLaporan = async (req, res, next) => {
  try {
    console.log('===== DELETE LAPORAN =====');
    console.log('REQ USER:', req.user);
    console.log('PARAM ID:', req.params.id);

    const laporan = await Laporan.findByPk(req.params.id);

    console.log('LAPORAN:', laporan?.toJSON());

    if (!laporan) {
      return errorResponse(res, 'Laporan tidak ditemukan', 404);
    }

    console.log('ROLE:', req.user.role);
    console.log('LOGIN USER ID:', req.user.id);
    console.log('OWNER ID:', laporan.user_id);

    // User biasa hanya boleh hapus laporan miliknya
    if (req.user.role === 'user' && laporan.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak. Bukan laporan Anda', 403);
    }

    // Admin tidak boleh hapus laporan
    if (req.user.role === 'admin') {
      return errorResponse(res, 'Admin tidak punya izin menghapus laporan', 403);
    }

    // Hapus gambar jika ada
    if (laporan.image) {
      const filePath = path.join(__dirname, '../../uploads', laporan.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await laporan.destroy();
    return successResponse(res, 'Laporan berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
};

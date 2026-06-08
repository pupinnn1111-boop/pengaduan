const { Comment, User, Laporan } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc  Get semua komentar (bisa filter by laporan_id)
 * @route GET /comments?laporan_id=1
 * @access Private
 */
const getAllComments = async (req, res, next) => {
  try {
    const { laporan_id } = req.query;
    const where = {};

    if (laporan_id) {
      where.laporan_id = laporan_id;
    }

    // User biasa hanya bisa lihat komentar di laporan miliknya
    if (req.user.role === 'user') {
      // Ambil semua laporan_id milik user
      const userLaporan = await Laporan.findAll({
        where: { user_id: req.user.id },
        attributes: ['id'],
      });
      const ids = userLaporan.map((l) => l.id);

      if (laporan_id) {
        // Pastikan laporan_id yang diminta memang milik user
        if (!ids.includes(parseInt(laporan_id))) {
          return errorResponse(res, 'Akses ditolak', 403);
        }
      } else {
        where.laporan_id = { $in: ids };
        // Gunakan Sequelize Op
        const { Op } = require('sequelize');
        where.laporan_id = { [Op.in]: ids };
      }
    }

    const comments = await Comment.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Laporan, as: 'laporan', attributes: ['id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, 'Data komentar berhasil diambil', comments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Buat komentar baru
 * @route POST /comments
 * @access Private (semua role)
 */
const createComment = async (req, res, next) => {
  try {
    const { laporan_id, comment } = req.body;

    if (!laporan_id) return errorResponse(res, 'laporan_id wajib diisi', 422);
    if (!comment || comment.trim() === '') {
      return errorResponse(res, 'Komentar tidak boleh kosong', 422);
    }

    // Cek laporan ada
    const laporan = await Laporan.findByPk(laporan_id);
    if (!laporan) return errorResponse(res, 'Laporan tidak ditemukan', 404);

    // User biasa hanya bisa komen di laporan miliknya
    if (req.user.role === 'user' && laporan.user_id !== req.user.id) {
      return errorResponse(res, 'Anda hanya dapat berkomentar di laporan milik Anda', 403);
    }

    const newComment = await Comment.create({
      laporan_id,
      user_id: req.user.id,
      comment: comment.trim(),
    });

    const result = await Comment.findByPk(newComment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Laporan, as: 'laporan', attributes: ['id', 'title'] },
      ],
    });

    return successResponse(res, 'Komentar berhasil ditambahkan', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Hapus komentar
 * @route DELETE /comments/:id
 * @access user (komentar sendiri), admin, super_admin
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return errorResponse(res, 'Komentar tidak ditemukan', 404);

    // User hanya bisa hapus komentar miliknya
    if (req.user.role === 'user' && comment.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak. Bukan komentar Anda', 403);
    }

    await comment.destroy();
    return successResponse(res, 'Komentar berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllComments, createComment, deleteComment };

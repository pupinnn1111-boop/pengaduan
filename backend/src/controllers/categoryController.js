const { Category, Laporan } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc  Get semua kategori
 * @route GET /categories
 * @access Public (semua bisa lihat)
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['created_at', 'DESC']],
    });
    return successResponse(res, 'Data kategori berhasil diambil', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Buat kategori baru
 * @route POST /categories
 * @access admin, super_admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return errorResponse(res, 'Nama kategori wajib diisi', 422);
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) return errorResponse(res, 'Nama kategori sudah ada', 409);

    const category = await Category.create({ name: name.trim() });
    return successResponse(res, 'Kategori berhasil dibuat', category, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update kategori
 * @route PUT /categories/:id
 * @access admin, super_admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    const { name } = req.body;
    if (!name || name.trim() === '') {
      return errorResponse(res, 'Nama kategori wajib diisi', 422);
    }

    // Cek duplikat (kecuali dirinya sendiri)
    const existing = await Category.findOne({ where: { name } });
    if (existing && existing.id !== category.id) {
      return errorResponse(res, 'Nama kategori sudah ada', 409);
    }

    await category.update({ name: name.trim() });
    return successResponse(res, 'Kategori berhasil diupdate', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Hapus kategori
 * @route DELETE /categories/:id
 * @access admin, super_admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return errorResponse(res, 'Kategori tidak ditemukan', 404);

    // Cek apakah masih ada laporan yang menggunakan kategori ini
    const laporanCount = await Laporan.count({ where: { category_id: category.id } });
    if (laporanCount > 0) {
      return errorResponse(
        res,
        `Kategori tidak dapat dihapus karena masih digunakan oleh ${laporanCount} laporan`,
        400
      );
    }

    await category.destroy();
    return successResponse(res, 'Kategori berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };

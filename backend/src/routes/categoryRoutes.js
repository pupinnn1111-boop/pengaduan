const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET — semua user yang login bisa lihat kategori
router.get('/', authMiddleware, getAllCategories);

// POST, PUT, DELETE — hanya admin dan super_admin
router.post('/', authMiddleware, roleMiddleware('admin', 'super_admin'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'super_admin'), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'super_admin'), deleteCategory);

module.exports = router;

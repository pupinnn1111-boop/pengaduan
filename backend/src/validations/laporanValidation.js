const { body } = require('express-validator');

const createLaporanValidation = [
  body('category_id')
    .notEmpty().withMessage('Kategori wajib dipilih')
    .isInt({ min: 1 }).withMessage('Kategori tidak valid'),

  body('title')
    .notEmpty().withMessage('Judul laporan wajib diisi')
    .isLength({ min: 5 }).withMessage('Judul minimal 5 karakter')
    .trim(),

  body('description')
    .notEmpty().withMessage('Deskripsi laporan wajib diisi')
    .trim(),
];

const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status wajib diisi')
    .isIn(['pending', 'approved', 'rejected']).withMessage('Status tidak valid (pending/approved/rejected)'),
];

module.exports = { createLaporanValidation, updateStatusValidation };

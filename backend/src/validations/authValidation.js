const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter')
    .trim(),

  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'super_admin']).withMessage('Role tidak valid'),
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi'),
];

module.exports = { registerValidation, loginValidation };

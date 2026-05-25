const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../validations/authValidation');

// POST /auth/register
router.post('/register', registerValidation, validate, register);

// POST /auth/login
router.post('/login', loginValidation, validate, login);

// GET /auth/me — profil user yang login
router.get('/me', authMiddleware, getMe);

module.exports = router;

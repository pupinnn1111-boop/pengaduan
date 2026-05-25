const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { registerValidation } = require('../validations/authValidation');

// Semua route user hanya untuk super_admin
router.use(authMiddleware, roleMiddleware('super_admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', registerValidation, validate, createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

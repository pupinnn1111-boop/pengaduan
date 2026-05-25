const express = require('express');
const router = express.Router();
const {
  getAllComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route comments butuh autentikasi
router.use(authMiddleware);

router.get('/', getAllComments);
router.post('/', createComment);
router.delete('/:id', deleteComment);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
} = require('../controllers/laporanController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createLaporanValidation,
} = require('../validations/laporanValidation');
const upload = require('../utils/upload');

// Semua route laporan butuh autentikasi
router.use(authMiddleware);

// GET /laporan — semua role bisa (filter by role di controller)
router.get('/', getAllLaporan);

// GET /laporan/:id
router.get('/:id', getLaporanById);

// POST /laporan — dengan upload gambar
router.post(
  '/',
  upload.single('image'),
  createLaporanValidation,
  validate,
  createLaporan
);

// PUT /laporan/:id — dengan upload gambar opsional
router.put('/:id', upload.single('image'), updateLaporan);

// DELETE /laporan/:id
router.delete('/:id', deleteLaporan);

module.exports = router;

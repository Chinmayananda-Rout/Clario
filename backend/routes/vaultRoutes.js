const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, getFiles, deleteFile } = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024}
});

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getFiles);
router.delete('/:id', protect, deleteFile);

module.exports = router;
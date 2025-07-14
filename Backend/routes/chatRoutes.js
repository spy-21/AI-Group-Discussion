const express = require('express');
const multer = require('multer');
const router = express.Router();
const { chatWithGPT, transcribeAudio } = require('../controllers/chatController');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

router.post('/chat', chatWithGPT);
router.post('/transcribe-audio', upload.single('audio'), transcribeAudio);

module.exports = router;

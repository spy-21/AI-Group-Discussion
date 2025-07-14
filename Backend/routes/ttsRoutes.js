const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../controllers/ttsController');

router.post('/tts', textToSpeech);

module.exports = router; 
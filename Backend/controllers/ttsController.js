require('dotenv').config();
const textToSpeechLib = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const { textToSpeech } = require('../utils/aiUtils');

const client = new textToSpeechLib.TextToSpeechClient();

const textToSpeechHandler = async (req, res) => {
    const { text } = req.body;
    try {
        const audioBuffer = await textToSpeech(text);
        res.set({ 'Content-Type': 'audio/wav' });
        res.send(audioBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { textToSpeech: textToSpeechHandler }; 
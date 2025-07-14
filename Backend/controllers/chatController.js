require('dotenv').config();
const axios = require('axios');

const chatWithGPT = async (req, res) => {
    const { messages } = req.body;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: messages,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
};

const transcribeAudio = async (req, res) => {
    try {
        const { language = 'en-US' } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({ 
                success: false, 
                error: 'No audio file provided' 
            });
        }

        // Create FormData for OpenAI Whisper API
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', audioFile.buffer, {
            filename: 'audio.webm',
            contentType: audioFile.mimetype
        });
        form.append('model', 'whisper-1');
        form.append('language', language.split('-')[0]); // Extract language code

        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    ...form.getHeaders()
                },
            }
        );

        res.json({
            success: true,
            data: {
                text: response.data.text,
                confidence: 0.95, // Whisper doesn't provide confidence, using default
                language: language
            }
        });
    } catch (error) {
        console.error('Audio transcription error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.response ? error.response.data : error.message 
        });
    }
};

module.exports = { chatWithGPT, transcribeAudio };

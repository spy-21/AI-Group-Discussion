require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { OpenAI } = require('openai');
const path = require('path');

// Initialize OpenAI (for GPT-4o and Whisper)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 💬 Get response from GPT-4o
async function getGPT4oResponse(prompt) {
    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
    });
    return chatCompletion.choices[0].message.content;
}

// 🎙️ Convert text to speech using ElevenLabs API
async function textToSpeech(text, voice_id = "EXAVITQu4vr4xnSDxMaL") {
    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
            {
                text: text,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            },
            {
                headers: {
                    "xi-api-key": process.env.ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                responseType: "arraybuffer"
            }
        );

        return Buffer.from(response.data); // return raw audio buffer
    } catch (err) {
        console.error("❌ ElevenLabs TTS error:", err.response?.data || err.message);
        throw err;
    }
}

// 🔊 Convert audio buffer to WAV format (for Whisper)
function audioDataToWav(audioData, sampleRate = 48000) {
    const length = audioData.length;
    const buffer = Buffer.alloc(44 + length * 2); // WAV header + PCM samples

    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + length * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(length * 2, 40);

    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i] / 255));
        buffer.writeInt16LE(sample * 0x7FFF, 44 + i * 2);
    }

    return buffer;
}

// 📝 Transcribe audio using OpenAI Whisper API
async function transcribeAudio(audioBuffer, options = {}) {
    try {
        const tempFilePath = `./temp_audio_${Date.now()}.webm`;
        fs.writeFileSync(tempFilePath, audioBuffer);

        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream(tempFilePath), {
            filename: 'audio.webm',
            contentType: 'audio/webm'
        });
        form.append('model', 'whisper-1');

        if (options.language) {
            form.append('language', options.language);
        }

        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    ...form.getHeaders()
                }
            }
        );

        fs.unlinkSync(tempFilePath); // cleanup
        return {
            success: true,
            text: response.data.text,
            language: response.data.language
        };

    } catch (error) {
        console.error('Transcription error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    getGPT4oResponse,
    textToSpeech,
    transcribeAudio,
    audioDataToWav
};

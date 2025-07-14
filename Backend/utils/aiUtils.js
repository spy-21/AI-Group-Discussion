require('dotenv').config();
const textToSpeechLib = require('@google-cloud/text-to-speech');
const util = require('util');
const fs = require('fs');
const axios = require('axios');
const { OpenAI } = require('openai');
const say = require('say');
const path = require('path');

// Initialize OpenAI with GPT-4o
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Get response from ChatGPT-4o
async function getGPT4oResponse(prompt) {
    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
    });
    return chatCompletion.choices[0].message.content;
}

// 🎙️ Convert text to voice using 'say' (system TTS)
async function textToSpeech(text, outputFile = null, options = {}) {
    return new Promise((resolve, reject) => {
        const tempFile = outputFile || path.join(__dirname, 'output.wav');
        say.export(text, null, 1.0, tempFile, (err) => {
            if (err) return reject(err);
            fs.readFile(tempFile, (err, data) => {
                if (err) return reject(err);
                // Optionally delete the temp file after reading
                fs.unlink(tempFile, () => { });
                resolve(data);
            });
        });
    });
}

// 🎯 Convert audio buffer to text using OpenAI Whisper
async function transcribeAudio(audioBuffer, options = {}) {
    try {
        // Create a temporary file for the audio data
        const tempFilePath = `./temp_audio_${Date.now()}.webm`;
        fs.writeFileSync(tempFilePath, audioBuffer);

        const FormData = require('form-data');
        const form = new FormData();

        // Add the audio file to the form
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
                },
            }
        );

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

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

// 🎨 Convert audio data array to WAV buffer
function audioDataToWav(audioData, sampleRate = 48000) {
    const length = audioData.length;
    const buffer = Buffer.alloc(44 + length * 2); // 44 byte WAV header + 16-bit samples

    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + length * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // PCM format size
    buffer.writeUInt16LE(1, 20);  // PCM format
    buffer.writeUInt16LE(1, 22);  // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    buffer.writeUInt16LE(2, 32);  // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(length * 2, 40);

    // Convert audio data to 16-bit PCM
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i] / 255)); // Normalize to [-1, 1]
        buffer.writeInt16LE(sample * 0x7FFF, 44 + i * 2);
    }

    return buffer;
}

module.exports = {
    getGPT4oResponse,
    textToSpeech,
    transcribeAudio,
    audioDataToWav
};

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
require("dotenv").config();
const axios = require('axios'); // Add this at the top if not present
const { textToSpeech, transcribeAudio, audioDataToWav } = require('./utils/aiUtils');

const app = express();
const server = http.createServer(app); // Wrap Express in HTTP server

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Session routes
app.use("/api/sessions", require("./routes/sessionRoutes"));

// Chat route
app.use("/api/chat", require("./routes/chatRoutes"));

// TTS route
app.use("/api/tts", require("./routes/ttsRoutes"));

// AI route (for transcription)
app.use("/api/ai", require("./routes/chatRoutes"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Example in-memory session store (replace with MongoDB for production)
let activeSessions = {};

// Add maps to track timers and audio processing for each session
const silenceTimers = {};
const speechTimers = {};
const audioBuffers = {};
const isProcessingAudio = {};

// AI Participant configurations
const aiConfigs = {
  '2ai2real': { ai: 2, real: 2 },
  '1ai3real': { ai: 1, real: 3 },
  '3ai1real': { ai: 3, real: 1 },
  '4real': { ai: 0, real: 4 }

};

// AI Participant names and personalities
const aiPersonalities = [
  { name: "AI Assistant - Sarah", avatar: "🤖", personality: "analytical", voice_id: "EXAVITQu4vr4xnSDxMaL" }, // Example voice_id
  { name: "AI Bot - Alex", avatar: "🤖", personality: "creative", voice_id: "21m00Tcm4TlvDq8ikWAM" }, // Example voice_id
  { name: "AI Helper - Maya", avatar: "🤖", personality: "supportive", voice_id: "AZnzlk1XvdvUeBnXmlld" }, // Example voice_id
  { name: "AI Expert - Dr. Chen", avatar: "🤖", personality: "technical", voice_id: "ErXwobaYiN019PkySvjV" }, // Example voice_id
  { name: "AI Moderator - James", avatar: "🤖", personality: "facilitator", voice_id: "MF3mGyEYCl7XYWbV9V6O" } // Example voice_id
];

// Generate AI participants based on configuration
const generateAIParticipants = (count, topic, sessionId) => {
  const aiParticipants = [];
  for (let i = 0; i < count; i++) {
    const personality = aiPersonalities[i % aiPersonalities.length];
    aiParticipants.push({
      id: `ai-${sessionId}-${i}`,
      socketId: null, // AI participants don't have socket IDs
      name: personality.name,
      avatar: personality.avatar,
      type: "ai",
      personality: personality.personality,
      voice_id: personality.voice_id,
      isMuted: false,
      isSpeaking: false,
      isOnline: true,
      topic: topic
    });
  }
  return aiParticipants;
};

// Helper to check if anyone is speaking in a session
function isAnyoneSpeaking(session) {
  return session.participants.some(p => p.isSpeaking);
}

// Audio processing functions
function initializeAudioBuffer(sessionId, userId) {
  const key = `${sessionId}-${userId}`;
  if (!audioBuffers[key]) {
    audioBuffers[key] = {
      chunks: [],
      startTime: Date.now(),
      lastChunkTime: Date.now()
    };
  }
}

function addAudioChunk(sessionId, userId, audioData) {
  const key = `${sessionId}-${userId}`;
  initializeAudioBuffer(sessionId, userId);

  audioBuffers[key].chunks.push({
    data: audioData,
    timestamp: Date.now()
  });
  audioBuffers[key].lastChunkTime = Date.now();
}

function clearAudioBuffer(sessionId, userId) {
  const key = `${sessionId}-${userId}`;
  if (audioBuffers[key]) {
    audioBuffers[key].chunks = [];
    audioBuffers[key].startTime = Date.now();
  }
}

async function processAudioBuffer(sessionId, userId, triggerType = 'silence') {
  const key = `${sessionId}-${userId}`;
  const session = activeSessions[sessionId];

  if (!session || !audioBuffers[key] || audioBuffers[key].chunks.length === 0) {
    return;
  }

  // Prevent multiple simultaneous processing
  if (isProcessingAudio[key]) {
    return;
  }

  isProcessingAudio[key] = true;

  try {
    console.log(`🎤 Processing audio buffer for ${userId} in session ${sessionId} (trigger: ${triggerType})`);

    // Get the participant info
    const participant = session.participants.find(p => p.id === userId);
    const participantName = participant ? participant.name : 'Unknown User';

    // Combine audio chunks (this is a simplified approach)
    const audioChunks = audioBuffers[key].chunks;

    if (audioChunks.length > 0) {
      // For now, we'll use the latest chunk for transcription
      // In a real implementation, you'd combine all chunks into a single audio file
      const latestChunk = audioChunks[audioChunks.length - 1];

      // Combine all audio chunks for better transcription
      const combinedAudioData = audioChunks.reduce((acc, chunk) => {
        return acc.concat(chunk.data);
      }, []);

      // Send for real transcription
      const transcriptionText = await transcribeAudioData(combinedAudioData);

      if (transcriptionText && transcriptionText.trim().length > 0) {
        console.log(`📝 Transcribed: "${transcriptionText}"`);

        // Broadcast transcription to all participants
        io.to(sessionId).emit("user-transcription-processed", {
          from: userId,
          participantName: participantName,
          transcription: transcriptionText,
          timestamp: new Date().toISOString(),
          triggerType: triggerType
        });

        // Trigger AI response
        await generateAndSendAIResponse(sessionId, transcriptionText, userId);
      }
    }

    // Clear the buffer after processing
    clearAudioBuffer(sessionId, userId);

  } catch (error) {
    console.error('Error processing audio buffer:', error);
  } finally {
    isProcessingAudio[key] = false;
  }
}

// Real transcription function using OpenAI Whisper API
async function transcribeAudioData(audioDataArray) {
  try {
    // Convert audio data array to WAV buffer
    const wavBuffer = audioDataToWav(audioDataArray);

    // Use the transcription utility from aiUtils
    const result = await transcribeAudio(wavBuffer, { language: 'en' });

    if (result.success) {
      return result.text;
    } else {
      console.error('Transcription failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error in transcribeAudioData:', error);

    // Fallback to mock transcription if API fails
    const mockTranscriptions = [
      "I think this is a really interesting point about artificial intelligence.",
      "Could you elaborate more on that topic?",
      "I agree with the previous speaker about the implications.",
      "Let me share my perspective on this matter.",
      "That's a fascinating way to look at the problem."
    ];

    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  }
}

async function generateAndSendAIResponse(sessionId, transcriptionText, userId) {
  const session = activeSessions[sessionId];
  if (!session) return;

  // Get AI participants
  const aiParticipants = session.participants.filter(p => p.type === "ai");
  if (aiParticipants.length === 0) return;

  // Select random AI participant
  const randomAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];

  // Generate AI response
  const aiResponse = generateAIResponse(transcriptionText, randomAI.personality);

  try {
    // Generate audio for AI response
    const audioBuffer = await textToSpeech(aiResponse);
    const audioBase64 = audioBuffer.toString('base64');

    // Send AI response with audio
    io.to(sessionId).emit("ai-response", {
      from: randomAI.id,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      audio: audioBase64,
      triggerType: 'user-speech'
    });

    console.log(`🤖 AI Response sent: "${aiResponse}"`);

  } catch (error) {
    console.error('Error generating AI response:', error);

    // Send text-only response if TTS fails
    io.to(sessionId).emit("ai-response", {
      from: randomAI.id,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      audio: null,
      triggerType: 'user-speech'
    });
  }
}

// Helper to trigger AI response if no one is speaking
function scheduleAISilenceResponse(sessionId) {
  // Clear any existing timer
  if (silenceTimers[sessionId]) {
    clearTimeout(silenceTimers[sessionId]);
  }

  // Set a new timer for 5 seconds
  silenceTimers[sessionId] = setTimeout(async () => {
    const session = activeSessions[sessionId];
    if (session && !isAnyoneSpeaking(session)) {
      console.log(`🤫 5 seconds of silence detected in session ${sessionId}`);

      // Process any pending audio from the last speaker
      const lastSpeaker = session.participants.find(p => p.type === 'real');
      if (lastSpeaker) {
        await processAudioBuffer(sessionId, lastSpeaker.id, 'silence');
      }

      // If still no recent activity, trigger generic AI response
      setTimeout(() => {
        if (session && !isAnyoneSpeaking(session)) {
          io.to(sessionId).emit("system-message", { message: "AI is filling the silence..." });
          io.emit("request-ai-response", { sessionId, message: "(silence)", userId: null });
        }
      }, 1000);
    }
  }, 5000);
}

// Helper to manage continuous speech processing
function scheduleContinuousSpeechProcessing(sessionId, userId) {
  const key = `${sessionId}-${userId}`;

  // Clear any existing timer
  if (speechTimers[key]) {
    clearTimeout(speechTimers[key]);
  }

  // Set a new timer for 10 seconds
  speechTimers[key] = setTimeout(async () => {
    console.log(`⏰ 10 seconds of continuous speech detected from ${userId}`);
    await processAudioBuffer(sessionId, userId, 'continuous-speech');

    // Reset timer for next 10-second interval if still speaking
    const session = activeSessions[sessionId];
    if (session) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant && participant.isSpeaking) {
        scheduleContinuousSpeechProcessing(sessionId, userId);
      }
    }
  }, 10000);
}

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Log all incoming socket events
  socket.onAny((event, ...args) => {
    console.log(`[SOCKET IN] Event: ${event}`, ...args);
  });

  // Join session with AI participants
  socket.on("join-session", ({ sessionId, user, participantConfig = "2ai2real" }) => {
    console.log(`👤 User ${user.name} joining session ${sessionId} with config: ${participantConfig}`);

    const participant = {
      id: uuidv4(),
      socketId: socket.id,
      name: user.name,
      avatar: user.avatar || "👤",
      type: user.type || "real",
      isMuted: false,
      isSpeaking: false,
      isOnline: true,
    };

    // Create session if it doesn't exist
    if (!activeSessions[sessionId]) {
      const config = aiConfigs[participantConfig] || aiConfigs['2ai2real'];
      const aiParticipants = generateAIParticipants(config.ai, user.topic || "Untitled Discussion", sessionId);

      activeSessions[sessionId] = {
        topic: user.topic || "Untitled Discussion",
        participants: [...aiParticipants],
        config: participantConfig,
        createdAt: new Date(),
        status: "active"
      };

      console.log(`🤖 Created session ${sessionId} with ${config.ai} AI participants`);
    }

    // Add real participant
    activeSessions[sessionId].participants.push(participant);
    socket.join(sessionId);

    // Store session info in socket for cleanup
    socket.sessionId = sessionId;
    socket.userId = participant.id;

    // Send updated session to everyone
    io.to(sessionId).emit("session-update", {
      sessionId,
      ...activeSessions[sessionId],
    });

    // Notify others that user joined
    socket.to(sessionId).emit("user-joined", participant);

    console.log(`✅ ${user.name} joined session ${sessionId}. Total participants: ${activeSessions[sessionId].participants.length}`);
  });

  // Handle mute/unmute
  socket.on("user-mute-toggle", ({ sessionId, userId, isMuted }) => {
    console.log(`[REQ] user-mute-toggle`, { sessionId, userId, isMuted });
    const session = activeSessions[sessionId];
    if (session) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.isMuted = isMuted;
        io.to(sessionId).emit("user-mute-updated", { userId, isMuted });
        console.log(`🔇 ${participant.name} ${isMuted ? 'muted' : 'unmuted'}`);
      }
    }
  });

  // Handle speaking status
  socket.on("user-speaking-status", async ({ sessionId, userId, isSpeaking, audioLevel }) => {
    console.log(`[REQ] user-speaking-status`, { sessionId, userId, isSpeaking, audioLevel });
    const session = activeSessions[sessionId];
    if (session) {
      // Enforce one speaker at a time
      if (isSpeaking) {
        session.participants.forEach(p => { p.isSpeaking = false; });
      }
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.isSpeaking = isSpeaking;
        participant.audioLevel = audioLevel || 0;
        io.to(sessionId).emit("user-speaking-updated", { userId, isSpeaking, audioLevel });
        console.log(`🎤 ${participant.name} ${isSpeaking ? 'started' : 'stopped'} speaking`);

        if (isSpeaking) {
          // Initialize audio buffer if speaking starts
          initializeAudioBuffer(sessionId, userId);
          // Schedule continuous speech processing
          scheduleContinuousSpeechProcessing(sessionId, userId);
        }
      }
      // Schedule AI silence response if no one is speaking
      if (!isAnyoneSpeaking(session)) {
        scheduleAISilenceResponse(sessionId);
      } else {
        if (silenceTimers[sessionId]) clearTimeout(silenceTimers[sessionId]);
      }
    }
  });

  // Handle transcription
  socket.on("send-transcription", ({ sessionId, transcription }) => {
    console.log(`[REQ] send-transcription`, { sessionId, transcription });
    socket.to(sessionId).emit("receive-transcription", transcription);
  });

  // Handle AI responses (simulated)
  socket.on("request-ai-response", async ({ sessionId, message, userId }) => {
    console.log(`[REQ] request-ai-response`, { sessionId, message, userId });
    const session = activeSessions[sessionId];
    if (session) {
      // Simulate AI response after a delay
      setTimeout(async () => {
        const aiParticipants = session.participants.filter(p => p.type === "ai");
        if (aiParticipants.length > 0) {
          const randomAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];
          console.log('DEBUG randomAI:', randomAI); // Debug log
          const aiResponse = generateAIResponse(message, randomAI.personality);
          console.log('DEBUG aiResponse:', aiResponse); // Debug log
          let audioBase64 = null;
          let audioType = null;
          try {
            // Use 'say' TTS utility
            const audioBuffer = await textToSpeech(aiResponse);
            audioBase64 = audioBuffer.toString('base64');
            // Set audio type to wav
            audioType = 'wav';
            console.log('DEBUG audioBase64 length:', audioBase64 ? audioBase64.length : 'null');
          } catch (err) {
            console.error('TTS error:', err); // Log full error object
          }
          io.to(sessionId).emit("ai-response", {
            from: randomAI.id,
            message: aiResponse,
            timestamp: new Date().toISOString(),
            audio: audioBase64, // base64-encoded audio
            audioType: audioType || 'wav'
          });
          console.log(`[RES] ai-response`, { sessionId, message: aiResponse, from: randomAI.id });
          console.log("Emitting ai-response:", {
            from: randomAI.id,
            message: aiResponse,
            audioBase64Length: audioBase64 ? audioBase64.length : 0
          });
        }
      }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
    }
  });

  // Handle audio data from users
  socket.on("audio-data-chunk", ({ sessionId, userId, audioData, timestamp }) => {
    console.log(`[REQ] audio-data-chunk`, { sessionId, userId, timestamp, audioDataLength: audioData ? audioData.length : 0 });
    const session = activeSessions[sessionId];
    if (session && audioData) {
      // Add audio chunk to buffer
      addAudioChunk(sessionId, userId, audioData);
      console.log(`🎧 Audio chunk received from ${userId} in session ${sessionId}`);
    }
  });

  // Handle user transcription - automatically trigger AI response
  socket.on("user-transcription", async ({ sessionId, transcription, userId }) => {
    console.log(`[REQ] user-transcription`, { sessionId, transcription, userId });
    const session = activeSessions[sessionId];
    if (session && transcription && transcription.trim().length > 0) {
      // Broadcast the transcription to all participants
      io.to(sessionId).emit("transcription-broadcast", {
        from: userId,
        transcription: transcription,
        timestamp: new Date().toISOString()
      });

      // Trigger AI response with 30% probability
      if (Math.random() < 0.3) {
        socket.emit("request-ai-response", {
          sessionId: sessionId,
          message: transcription,
          userId: userId
        });
      }
    }
  });

  // Handle WebRTC signaling
  socket.on("webrtc-signal", ({ sessionId, type, data, fromId, targetId }) => {
    console.log(`[REQ] webrtc-signal`, { sessionId, type, fromId, targetId });
    console.log(`WebRTC signal from ${fromId} to ${targetId}:`, type);

    // Forward the signaling message to the target participant
    socket.to(sessionId).emit("webrtc-signal", {
      type: type,
      data: data,
      fromId: fromId,
      targetId: targetId
    });
  });

  // Leave session
  socket.on("leave-session", ({ sessionId, userId }) => {
    console.log(`[REQ] leave-session`, { sessionId, userId });
    const session = activeSessions[sessionId];
    if (session) {
      session.participants = session.participants.filter(p => p.id !== userId);
      socket.leave(sessionId);

      // Notify others
      socket.to(sessionId).emit("user-left", userId);

      // Clean up empty sessions
      if (session.participants.length === 0) {
        delete activeSessions[sessionId];
        console.log(`🗑️ Session ${sessionId} deleted (no participants)`);
      } else {
        io.to(sessionId).emit("session-update", {
          sessionId,
          ...session,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET] Disconnected:`, socket.id);

    if (socket.sessionId) {
      const session = activeSessions[socket.sessionId];
      if (session) {
        session.participants = session.participants.filter(p => p.socketId !== socket.id);

        // Notify others
        socket.to(socket.sessionId).emit("user-left", socket.userId);

        // Clean up empty sessions
        if (session.participants.length === 0) {
          delete activeSessions[socket.sessionId];
          console.log(`🗑️ Session ${socket.sessionId} deleted (no participants)`);
        } else {
          io.to(socket.sessionId).emit("session-update", {
            sessionId: socket.sessionId,
            ...session,
          });
        }
      }
    }
  });
});

// Generate AI responses based on personality
const generateAIResponse = (message, personality) => {
  const responses = {
    analytical: [
      "That's an interesting point. Let me analyze this from a data-driven perspective...",
      "From a logical standpoint, I can see several factors at play here...",
      "This raises some important questions that we should consider systematically...",
      "Let me break this down into its core components..."
    ],
    creative: [
      "That's a fascinating perspective! What if we looked at this from a completely different angle?",
      "I love how you're thinking outside the box. Here's a creative approach...",
      "This reminds me of an innovative solution I've been considering...",
      "What if we reimagined this problem entirely?"
    ],
    supportive: [
      "That's a great contribution to our discussion! I really appreciate your insight.",
      "You've made an excellent point. Let me build on that...",
      "I think you're onto something important here. Let's explore this further...",
      "Thank you for sharing that perspective. It adds valuable depth to our conversation."
    ],
    technical: [
      "From a technical perspective, there are several important considerations here...",
      "Let me provide some technical context that might be relevant...",
      "This touches on some fundamental technical principles...",
      "From an engineering standpoint, we should consider..."
    ],
    facilitator: [
      "Great discussion point! Let's make sure everyone has a chance to share their thoughts on this.",
      "This is a key topic. How do others feel about this perspective?",
      "Let's explore this further. What are the different viewpoints here?",
      "This is an important aspect of our discussion. Let's dive deeper into this."
    ]
  };

  const personalityResponses = responses[personality] || responses.analytical;
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
};

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different one.`);
    process.exit(1);
  } else {
    throw err;
  }
});

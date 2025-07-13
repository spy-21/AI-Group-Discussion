const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
require("dotenv").config();

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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Example in-memory session store (replace with MongoDB for production)
let activeSessions = {};

// AI Participant configurations
const aiConfigs = {
  '2ai2real': { ai: 2, real: 2 },
  '1ai3real': { ai: 1, real: 3 },
  '3ai1real': { ai: 3, real: 1 },
  '4real': { ai: 0, real: 4 },
  '1ai1real': { ai: 1, real: 1 },
  '2ai1real': { ai: 2, real: 1 },
  '1ai2real': { ai: 1, real: 2 },
  '4ai': { ai: 4, real: 0 }
};

// AI Participant names and personalities
const aiPersonalities = [
  { name: "AI Assistant - Sarah", avatar: "🤖", personality: "analytical" },
  { name: "AI Bot - Alex", avatar: "🤖", personality: "creative" },
  { name: "AI Helper - Maya", avatar: "🤖", personality: "supportive" },
  { name: "AI Expert - Dr. Chen", avatar: "🤖", personality: "technical" },
  { name: "AI Moderator - James", avatar: "🤖", personality: "facilitator" }
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
      isMuted: false,
      isSpeaking: false,
      isOnline: true,
      topic: topic
    });
  }
  return aiParticipants;
};

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

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
  socket.on("user-speaking-status", ({ sessionId, userId, isSpeaking, audioLevel }) => {
    const session = activeSessions[sessionId];
    if (session) {
      const participant = session.participants.find(p => p.id === userId);
      if (participant) {
        participant.isSpeaking = isSpeaking;
        participant.audioLevel = audioLevel || 0;
        io.to(sessionId).emit("user-speaking-updated", { userId, isSpeaking, audioLevel });
        console.log(`🎤 ${participant.name} ${isSpeaking ? 'started' : 'stopped'} speaking`);
      }
    }
  });

  // Handle transcription
  socket.on("send-transcription", ({ sessionId, transcription }) => {
    socket.to(sessionId).emit("receive-transcription", transcription);
  });

  // Handle AI responses (simulated)
  socket.on("request-ai-response", ({ sessionId, message, userId }) => {
    const session = activeSessions[sessionId];
    if (session) {
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiParticipants = session.participants.filter(p => p.type === "ai");
        if (aiParticipants.length > 0) {
          const randomAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];
          const aiResponse = generateAIResponse(message, randomAI.personality);

          io.to(sessionId).emit("ai-response", {
            from: randomAI.id,
            message: aiResponse,
            timestamp: new Date().toISOString()
          });
        }
      }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
    }
  });

  // Leave session
  socket.on("leave-session", ({ sessionId, userId }) => {
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
    console.log("❌ Disconnected:", socket.id);

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
});

const express = require("express");
const router = express.Router();
const {
    createSession,
    getSession,
    getAllSessions,
    deleteSession
} = require("../controllers/sessionController");

// Create a new session
router.post("/create", createSession);

// Get a specific session
router.get("/:sessionId", getSession);

// Get all sessions for a user
router.get("/", getAllSessions);

// Delete a session
router.delete("/:sessionId", deleteSession);

module.exports = router; 
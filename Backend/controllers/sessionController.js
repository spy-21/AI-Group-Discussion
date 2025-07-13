const { v4: uuidv4 } = require("uuid");

// In-memory session store (replace with MongoDB in production)
let sessions = {};

exports.createSession = async (req, res) => {
    try {
        const {
            topic,
            description,
            category,
            date,
            time,
            duration,
            participantConfig,
            maxParticipants,
            createdBy
        } = req.body;

        const sessionId = uuidv4();

        const session = {
            id: sessionId,
            topic,
            description,
            category,
            date,
            time,
            duration,
            participantConfig,
            maxParticipants,
            createdBy,
            createdAt: new Date(),
            status: "active",
            participants: []
        };

        sessions[sessionId] = session;

        res.status(201).json({
            success: true,
            session: {
                id: sessionId,
                topic,
                participantConfig,
                joinUrl: `${req.protocol}://${req.get('host')}/session/${sessionId}`
            }
        });
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create session"
        });
    }
};

exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = sessions[sessionId];

        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found"
            });
        }

        res.json({
            success: true,
            session
        });
    } catch (error) {
        console.error("Error getting session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get session"
        });
    }
};

exports.getAllSessions = async (req, res) => {
    try {
        const userSessions = Object.values(sessions).filter(
            session => session.createdBy === req.user?.id
        );

        res.json({
            success: true,
            sessions: userSessions
        });
    } catch (error) {
        console.error("Error getting sessions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get sessions"
        });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessions[sessionId]) {
            return res.status(404).json({
                success: false,
                error: "Session not found"
            });
        }

        delete sessions[sessionId];

        res.json({
            success: true,
            message: "Session deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete session"
        });
    }
}; 
import { useState, useEffect, useCallback } from 'react';
import { sessionAPI } from '../api/api';

export const useSessionManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create a new session
    const createSession = useCallback(async (sessionData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await sessionAPI.create(sessionData);
            const newSession = response.data;

            setSessions(prev => [...prev, newSession]);
            setCurrentSession(newSession);

            return newSession;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Join an existing session
    const joinSession = useCallback(async (sessionId, userData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await sessionAPI.join(sessionId, userData);
            const session = response.data;

            setCurrentSession(session);
            return session;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get session by ID
    const getSession = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await sessionAPI.getById(sessionId);
            const session = response.data;

            setCurrentSession(session);
            return session;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update session
    const updateSession = useCallback(async (sessionId, updateData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await sessionAPI.update(sessionId, updateData);
            const updatedSession = response.data;

            setCurrentSession(updatedSession);
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? updatedSession : session
                )
            );

            return updatedSession;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Leave session
    const leaveSession = useCallback(async (sessionId, userId) => {
        setLoading(true);
        setError(null);

        try {
            await sessionAPI.leave(sessionId, userId);
            setCurrentSession(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get session participants
    const getParticipants = useCallback(async (sessionId) => {
        try {
            const response = await sessionAPI.getParticipants(sessionId);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get participants');
            throw err;
        }
    }, []);

    // Get session reports
    const getReports = useCallback(async (sessionId) => {
        try {
            const response = await sessionAPI.getReports(sessionId);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get reports');
            throw err;
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Clear current session
    const clearCurrentSession = useCallback(() => {
        setCurrentSession(null);
    }, []);

    return {
        sessions,
        currentSession,
        loading,
        error,
        createSession,
        joinSession,
        getSession,
        updateSession,
        leaveSession,
        getParticipants,
        getReports,
        clearError,
        clearCurrentSession,
    };
}; 
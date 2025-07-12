import React, { createContext, useState, useContext, useEffect } from 'react';

const AIInterviewContext = createContext();

export const useAIInterview = () => {
  const context = useContext(AIInterviewContext);
  if (!context) {
    throw new Error('useAIInterview must be used within an AIInterviewProvider');
  }
  return context;
};

export const AIInterviewProvider = ({ children }) => {
  const [aiSession, setAiSession] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    preferences: {
      interviewType: 'general',
      aiPersonality: 'professional',
      difficulty: 'medium',
      duration: 30
    },
    stats: {
      totalInterviews: 0,
      averageScore: 0,
      strengths: [],
      improvements: []
    }
  });
  const [aiPersonalities, setAiPersonalities] = useState({
    professional: {
      name: 'Professional',
      description: 'Formal, business-oriented interviewer',
      traits: ['structured', 'direct', 'focused'],
      greeting: 'Good day! I\'m here to conduct a professional interview with you. Shall we begin?'
    },
    friendly: {
      name: 'Friendly',
      description: 'Warm, approachable interviewer',
      traits: ['supportive', 'encouraging', 'conversational'],
      greeting: 'Hello! I\'m excited to chat with you today. Let\'s have a great conversation!'
    },
    challenging: {
      name: 'Challenging',
      description: 'Rigorous, demanding interviewer',
      traits: ['tough', 'analytical', 'probing'],
      greeting: 'I expect excellence. This interview will test your limits. Are you ready?'
    },
    supportive: {
      name: 'Supportive',
      description: 'Encouraging, helpful interviewer',
      traits: ['patient', 'understanding', 'constructive'],
      greeting: 'Welcome! I\'m here to help you succeed. Let\'s work together to showcase your best self.'
    }
  });

  const [interviewTypes, setInterviewTypes] = useState({
    general: {
      name: 'General Interview',
      description: 'Standard interview covering basic questions',
      topics: ['background', 'experience', 'goals', 'motivation'],
      duration: 20,
      questions: [
        'Tell me about yourself',
        'What are your strengths and weaknesses?',
        'Why do you want this position?',
        'Where do you see yourself in 5 years?'
      ]
    },
    technical: {
      name: 'Technical Interview',
      description: 'Focus on technical skills and problem-solving',
      topics: ['coding', 'algorithms', 'system design', 'technical concepts'],
      duration: 45,
      questions: [
        'Explain your technical background',
        'Walk me through your problem-solving process',
        'How do you approach debugging?',
        'Describe a challenging technical project'
      ]
    },
    behavioral: {
      name: 'Behavioral Interview',
      description: 'Situational and behavioral questions',
      topics: ['teamwork', 'leadership', 'conflict resolution', 'adaptability'],
      duration: 30,
      questions: [
        'Tell me about a time you faced a challenge',
        'Describe a situation where you had to work in a team',
        'How do you handle conflict?',
        'Give an example of when you showed leadership'
      ]
    },
    mock: {
      name: 'Mock Interview',
      description: 'Full simulation of real interview',
      topics: ['comprehensive', 'realistic', 'timed', 'structured'],
      duration: 60,
      questions: [
        'Complete interview simulation',
        'Multiple rounds',
        'Realistic timing',
        'Comprehensive feedback'
      ]
    },
    practice: {
      name: 'Practice Session',
      description: 'Casual practice with immediate feedback',
      topics: ['practice', 'feedback', 'improvement', 'learning'],
      duration: 15,
      questions: [
        'Quick practice questions',
        'Immediate feedback',
        'Skill building',
        'Confidence boosting'
      ]
    }
  });

  // Load user data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('aiInterviewProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedHistory = localStorage.getItem('aiInterviewHistory');
    if (savedHistory) {
      setInterviewHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save user data to localStorage
  useEffect(() => {
    localStorage.setItem('aiInterviewProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('aiInterviewHistory', JSON.stringify(interviewHistory));
  }, [interviewHistory]);

  const addToTranscript = (entry) => {
    setTranscript(prev => [...prev, {
      ...entry,
      id: entry.id || Date.now(),
      timestamp: entry.timestamp || new Date().toISOString()
    }]);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  const startNewSession = (config) => {
    const newSession = {
      id: `ai-${Date.now()}`,
      type: 'ai-interview',
      config,
      startTime: new Date().toISOString(),
      status: 'active',
      transcript: [],
      scores: {
        communication: 0,
        technical: 0,
        confidence: 0,
        overall: 0
      },
      feedback: []
    };
    
    setAiSession(newSession);
    setTranscript([]);
    setCurrentQuestion(null);
    return newSession;
  };

  const endSession = async (sessionData) => {
    if (!aiSession) return;

    const completedSession = {
      ...aiSession,
      ...sessionData,
      endTime: new Date().toISOString(),
      status: 'completed',
      duration: sessionData.duration || 0
    };

    // Add to interview history
    setInterviewHistory(prev => [completedSession, ...prev]);

    // Update user stats
    const newStats = {
      totalInterviews: userProfile.stats.totalInterviews + 1,
      averageScore: calculateAverageScore([...interviewHistory, completedSession]),
      strengths: updateStrengths(completedSession.scores),
      improvements: updateImprovements(completedSession.scores)
    };

    setUserProfile(prev => ({
      ...prev,
      stats: newStats
    }));

    // Clear current session
    setAiSession(null);
    setTranscript([]);
    setCurrentQuestion(null);

    return completedSession;
  };

  const calculateAverageScore = (sessions) => {
    if (sessions.length === 0) return 0;
    
    const totalScore = sessions.reduce((sum, session) => {
      return sum + (session.scores?.overall || 0);
    }, 0);
    
    return Math.round(totalScore / sessions.length);
  };

  const updateStrengths = (scores) => {
    const strengths = [];
    if (scores.communication >= 80) strengths.push('Communication');
    if (scores.technical >= 80) strengths.push('Technical Skills');
    if (scores.confidence >= 80) strengths.push('Confidence');
    return strengths;
  };

  const updateImprovements = (scores) => {
    const improvements = [];
    if (scores.communication < 60) improvements.push('Communication');
    if (scores.technical < 60) improvements.push('Technical Skills');
    if (scores.confidence < 60) improvements.push('Confidence');
    return improvements;
  };

  const getPersonalityConfig = (personalityType) => {
    return aiPersonalities[personalityType] || aiPersonalities.professional;
  };

  const getInterviewConfig = (interviewType) => {
    return interviewTypes[interviewType] || interviewTypes.general;
  };

  const updateUserProfile = (updates) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const getRecommendations = () => {
    const { stats } = userProfile;
    const recommendations = [];

    if (stats.totalInterviews === 0) {
      recommendations.push({
        type: 'start',
        title: 'Start with a Practice Session',
        description: 'Begin with a friendly practice session to get comfortable with AI interviews.',
        action: 'practice'
      });
    } else if (stats.averageScore < 60) {
      recommendations.push({
        type: 'improve',
        title: 'Focus on Improvement Areas',
        description: 'Work on your weakest areas to boost your overall performance.',
        action: 'targeted'
      });
    } else if (stats.averageScore >= 80) {
      recommendations.push({
        type: 'challenge',
        title: 'Try a Challenging Interview',
        description: 'You\'re doing great! Challenge yourself with a more difficult interview.',
        action: 'challenging'
      });
    }

    return recommendations;
  };

  const searchInterviewHistory = (query) => {
    if (!query) return interviewHistory;
    
    return interviewHistory.filter(session => 
      session.config?.interviewType?.includes(query.toLowerCase()) ||
      session.config?.aiPersonality?.includes(query.toLowerCase()) ||
      session.transcript?.some(entry => 
        entry.content?.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const value = {
    // State
    aiSession,
    transcript,
    isRecording,
    currentQuestion,
    interviewHistory,
    userProfile,
    aiPersonalities,
    interviewTypes,

    // Setters
    setAiSession,
    setTranscript,
    setIsRecording,
    setCurrentQuestion,
    setInterviewHistory,
    setUserProfile,

    // Functions
    addToTranscript,
    clearTranscript,
    startNewSession,
    endSession,
    getPersonalityConfig,
    getInterviewConfig,
    updateUserProfile,
    getRecommendations,
    searchInterviewHistory,
    calculateAverageScore
  };

  return (
    <AIInterviewContext.Provider value={value}>
      {children}
    </AIInterviewContext.Provider>
  );
};

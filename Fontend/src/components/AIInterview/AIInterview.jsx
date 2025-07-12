import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAIInterview } from '../../context/AIInterviewContext';
import { aiService } from '../../services/aiService';

const AIInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { 
    aiSession, 
    setAiSession, 
    transcript, 
    addToTranscript,
    isRecording,
    setIsRecording,
    currentQuestion,
    setCurrentQuestion
  } = useAIInterview();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [aiPersonality, setAiPersonality] = useState('professional');
  const [isListening, setIsListening] = useState(false);
  const [interviewType, setInterviewType] = useState('general');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentScore, setCurrentScore] = useState({ communication: 0, technical: 0, confidence: 0 });
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize AI session
  useEffect(() => {
    if (sessionId && !aiSession) {
      initializeAISession();
    }
  }, [sessionId]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          setUserInput(transcript);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const initializeAISession = async () => {
    try {
      const newSession = {
        id: sessionId,
        type: 'ai-interview',
        startTime: new Date().toISOString(),
        status: 'active',
        interviewType: interviewType,
        aiPersonality: aiPersonality,
        questions: [],
        responses: [],
        score: { communication: 0, technical: 0, confidence: 0 }
      };
      
      setAiSession(newSession);
      
      // Start with AI greeting
      const greeting = await aiService.generateGreeting(interviewType, aiPersonality);
      addAIMessage(greeting);
      
    } catch (error) {
      console.error('Error initializing AI session:', error);
    }
  };

  const addAIMessage = (message) => {
    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: message,
      timestamp: new Date().toISOString(),
      speaker: 'AI Interviewer'
    };
    
    setConversationHistory(prev => [...prev, aiMessage]);
    addToTranscript(aiMessage);
    
    // Text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.voice = speechSynthesis.getVoices().find(voice => 
        voice.name.includes('Google US English') || voice.lang === 'en-US'
      );
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const addUserMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      speaker: 'You'
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    addToTranscript(userMessage);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const message = userInput.trim();
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Add user message
      addUserMessage(message);
      
      // Generate AI response
      const context = {
        conversationHistory,
        interviewType,
        aiPersonality,
        sessionTime,
        currentScore
      };
      
      const response = await aiService.generateInterviewResponse(message, context);
      
      // Add AI response
      addAIMessage(response.message);
      
      // Update current question if AI asks one
      if (response.question) {
        setCurrentQuestion(response.question);
      }
      
      // Update scores based on response analysis
      if (response.scores) {
        setCurrentScore(prev => ({
          communication: Math.max(prev.communication, response.scores.communication || 0),
          technical: Math.max(prev.technical, response.scores.technical || 0),
          confidence: Math.max(prev.confidence, response.scores.confidence || 0)
        }));
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      addAIMessage("I apologize, but I'm having trouble processing your response. Could you please try again?");
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const endInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview?')) {
      try {
        // Generate final report
        const reportData = {
          sessionId: aiSession.id,
          duration: sessionTime,
          transcript: conversationHistory,
          finalScore: currentScore,
          interviewType,
          aiPersonality,
          timestamp: new Date().toISOString()
        };
        
        // Save session data
        await aiService.saveInterviewSession(reportData);
        
        // Navigate to results page
        navigate(`/ai-interview/results/${sessionId}`);
        
      } catch (error) {
        console.error('Error ending interview:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">AI Interview Session</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Duration: {formatTime(sessionTime)}</span>
              <button
                onClick={endInterview}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interview Type & AI Personality */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Interview Configuration</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={conversationHistory.length > 0}
                  >
                    <option value="general">General Interview</option>
                    <option value="technical">Technical Interview</option>
                    <option value="behavioral">Behavioral Interview</option>
                    <option value="mock">Mock Interview</option>
                    <option value="practice">Practice Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality</label>
                  <select
                    value={aiPersonality}
                    onChange={(e) => setAiPersonality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={conversationHistory.length > 0}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="challenging">Challenging</option>
                    <option value="supportive">Supportive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Interview Conversation</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                    className={`p-2 rounded-full ${
                      isListening 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isListening ? '🛑' : '🎤'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </span>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4"
              >
                {conversationHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Welcome to your AI Interview!</p>
                    <p className="text-sm mt-2">The AI interviewer will start the conversation shortly...</p>
                  </div>
                ) : (
                  conversationHistory.map((message) => (
                    <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        <div className="font-medium text-sm mb-1">{message.speaker}</div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">AI is thinking...</div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your response or use voice input..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Current Scores */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <span className={`font-medium ${getScoreColor(currentScore.communication)}`}>
                    {currentScore.communication.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentScore.communication}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Technical Skills</span>
                  <span className={`font-medium ${getScoreColor(currentScore.technical)}`}>
                    {currentScore.technical.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentScore.technical}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className={`font-medium ${getScoreColor(currentScore.confidence)}`}>
                    {currentScore.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentScore.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Question</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-900 font-medium">{currentQuestion}</p>
                </div>
              </div>
            )}

            {/* Session Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Asked:</span>
                  <span className="font-medium">{conversationHistory.filter(m => m.type === 'ai').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Responses Given:</span>
                  <span className="font-medium">{conversationHistory.filter(m => m.type === 'user').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interview Type:</span>
                  <span className="font-medium">{interviewType}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-full px-4 py-2 text-sm rounded-md ${
                    isRecording 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <button className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Export Transcript
                </button>
                <button className="w-full px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">
                  Get Hint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterview;

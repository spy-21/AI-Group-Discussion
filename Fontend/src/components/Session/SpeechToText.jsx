import React, { useState, useEffect, useRef } from 'react';

const SpeechToText = ({ 
  isActive, 
  onTranscription, 
  language = 'en-US',
  isConnected 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      // Check for Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setIsSupported(true);
        initializeSpeechRecognition();
      } else {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser.');
      }
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      
      // Configure recognition settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;
      
      // Handle results
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        
        // Send final transcript to parent
        if (finalTranscript && onTranscription) {
          onTranscription({
            text: finalTranscript,
            confidence: confidence,
            timestamp: Date.now(),
            language: language,
            isFinal: true
          });
        }
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
        // Restart if still active
        if (isActive && isConnected) {
          setTimeout(() => {
            startListening();
          }, 100);
        }
      };
      
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition.');
    }
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition.');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  };

  // Handle active state changes
  useEffect(() => {
    if (isActive && isConnected && isSupported) {
      startListening();
    } else {
      stopListening();
    }
  }, [isActive, isConnected, isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Alternative: Use MediaRecorder for audio capture and send to backend
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioToBackend(audioBlob);
      };
      
      mediaRecorderRef.current.start(1000); // Capture every second
      
    } catch (err) {
      console.error('Error starting audio recording:', err);
      setError('Failed to start audio recording.');
    }
  };

  // Send audio to backend for transcription
  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);
      
      const response = await fetch('/api/ai/transcribe-audio', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && onTranscription) {
          onTranscription({
            text: result.data.text,
            confidence: result.data.confidence,
            timestamp: Date.now(),
            language: language,
            isFinal: true
          });
        }
      }
    } catch (err) {
      console.error('Error sending audio to backend:', err);
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (error) return '🚫';
    if (!isSupported) return '⚠️';
    if (isListening) return '🎤🔴';
    if (isActive) return '🎤';
    return '🎤';
  };

  // Get status color
  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (!isSupported) return 'text-yellow-500';
    if (isListening) return 'text-red-500';
    if (isActive) return 'text-green-500';
    return 'text-gray-400';
  };

  // Get status text
  const getStatusText = () => {
    if (error) return 'Error';
    if (!isSupported) return 'Not Supported';
    if (isListening) return 'Listening...';
    if (isActive) return 'Ready';
    return 'Inactive';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Speech Recognition</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-2xl ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
          <span className="text-sm text-gray-600">
            {getStatusText()}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!isSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-700 text-sm">
            Speech recognition is not supported in this browser. 
            Audio will be sent to backend for processing.
          </p>
        </div>
      )}

      {/* Live Transcript Display */}
      {isListening && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Live Transcript</span>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[60px]">
            <p className="text-gray-800 text-sm">
              {transcript || 'Listening...'}
            </p>
            {confidence > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence</span>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Language</span>
        <select
          value={language}
          onChange={(e) => {
            const newLanguage = e.target.value;
            if (recognitionRef.current) {
              recognitionRef.current.lang = newLanguage;
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="hi-IN">Hindi</option>
          <option value="zh-CN">Chinese (Simplified)</option>
        </select>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Manual Controls */}
      <div className="flex space-x-2">
        <button
          onClick={startListening}
          disabled={!isSupported || !isConnected}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            !isSupported || !isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          Start Listening
        </button>
        <button
          onClick={stopListening}
          disabled={!isSupported || !isListening}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            !isSupported || !isListening
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop Listening
        </button>
      </div>
    </div>
  );
};

export default SpeechToText; 
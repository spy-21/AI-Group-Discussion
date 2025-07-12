import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AudioControls from "./AudioControls";
import AudioStream from "./AudioStream";
import SpeechToText from "./SpeechToText";

const SessionRoom = () => {
  const { id } = useParams();
  const [session, setSession] = useState({
    id: id,
    topic: "Impact of AI on Future Employment",
    scheduledTime: "2024-01-15T14:00:00",
    status: "active",
    participants: [
      {
        id: 1,
        name: "Alice (Host)",
        type: "real",
        isOnline: true,
        isMuted: false,
        isSpeaking: true,
        avatar: "👩‍💼",
      },
      {
        id: 2,
        name: "Bob",
        type: "real",
        isOnline: true,
        isMuted: false,
        isSpeaking: false,
        avatar: "👨‍💻",
      },
      {
        id: 3,
        name: "AI Assistant - Sarah",
        type: "ai",
        isOnline: true,
        isMuted: false,
        isSpeaking: false,
        avatar: "🤖",
      },
      {
        id: 4,
        name: "Carol",
        type: "real",
        isOnline: true,
        isMuted: false,
        isSpeaking: false,
        avatar: "👩‍🎓",
      },
    ],
  });

  const [userState, setUserState] = useState({
    isMuted: false,
    isSpeaking: false,
    isConnected: true,
    volume: 1,
    audioLevel: 0,
  });

  const [audioStream, setAudioStream] = useState(null);
  const [transcriptionActive, setTranscriptionActive] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [liveTranscription, setLiveTranscription] = useState("");
  const [participantFeedback, setParticipantFeedback] = useState({});
  const [showSubtitles, setShowSubtitles] = useState(true);

  const [transcript, setTranscript] = useState([
    {
      speaker: "Alice (Host)",
      message:
        "Welcome everyone to our discussion on AI and employment. Today we'll explore how artificial intelligence is reshaping the job market.",
      timestamp: "14:00:05",
      type: "speech",
      avatar: "👩‍💼",
    },
    {
      speaker: "AI Assistant - Sarah",
      message:
        "Thank you Alice. I believe AI will create more jobs than it eliminates, particularly in new fields we haven't even imagined yet. The key is adaptation and continuous learning.",
      timestamp: "14:00:15",
      type: "ai",
      avatar: "🤖",
    },
    {
      speaker: "Bob",
      message:
        "I'm concerned about the transition period though. What about people who lose their jobs? How do we ensure they can retrain and find new opportunities?",
      timestamp: "14:00:25",
      type: "speech",
      avatar: "👨‍💻",
    },
    {
      speaker: "Carol",
      message:
        "That's a great point, Bob. I think we need stronger social safety nets and government programs to support workers during these transitions.",
      timestamp: "14:00:35",
      type: "speech",
      avatar: "👩‍🎓",
    },
    {
      speaker: "AI Assistant - Mike",
      message:
        "I agree with Carol. We should also consider universal basic income as a potential solution to address job displacement concerns.",
      timestamp: "14:00:45",
      type: "ai",
      avatar: "🤖",
    },
  ]);

  const [sessionTime, setSessionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState("Alice (Host)");

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = (isMuted) => {
    setUserState((prev) => ({ ...prev, isMuted }));
  };

  const handleVolumeChange = (volume) => {
    setUserState((prev) => ({ ...prev, volume }));
  };

  const handleAudioStream = (stream) => {
    setAudioStream(stream);
  };

  const handleSpeakingStatus = (isSpeaking, audioLevel) => {
    setUserState((prev) => ({
      ...prev,
      isSpeaking,
      audioLevel: audioLevel || 0,
    }));
  };

  const handleTranscription = (transcriptionData) => {
    if (transcriptionData.isFinal) {
      const newEntry = {
        speaker: "You",
        message: transcriptionData.text,
        timestamp: new Date().toLocaleTimeString(),
        type: "speech",
        avatar: "👤",
        confidence: transcriptionData.confidence,
      };
      setTranscript((prev) => [...prev, newEntry]);

      // Update live transcription
      setLiveTranscription(transcriptionData.text);

      // Simulate AI feedback after a delay
      setTimeout(() => {
        const feedback = generateAIFeedback(transcriptionData.text);
        setParticipantFeedback((prev) => ({
          ...prev,
          [1]: feedback, // User ID 1
        }));
      }, 2000);
    }
  };

  const generateAIFeedback = (text) => {
    const feedbacks = [
      "Great point! Consider adding more specific examples.",
      "Excellent contribution to the discussion.",
      "Try to speak a bit slower for better clarity.",
      "That's a thoughtful perspective on the topic.",
      "Consider building on others' previous comments.",
      "Good use of evidence to support your argument.",
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const handleAudioData = (audioData) => {
    // Handle WebRTC signaling or audio data
    console.log("Audio data received:", audioData);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const leaveSession = () => {
    if (window.confirm("Are you sure you want to leave this session?")) {
      window.history.back();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification instead of alert
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    toast.textContent = "Session link copied!";
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  const getSpeakingParticipant = () => {
    return session.participants.find((p) => p.isSpeaking);
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-black border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎤</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">
                {session.topic}
              </h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    session.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-gray-300 text-xs">
                  {formatTime(sessionTime)}
                </span>
                <span className="text-gray-400 text-xs">
                  • {session.participants.length} participants
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selection */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors border-none focus:outline-none"
          >
            <option value="en-US">🇺🇸 English</option>
            <option value="hi-IN">🇮🇳 Hindi</option>
          </select>

          {/* Subtitle Toggle */}
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showSubtitles
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {showSubtitles ? "📺 Subtitles ON" : "📺 Subtitles OFF"}
          </button>

          <button
            onClick={copyLink}
            className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors"
          >
            📋 Invite
          </button>
          <button
            onClick={toggleRecording}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isRecording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {isRecording ? "⏹️ Stop Recording" : "🔴 Record"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-black">
        {/* Main Video Grid Area */}
        <div className="flex-1 p-4 bg-black relative">
          {/* Live Transcription Overlay */}
          {showSubtitles && liveTranscription && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3 max-w-2xl">
              <div className="text-white text-center">
                <div className="text-sm text-gray-300 mb-1">
                  Live Transcription
                </div>
                <div className="text-lg font-medium">{liveTranscription}</div>
              </div>
            </div>
          )}

          {/* Video Grid */}
          <div className="grid grid-cols-2 gap-6 h-full max-w-6xl mx-auto p-4 bg-black">
            {session.participants.map((participant) => (
              <div
                key={participant.id}
                className={`relative bg-gray-800 rounded-xl overflow-hidden border-2 transition-all min-h-[300px] ${
                  participant.isSpeaking
                    ? "border-green-500 shadow-lg shadow-green-500/20"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                {/* Video Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{participant.avatar}</div>
                    <div className="text-white text-lg font-medium truncate px-4">
                      {participant.name}
                    </div>
                  </div>
                </div>

                {/* Participant Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white text-base font-medium truncate">
                        {participant.name}
                      </span>
                      {participant.type === "ai" && (
                        <span className="px-3 py-1 text-sm bg-purple-600 text-white rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {participant.isMuted && (
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🔇</span>
                        </div>
                      )}
                      {participant.isSpeaking && (
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* AI Feedback Indicator */}
                  {participantFeedback[participant.id] && (
                    <div className="mt-2 p-2 bg-yellow-900/80 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-sm">🤖</span>
                        <span className="text-yellow-200 text-xs">
                          {participantFeedback[participant.id]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Speaking Indicator */}
                {participant.isSpeaking && (
                  <div className="absolute top-4 left-4 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-black border-l border-gray-700 flex flex-col">
          {/* Participants Tab */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold mb-3">
              Participants ({session.participants.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {session.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                    participant.isSpeaking
                      ? "bg-green-900/20 border border-green-500/30"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                      {participant.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800 ${
                        participant.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium truncate">
                        {participant.name}
                      </span>
                      {participant.type === "ai" && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {participant.isSpeaking && (
                        <span className="text-green-400">● Speaking</span>
                      )}
                      {participant.isMuted && <span>🔇 Muted</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat/Transcript Area */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Live Chat</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Language:</span>
                <span className="text-xs text-white font-medium">
                  {selectedLanguage}
                </span>
              </div>
            </div>
            <div className="flex-1 bg-gray-900 rounded-lg p-3 overflow-y-auto space-y-3">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    entry.type === "ai"
                      ? "bg-purple-900/30 border-l-2 border-purple-500"
                      : "bg-gray-800 border-l-2 border-blue-500"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-sm font-medium ${
                            entry.type === "ai"
                              ? "text-purple-300"
                              : "text-blue-300"
                          }`}
                        >
                          {entry.speaker}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {entry.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Feedback Panel */}
            <div className="p-4 border-t border-gray-700">
              <h4 className="text-white font-semibold mb-3 text-sm">
                🤖 AI Feedback
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.keys(participantFeedback).length > 0 ? (
                  Object.entries(participantFeedback).map(
                    ([participantId, feedback]) => {
                      const participant = session.participants.find(
                        (p) => p.id.toString() === participantId
                      );
                      return (
                        <div
                          key={participantId}
                          className="p-2 bg-yellow-900/30 rounded-lg border border-yellow-500/30"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-yellow-400 text-xs">💡</span>
                            <span className="text-yellow-200 text-xs font-medium">
                              {participant?.name || "Unknown"}
                            </span>
                          </div>
                          <p className="text-yellow-100 text-xs">{feedback}</p>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="text-gray-400 text-xs text-center py-2">
                    No AI feedback yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-black border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleMute(!userState.isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                userState.isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <span className="text-white text-xl">
                {userState.isMuted ? "🔇" : "🎤"}
              </span>
            </button>

            {/* Audio Level Indicator */}
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white text-xl">💬</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={leaveSession}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-white text-xl">📞</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Audio Components */}
      <div className="hidden">
        <AudioControls
          isConnected={userState.isConnected}
          onAudioStream={handleAudioStream}
          onMuteToggle={toggleMute}
          onVolumeChange={handleVolumeChange}
          isMuted={userState.isMuted}
          volume={userState.volume}
          isSpeaking={userState.isSpeaking}
          audioLevel={userState.audioLevel}
        />

        <AudioStream
          sessionId={session.id}
          userId={1}
          participants={session.participants}
          onAudioData={handleAudioData}
          onSpeakingStatus={handleSpeakingStatus}
          isConnected={userState.isConnected}
        />

        <SpeechToText
          isActive={transcriptionActive}
          onTranscription={handleTranscription}
          language="en-US"
          isConnected={userState.isConnected}
        />
      </div>
    </div>
  );
};

export default SessionRoom;

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
// import SimplePeer from 'simple-peer'; // or use native WebRTC

const SessionRoom = ({ sessionId }) => {
  const [participants, setParticipants] = useState([
    // Example: { id, name, isAI, isMuted, isSpeaking }
  ]);
  const [transcript, setTranscript] = useState([]);
  const [timer, setTimer] = useState(1800); // 30 min
  const [isMuted, setIsMuted] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    // Connect to Socket.io server
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join-room', { sessionId });

    // Listen for participant updates, signaling, etc.
    socketRef.current.on('participants-update', setParticipants);

    // Timer countdown
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // WebRTC setup would go here (see simple-peer or native RTCPeerConnection)

  // TTS: Use Web Speech API or Google TTS to speak AI responses
  // STT: Use Web Speech API or Google STT to transcribe user audio

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">GD Room: [Topic Here]</h2>
        <div className="bg-gray-100 px-3 py-1 rounded-full font-mono">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</div>
        <button className="text-red-600">Leave</button>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {/* Main Audio/Transcript Area */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <button onClick={() => setIsMuted(m => !m)} className={`px-4 py-2 rounded ${isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button className="ml-4 px-4 py-2 rounded bg-blue-100 text-blue-600">Raise Hand</button>
          </div>
          <div className="h-48 overflow-y-auto border rounded p-2 mb-4">
            <div className="text-gray-500 text-sm">Live Transcript:</div>
            {transcript.map((line, i) => (
              <div key={i}><b>{line.speaker}:</b> {line.text}</div>
            ))}
          </div>
        </div>
        {/* Participant List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Participants</h3>
          <ul>
            {participants.map(p => (
              <li key={p.id} className="flex items-center mb-2">
                <span className={`w-2 h-2 rounded-full mr-2 ${p.isSpeaking ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="font-medium">{p.name}</span>
                {p.isAI && <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">AI</span>}
                {p.isMuted && <span className="ml-2 text-xs text-red-500">Muted</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;

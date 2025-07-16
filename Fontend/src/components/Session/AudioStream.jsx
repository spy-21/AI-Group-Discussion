import React, { useEffect, useRef, useState } from 'react';

const AudioStream = ({ 
  userId, 
  participants, 
  onAudioData, 
  onSpeakingStatus,
  isConnected 
}) => {
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  const localAudioRef = useRef(null);
  const remoteAudiosRef = useRef(new Map());
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize audio context and local stream
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Create audio context
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          }
        });

        setLocalStream(stream);
        
        // Set local audio element
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        // Start audio processing for analysis
        startAudioProcessing(stream, context);
        
        setIsInitialized(true);

      } catch (err) {
        console.error('Error initializing audio:', err);
        setError('Failed to access microphone. Please check permissions.');
      }
    };

    if (isConnected && !isInitialized) {
      initializeAudio();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isConnected, isInitialized]);

  // Handle new participants joining
  useEffect(() => {
    participants.forEach(participant => {
      if (participant.id !== userId && !peerConnections.has(participant.id)) {
        createPeerConnection(participant.id);
      }
    });
  }, [participants, userId]);

  // Create peer connection for a participant
  const createPeerConnection = (participantId) => {
    try {
      const peerConnection = new RTCPeerConnection(rtcConfiguration);
      
      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        const [stream] = event.streams;
        console.log('Received remote track from:', participantId);
        
        // Create audio element if it doesn't exist
        if (!remoteAudiosRef.current.has(participantId)) {
          const audioElement = document.createElement('audio');
          audioElement.autoplay = true;
          audioElement.controls = false;
          audioElement.style.display = 'none';
          document.body.appendChild(audioElement);
          remoteAudiosRef.current.set(participantId, audioElement);
        }
        
        const audioElement = remoteAudiosRef.current.get(participantId);
        audioElement.srcObject = stream;
        audioElement.play().catch(console.error);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to signaling server
          if (onAudioData) {
            onAudioData({
              type: 'ice-candidate',
              candidate: event.candidate,
              targetId: participantId
            });
          }
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${participantId}:`, peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          console.log(`✅ Audio connection established with ${participantId}`);
        } else if (peerConnection.connectionState === 'failed') {
          console.log(`❌ Audio connection failed with ${participantId}`);
          // Try to restart the connection
          setTimeout(() => createOffer(participantId), 1000);
        }
      };

      setPeerConnections(prev => new Map(prev.set(participantId, peerConnection)));
      
      // Create offer immediately for new connections
      setTimeout(() => createOffer(participantId), 100);

    } catch (err) {
      console.error('Error creating peer connection:', err);
    }
  };

  // Start audio processing for analysis
  const startAudioProcessing = (stream, context) => {
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastSpeaking = false;
    let speakingStartTime = null;
    let listening = true;

    const processAudio = () => {
      if (!listening) return;
      analyser.getByteFrequencyData(dataArray);

      // Calculate audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255;

      // Detect speaking
      const isSpeaking = normalizedLevel > 0.1;

      // Debug: log speaking state and userId
      console.log('isSpeaking:', isSpeaking, 'lastSpeaking:', lastSpeaking, 'userId:', userId);

      // Only call onSpeakingStatus if state changes
      if (onSpeakingStatus && isSpeaking !== lastSpeaking) {
        onSpeakingStatus(isSpeaking, normalizedLevel);
        lastSpeaking = isSpeaking;
        if (isSpeaking) {
          speakingStartTime = Date.now();
        } else {
          speakingStartTime = null;
        }
      }

      // If speaking, check if 10 seconds have passed
      if (isSpeaking && speakingStartTime && Date.now() - speakingStartTime >= 10000) {
        // Debug: log before emitting
        if (!userId) {
          console.warn('[WARN] userId is missing, cannot emit request-ai-response');
        } else if (typeof window !== 'undefined' && window.socket && window.sessionId) {
          console.log("[EMIT] request-ai-response", {
            sessionId: window.sessionId,
            message: "(user speaking for 10 seconds)",
            userId: userId
          });
          window.socket.emit("request-ai-response", {
            sessionId: window.sessionId,
            message: "(user speaking for 10 seconds)",
            userId: userId
          });
        }
        // Reset timer to allow repeated requests every 10 seconds
        speakingStartTime = Date.now();
      }

      // Send audio data to server for buffering
      if (window.socket && window.sessionId && userId) {
        window.socket.emit("audio-data-chunk", {
          sessionId: window.sessionId,
          userId: userId,
          audioData: Array.from(dataArray), // Convert to regular array
          timestamp: Date.now()
        });
      }

      // Send audio data for analysis (optional, for visual feedback)
      if (onAudioData && isSpeaking) {
        onAudioData({
          type: 'audio-data',
          audioLevel: normalizedLevel,
          timestamp: Date.now()
        });
      }
    };

    processAudio();
  };

  // Handle incoming signaling messages
  const handleSignalingMessage = async (message) => {
    const { type, fromId, data } = message;
    const peerConnection = peerConnections.get(fromId);

    if (!peerConnection) return;

    try {
      switch (type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          if (onAudioData) {
            onAudioData({
              type: 'answer',
              answer: answer,
              targetId: fromId
            });
          }
          break;

        case 'answer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
          break;

        case 'ice-candidate':
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
          break;
      }
    } catch (err) {
      console.error('Error handling signaling message:', err);
    }
  };

  // Create offer for new participant
  const createOffer = async (participantId) => {
    const peerConnection = peerConnections.get(participantId);
    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (onAudioData) {
        onAudioData({
          type: 'offer',
          offer: offer,
          targetId: participantId
        });
      }
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  // Clean up peer connections
  const cleanupPeerConnection = (participantId) => {
    const peerConnection = peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(participantId);
        return newMap;
      });
    }

    // Clean up remote audio element
    if (remoteAudiosRef.current.has(participantId)) {
      const audioElement = remoteAudiosRef.current.get(participantId);
      audioElement.srcObject = null;
      remoteAudiosRef.current.delete(participantId);
    }
  };

  // Handle participant leaving
  useEffect(() => {
    const currentParticipantIds = new Set(participants.map(p => p.id));
    
    peerConnections.forEach((connection, participantId) => {
      if (!currentParticipantIds.has(participantId)) {
        cleanupPeerConnection(participantId);
      }
    });
  }, [participants]);

  // Start a timer that emits request-ai-response every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.socket && window.sessionId && userId) {
        console.log("[EMIT] request-ai-response (interval)", {
          sessionId: window.sessionId,
          message: "(timer trigger)",
          userId: userId
        });
        window.socket.emit("request-ai-response", {
          sessionId: window.sessionId,
          message: "(timer trigger)",
          userId: userId
        });
      } else {
        console.warn('[WARN] Cannot emit request-ai-response (interval): missing socket, sessionId, or userId');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Expose signaling handler to parent component
  useEffect(() => {
    if (typeof onAudioData === 'function') {
      onAudioData.handleSignalingMessage = handleSignalingMessage;
    }
  }, [onAudioData]);

  return (
    <div className="space-y-8">
      {/* Local Audio (hidden) */}
      <audio
        ref={localAudioRef}
        autoPlay
        muted
        style={{ display: 'none' }}
      />
      
      {/* Remote Audio Elements */}
      {participants
        .filter(participant => participant.id !== userId)
        .map(participant => (
          <audio
            key={participant.id}
            ref={(el) => {
              if (el) {
                remoteAudiosRef.current.set(participant.id, el);
              }
            }}
            autoPlay
            controls={false}
            style={{ display: 'none' }}
          />
        ))}
      
      {/* Audio Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-blue-700">
            {isInitialized ? 'Audio streaming active' : 'Initializing audio...'}
          </span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Connected to {peerConnections.size} participants
        </p>
      </div>
    </div>
  );
};

export default AudioStream; 
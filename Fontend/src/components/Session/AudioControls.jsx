import React, { useState, useEffect, useRef } from "react";

const AudioControls = ({
  isConnected,
  onAudioStream,
  onMuteToggle,
  onVolumeChange,
  onSpeakingStatus,
  isMuted = false,
  volume = 1,
  isSpeaking = false,
  audioLevel = 0,
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [error, setError] = useState(null);
  const animationFrameRef = useRef(null);

  // Initialize audio context and microphone
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
        });

        setMediaStream(stream);
        setIsMicActive(true);

        // Create audio context for analysis
        const context = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();

        analyserNode.fftSize = 256;
        source.connect(analyserNode);

        setAudioContext(context);

        // Start audio level monitoring
        monitorAudioLevel(analyserNode);

        // Send audio stream to parent component
        if (onAudioStream) {
          onAudioStream(stream);
        }
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError(
          "Microphone access denied. Please allow microphone permissions."
        );
      }
    };

    if (isConnected && !isMicActive) {
      initAudio();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isConnected, isMicActive, onAudioStream]);

  // Monitor audio levels for visual feedback
  const monitorAudioLevel = (analyserNode) => {
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    let lastSpeakingState = false;

    const updateLevel = () => {
      analyserNode.getByteFrequencyData(dataArray);

      // Calculate average audio level
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1

      // Update speaking status based on audio level
      const isSpeaking = normalizedLevel > 0.1 && !isMuted;

      // Only trigger callback if speaking state changed
      if (isSpeaking !== lastSpeakingState) {
        lastSpeakingState = isSpeaking;
        if (onSpeakingStatus) {
          onSpeakingStatus(isSpeaking, normalizedLevel);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicActive(audioTrack.enabled);
        if (onMuteToggle) {
          onMuteToggle(!audioTrack.enabled);
        }
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  // Get microphone status icon
  const getMicIcon = () => {
    if (error) return "🚫";
    if (!isMicActive || isMuted) return "🎤";
    if (isSpeaking) return "🎤🔴";
    return "🎤";
  };

  // Get microphone status color
  const getMicColor = () => {
    if (error) return "text-red-500";
    if (!isMicActive || isMuted) return "text-gray-400";
    if (isSpeaking) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Audio Controls</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-2xl ${getMicColor()}`}>{getMicIcon()}</span>
          <span className="text-sm text-gray-600">
            {error
              ? "Error"
              : isMuted
              ? "Muted"
              : isSpeaking
              ? "Speaking"
              : "Active"}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Reload page to try again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Microphone Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Microphone</span>
          <button
            onClick={handleMuteToggle}
            disabled={!!error}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              error
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isMuted
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Volume</span>
            <span className="text-sm text-gray-500">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Audio Level Indicator */}
        {isMicActive && !isMuted && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Audio Level
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-100 ${
                  audioLevel > 0.7
                    ? "bg-red-500"
                    : audioLevel > 0.4
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Settings */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">
            Audio Settings
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Sample Rate: 48kHz</div>
            <div>Echo Cancellation: On</div>
            <div>Noise Suppression: On</div>
            <div>Auto Gain Control: On</div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
};

export default AudioControls;

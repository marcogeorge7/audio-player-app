'use client';

import { useState, useRef, useEffect } from 'react';
import { Playlist, PlaylistItem, PlayerState, AudioDevice } from '@/types/audio';

interface AudioPlayerProps {
  playlist: Playlist;
  audioDevices: AudioDevice[];
  onPlaylistUpdate?: (playlist: Playlist) => void;
}

export default function AudioPlayer({
  playlist,
  audioDevices,
  onPlaylistUpdate
}: AudioPlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isPaused: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    audioElement: null,
    sourceNode: null,
    gainNode: null,
    selectedPlaylist: playlist,
    selectedDevice: audioDevices[0] || null
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTrackRef = useRef<PlaylistItem | null>(null);
  const currentSourceNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const currentGainNodeRef = useRef<GainNode | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const playbackIdRef = useRef<number>(0); // Track current playback session
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize audio context
  useEffect(() => {
    if (!isMounted) return;
    
    const initAudio = async () => {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isMounted]);

  // Update selected playlist when prop changes
  useEffect(() => {
    setPlayerState(prev => ({
      ...prev,
      selectedPlaylist: playlist
    }));
    // Reset to first track when playlist changes
    if (playlist.items.length > 0) {
      currentTrackRef.current = playlist.items[0];
    }
  }, [playlist]);

  // Get current track
  const getCurrentTrack = (): PlaylistItem | null => {
    if (!playlist.items.length || playlist.currentIndex >= playlist.items.length) {
      return null;
    }
    return playlist.items[playlist.currentIndex];
  };

  // Get next track index
  const getNextIndex = (): number => {
    if (playlist.items.length === 0) return 0;
    
    if (playlist.repeat === 'one') {
      return playlist.currentIndex;
    }
    
    let nextIndex: number;
    if (playlist.shuffle && playlist.shuffledIndices) {
      const currentShufflePos = playlist.shuffledIndices.indexOf(playlist.currentIndex);
      nextIndex = playlist.shuffledIndices[(currentShufflePos + 1) % playlist.shuffledIndices.length];
    } else {
      nextIndex = (playlist.currentIndex + 1) % playlist.items.length;
    }
    
    if (nextIndex === 0 && playlist.repeat === 'off') {
      return -1; // End of playlist
    }
    
    return nextIndex;
  };

  // Get previous track index
  const getPreviousIndex = (): number => {
    if (playlist.items.length === 0) return 0;
    
    if (playlist.repeat === 'one') {
      return playlist.currentIndex;
    }
    
    let prevIndex: number;
    if (playlist.shuffle && playlist.shuffledIndices) {
      const currentShufflePos = playlist.shuffledIndices.indexOf(playlist.currentIndex);
      const newPos = currentShufflePos - 1;
      prevIndex = playlist.shuffledIndices[newPos < 0 ? playlist.shuffledIndices.length - 1 : newPos];
    } else {
      prevIndex = playlist.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = playlist.repeat === 'all' ? playlist.items.length - 1 : 0;
      }
    }
    
    return prevIndex;
  };

  // Update current track index
  const updateCurrentIndex = (index: number) => {
    if (onPlaylistUpdate) {
      const updatedPlaylist = {
        ...playlist,
        currentIndex: index,
        updatedAt: new Date().toISOString()
      };
      onPlaylistUpdate(updatedPlaylist);
    }
  };

  // Stop current audio
  const stopAudio = () => {
    // Increment playback ID to invalidate any pending onended callbacks
    playbackIdRef.current += 1;
    
    // Stop source node using ref
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.stop();
      } catch {}
      currentSourceNodeRef.current = null;
    }
    
    // Stop audio element using ref
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.srcObject = null;
      currentAudioElementRef.current = null;
    }
    
    // Clear gain node ref
    if (currentGainNodeRef.current) {
      currentGainNodeRef.current = null;
    }
    
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      sourceNode: null,
      gainNode: null,
      audioElement: null,
      currentTime: 0
    }));
  };

  // Play current track
  const playTrack = async (trackIndex?: number) => {
    if (!audioContextRef.current) return;
    
    const indexToPlay = trackIndex !== undefined ? trackIndex : playlist.currentIndex;
    const track = playlist.items[indexToPlay];
    
    if (!track) return;
    
    // Update current index if different
    if (indexToPlay !== playlist.currentIndex) {
      updateCurrentIndex(indexToPlay);
    }
    
    // Stop any existing audio
    stopAudio();
    
    try {
      if (track.content.startsWith('tone:')) {
        // Play tone
        const frequency = parseInt(track.content.split(':')[1]);
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(playerState.volume, audioContextRef.current.currentTime);
        
        // Create stream destination for device routing
        const streamDestination = audioContextRef.current.createMediaStreamDestination();
        oscillator.connect(gainNode);
        gainNode.connect(streamDestination);
        
        // Create audio element for device routing
        const audioElement = new Audio();
        audioElement.srcObject = streamDestination.stream;
        audioElement.volume = 1.0;
        
        // Route to selected device
        if (playerState.selectedDevice && 'setSinkId' in audioElement) {
          try {
            await (audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(playerState.selectedDevice.deviceId);
          } catch (error) {
            console.warn('setSinkId failed:', error);
          }
        }
        
        // Capture playback ID for this track
        const currentPlaybackId = playbackIdRef.current;
        
        // Handle track end
        oscillator.onended = () => {
          // Check if this callback is still valid (not invalidated by a new track)
          if (playbackIdRef.current !== currentPlaybackId) {
            console.log('🔇 Ignoring onended from previous track (tone)');
            return;
          }
          
          const nextIndex = getNextIndex();
          if (nextIndex >= 0) {
            setTimeout(() => playTrack(nextIndex), 100);
          } else {
            stopAudio();
          }
        };
        
        oscillator.start();
        await audioElement.play();
        
        // Store refs for proper cleanup
        currentSourceNodeRef.current = oscillator;
        currentGainNodeRef.current = gainNode;
        currentAudioElementRef.current = audioElement;
        
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          sourceNode: oscillator,
          gainNode,
          audioElement,
          duration: 0 // Infinite for tones
        }));
        
      } else {
        // Play audio file
        const response = await fetch(`/audio/${track.content}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        const sourceNode = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();
        
        sourceNode.buffer = audioBuffer;
        sourceNode.loop = playlist.repeat === 'one';
        gainNode.gain.setValueAtTime(playerState.volume, audioContextRef.current.currentTime);
        
        // Create stream destination for device routing
        const streamDestination = audioContextRef.current.createMediaStreamDestination();
        sourceNode.connect(gainNode);
        gainNode.connect(streamDestination);
        
        // Create audio element for device routing
        const audioElement = new Audio();
        audioElement.srcObject = streamDestination.stream;
        audioElement.volume = 1.0;
        
        // Route to selected device
        if (playerState.selectedDevice && 'setSinkId' in audioElement) {
          try {
            await (audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(playerState.selectedDevice.deviceId);
          } catch (error) {
            console.warn('setSinkId failed:', error);
          }
        }
        
        // Capture playback ID for this track
        const currentPlaybackId = playbackIdRef.current;
        
        // Handle track end
        sourceNode.onended = () => {
          // Check if this callback is still valid (not invalidated by a new track)
          if (playbackIdRef.current !== currentPlaybackId) {
            console.log('🔇 Ignoring onended from previous track (file)');
            return;
          }
          
          if (!sourceNode.loop) {
            const nextIndex = getNextIndex();
            if (nextIndex >= 0) {
              setTimeout(() => playTrack(nextIndex), 100);
            } else {
              stopAudio();
            }
          }
        };
        
        sourceNode.start();
        await audioElement.play();
        
        // Store refs for proper cleanup
        currentSourceNodeRef.current = sourceNode;
        currentGainNodeRef.current = gainNode;
        currentAudioElementRef.current = audioElement;
        
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          sourceNode,
          gainNode,
          audioElement,
          duration: audioBuffer.duration
        }));
      }
      
      currentTrackRef.current = track;
      console.log(`🎵 Playing: ${track.title}`);
      
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Pause/Resume
  const togglePause = () => {
    if (playerState.isPlaying) {
      stopAudio();
      setPlayerState(prev => ({ ...prev, isPaused: true }));
    } else if (playerState.isPaused) {
      playTrack(playlist.currentIndex);
    }
  };

  // Next track
  const nextTrack = () => {
    const nextIndex = getNextIndex();
    if (nextIndex >= 0) {
      playTrack(nextIndex);
    }
  };

  // Previous track
  const previousTrack = () => {
    const prevIndex = getPreviousIndex();
    playTrack(prevIndex);
  };

  // Update volume
  const updateVolume = (volume: number) => {
    setPlayerState(prev => ({ ...prev, volume }));
    if (currentGainNodeRef.current && audioContextRef.current) {
      currentGainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  };

  // Update device selection
  const updateDevice = (device: AudioDevice) => {
    setPlayerState(prev => ({ ...prev, selectedDevice: device }));
  };

  const currentTrack = getCurrentTrack();
  const progress = playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎵 Audio Player</h2>
        <p className="text-gray-600">{playlist.name}</p>
        {playlist.description && (
          <p className="text-sm text-gray-500 mt-1">{playlist.description}</p>
        )}
      </div>

      {/* Device Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Device:
        </label>
        <select
          value={playerState.selectedDevice?.deviceId || ''}
          onChange={(e) => {
            const device = audioDevices.find(d => d.deviceId === e.target.value);
            if (device) updateDevice(device);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {audioDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      {/* Current Track Info */}
      {currentTrack && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {currentTrack.title}
          </div>
          <div className="text-sm text-gray-500">
            Track {playlist.currentIndex + 1} of {playlist.items.length} • {currentTrack.type}
          </div>
          {playerState.duration > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.floor(playerState.currentTime / 60)}:{Math.floor(playerState.currentTime % 60).toString().padStart(2, '0')}</span>
                <span>{Math.floor(playerState.duration / 60)}:{Math.floor(playerState.duration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={previousTrack}
          disabled={!currentTrack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          ⏮️ Previous
        </button>
        
        <button
          onClick={() => currentTrack && playTrack()}
          disabled={!currentTrack || playerState.isPlaying}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {playerState.isPlaying ? '🔄 Playing...' : '▶️ Play'}
        </button>
        
        <button
          onClick={togglePause}
          disabled={!currentTrack}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {playerState.isPlaying ? '⏸️ Pause' : '▶️ Resume'}
        </button>
        
        <button
          onClick={stopAudio}
          disabled={!playerState.isPlaying && !playerState.isPaused}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          ⏹️ Stop
        </button>
        
        <button
          onClick={nextTrack}
          disabled={!currentTrack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          ⏭️ Next
        </button>
      </div>

      {/* Volume Control */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volume: {Math.round(playerState.volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={playerState.volume}
          onChange={(e) => updateVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Playlist Quick View */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Playlist ({playlist.items.length} tracks)
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {playlist.items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer ${
                index === playlist.currentIndex
                  ? 'bg-blue-100 border border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => playTrack(index)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-sm font-mono text-gray-500">
                  #{(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-sm truncate" title={item.title}>
                  {item.title}
                </span>
                {index === playlist.currentIndex && playerState.isPlaying && (
                  <span className="text-blue-600">▶️</span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                ({item.type})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Playback Options */}
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          🔀 Shuffle: {playlist.shuffle ? 'ON' : 'OFF'}
        </div>
        <div className="text-sm text-gray-600">
          🔁 Repeat: {playlist.repeat.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

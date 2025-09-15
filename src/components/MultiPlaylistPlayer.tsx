'use client';

import { useState, useEffect } from 'react';
import { Playlist, AudioDevice } from '@/types/audio';
import { useAudioFiles } from '@/hooks/useAudioFiles';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import PlaylistForm from './PlaylistForm';
import AudioPlayer from './AudioPlayer';
import FileUpload from './FileUpload';

type ViewMode = 'playlists' | 'create' | 'edit' | 'players';

interface PlaylistPlayerInstance {
  id: string;
  playlist: Playlist;
  device: AudioDevice;
}

export default function MultiPlaylistPlayer() {
  const [currentView, setCurrentView] = useState<ViewMode>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [activeInstances, setActiveInstances] = useState<PlaylistPlayerInstance[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Use custom hooks for data fetching
  const { audioFiles, loading: filesLoading, error: filesError, refetch: refetchFiles } = useAudioFiles();
  const { audioDevices, loading: devicesLoading, error: devicesError } = useAudioDevices();
  
  const isLoading = filesLoading || devicesLoading;
  const hasError = filesError || devicesError;

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
    loadStoredPlaylists();
  }, []);

  // Load playlists from localStorage
  const loadStoredPlaylists = () => {
    try {
      const stored = localStorage.getItem('audio-playlists');
      if (stored) {
        const parsedPlaylists = JSON.parse(stored);
        setPlaylists(parsedPlaylists);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  // Save playlists to localStorage
  const savePlaylistsToStorage = (newPlaylists: Playlist[]) => {
    try {
      localStorage.setItem('audio-playlists', JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  // Handle playlist save
  const handleSavePlaylist = (playlist: Playlist) => {
    const existingIndex = playlists.findIndex(p => p.id === playlist.id);
    let newPlaylists: Playlist[];
    
    if (existingIndex >= 0) {
      // Update existing playlist
      newPlaylists = [...playlists];
      newPlaylists[existingIndex] = playlist;
    } else {
      // Add new playlist
      newPlaylists = [...playlists, playlist];
    }
    
    setPlaylists(newPlaylists);
    savePlaylistsToStorage(newPlaylists);
    setCurrentView('playlists');
    setEditingPlaylist(null);
  };

  // Handle playlist delete
  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      const newPlaylists = playlists.filter(p => p.id !== playlistId);
      setPlaylists(newPlaylists);
      savePlaylistsToStorage(newPlaylists);
      
      // Remove from active instances if playing
      setActiveInstances(prev => prev.filter(instance => instance.playlist.id !== playlistId));
    }
  };

  // Handle playlist update (for player state changes)
  const handlePlaylistUpdate = (instanceId: string, updatedPlaylist: Playlist) => {
    // Update in playlists
    const newPlaylists = playlists.map(p => 
      p.id === updatedPlaylist.id ? updatedPlaylist : p
    );
    setPlaylists(newPlaylists);
    savePlaylistsToStorage(newPlaylists);
    
    // Update in active instances
    setActiveInstances(prev => 
      prev.map(instance => 
        instance.id === instanceId 
          ? { ...instance, playlist: updatedPlaylist }
          : instance
      )
    );
  };

  // Add playlist to player
  const addToPlayer = (playlist: Playlist, device: AudioDevice) => {
    // Check if device is already being used
    const deviceInUse = activeInstances.some(instance => instance.device.deviceId === device.deviceId);
    if (deviceInUse) {
      alert(`Device "${device.label}" is already being used by another playlist.`);
      return;
    }

    const newInstance: PlaylistPlayerInstance = {
      id: `${playlist.id}-${device.deviceId}-${Date.now()}`,
      playlist,
      device
    };

    setActiveInstances(prev => [...prev, newInstance]);
    setCurrentView('players');
  };

  // Remove playlist from player
  const removeFromPlayer = (instanceId: string) => {
    setActiveInstances(prev => prev.filter(instance => instance.id !== instanceId));
  };

  // Handle file upload completion
  const handleUploadComplete = () => {
    refetchFiles();
  };

  // Handle client-side mounting first — avoid SSR/hydration mismatches
  if (!isMounted) {
    return null;
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p className="text-gray-600">
          {filesLoading && devicesLoading ? 'Loading audio files and devices...' :
           filesLoading ? 'Loading audio files...' : 'Loading audio devices...'}
        </p>
        <p className="text-sm text-gray-500 mt-2">Please allow microphone access to detect audio outputs</p>
      </div>
    );
  }

  // Handle errors
  if (hasError) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Resources</h3>
        <div className="text-red-600 mb-4">
          {filesError && <p>• Audio files: {filesError}</p>}
          {devicesError && <p>• Audio devices: {devicesError}</p>}
        </div>
        <p className="text-sm text-gray-500">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (audioDevices.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Audio Devices Found</h3>
        <p className="text-gray-600 mb-4">
          No audio output devices are available. To use this player, you need audio devices such as:
        </p>
        <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
          <li>• System default speakers</li>
          <li>• USB headphones or speakers</li>
          <li>• Bluetooth audio devices</li>
          <li>• External audio interfaces</li>
        </ul>
        <p className="text-sm text-gray-500 mt-4">
          Connect audio devices and refresh the page.
        </p>
      </div>
    );
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <PlaylistForm
            audioFiles={audioFiles}
            onSavePlaylist={handleSavePlaylist}
            onCancel={() => setCurrentView('playlists')}
          />
        );
        
      case 'edit':
        return editingPlaylist ? (
          <PlaylistForm
            audioFiles={audioFiles}
            existingPlaylist={editingPlaylist}
            onSavePlaylist={handleSavePlaylist}
            onCancel={() => {
              setEditingPlaylist(null);
              setCurrentView('playlists');
            }}
          />
        ) : null;
        
      case 'players':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">🎵 Active Players</h2>
                <p className="text-gray-600">Playing {activeInstances.length} playlist{activeInstances.length !== 1 ? 's' : ''} on separate outputs</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => setCurrentView('playlists')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  ➕ Add More
                </button>
                <button
                  onClick={() => {
                    if (confirm('Stop all players?')) {
                      setActiveInstances([]);
                      setCurrentView('playlists');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={activeInstances.length === 0}
                >
                  ⏹️ Stop All
                </button>
              </div>
            </div>

            {/* Active Player Instances */}
            {activeInstances.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Players</h3>
                <p className="text-gray-600 mb-4">Add playlists to start playing on different outputs</p>
                <button
                  onClick={() => setCurrentView('playlists')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Select Playlists
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {activeInstances.map((instance) => (
                  <div key={instance.id} className="relative">
                    <button
                      onClick={() => removeFromPlayer(instance.id)}
                      className="absolute top-2 right-2 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                      title="Remove from player"
                    >
                      ✕
                    </button>
                    <AudioPlayer
                      playlist={instance.playlist}
                      audioDevices={[instance.device]} // Only allow the selected device
                      onPlaylistUpdate={(updatedPlaylist) => handlePlaylistUpdate(instance.id, updatedPlaylist)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default: // 'playlists'
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
                🎵 Multi-Playlist Audio Player
              </h1>
              <p className="text-center text-gray-600 mb-4">
                Play different playlists on separate audio outputs simultaneously
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
                <span>🎧 {audioDevices.length} Device{audioDevices.length !== 1 ? 's' : ''}</span>
                <span>🎵 {audioFiles.length} Audio File{audioFiles.length !== 1 ? 's' : ''}</span>
                <span>📂 {playlists.length} Playlist{playlists.length !== 1 ? 's' : ''}</span>
                <span>▶️ {activeInstances.length} Playing</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentView('create')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
              >
                ➕ Create New Playlist
              </button>
              {activeInstances.length > 0 && (
                <button
                  onClick={() => setCurrentView('players')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors"
                >
                  🎵 View Active Players ({activeInstances.length})
                </button>
              )}
            </div>

            {/* Playlists List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Playlists</h2>
              
              {playlists.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
                  <p className="text-sm mb-4">Create your first playlist to get started</p>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate" title={playlist.name}>
                            {playlist.name}
                          </h3>
                          {playlist.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={playlist.description}>
                              {playlist.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingPlaylist(playlist);
                              setCurrentView('edit');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Edit playlist"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Delete playlist"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{playlist.items.length} track{playlist.items.length !== 1 ? 's' : ''}</span>
                        <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {playlist.items.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Tracks:</div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {playlist.items.slice(0, 3).map((item, index) => (
                              <div key={item.id} className="text-xs text-gray-600 truncate">
                                {index + 1}. {item.title}
                              </div>
                            ))}
                            {playlist.items.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{playlist.items.length - 3} more...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {playlist.items.length === 0 ? (
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-md cursor-not-allowed"
                        >
                          Empty Playlist
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Select output device:</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {audioDevices.map(device => {
                              const isDeviceInUse = activeInstances.some(instance => instance.device.deviceId === device.deviceId);
                              return (
                                <button
                                  key={device.deviceId}
                                  onClick={() => addToPlayer(playlist, device)}
                                  disabled={isDeviceInUse}
                                  className={`w-full px-3 py-2 text-xs rounded-md transition-colors text-left ${
                                    isDeviceInUse
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                                  }`}
                                  title={isDeviceInUse ? 'Device already in use' : `Play on ${device.label}`}
                                >
                                  <span className="block truncate">
                                    {isDeviceInUse ? '🔒' : '▶️'} {device.label}
                                  </span>
                                  {isDeviceInUse && (
                                    <span className="text-xs text-gray-400">In use</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="w-full max-w-7xl mx-auto px-4">
        {renderCurrentView()}
      </div>
    </div>
  );
}

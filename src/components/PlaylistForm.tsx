'use client';

import { useState } from 'react';
import { Playlist, PlaylistItem, AudioFile, ToneFrequency } from '@/types/audio';

interface PlaylistFormProps {
  audioFiles: AudioFile[];
  onSavePlaylist: (playlist: Playlist) => void;
  existingPlaylist?: Playlist;
  onCancel?: () => void;
}

const TONE_FREQUENCIES: ToneFrequency[] = [220, 440, 880, 1000];

export default function PlaylistForm({
  audioFiles,
  onSavePlaylist,
  existingPlaylist,
  onCancel
}: PlaylistFormProps) {
  const [name, setName] = useState(existingPlaylist?.name || '');
  const [description, setDescription] = useState(existingPlaylist?.description || '');
  const [items, setItems] = useState<PlaylistItem[]>(existingPlaylist?.items || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Generate unique ID for playlist items
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create playlist item from audio file
  const createFileItem = (file: AudioFile): PlaylistItem => ({
    id: generateId(),
    type: 'file',
    content: file.filename,
    title: file.label
  });

  // Create playlist item from tone
  const createToneItem = (frequency: ToneFrequency): PlaylistItem => ({
    id: generateId(),
    type: 'tone',
    content: `tone:${frequency}`,
    title: `🎵 Tone ${frequency}Hz`
  });

  // Add item to playlist
  const addItem = (item: PlaylistItem) => {
    setItems(prev => [...prev, item]);
  };

  // Remove item from playlist
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Move item in playlist
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
  };

  // Handle drag events
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveItem(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  // Save playlist
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to the playlist');
      return;
    }

    const playlist: Playlist = {
      id: existingPlaylist?.id || generateId(),
      name: name.trim(),
      description: description.trim(),
      items,
      currentIndex: existingPlaylist?.currentIndex || 0,
      shuffle: existingPlaylist?.shuffle || false,
      repeat: existingPlaylist?.repeat || 'off',
      createdAt: existingPlaylist?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSavePlaylist(playlist);
  };

  // Clear all items
  const clearItems = () => {
    if (confirm('Remove all items from the playlist?')) {
      setItems([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {existingPlaylist ? '✏️ Edit Playlist' : '➕ Create New Playlist'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Playlist Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter playlist name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      {/* Add Items Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Items</h3>
        
        {/* Tone Generator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Tone Generator:
          </label>
          <div className="flex flex-wrap gap-2">
            {TONE_FREQUENCIES.map(freq => (
              <button
                key={freq}
                onClick={() => addItem(createToneItem(freq))}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md transition-colors"
              >
                + {freq}Hz
              </button>
            ))}
          </div>
        </div>

        {/* Audio Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Audio Files:
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {audioFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No audio files available</p>
                <p className="text-xs mt-1">Upload some files to add them to playlists</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {audioFiles.map(file => (
                  <button
                    key={file.filename}
                    onClick={() => addItem(createFileItem(file))}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm"
                    title={`Add ${file.label} to playlist`}
                  >
                    <span className="text-green-600 mr-2">+</span>
                    {file.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Playlist Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Playlist Items ({items.length})
          </h3>
          {items.length > 0 && (
            <button
              onClick={clearItems}
              className="text-sm text-red-600 hover:text-red-800"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-sm">No items in playlist yet</p>
            <p className="text-xs mt-1">Add some tracks or tones above</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md border cursor-move"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-sm font-mono text-gray-500">
                    #{(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium truncate" title={item.title}>
                    {item.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({item.type})
                  </span>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!name.trim() || items.length === 0}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          {existingPlaylist ? '💾 Save Changes' : '✅ Create Playlist'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

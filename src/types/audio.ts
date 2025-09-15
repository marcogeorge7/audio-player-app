export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export interface AudioFile {
  filename: string;
  label: string;
  path: string;
}

// Playlist types
export interface PlaylistItem {
  id: string;
  type: 'file' | 'tone';
  content: string; // filename or 'tone:frequency'
  title: string;
  duration?: number; // in seconds, if known
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: PlaylistItem[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  shuffledIndices?: number[];
  createdAt: string;
  updatedAt: string;
}

// Player state
export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  audioElement: HTMLAudioElement | null;
  sourceNode: AudioBufferSourceNode | OscillatorNode | null;
  gainNode: GainNode | null;
  selectedPlaylist: Playlist | null;
  selectedDevice: AudioDevice | null;
}

export type ToneFrequency = 220 | 440 | 880 | 1000;

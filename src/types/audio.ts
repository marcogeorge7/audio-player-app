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

export interface DeviceAudioState {
  isPlaying: boolean;
  volume: number;
  audioContent: string; // 'none', 'tone:frequency', or filename
  audioElement: HTMLAudioElement | null;
  oscillatorNode: OscillatorNode | null;
  gainNode: GainNode | null;
}

export interface AudioOption {
  value: string;
  label: string;
}

export type ToneFrequency = 220 | 440 | 880 | 1000;

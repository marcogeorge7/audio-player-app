import { AudioFile, AudioOption } from '@/types/audio';

export function getAudioOptions(audioFiles: AudioFile[]): AudioOption[] {
  const baseOptions: AudioOption[] = [
    { value: 'none', label: '🔇 No Audio' },
    { value: 'tone:220', label: '🎵 Low Tone (220Hz)' },
    { value: 'tone:440', label: '🎵 Mid Tone (440Hz)' },
    { value: 'tone:880', label: '🎵 High Tone (880Hz)' },
    { value: 'tone:1000', label: '🎵 Very High Tone (1000Hz)' }
  ];
  
  // Add available audio files
  const fileOptions: AudioOption[] = audioFiles.map(file => ({
    value: file.filename,
    label: file.label
  }));
  
  return [...baseOptions, ...fileOptions];
}

export function getCurrentToneFrequency(audioContent: string): number {
  if (audioContent.startsWith('tone:')) {
    return parseInt(audioContent.split(':')[1]) || 440;
  }
  return 440;
}

export function formatLabel(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
}

export function getDefaultAudioContent(index: number): string {
  switch (index) {
    case 0: return 'tone:220';
    case 1: return 'tone:440';
    case 2: return 'tone:880';
    default: return 'none';
  }
}

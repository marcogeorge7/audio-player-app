import { useState, useEffect } from 'react';

export interface AudioFile {
  filename: string;
  label: string;
  path: string;
}

export interface UseAudioFilesReturn {
  audioFiles: AudioFile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAudioFiles(): UseAudioFilesReturn {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/audio-files');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audio files');
      }
      
      setAudioFiles(data.files || []);
      console.log('📁 Loaded audio files dynamically:', data.files);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error loading audio files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  return {
    audioFiles,
    loading,
    error,
    refetch: fetchAudioFiles
  };
}

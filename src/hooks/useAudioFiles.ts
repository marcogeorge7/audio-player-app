import { useState, useEffect } from 'react';
import { getApiBase } from '@/utils/api';

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
      
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        setError('Not in browser environment');
        return;
      }
      
      const base = getApiBase();
      const url = `${base}/data/audio-files.json`;
      console.log('📁 useAudioFiles - fetching:', url);
      
      const response = await fetch(url);
      console.log('📁 useAudioFiles - response status:', response.status);
      
      const data = await response.json();
      console.log('📁 useAudioFiles - data:', data);
      
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

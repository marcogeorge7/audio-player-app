import { useState, useEffect, useCallback } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export interface UseAudioDevicesReturn {
  audioDevices: AudioDevice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAudioDevices() {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAudioDevices = useCallback(async () => {
    if (!isMounted) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in the browser environment
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setError('Media devices API not available');
        return;
      }
      
      // Request microphone permission to get device labels
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices
        .filter(device => 
          device.kind === 'audiooutput' && 
          device.deviceId !== 'default' && 
          device.deviceId !== 'communications' &&
          device.deviceId.length > 10 // Filter out system pseudo-devices
        )
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Audio Device ${device.deviceId.substring(0, 8)}`,
          kind: device.kind
        }));
      
      console.log('🔊 Non-default audio devices found:', audioOutputs);
      setAudioDevices(audioOutputs);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('❌ Error accessing media devices:', err);
    } finally {
      setLoading(false);
    }
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchAudioDevices();
    }
  }, [isMounted, fetchAudioDevices]);

  return {
    audioDevices,
    loading,
    error,
    refetch: fetchAudioDevices
  };
}

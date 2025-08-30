'use client';

import {useState, useRef, useEffect} from 'react';
import {DeviceAudioState} from '@/types/audio';
import {useAudioFiles} from '@/hooks/useAudioFiles';
import {useAudioDevices} from '@/hooks/useAudioDevices';
import {getAudioOptions, getDefaultAudioContent, getCurrentToneFrequency} from '@/utils/audioUtils';

export default function MultiDevicePlayer() {
    const [deviceStates, setDeviceStates] = useState<Map<string, DeviceAudioState>>(new Map());
    const audioContextRef = useRef<AudioContext | null>(null);

    // Use custom hooks for data fetching
    const {audioFiles, loading: filesLoading, error: filesError} = useAudioFiles();
    const {audioDevices, loading: devicesLoading, error: devicesError} = useAudioDevices();

    const isLoading = filesLoading || devicesLoading;
    const hasError = filesError || devicesError;

    // Initialize audio context
    useEffect(() => {
        const initAudio = async () => {
            if (typeof window !== 'undefined') {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                audioContextRef.current = new AudioContextClass();

                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
            }
        };

        initAudio();

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Initialize device states when devices are loaded
    useEffect(() => {
        if (audioDevices.length > 0 && deviceStates.size === 0) {
            const initialStates = new Map<string, DeviceAudioState>();
            audioDevices.forEach((device, index) => {
                const defaultContent = getDefaultAudioContent(index);

                initialStates.set(device.deviceId, {
                    isPlaying: false,
                    volume: 0.5,
                    audioContent: defaultContent,
                    audioElement: null,
                    oscillatorNode: null,
                    gainNode: null
                });
            });
            setDeviceStates(initialStates);
        }
    }, [audioDevices, deviceStates.size]);

    // Create audio chain for specific device
    const createAudioChain = async (deviceId: string): Promise<{
        gainNode: GainNode;
        destination: MediaStreamAudioDestinationNode;
        audioElement: HTMLAudioElement;
    } | null> => {
        if (!audioContextRef.current) return null;

        // Create audio processing chain
        const gainNode = audioContextRef.current.createGain();
        const streamDestination = audioContextRef.current.createMediaStreamDestination();

        // Connect gain to stream destination
        gainNode.connect(streamDestination);

        // Create audio element for this device
        const audioElement = new Audio();
        audioElement.srcObject = streamDestination.stream;
        audioElement.volume = 1.0; // Control volume through gainNode instead

        // Attempt to route to specific device
        if ('setSinkId' in audioElement) {
            try {
                await (audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
                console.log(`🎯 Attempting to route to device: ${deviceId}`);
            } catch (error) {
                console.warn(`⚠️ setSinkId failed for ${deviceId}:`, error);
            }
        } else {
            console.warn('⚠️ setSinkId not supported in this browser');
        }

        // Start the audio element
        try {
            await audioElement.play();
            console.log(`🎵 Audio element started for device: ${deviceId}`);
        } catch (error) {
            console.warn(`⚠️ Could not start audio element:`, error);
        }

        return {gainNode, destination: streamDestination, audioElement};
    };

    // Start audio on specific device
    const startAudio = async (deviceId: string) => {
        const state = deviceStates.get(deviceId);
        if (!state || !audioContextRef.current || state.audioContent === 'none') return;

        console.log(`🚀 Starting audio on device: ${deviceId} with content: ${state.audioContent}`);

        // Stop any existing audio
        stopAudio(deviceId);

        // Create audio chain
        const chain = await createAudioChain(deviceId);
        if (!chain) return;

        const {gainNode, audioElement} = chain;
        gainNode.gain.setValueAtTime(state.volume, audioContextRef.current.currentTime);

        if (state.audioContent.startsWith('tone:')) {
            // Generate tone
            const frequency = parseInt(state.audioContent.split(':')[1]);
            const oscillator = audioContextRef.current.createOscillator();
            oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
            oscillator.type = 'sine';
            oscillator.connect(gainNode);
            oscillator.start();

            // Update state
            setDeviceStates(prev => {
                const newStates = new Map(prev);
                const deviceState = newStates.get(deviceId);
                if (deviceState) {
                    deviceState.isPlaying = true;
                    deviceState.oscillatorNode = oscillator;
                    deviceState.gainNode = gainNode;
                    deviceState.audioElement = audioElement;
                    newStates.set(deviceId, {...deviceState});
                }
                return newStates;
            });

            console.log(`✅ Started tone (${frequency}Hz) on device: ${deviceId}`);

        } else {
            // Play audio file
            try {
                const response = await fetch(`/audio/${state.audioContent}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                const sourceNode = audioContextRef.current.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.loop = true;
                sourceNode.connect(gainNode);
                sourceNode.start();

                // Update state
                setDeviceStates(prev => {
                    const newStates = new Map(prev);
                    const deviceState = newStates.get(deviceId);
                    if (deviceState) {
                        deviceState.isPlaying = true;
                        deviceState.oscillatorNode = sourceNode as unknown as OscillatorNode;
                        deviceState.gainNode = gainNode;
                        deviceState.audioElement = audioElement;
                        newStates.set(deviceId, {...deviceState});
                    }
                    return newStates;
                });

                console.log(`✅ Started audio file (${state.audioContent}) on device: ${deviceId}`);

            } catch (error) {
                console.error(`❌ Error playing audio file on ${deviceId}:`, error);
            }
        }
    };

    // Stop audio on specific device
    const stopAudio = (deviceId: string) => {
        const state = deviceStates.get(deviceId);
        if (!state) return;

        // Stop oscillator or source node
        if (state.oscillatorNode) {
            try {
                state.oscillatorNode.stop();
            } catch {
            }
        }

        // Stop audio element
        if (state.audioElement) {
            state.audioElement.pause();
            state.audioElement.srcObject = null;
        }

        // Update state
        setDeviceStates(prev => {
            const newStates = new Map(prev);
            const deviceState = newStates.get(deviceId);
            if (deviceState) {
                deviceState.isPlaying = false;
                deviceState.oscillatorNode = null;
                deviceState.gainNode = null;
                deviceState.audioElement = null;
                newStates.set(deviceId, {...deviceState});
            }
            return newStates;
        });

        console.log(`⏹️ Stopped audio on device: ${deviceId}`);
    };

    // Update device setting
    const updateDeviceSetting = <K extends keyof DeviceAudioState>(
        deviceId: string,
        key: K,
        value: DeviceAudioState[K]
    ) => {
        setDeviceStates(prev => {
            const newStates = new Map(prev);
            const deviceState = newStates.get(deviceId);
            if (deviceState) {
                deviceState[key] = value;

                // Update volume in real-time
                if (key === 'volume' && typeof value === 'number' && deviceState.gainNode && audioContextRef.current) {
                    deviceState.gainNode.gain.setValueAtTime(value, audioContextRef.current.currentTime);
                }

                newStates.set(deviceId, {...deviceState});
            }
            return newStates;
        });
    };

    // Update tone frequency
    const updateToneFrequency = (deviceId: string, frequency: number) => {
        const state = deviceStates.get(deviceId);
        if (state?.oscillatorNode && audioContextRef.current) {
            try {
                (state.oscillatorNode as OscillatorNode).frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
            } catch {
            }
        }
        updateDeviceSetting(deviceId, 'audioContent', `tone:${frequency}`);
    };

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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Additional Audio Devices Found</h3>
                <p className="text-gray-600 mb-4">
                    Only the default system audio device is available. To use this player, you need to connect additional audio devices such as:
                </p>
                <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
                    <li>• USB headphones or speakers</li>
                    <li>• Bluetooth audio devices</li>
                    <li>• External audio interfaces</li>
                    <li>• Multiple USB audio dongles</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                    Connect additional devices and refresh the page.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                {/*🎵 Multi-Device Audio Player*/}
            </h2>

            {/* Reality Check */}
            {/*<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">*/}
            {/*  <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Limitation Notice:</h3>*/}
            {/*  <p className="text-sm text-red-700">*/}
            {/*    <strong>On macOS, all audio will likely play through your system default device</strong> regardless of the device selected below. */}
            {/*    This demonstrates the fundamental limitation of web browsers on macOS. The audio routing will appear to work in the interface, */}
            {/*    but macOS Core Audio will route all browser audio to the default output.*/}
            {/*  </p>*/}
            {/*</div>*/}

            {/* Device Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioDevices.map((device) => {
                    const state = deviceStates.get(device.deviceId);
                    if (!state) return null;

                    return (
                        <div
                            key={device.deviceId}
                            className="border border-gray-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
                        >
                            {/* Device Header */}
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate" title={device.label}>
                                    {device.label}
                                </h3>
                                <div className="text-xs text-gray-500 truncate" title={device.deviceId}>
                                    ID: {device.deviceId}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                      state.isPlaying
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {state.isPlaying ? '🎵 Playing' : '⏸️ Stopped'}
                  </span>
                                </div>
                            </div>

                            {/* Audio Content Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Audio Content:
                                </label>
                                <select
                                    value={state.audioContent}
                                    onChange={(e) => updateDeviceSetting(device.deviceId, 'audioContent', e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                >
                                    {getAudioOptions(audioFiles).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tone Frequency (if tone selected) */}
                            {state.audioContent.startsWith('tone:') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency: {getCurrentToneFrequency(state.audioContent)} Hz
                                    </label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="2000"
                                        value={getCurrentToneFrequency(state.audioContent)}
                                        onChange={(e) => updateToneFrequency(device.deviceId, parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Volume Control */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Volume: {Math.round(state.volume * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={state.volume}
                                    onChange={(e) => updateDeviceSetting(device.deviceId, 'volume', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Control Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => startAudio(device.deviceId)}
                                    disabled={state.isPlaying || state.audioContent === 'none'}
                                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors"
                                >
                                    ▶️ Play
                                </button>
                                <button
                                    onClick={() => stopAudio(device.deviceId)}
                                    disabled={!state.isPlaying}
                                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors"
                                >
                                    ⏹️ Stop
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Master Controls */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-4">🎛️ Master Controls</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => audioDevices.forEach(device => startAudio(device.deviceId))}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm"
                    >
                        ▶️ Play All
                    </button>
                    <button
                        onClick={() => audioDevices.forEach(device => stopAudio(device.deviceId))}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
                    >
                        ⏹️ Stop All
                    </button>
                </div>
            </div>

            {/* Instructions */}
            {/*<div className="mt-6 p-4 bg-blue-50 rounded-lg">*/}
            {/*  <h3 className="font-semibold text-blue-800 mb-2">📋 How to Use:</h3>*/}
            {/*  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">*/}
            {/*    <li>Each card represents a non-default audio device connected to your system</li>*/}
            {/*    <li>Select different audio content for each device (tones or audio files)</li>*/}
            {/*    <li>Adjust volume and frequency independently for each device</li>*/}
            {/*    <li>Click &ldquo;Play&rdquo; to start audio on that specific device</li>*/}
            {/*    <li><strong>Note:</strong> On macOS, audio may still route to your default device despite device selection</li>*/}
            {/*  </ol>*/}
            {/*</div>*/}
        </div>
    );
}

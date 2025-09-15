# Multi-Playlist Audio Player Guide

## How to Play 2 Playlists on 2 Different Outputs Simultaneously

The **Multi-Playlist Audio Player** allows you to play different playlists on separate audio outputs at the same time. Here's how to use it:

### 🎯 Quick Start

1. **Create Playlists**
   - Click "➕ Create New Playlist"
   - Add a name and description
   - Add audio files or tone generators to your playlist
   - Drag and drop to reorder tracks
   - Save the playlist

2. **Select Output Devices**
   - After creating playlists, you'll see them in the main view
   - Under each playlist, you'll see a list of available audio devices
   - Click on any device button (▶️ Device Name) to assign that playlist to that output

3. **Multi-Device Playback**
   - Each audio device can only play one playlist at a time
   - Devices already in use will show 🔒 and be disabled
   - You can have multiple playlists playing simultaneously on different devices

### 🎵 Features

#### Playlist Management
- **Create/Edit/Delete** playlists with custom names and descriptions
- **Add Multiple Track Types**: Audio files and tone generators (220Hz, 440Hz, 880Hz, 1000Hz)
- **Drag & Drop Reordering**: Rearrange tracks in your playlists
- **Persistent Storage**: Playlists are saved in your browser's local storage

#### Independent Players
- **Separate Controls**: Each active playlist has its own player with independent controls
- **Device Assignment**: Each playlist is locked to a specific audio output device
- **Real-time Management**: Add or remove players without stopping others
- **Track Navigation**: Previous/Next, Play/Pause/Stop controls for each player

#### Audio Device Management
- **Device Detection**: Automatically detects all available audio output devices
- **Exclusive Usage**: Prevents conflicts by allowing only one playlist per device
- **Device Routing**: Uses Web Audio API with setSinkId for device-specific output

### 📋 Step-by-Step Example

**To play 2 different playlists on 2 separate outputs:**

1. **Create First Playlist**:
   ```
   Name: "Ambient Music"
   Tracks: Add some calm audio files or low-frequency tones
   ```

2. **Create Second Playlist**:
   ```
   Name: "Focus Sounds"
   Tracks: Add white noise files or higher-frequency tones
   ```

3. **Assign to Different Devices**:
   - Find "Ambient Music" playlist → Click "▶️ USB Headphones"
   - Find "Focus Sounds" playlist → Click "▶️ Bluetooth Speaker"

4. **Control Each Player**:
   - Switch to "🎵 View Active Players" 
   - Each playlist now has independent playback controls
   - Adjust volume, skip tracks, pause/resume individually

### ⚙️ Advanced Features

#### Playlist Controls
- **Shuffle Mode**: Randomize track order within each playlist
- **Repeat Modes**: 
  - Off: Play once and stop
  - One: Repeat current track
  - All: Loop entire playlist

#### Player Management
- **Add More**: Add additional playlists while others are playing
- **Stop All**: Stop all active players at once
- **Remove Individual**: Remove specific players using the ✕ button

#### File Management
- **Upload Audio Files**: Drag and drop or browse to add new audio files
- **Real-time Updates**: Newly uploaded files are immediately available in playlists

### 🔧 Technical Details

#### Supported Audio Formats
- MP3, WAV, OGG, AAC (browser-dependent)
- Generated tones: 220Hz, 440Hz, 880Hz, 1000Hz sine waves

#### Browser Requirements
- Modern browsers with Web Audio API support
- MediaDevices API for device enumeration
- setSinkId support (Chrome, Edge - limited on Safari/Firefox)

#### Limitations
- **macOS Safari**: Device routing may not work due to browser limitations
- **Maximum Concurrent Players**: Limited by system resources and audio drivers
- **Local Storage**: Playlists are stored per-browser, not synced across devices

### 🎯 Use Cases

1. **DJ/Event**: Play background music through main speakers while monitoring cues through headphones
2. **Focus Work**: Ambient sounds through speakers, focus music through headphones
3. **Testing**: Compare audio quality between different output devices
4. **Accessibility**: Different audio content for different users or environments
5. **Multi-room**: Different playlists for different rooms (if you have multiple USB audio devices)

### 🚨 Important Notes

- Each audio device can only be used by one playlist at a time
- On macOS, all audio may route to the default device regardless of selection
- The app uses browser APIs that require user interaction to start audio playback
- Playlists persist in browser storage and will be available on next visit

Enjoy your multi-playlist audio experience! 🎵

# Multi-Device Audio Player

## 🎵 **Advanced Web Audio Player with Dynamic File Loading**

A sophisticated web-based audio player that attempts to route different audio content to multiple connected audio devices. Built with Next.js, TypeScript, and the Web Audio API.

## ✅ **What Works in This Player**

1. **Dynamic File Loading**: Automatically detects audio files from the public folder
2. **Multi-Device Interface**: Shows all non-default audio devices
3. **Independent Controls**: Volume, content, and frequency per device
4. **Generated Tones**: Real-time sine wave generation with adjustable frequency
5. **Audio File Playback**: Support for multiple audio formats
6. **Real-time Updates**: Live frequency and volume adjustments

## ⚠️ **Platform Limitations**

While this player demonstrates advanced web audio techniques, there are inherent browser limitations:

- **macOS**: Browser sandboxing prevents true device-specific routing
- **setSinkId()**: May report success but audio routes to default device
- **Web Audio API**: All output ultimately goes through system default audio

### **For True Multi-Device Control:**
- Native desktop applications (Electron, Tauri, Swift)
- System-level audio routing software (BlackHole, Audio Hijack)
- Hardware solutions (USB audio interfaces, mixers)

## 🔧 **Getting Started**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the multi-device audio player.

## ✨ **Current Features**

### **Clean Multi-Device Audio Player**
- **Dynamic Audio File Loading**: Automatically detects audio files from `public/audio/` folder
- **Non-Default Device Filtering**: Shows only additional audio devices (excludes system default)
- **Individual Device Controls**: Independent audio content, volume, and frequency per device
- **Real-time Audio Options**: 
  - Generated tones (100Hz - 2000Hz range)
  - Audio files from your collection
  - Live frequency adjustment
- **Master Controls**: Play/stop all devices simultaneously

### **Available Audio Files**
- `sample.wav` - Main audio sample
- `sample.mp3` - MP3 version 
- `tone-220.wav` - Low tone file
- `tone-880.wav` - High tone file
- `tone-1000.wav` - Very high tone file

### **How to Add More Audio Files**
1. Add audio files (`.wav`, `.mp3`, `.ogg`, `.m4a`) to `public/audio/` folder
2. Refresh the page - new files will automatically appear in the dropdown
3. Files are automatically labeled with clean names

## 🎵 **Key Takeaway**

**The player works perfectly and demonstrates advanced Web Audio API usage.** However, on macOS, browser limitations mean audio routing to specific devices may not work as expected. This is a platform limitation, not a code issue.

For true multi-device audio routing, you need native applications or system-level audio routing tools.

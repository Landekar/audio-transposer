# Audio Transposer

A web-based application that allows users to manipulate audio files by changing pitch and adjusting playback speed independently. Built using vanilla JavaScript and the Web Audio API, the Audio Transposer offers real-time audio processing directly in the browser without requiring any server-side processing.

## Features

- **Audio File Processing**: Load audio files via drag-and-drop or file selection
- **Dual-Mode Operation**:
  - **Pitch-Only Mode**: Transpose pitch up or down while maintaining original speed
  - **Time Stretch Mode**: Adjust playback speed without affecting pitch
- **Real-time Controls**:
  - Pitch transposition (±12 semitones)
  - Time stretching (50% to 150% of original speed)
  - Volume adjustment
- **Visualizations**:
  - Waveform display with synchronized playhead
  - Precise timeline with accurate time display
- **User Interface**:
  - Intuitive controls with clear visual feedback
  - Ability to switch audio files without page reload
  - Responsive design for different screen sizes

## How It Works

### Audio Processing

The application uses the Web Audio API's built-in capabilities for both pitch shifting and time stretching:

1. **Pitch-Only Mode**:
   - Utilizes the `detune` property of the AudioBufferSourceNode to shift pitch
   - Maintains original playback speed regardless of pitch changes
   - Range of ±1200 cents (±12 semitones, or one octave in either direction)

2. **Time Stretch Mode**:
   - Uses the `playbackRate` property to speed up or slow down audio
   - Disables pitch transposition when in this mode
   - Speed adjustment from 50% (half speed) to 150% (1.5x speed)

### User Interface

The UI is designed to provide clear feedback about the current state of the audio:

- **Waveform Visualization**: Shows the audio data's amplitude over time
- **Playhead Marker**: Provides visual reference of current playback position
- **Timeline Slider**: Allows precise seeking through the audio
- **Mode Toggle**: Switches between pitch-only and time-stretch modes
- **File Management**: Upload new files or replace current audio without reloading

## Current Limitations

- YouTube URL integration is currently not implemented
- Advanced audio effects (reverb, delay, etc.) are not yet available
- No persistent storage for saving modified audio

## Roadmap

### Phase 1: Core Functionality (Current)

- [x] Web Audio API core implementation
- [x] Local file loading and processing
- [x] Basic pitch shifting implementation
- [x] Time stretching functionality
- [x] Waveform visualization
- [x] Timeline/playhead implementation
- [ ] YouTube URL audio extraction
- [ ] Support for additional streaming platforms
- [ ] Keyboard shortcuts for common actions
- [ ] Loop functionality

### Phase 2: Enhanced Features

- [ ] Frequency analysis for note detection
- [ ] Key signature detection
- [ ] Tempo detection
- [ ] Enhanced waveform visualization (color mapping to frequency)
- [ ] Spectrogram view option
- [ ] Audio export in multiple formats
- [ ] Preset saving functionality

### Phase 3: Educational Components

- [ ] Interactive tutorial for first-time users
- [ ] Documentation on audio-visual relationships
- [ ] Tooltips for music theory concepts
- [ ] Example library demonstrating principles

### Phase 4: Advanced Features

- [ ] Multi-track support
- [ ] AI-based arrangement suggestions
- [ ] Style recognition
- [ ] Automatic transcription
- [ ] Visual design generation based on audio characteristics

## Browser Compatibility

- Tested on Chrome, Firefox, and Edge
- Requires a browser with Web Audio API support
- Best experienced on desktop with good audio hardware

## Development

This project is built using:
- Vanilla JavaScript (ES6+)
- HTML5 and CSS3
- Web Audio API
- No external dependencies except for visualization

## License

MIT License - Feel free to use, modify, and distribute as needed.

---

Created for audio exploration and learning purposes.
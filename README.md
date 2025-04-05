# Audio Transposer

A web application that allows you to transpose audio files, change their speed, and apply time stretching in real-time.

## Features

- **Audio File Support**: Upload and process MP3, WAV, OGG, and FLAC audio files
- **Pitch Transposition**: Adjust the pitch of audio files up to 12 semitones up or down
- **Speed Adjustment**: Change playback speed from 50% to 200%
- **Time Stretching**: Change pitch without affecting speed (experimental)
- **Waveform Visualization**: See a visual representation of your audio
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Open the application in a modern web browser
2. Drag and drop an audio file or click "Select File" to upload
3. Once the file is loaded, use the sliders to adjust:
   - Pitch (in semitones)
   - Speed (percentage)
   - Volume
4. Toggle "Time Stretch Mode" to change pitch without affecting speed
5. Use the playback controls to play/pause audio
6. The progress bar allows you to seek through the audio

## Technical Implementation

The Audio Transposer leverages several modern web technologies:

- **Web Audio API**: For audio processing and playback
- **Canvas API**: For waveform visualization
- **ES6 Modules**: For clean code organization
- **Drag and Drop API**: For easy file uploading

### Project Structure

- `index.html` - Main HTML structure
- `style.css` - Application styling
- `js/main.js` - Core application logic
- `js/audio-handler.js` - Audio processing functionality using Web Audio API
- `js/ui-handler.js` - User interface management

## Limitations

- Time stretching is currently implemented in a simplified way and may cause audio artifacts
- Very large audio files may cause performance issues on mobile devices
- The application requires a modern browser with Web Audio API support

## Future Enhancements

- Improved time-stretching algorithm
- Audio effects like reverb and echo
- Ability to save and download the processed audio
- Keyboard shortcuts for common actions
- More advanced waveform visualization

## Browser Compatibility

The Audio Transposer works in recent versions of:
- Chrome
- Firefox
- Edge
- Safari (14+)

## Local Development

To run the project locally:

1. Clone this repository
2. Open `index.html` in your browser
3. No build step or server is required

## License

MIT
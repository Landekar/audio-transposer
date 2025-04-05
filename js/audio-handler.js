let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let gainNode = null;
let analyserNode = null;
let isPlaying = false;
let startTime = 0;
let pausedTime = 0;
let currentVolume = 1.0; // Range 0.0 to 1.0
let currentDetuneValue = 0; // In cents
let currentPlaybackRate = 1.0; // Default playback rate (percentage / 100)
let isTimeStretchMode = false; // Track whether we're in time stretch mode

/**
 * Initializes the Web Audio API AudioContext and essential nodes.
 * Must be called after a user gesture (like a click).
 */
export function initAudioContext() {
    if (audioContext) return; // Already initialized
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
        gainNode.gain.value = currentVolume; // Set initial volume
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048; // Default FFT size for visualization
        gainNode.connect(audioContext.destination); // Connect gain to output
        console.log('AudioContext initialized.');
    } catch (e) {
        console.error('Web Audio API is not supported in this browser', e);
        alert('Web Audio API is not supported in this browser');
    }
}
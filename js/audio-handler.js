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
let onAudioEnded = null; // Callback for when audio playback ends

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

/**
 * Loads and decodes an audio file.
 * @param {File} file - The audio file to load
 * @param {Function} onEndedCallback - Callback function when audio playback ends
 * @returns {Promise} A promise that resolves when the audio is loaded
 */
export function loadAudioFile(file, onEndedCallback) {
    if (!audioContext) {
        initAudioContext();
    }
    
    // Store the callback
    onAudioEnded = onEndedCallback;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                console.log('Audio decoded successfully, duration:', audioBuffer.duration);
                
                // Reset playback state
                isPlaying = false;
                pausedTime = 0;
                
                resolve(audioBuffer);
            } catch (err) {
                console.error('Error decoding audio data', err);
                reject(err);
            }
        };
        
        reader.onerror = (err) => {
            console.error('Error reading file', err);
            reject(err);
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Creates a new audio source node and connects it to the audio graph.
 * @returns {AudioBufferSourceNode} The new source node
 */
function createSourceNode() {
    if (!audioContext || !audioBuffer) {
        console.error('AudioContext or AudioBuffer not initialized');
        return null;
    }
    
    // Create a new source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Apply transposition and time stretching settings
    source.detune.value = currentDetuneValue;
    
    if (isTimeStretchMode) {
        // In time stretch mode, only pitch changes, not speed
        source.playbackRate.value = 1.0;
        // TODO: Implement proper time stretching algorithm
        // This is a placeholder - real time stretching would need a more sophisticated approach
    } else {
        // Normal mode: pitch and speed are linked
        source.playbackRate.value = currentPlaybackRate;
    }
    
    // Connect source to the audio graph: source -> analyser -> gain -> destination
    source.connect(analyserNode);
    analyserNode.connect(gainNode);
    
    // Set up ended event handler
    source.onended = handlePlaybackEnded;
    
    return source;
}

/**
 * Handles the audio playback ended event.
 */
function handlePlaybackEnded() {
    console.log('Playback ended');
    isPlaying = false;
    pausedTime = 0;
    
    // Call the callback if it exists
    if (typeof onAudioEnded === 'function') {
        onAudioEnded();
    }
}

/**
 * Toggles playback state between play and pause.
 * @returns {boolean} The new playing state
 */
export function togglePlayPause() {
    if (!audioContext || !audioBuffer) {
        console.error('No audio loaded');
        return false;
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (isPlaying) {
        // Pause playback
        sourceNode.stop();
        pausedTime = pausedTime + (audioContext.currentTime - startTime);
        isPlaying = false;
    } else {
        // Start playback
        sourceNode = createSourceNode();
        if (!sourceNode) return false;
        
        startTime = audioContext.currentTime;
        sourceNode.start(0, pausedTime); // Start from pausedTime
        isPlaying = true;
    }
    
    return isPlaying;
}

/**
 * Sets the volume level.
 * @param {number} linearVolume - Volume level from 0.0 to 1.0
 */
export function setVolume(linearVolume) {
    if (!gainNode) return;
    
    // Clamp volume between 0 and 1
    currentVolume = Math.max(0, Math.min(1, linearVolume));
    
    // Apply the volume setting
    gainNode.gain.value = currentVolume;
    console.log('Volume set to:', currentVolume);
}

/**
 * Adjusts the transposition level.
 * @param {number} semitones - Number of semitones to transpose (-12 to 12)
 */
export function setTranspose(semitones) {
    // Convert semitones to cents (100 cents = 1 semitone)
    const cents = semitones * 100;
    currentDetuneValue = cents;
    
    // Apply to current source if playing
    if (sourceNode && isPlaying) {
        sourceNode.detune.value = currentDetuneValue;
    }
    
    console.log('Transpose set to:', semitones, 'semitones (', cents, 'cents)');
}

/**
 * Sets the playback rate.
 * @param {number} rate - Playback rate as a percentage (50 to 200)
 */
export function setPlaybackRate(rate) {
    // Convert percentage to decimal (50% = 0.5, 100% = 1.0, 200% = 2.0)
    const rateValue = rate / 100;
    
    // Clamp between 0.5 and 2.0
    currentPlaybackRate = Math.max(0.5, Math.min(2.0, rateValue));
    
    // Apply to current source if playing and not in time stretch mode
    if (sourceNode && isPlaying && !isTimeStretchMode) {
        sourceNode.playbackRate.value = currentPlaybackRate;
    }
    
    console.log('Playback rate set to:', currentPlaybackRate);
}

/**
 * Enables or disables time stretching mode.
 * @param {boolean} enabled - Whether time stretching is enabled
 */
export function setTimeStretchMode(enabled) {
    isTimeStretchMode = enabled;
    
    if (isPlaying) {
        // Need to restart playback with new settings
        const currentTime = getCurrentTime();
        sourceNode.stop();
        sourceNode = createSourceNode();
        sourceNode.start(0, currentTime); // Resume from current position
    }
    
    console.log('Time stretch mode:', isTimeStretchMode ? 'enabled' : 'disabled');
}

/**
 * Gets the current playback time.
 * @returns {number} Current playback time in seconds
 */
export function getCurrentTime() {
    if (!isPlaying) {
        return pausedTime;
    }
    return pausedTime + (audioContext.currentTime - startTime);
}

/**
 * Gets the total duration of the loaded audio.
 * @returns {number} Duration in seconds or 0 if no audio is loaded
 */
export function getDuration() {
    return audioBuffer ? audioBuffer.duration : 0;
}

/**
 * Seeks to a specific time in the audio.
 * @param {number} time - Time to seek to, in seconds
 */
export function seekToTime(time) {
    if (!audioBuffer) return;
    
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(audioBuffer.duration, time));
    
    // If playing, stop current playback and restart at new position
    if (isPlaying) {
        sourceNode.stop();
        pausedTime = clampedTime;
        sourceNode = createSourceNode();
        startTime = audioContext.currentTime;
        sourceNode.start(0, pausedTime);
    } else {
        // Just update the paused time
        pausedTime = clampedTime;
    }
    
    console.log('Seeked to:', clampedTime, 'seconds');
}

/**
 * Gets frequency data for visualization.
 * @returns {Uint8Array} Array containing frequency data
 */
export function getFrequencyData() {
    if (!analyserNode) return null;
    
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);
    
    return dataArray;
}

/**
 * Gets time domain data for waveform visualization.
 * @returns {Uint8Array} Array containing time domain data
 */
export function getTimeData() {
    if (!analyserNode) return null;
    
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);
    
    return dataArray;
}

/**
 * Checks if audio is currently playing.
 * @returns {boolean} True if audio is playing
 */
export function getIsPlaying() {
    return isPlaying;
}

/**
 * Cleans up audio resources.
 */
export function cleanup() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
    }
    
    if (analyserNode) {
        analyserNode.disconnect();
    }
    
    if (gainNode) {
        gainNode.disconnect();
    }
    
    audioBuffer = null;
    isPlaying = false;
    pausedTime = 0;
    
    console.log('Audio resources cleaned up');
}
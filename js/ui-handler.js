// --- DOM Element References ---
const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('file-input');
const selectFileBtn = document.getElementById('select-file-btn');
const youtubeContainer = document.getElementById('youtube-container');
const youtubeUrl = document.getElementById('youtube-url');
const loadYoutubeBtn = document.getElementById('load-youtube-btn');
const audioContainer = document.getElementById('audio-container');
const fileNameDisplay = document.getElementById('file-name');
const waveformContainer = document.getElementById('waveform');
const transposeValueDisplay = document.getElementById('transpose-value');
const transposeUpBtn = document.getElementById('transpose-up');
const transposeDownBtn = document.getElementById('transpose-down');
const volumeSlider = document.getElementById('volume-slider');
const volumeValueDisplay = document.getElementById('volume-value');
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const changeFileBtn = document.getElementById('change-file-btn');
const timelineSlider = document.getElementById('timeline-slider');
const timeCurrentDisplay = document.getElementById('time-current');
const timeDurationDisplay = document.getElementById('time-duration');
const pitchOnlyModeBtn = document.getElementById('pitch-only-mode');
const timeStretchModeBtn = document.getElementById('time-stretch-mode');
const timeStretchSlider = document.getElementById('time-stretch-slider');
const timeStretchValue = document.getElementById('time-stretch-value');
const timeStretchContainer = document.getElementById('time-stretch-container');

/**
 * Updates the status message displayed to the user.
 * @param {string} message - The message to display.
 */
export function updateStatus(message) {
    statusMessage.textContent = message;
}

/**
 * Shows the audio controls and hides the upload section.
 */
export function showAudioControls() {
    // Remove change-mode class if present
    uploadContainer.classList.remove('change-mode');
    youtubeContainer.classList.remove('change-mode');
    
    // Hide upload containers
    uploadContainer.classList.add('hidden');
    youtubeContainer.classList.add('hidden');
    
    // Show audio container
    audioContainer.classList.remove('hidden');
}

/**
 * Shows the upload section and hides the audio controls.
 */
export function showUploadSection() {
    audioContainer.classList.add('hidden');
    uploadContainer.classList.remove('hidden');
    youtubeContainer.classList.remove('hidden');
    // Optionally clear filename, waveform etc.
    updateFileName('');
    clearWaveformDisplay();
    updatePlayPauseButton(false);
    setControlsDisabled(true); // Disable controls initially
}

/**
 * Shows the upload section temporarily for choosing a new file
 * while keeping the audio controls visible.
 */
export function showFileChangeInterface() {
    // Instead of hiding audio controls, we'll overlay the upload interface
    uploadContainer.classList.remove('hidden');
    youtubeContainer.classList.remove('hidden');
    
    // Add a special class to indicate we're in "change file" mode
    uploadContainer.classList.add('change-mode');
    youtubeContainer.classList.add('change-mode');
    
    // Scroll to the upload container to make it visible
    uploadContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Updates the displayed file name.
 * @param {string} name - The name of the file.
 */
export function updateFileName(name) {
    fileNameDisplay.textContent = name || 'No file loaded';
}

/**
 * Updates the transpose value display.
 * @param {number} value - The current transposition value in semitones.
 */
export function updateTransposeValueDisplay(value) {
    transposeValueDisplay.textContent = value;
}

/**
 * Updates the time stretch value display.
 * @param {number} value - The time stretch percentage.
 */
export function updateTimeStretchDisplay(value) {
    timeStretchValue.textContent = `${value}%`;
}

/**
 * Updates the volume value display next to the slider.
 * @param {number} value - The current volume value (0-100).
 */
export function updateVolumeDisplay(value) {
    volumeValueDisplay.textContent = `${value}%`;
}

/**
 * Updates the text of the play/pause button.
 * @param {boolean} isPlaying - True if audio is currently playing.
 */
export function updatePlayPauseButton(isPlaying) {
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

/**
 * Sets the mode for pitch/time handling.
 * @param {boolean} isTimeStretch - Whether time stretching mode is active.
 */
export function setTimeStretchMode(isTimeStretch) {
    isTimeStretchMode = isTimeStretch;
    
    if (isTimeStretch) {
        pitchOnlyModeBtn.classList.remove('active');
        timeStretchModeBtn.classList.add('active');
        timeStretchContainer.classList.remove('disabled');
    } else {
        pitchOnlyModeBtn.classList.add('active');
        timeStretchModeBtn.classList.remove('active');
        timeStretchContainer.classList.add('disabled');
    }
}

/**
 * Sets the disabled state of the main playback controls.
 * @param {boolean} isDisabled - True to disable, false to enable.
 */
export function setControlsDisabled(isDisabled) {
    playPauseBtn.disabled = isDisabled;
    resetBtn.disabled = isDisabled;
    changeFileBtn.disabled = isDisabled;
    transposeUpBtn.disabled = isDisabled;
    transposeDownBtn.disabled = isDisabled;
    volumeSlider.disabled = isDisabled;
    timelineSlider.disabled = isDisabled;
    timeStretchSlider.disabled = isDisabled;
    pitchOnlyModeBtn.disabled = isDisabled;
    timeStretchModeBtn.disabled = isDisabled;
}

// --- Timeline Update Functions ---

/**
 * Formats time in seconds to MM:SS format.
 * @param {number} seconds - Time in seconds.
 * @returns {string} - Formatted time string.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Updates the timeline slider position and time displays.
 * @param {number} currentTime - Current playback time in seconds.
 * @param {number} duration - Total duration in seconds.
 * @param {boolean} isUserSeeking - True if the user is currently dragging the slider.
 */
export function updateTimelineUI(currentTime, duration, isUserSeeking = false) {
    if (isNaN(duration) || duration <= 0) return;
    
    // Ensure currentTime doesn't exceed duration
    currentTime = Math.min(currentTime, duration);
    
    // Format and display times
    timeCurrentDisplay.textContent = formatTime(currentTime);
    timeDurationDisplay.textContent = formatTime(duration);

    // Calculate progress (0-1)
    const progress = duration > 0 ? currentTime / duration : 0;
    
    // Update playhead position on waveform
    updatePlayhead(progress);

    // Only update slider value if user isn't actively dragging it
    if (!isUserSeeking) {
        // Convert to percentage for the slider (0-100)
        timelineSlider.value = progress * 100;
    }
}

// --- Waveform Visualization ---

let visualizationStopCallback = null;
let playheadMarker = null;
let waveformCanvas = null;

/**
 * Clears the waveform display area.
 */
export function clearWaveformDisplay() {
    if (visualizationStopCallback) {
        visualizationStopCallback();
        visualizationStopCallback = null;
    }
    
    // Remove playhead marker if it exists
    if (playheadMarker) {
        playheadMarker.remove();
        playheadMarker = null;
    }
    
    waveformContainer.innerHTML = ''; 
    waveformCanvas = null;
}

/**
 * Initializes and starts the waveform visualization.
 * @param {AnalyserNode} analyserNode - The Web Audio AnalyserNode.
 */
export function startWaveformVisualization(analyserNode) {
    clearWaveformDisplay(); // Clear previous if any
    if (!analyserNode) return;

    const canvas = document.createElement('canvas');
    waveformContainer.appendChild(canvas);
    waveformCanvas = canvas;
    
    // Create playhead marker
    playheadMarker = document.createElement('div');
    playheadMarker.className = 'playhead-marker';
    playheadMarker.style.left = '0px';
    waveformContainer.appendChild(playheadMarker);
    
    const ctx = canvas.getContext('2d');
    const width = waveformContainer.clientWidth;
    const height = waveformContainer.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId;

    function drawWaveformFrame() {
        animationId = requestAnimationFrame(drawWaveformFrame);

        analyserNode.getByteTimeDomainData(dataArray);

        // Clear canvas (slightly transparent for trail effect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; 
        ctx.fillRect(0, 0, width, height);

        // Draw waveform line
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000'; // Use var(--dark-color) potentially
        ctx.beginPath();

        const sliceWidth = width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0; // value between 0 and 2
            const y = v * height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    drawWaveformFrame();

    visualizationStopCallback = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };
}

/**
 * Updates the playhead position on the waveform.
 * @param {number} progress - Progress value between 0 and 1.
 */
export function updatePlayhead(progress) {
    if (playheadMarker && waveformCanvas) {
        const position = Math.max(0, Math.min(1, progress)) * waveformCanvas.width;
        playheadMarker.style.left = `${position}px`;
    }
}

// --- UI Initialization ---

// Keep track of whether the user is dragging the timeline slider
let isSeeking = false;

// Keep track of current mode
let isTimeStretchMode = false;

/**
 * Initializes the UI event handlers.
 * @param {Object} handlers - Object containing event handler functions.
 */
export function initializeUI(handlers) {
    // File input change event
    fileInput.addEventListener('change', handlers.onFileChange);

    // Select file button click
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // YouTube URL load button
    loadYoutubeBtn.addEventListener('click', () => {
        handlers.onLoadYoutube(youtubeUrl.value);
    });

    // File drag and drop handling
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadContainer.classList.add('drag-over');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('drag-over');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadContainer.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            handlers.onFileDrop(e);
        }
    });

    // Playback controls
    playPauseBtn.addEventListener('click', handlers.onPlayPause);
    resetBtn.addEventListener('click', handlers.onReset);
    changeFileBtn.addEventListener('click', () => {
        showFileChangeInterface();
    });

    // Transpose controls
    transposeUpBtn.addEventListener('click', () => {
        handlers.onTransposeChange(1);
    });

    transposeDownBtn.addEventListener('click', () => {
        handlers.onTransposeChange(-1);
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        updateVolumeDisplay(value);
        handlers.onVolumeChange(value);
    });
    
    // Time stretch mode controls
    pitchOnlyModeBtn.addEventListener('click', () => {
        if (isTimeStretchMode) {
            setTimeStretchMode(false);
            handlers.onTimeStretchModeChange(false);
        }
    });
    
    timeStretchModeBtn.addEventListener('click', () => {
        if (!isTimeStretchMode) {
            setTimeStretchMode(true);
            handlers.onTimeStretchModeChange(true);
        }
    });
    
    // Time stretch value control
    timeStretchSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        updateTimeStretchDisplay(value);
        handlers.onTimeStretchChange(value);
    });
    
    // Timeline control
    timelineSlider.addEventListener('input', (e) => {
        const percentage = parseFloat(e.target.value) / 100;
        isSeeking = true;
        handlers.onSeek(percentage);
    });
    
    timelineSlider.addEventListener('change', (e) => {
        const percentage = parseFloat(e.target.value) / 100;
        isSeeking = false;
        handlers.onSeek(percentage);
    });

    // Initialize time stretch mode to pitch-only by default
    setTimeStretchMode(false);
    updateTimeStretchDisplay(parseInt(timeStretchSlider.value, 10));
    timeStretchContainer.classList.add('disabled');

    // Initially disable controls until audio is loaded
    setControlsDisabled(true);
}

/**
 * Returns whether the user is currently seeking via the timeline slider.
 */
export function getIsSeeking() {
    return isSeeking;
}
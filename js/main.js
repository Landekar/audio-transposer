import {
    initializeUI,
    updateFileName,
    updatePlayPauseButton,
    updateTransposeValueDisplay,
    setControlsDisabled,
    showAudioControls,
    showUploadSection,
    clearWaveformDisplay,
    startWaveformVisualization,
    updateTimelineUI,
    getIsSeeking,
    updateTimeStretchDisplay,
    setTimeStretchMode
} from './ui-handler.js';

import {
    initAudioContext,
    loadAudioFile,
    togglePlayPause,
    stopAudio,
    setTranspose,
    setVolume,
    getPlaybackState,
    getCurrentTranspose,
    getAnalyserNode,
    getDuration,
    getCurrentTime,
    seekToTime,
    setTimeStretchMode as setAudioTimeStretchMode,
    setTimeStretch
} from './audio-handler.js';

let isAudioReady = false;
let currentTransposeValue = 0;
let contextInitialized = false;
let animationFrameId = null;

function handleAudioEnded() {
    updatePlayPauseButton(false);
    console.log("Playback naturally ended.");
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    updateTimelineUI(getDuration(), getDuration());
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    initializeUI({
        onFileChange: handleFileEvent,
        onFileDrop: handleFileDrop,
        onPlayPause: handlePlayPause,
        onReset: handleReset,
        onTransposeChange: handleTransposeChange,
        onVolumeChange: handleVolumeChange,
        onLoadYoutube: handleLoadYoutube,
        onSeek: handleSeek,
        onTimeStretchModeChange: handleTimeStretchModeChange,
        onTimeStretchChange: handleTimeStretchChange
    });
});

function ensureAudioContext() {
    if (!contextInitialized) {
        initAudioContext();
        contextInitialized = true;
    }
}

async function processFile(file) {
    ensureAudioContext();

    if (!file || !file.type.startsWith('audio/')) {
        alert('Please select a valid audio file.');
        return;
    }

    isAudioReady = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Clear change-mode class if present
    document.getElementById('upload-container').classList.remove('change-mode');
    document.getElementById('youtube-container').classList.remove('change-mode');
    
    showUploadSection();
    clearWaveformDisplay();
    updateFileName('Loading & Decoding...');
    updateTimelineUI(0, 0);

    try {
        const success = await loadAudioFile(file, handleAudioEnded);

        if (success) {
            isAudioReady = true;
            currentTransposeValue = 0;
            updateFileName(file.name);
            showAudioControls();
            setControlsDisabled(false);
            updatePlayPauseButton(false);
            updateTransposeValueDisplay(currentTransposeValue);
            setTimeStretchMode(false); // Reset to pitch-only mode
            
            // Initialize volume
            const initialVolume = parseInt(document.getElementById('volume-slider').value, 10);
            handleVolumeChange(initialVolume);
            
            // Initialize time stretch
            const initialTimeStretch = parseInt(document.getElementById('time-stretch-slider').value, 10);
            updateTimeStretchDisplay(initialTimeStretch);
            
            // Start visualization
            const analyser = getAnalyserNode();
            if (analyser) {
                startWaveformVisualization(analyser);
            }
            
            updateTimelineUI(0, getDuration());
        } else {
            alert('Error loading/decoding audio file. Please try a different file.');
            showUploadSection();
        }
    } catch (error) {
        alert('An unexpected error occurred loading the file.');
        console.error("File processing error:", error);
        showUploadSection();
    }
}

function handleFileEvent(event) {
    const file = event.target.files[0];
    processFile(file);
}

function handleFileDrop(event) {
    const file = event.dataTransfer.files[0];
    processFile(file);
}

function handlePlayPause() {
    ensureAudioContext();
    if (!isAudioReady) return;
    togglePlayPause();
    const state = getPlaybackState();
    updatePlayPauseButton(state === 'playing');

    if (state === 'playing') {
        startTimelineUpdate();
    } else {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        updateTimelineUI(getCurrentTime(), getDuration(), getIsSeeking());
    }
}

function handleReset() {
    if (!isAudioReady) return;
    currentTransposeValue = 0;
    setTranspose(currentTransposeValue);
    updateTransposeValueDisplay(currentTransposeValue);
}

function handleTransposeChange(delta) {
    if (!isAudioReady) return;

    let newTranspose = getCurrentTranspose() + delta;
    newTranspose = Math.max(-12, Math.min(12, newTranspose));

    setTranspose(newTranspose);
    const actualTranspose = getCurrentTranspose();
    updateTransposeValueDisplay(actualTranspose);
}

function handleVolumeChange(value) {
    setVolume(value);
}

function handleSeek(percentage) {
    if (!isAudioReady) return;
    const duration = getDuration();
    if (duration > 0) {
        // Convert percentage to time in seconds
        const seekTime = Math.max(0, Math.min(1, percentage)) * duration;
        console.log(`Seeking to: ${seekTime}s (${percentage * 100}%)`);
        seekToTime(seekTime);
        updateTimelineUI(seekTime, duration);
    }
}

function handleLoadYoutube(url) {
    if (!url) {
        alert('Please enter a YouTube URL.');
        return;
    }
    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
         alert('Invalid YouTube URL provided.');
        return;
    }
    alert('YouTube integration is currently not implemented in this version.');
}

function startTimelineUpdate() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    function updateLoop() {
        if (getPlaybackState() === 'playing') {
            const currentTime = getCurrentTime();
            const duration = getDuration();
            
            // Validate times to prevent NaN or out-of-bounds values
            if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
                updateTimelineUI(currentTime, duration, getIsSeeking());
                
                // Check if we've reached the end (or close enough to it)
                if (currentTime >= duration - 0.1) {
                    handleAudioEnded();
                    return;
                }
            }
            
            animationFrameId = requestAnimationFrame(updateLoop);
        } else {
            animationFrameId = null;
        }
    }
    
    animationFrameId = requestAnimationFrame(updateLoop);
}

function handleTimeStretchModeChange(isTimeStretchMode) {
    if (!isAudioReady) return;
    setAudioTimeStretchMode(isTimeStretchMode);
    
    // If switching to time stretch mode, apply current slider value
    if (isTimeStretchMode) {
        const value = parseInt(document.getElementById('time-stretch-slider').value, 10);
        setTimeStretch(value);
    }
}

function handleTimeStretchChange(value) {
    if (!isAudioReady) return;
    setTimeStretch(value);
}
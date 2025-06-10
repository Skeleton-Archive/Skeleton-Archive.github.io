class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.currentSongTitle = document.getElementById('currentSongTitle');
        this.currentSongArtist = document.getElementById('currentSongArtist');
        this.currentSongImage = document.getElementById('currentSongImage');
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
        
        this.isPlaying = false;
        this.currentSong = null;
        this.currentIndex = -1;
        this.songs = [];
        this.isMuted = false;
        this.previousVolume = 50;
        this.isDragging = false;
        
        this.initializeSongs();
        this.initializeEventListeners();
        this.setVolume(50);
        this.createSnowEffect();
    }
    
    initializeSongs() {
        const songItems = document.querySelectorAll('.song-item');
        this.songs = Array.from(songItems).map((item, index) => ({
            element: item,
            url: item.dataset.song,
            title: item.dataset.title,
            artist: item.querySelector('.song-artist').textContent,
            image: item.querySelector('.song-image').src,
            index: index
        }));
    }
    
    initializeEventListeners() {
        // Song selection
        this.songs.forEach((song, index) => {
            song.element.addEventListener('click', () => {
                this.loadSong(index);
            });
        });
        
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // Previous button
        this.prevBtn.addEventListener('click', () => {
            this.previousSong();
        });
        
        // Next button
        this.nextBtn.addEventListener('click', () => {
            this.nextSong();
        });
        
        // Progress bar events
        this.progressBar.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.seekTo(e);
            }
        });
        
        this.progressBar.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.seekTo(e);
            document.addEventListener('mousemove', this.handleProgressDrag.bind(this));
            document.addEventListener('mouseup', this.handleProgressDragEnd.bind(this));
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
        
        // Volume button (mute/unmute)
        this.volumeBtn.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
            }
        });
        
        this.audio.addEventListener('ended', () => {
            this.nextSong();
        });
        
        this.audio.addEventListener('loadstart', () => {
            this.currentSongTitle.textContent = 'Loading...';
            this.currentSongArtist.textContent = 'Please wait...';
        });
        
        this.audio.addEventListener('canplay', () => {
            if (this.currentSong) {
                this.currentSongTitle.textContent = this.currentSong.title;
                this.currentSongArtist.textContent = this.currentSong.artist;
            }
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showError('Failed to load audio file');
            this.pauseSong();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardControls(e);
        });
    }
    
    handleProgressDrag(e) {
        if (this.isDragging) {
            this.seekTo(e);
        }
    }
    
    handleProgressDragEnd() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleProgressDrag.bind(this));
        document.removeEventListener('mouseup', this.handleProgressDragEnd.bind(this));
    }
    
    loadSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        // Remove playing class from all songs
        this.songs.forEach(song => {
            song.element.classList.remove('playing', 'active');
        });
        
        this.currentIndex = index;
        this.currentSong = this.songs[index];
        
        // Add active and playing classes
        this.currentSong.element.classList.add('active');
        
        this.audio.src = this.currentSong.url;
        this.currentSongTitle.textContent = this.currentSong.title;
        this.currentSongArtist.textContent = this.currentSong.artist;
        this.currentSongImage.src = this.currentSong.image;
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.currentTime.textContent = '0:00';
        this.duration.textContent = '0:00';
        
        // Load and play the song
        this.audio.load();
        
        // Wait for the audio to be ready before playing
        this.audio.addEventListener('canplaythrough', () => {
            this.playSong();
        }, { once: true });
    }
    
    togglePlayPause() {
        if (!this.currentSong) {
            if (this.songs.length > 0) {
                this.loadSong(0);
            }
            return;
        }
        
        if (this.isPlaying) {
            this.pauseSong();
        } else {
            this.playSong();
        }
    }
    
    playSong() {
        if (!this.currentSong) return;
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.playIcon.style.display = 'none';
                this.pauseIcon.style.display = 'inline';
                this.currentSong.element.classList.add('playing');
            }).catch(error => {
                console.error('Error playing audio:', error);
                this.showError('Error playing the song. Please try another one.');
                this.isPlaying = false;
                this.playIcon.style.display = 'inline';
                this.pauseIcon.style.display = 'none';
            });
        }
    }
    
    pauseSong() {
        this.audio.pause();
        this.isPlaying = false;
        this.playIcon.style.display = 'inline';
        this.pauseIcon.style.display = 'none';
        if (this.currentSong) {
            this.currentSong.element.classList.remove('playing');
        }
    }
    
    previousSong() {
        if (this.songs.length === 0) return;
        
        let newIndex = this.currentIndex - 1;
        if (newIndex < 0) {
            newIndex = this.songs.length - 1;
        }
        this.loadSong(newIndex);
    }
    
    nextSong() {
        if (this.songs.length === 0) return;
        
        let newIndex = this.currentIndex + 1;
        if (newIndex >= this.songs.length) {
            newIndex = 0;
        }
        this.loadSong(newIndex);
    }
    
    seekTo(e) {
        if (!this.currentSong || !this.audio.duration || isNaN(this.audio.duration)) {
            return;
        }
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        
        const newTime = percentage * this.audio.duration;
        this.audio.currentTime = newTime;
        
        // Update progress immediately
        this.updateProgress();
    }
    
    setVolume(value) {
        const volume = Math.max(0, Math.min(100, value));
        this.audio.volume = volume / 100;
        this.updateVolumeIcon(volume);
        
        if (volume > 0) {
            this.isMuted = false;
            this.previousVolume = volume;
        }
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.previousVolume);
            this.volumeSlider.value = this.previousVolume;
            this.isMuted = false;
        } else {
            this.previousVolume = this.volumeSlider.value;
            this.setVolume(0);
            this.volumeSlider.value = 0;
            this.isMuted = true;
        }
    }
    
    updateVolumeIcon(volume) {
        if (volume == 0 || this.isMuted) {
            this.volumeBtn.textContent = '🔇';
        } else if (volume < 50) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }
    
    updateProgress() {
        if (!this.audio.duration || isNaN(this.audio.duration) || isNaN(this.audio.currentTime)) {
            return;
        }
        
        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = Math.max(0, Math.min(100, percentage)) + '%';
        this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        
        // Update duration if it's not set
        if (this.duration.textContent === '0:00' || this.duration.textContent === '') {
            this.updateDuration();
        }
    }
    
    updateDuration() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            this.duration.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    handleKeyboardControls(e) {
        // Only handle keys if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    // Seek backward 10 seconds
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                } else {
                    this.previousSong();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    // Seek forward 10 seconds
                    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                } else {
                    this.nextSong();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentVol = parseInt(this.volumeSlider.value);
                const newVolUp = Math.min(100, currentVol + 10);
                this.volumeSlider.value = newVolUp;
                this.setVolume(newVolUp);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentVolDown = parseInt(this.volumeSlider.value);
                const newVolDown = Math.max(0, currentVolDown - 10);
                this.volumeSlider.value = newVolDown;
                this.setVolume(newVolDown);
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }
    
    showError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-notification');
        existingErrors.forEach(error => error.remove());
        
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 3000);
    }
    
    createSnowEffect() {
        const snowContainer = document.getElementById('snowContainer');
        const snowflakeCount = 50;
        
        for (let i = 0; i < snowflakeCount; i++) {
            setTimeout(() => {
                this.createSnowflake(snowContainer);
            }, i * 100);
        }
        
        // Create new snowflakes periodically
        setInterval(() => {
            if (snowContainer.children.length < snowflakeCount) {
                this.createSnowflake(snowContainer);
            }
        }, 300);
    }
    
    createSnowflake(container) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        
        // Random properties
        const startPositionLeft = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2; // 2-5 seconds
        const opacity = Math.random() * 0.6 + 0.4; // 0.4-1
        const size = Math.random() * 0.8 + 0.8; // 0.8-1.6em
        
        snowflake.style.left = startPositionLeft + '%';
        snowflake.style.animationDuration = animationDuration + 's';
        snowflake.style.opacity = opacity;
        snowflake.style.fontSize = size + 'em';
        
        container.appendChild(snowflake);
        
        // Remove snowflake after animation
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.remove();
            }
        }, animationDuration * 1000);
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

// Add smooth scrolling for song grid
document.addEventListener('DOMContentLoaded', () => {
    const songsContainer = document.querySelector('.songs-container');
    
    // Add scroll behavior
    let isScrolling = false;
    songsContainer.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // Add any scroll-based animations here if needed
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
});

// Add visual feedback for interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation and error notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
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
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => {
            this.seekTo(e);
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
            this.updateProgress();
        });
        
        this.audio.addEventListener('ended', () => {
            this.nextSong();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showError('Failed to load audio file');
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardControls(e);
        });
    }
    
    loadSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        // Remove playing class from all songs
        this.songs.forEach(song => {
            song.element.classList.remove('playing', 'active');
        });
        
        this.currentIndex = index;
        this.currentSong = this.songs[index];
        
        // Add active class
        this.currentSong.element.classList.add('active');
        
        this.audio.src = this.currentSong.url;
        this.currentSongTitle.textContent = this.currentSong.title;
        this.currentSongArtist.textContent = this.currentSong.artist;
        this.currentSongImage.src = this.currentSong.image;
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.currentTime.textContent = '0:00';
        this.duration.textContent = '0:00';
        
        // Auto play the song
        this.playSong();
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
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'inline';
            this.currentSong.element.classList.add('playing');
        }).catch(error => {
            console.error('Error playing audio:', error);
            this.showError('Error playing the song. Please try another one.');
        });
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
        if (!this.currentSong || !this.audio.duration) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        this.audio.currentTime = percentage * this.audio.duration;
    }
    
    setVolume(value) {
        this.audio.volume = value / 100;
        this.updateVolumeIcon(value);
        
        if (value > 0) {
            this.isMuted = false;
            this.previousVolume = value;
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
        if (!this.audio.duration) return;
        
        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = percentage + '%';
        this.currentTime.textContent = this.formatTime(this.audio.currentTime);
    }
    
    updateDuration() {
        this.duration.textContent = this.formatTime(this.audio.duration);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    handleKeyboardControls(e) {
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
                this.previousSong();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSong();
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
        const errorDiv = document.createElement('div');
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
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    createSnowEffect() {
        const snowContainer = document.getElementById('snowContainer');
        const snowflakeCount = 50;
        
        for (let i = 0; i < snowflakeCount; i++) {
            this.createSnowflake(snowContainer);
        }
        
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
        
        const startPositionLeft = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const opacity = Math.random() * 0.6 + 0.4;
        const size = Math.random() * 0.8 + 0.8;
        
        snowflake.style.left = startPositionLeft + '%';
        snowflake.style.animationDuration = animationDuration + 's';
        snowflake.style.opacity = opacity;
        snowflake.style.fontSize = size + 'em';
        
        container.appendChild(snowflake);
        
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

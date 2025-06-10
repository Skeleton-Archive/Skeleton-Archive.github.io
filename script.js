class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.currentSongTitle = document.getElementById('currentSongTitle');
        this.currentSongImage = document.getElementById('currentSongImage');
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
        
        this.isPlaying = false;
        this.currentSong = null;
        
        this.initializeEventListeners();
        this.setVolume(50);
    }
    
    initializeEventListeners() {
        // Song selection
        document.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const songUrl = item.dataset.song;
                const songTitle = item.dataset.title;
                const songImage = item.querySelector('.song-image').src;
                this.loadSong(songUrl, songTitle, songImage);
            });
        });
        
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // Stop button
        this.stopBtn.addEventListener('click', () => {
            this.stopSong();
        });
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => {
            this.seekTo(e);
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        this.audio.addEventListener('ended', () => {
            this.onSongEnd();
        });
        
        this.audio.addEventListener('loadstart', () => {
            this.currentSongTitle.textContent = 'Loading...';
        });
        
        this.audio.addEventListener('canplay', () => {
            if (this.currentSong) {
                this.currentSongTitle.textContent = this.currentSong.title;
            }
        });
    }
    
    loadSong(url, title, image) {
        this.currentSong = { url, title, image };
        this.audio.src = url;
        this.currentSongTitle.textContent = title;
        this.currentSongImage.src = image;
        this.currentSongImage.style.display = 'block';
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.currentTime.textContent = '0:00';
        
        // Auto play the song
        this.audio.load();
        this.playSong();
    }
    
    togglePlayPause() {
        if (!this.currentSong) {
            alert('Please select a song first!');
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
        }).catch(error => {
            console.error('Error playing audio:', error);
            alert('Error playing the song. Please try another one.');
        });
    }
    
    pauseSong() {
        this.audio.pause();
        this.isPlaying = false;
        this.playIcon.style.display = 'inline';
        this.pauseIcon.style.display = 'none';
    }
    
    stopSong() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.playIcon.style.display = 'inline';
        this.pauseIcon.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.currentTime.textContent = '0:00';
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
    
    onSongEnd() {
        this.isPlaying = false;
        this.playIcon.style.display = 'inline';
        this.pauseIcon.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.audio.currentTime = 0;
        this.currentTime.textContent = '0:00';
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

// Add some visual feedback for song selection
document.addEventListener('DOMContentLoaded', () => {
    const songItems = document.querySelectorAll('.song-item');
    
    songItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            songItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
        });
    });
});

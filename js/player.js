// Видеоплеер JavaScript

class CustomVideoPlayer {
    constructor() {
        this.video = document.getElementById('main-video');
        this.player = document.querySelector('.custom-video-player');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentTimeElem = document.getElementById('currentTime');
        this.durationElem = document.getElementById('duration');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFilled = document.querySelector('.progress-filled');
        this.progressHandle = document.querySelector('.progress-handle');
        this.speedBtn = document.getElementById('speedBtn');
        this.speedMenu = document.querySelector('.speed-menu');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.screenshotBtn = document.getElementById('screenshotBtn');
        this.blurBtn = document.getElementById('blurBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.overlay = document.querySelector('.video-overlay');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        
        // Инструмент размытия
        this.blurTool = document.getElementById('blurTool');
        this.blurCanvas = document.getElementById('blurCanvas');
        this.blurCtx = this.blurCanvas.getContext('2d');
        this.blurAreas = [];
        this.isBlurMode = false;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        this.init();
    }
    
    init() {
        // Основные обработчики событий
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.overlay.addEventListener('click', () => this.togglePlayPause());
        this.video.addEventListener('play', () => this.updatePlayPauseButton());
        this.video.addEventListener('pause', () => this.updatePlayPauseButton());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('error', (e) => this.handleError(e));
        
        // Громкость
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.changeVolume(e));
        
        // Прогресс бар
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.progressBar.addEventListener('mousedown', () => this.startDragging());
        
        // Скорость воспроизведения
        this.speedBtn.addEventListener('click', (e) => e.stopPropagation());
        this.speedMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeSpeed(e));
        });
        
        // Полноэкранный режим
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        
        // Дополнительные функции
        this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
        this.blurBtn.addEventListener('click', () => this.toggleBlurMode());
        this.shareBtn.addEventListener('click', () => this.share());
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Инициализация размытия
        this.initBlurTool();
        
        // Сохранение громкости
        this.loadVolumeFromStorage();
    }
    
    // Воспроизведение/пауза
    togglePlayPause() {
        if (this.video.paused) {
            this.video.play().catch(e => {
                console.error('Ошибка воспроизведения:', e);
                this.showError('Не удалось воспроизвести видео');
            });
        } else {
            this.video.pause();
        }
    }
    
    updatePlayPauseButton() {
        const icon = this.playPauseBtn.querySelector('i');
        if (this.video.paused) {
            icon.className = 'fas fa-play';
            this.player.classList.remove('playing');
        } else {
            icon.className = 'fas fa-pause';
            this.player.classList.add('playing');
        }
    }
    
    // Громкость
    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateVolumeButton();
        this.volumeSlider.value = this.video.muted ? 0 : this.video.volume * 100;
    }
    
    changeVolume(e) {
        const volume = e.target.value / 100;
        this.video.volume = volume;
        this.video.muted = volume === 0;
        this.updateVolumeButton();
        this.saveVolumeToStorage(volume);
    }
    
    updateVolumeButton() {
        const icon = this.volumeBtn.querySelector('i');
        if (this.video.muted || this.video.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.video.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    saveVolumeToStorage(volume) {
        localStorage.setItem('playerVolume', volume);
    }
    
    loadVolumeFromStorage() {
        const savedVolume = localStorage.getItem('playerVolume');
        if (savedVolume !== null) {
            this.video.volume = parseFloat(savedVolume);
            this.volumeSlider.value = savedVolume * 100;
            this.updateVolumeButton();
        }
    }
    
    // Прогресс и время
    updateDuration() {
        const duration = this.formatTime(this.video.duration);
        this.durationElem.textContent = duration;
    }
    
    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = percent + '%';
        this.progressHandle.style.left = percent + '%';
        this.currentTimeElem.textContent = this.formatTime(this.video.currentTime);
    }
    
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = percent * this.video.duration;
    }
    
    startDragging() {
        const onMouseMove = (e) => {
            this.seek(e);
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        const timeString = h > 0 
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m}:${s.toString().padStart(2, '0')}`;
            
        return timeString;
    }
    
    // Скорость воспроизведения
    changeSpeed(e) {
        const speed = parseFloat(e.target.dataset.speed);
        this.video.playbackRate = speed;
        this.speedBtn.textContent = speed + 'x';
        
        // Обновление активной кнопки
        this.speedMenu.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
    
    // Полноэкранный режим
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.player.requestFullscreen) {
                this.player.requestFullscreen();
            } else if (this.player.webkitRequestFullscreen) {
                this.player.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    
    updateFullscreenButton() {
        const icon = this.fullscreenBtn.querySelector('i');
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
        } else {
            icon.className = 'fas fa-expand';
        }
    }
    
    // Скриншот
    takeScreenshot() {
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        
        // Применение размытых областей к скриншоту
        this.blurAreas.forEach(area => {
            const scaleX = canvas.width / this.video.offsetWidth;
            const scaleY = canvas.height / this.video.offsetHeight;
            
            ctx.filter = 'blur(10px)';
            ctx.drawImage(
                this.video,
                area.x * scaleX,
                area.y * scaleY,
                area.width * scaleX,
                area.height * scaleY,
                area.x * scaleX,
                area.y * scaleY,
                area.width * scaleX,
                area.height * scaleY
            );
            ctx.filter = 'none';
        });
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gumball-screenshot-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Скриншот сохранен!');
        });
    }
    
    // Инструмент размытия
    toggleBlurMode() {
        this.isBlurMode = !this.isBlurMode;
        this.blurTool.style.display = this.isBlurMode ? 'block' : 'none';
        this.blurBtn.classList.toggle('active', this.isBlurMode);
        
        if (!this.isBlurMode) {
            this.clearBlurAreas();
        }
    }
    
    initBlurTool() {
        let currentArea = null;
        
        this.blurTool.addEventListener('mousedown', (e) => {
            if (e.target === this.blurTool) {
                this.isDrawing = true;
                const rect = this.blurTool.getBoundingClientRect();
                this.startX = e.clientX - rect.left;
                this.startY = e.clientY - rect.top;
                
                currentArea = document.createElement('div');
                currentArea.className = 'blur-area';
                currentArea.style.left = this.startX + 'px';
                currentArea.style.top = this.startY + 'px';
                this.blurTool.appendChild(currentArea);
            }
        });
        
        this.blurTool.addEventListener('mousemove', (e) => {
            if (this.isDrawing && currentArea) {
                const rect = this.blurTool.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;
                
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                
                currentArea.style.width = Math.abs(width) + 'px';
                currentArea.style.height = Math.abs(height) + 'px';
                
                if (width < 0) {
                    currentArea.style.left = currentX + 'px';
                }
                if (height < 0) {
                    currentArea.style.top = currentY + 'px';
                }
            }
        });
        
        this.blurTool.addEventListener('mouseup', () => {
            if (this.isDrawing && currentArea) {
                this.isDrawing = false;
                currentArea.classList.add('active');
                
                // Сохранение области
                const rect = currentArea.getBoundingClientRect();
                const toolRect = this.blurTool.getBoundingClientRect();
                
                this.blurAreas.push({
                    x: rect.left - toolRect.left,
                    y: rect.top - toolRect.top,
                    width: rect.width,
                    height: rect.height,
                    element: currentArea
                });
                
                // Добавление кнопки удаления
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-blur-area';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = () => this.removeBlurArea(currentArea);
                currentArea.appendChild(removeBtn);
                
                currentArea = null;
            }
        });
        
        // Отмена рисования при выходе за пределы
        this.blurTool.addEventListener('mouseleave', () => {
            if (this.isDrawing && currentArea) {
                this.isDrawing = false;
                currentArea.remove();
                currentArea = null;
            }
        });
    }
    
    removeBlurArea(element) {
        const index = this.blurAreas.findIndex(area => area.element === element);
        if (index !== -1) {
            this.blurAreas.splice(index, 1);
            element.remove();
        }
    }
    
    clearBlurAreas() {
        this.blurAreas.forEach(area => area.element.remove());
        this.blurAreas = [];
    }
    
    // Поделиться
    share() {
        const modal = document.getElementById('shareModal');
        const shareLink = document.getElementById('shareLink');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('t', Math.floor(this.video.currentTime));
        
        shareLink.value = currentUrl.toString();
        
        // Обновление ссылок для социальных сетей
        const vkLink = document.getElementById('shareVK');
        const telegramLink = document.getElementById('shareTelegram');
        
        const shareText = `Смотрю "${document.querySelector('.hero-title').textContent}" - Серии ${document.getElementById('episode').selectedOptions[0].text}`;
        
        vkLink.href = `https://vk.com/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`;
        telegramLink.href = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
        
        modal.style.display = 'block';
    }
    
    // Клавиатурные сокращения
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const key = e.key.toLowerCase();
        
        switch(key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
            case 'arrowleft':
                e.preventDefault();
                this.video.currentTime -= 10;
                break;
            case 'arrowright':
                e.preventDefault();
                this.video.currentTime += 10;
                break;
            case 'arrowup':
                e.preventDefault();
                this.video.volume = Math.min(this.video.volume + 0.1, 1);
                this.volumeSlider.value = this.video.volume * 100;
                this.updateVolumeButton();
                break;
            case 'arrowdown':
                e.preventDefault();
                this.video.volume = Math.max(this.video.volume - 0.1, 0);
                this.volumeSlider.value = this.video.volume * 100;
                this.updateVolumeButton();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                e.preventDefault();
                const percent = parseInt(key) * 10;
                this.video.currentTime = (percent / 100) * this.video.duration;
                break;
        }
    }
    
    // Загрузка и ошибки
    showLoading() {
        this.player.classList.add('buffering');
    }
    
    hideLoading() {
        this.player.classList.remove('buffering');
    }
    
    handleError(e) {
        console.error('Ошибка видео:', e);
        this.showError('Произошла ошибка при загрузке видео');
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'video-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 100;
        `;
        this.player.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'player-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 100;
            animation: fadeInOut 3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                20%, 80% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        this.player.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

// Инициализация плеера
document.addEventListener('DOMContentLoaded', () => {
    const player = new CustomVideoPlayer();
    window.videoPlayer = player; // Для доступа из консоли при отладке
});

// Обработка времени из URL при загрузке
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const time = params.get('t');
    if (time && window.videoPlayer) {
        window.videoPlayer.video.addEventListener('loadedmetadata', () => {
            window.videoPlayer.video.currentTime = parseInt(time);
        }, { once: true });
    }
});
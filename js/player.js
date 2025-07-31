// Видеоплеер JavaScript (упрощён для embed-iframe)

class CustomVideoPlayer {
    constructor() {
        // Упрощено: больше нет нужды в видео-элементах, так как используем iframe
        this.player = document.querySelector('.custom-video-player');
        this.shareBtn = document.getElementById('shareBtn');
        
        this.init();
    }
    
    init() {
        // Поделиться (оставлено, так как работает независимо)
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.share());
        }
        
        // Клавиатурные сокращения (упрощены, так как нет видео-элемента)
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // Поделиться
    share() {
        const modal = document.getElementById('shareModal');
        const shareLink = document.getElementById('shareLink');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('t', 0); // Время не актуально для embed
        
        shareLink.value = currentUrl.toString();
        
        // Обновление ссылок для социальных сетей
        const vkLink = document.getElementById('shareVK');
        const telegramLink = document.getElementById('shareTelegram');
        
        const shareText = `Смотрю "${document.querySelector('.hero-title').textContent}" - Серии ${document.getElementById('episode').selectedOptions[0].text}`;
        
        vkLink.href = `https://vk.com/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`;
        telegramLink.href = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
        
        modal.style.display = 'block';
    }
    
    // Клавиатурные сокращения (упрощены)
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const key = e.key.toLowerCase();
        
        switch(key) {
            case ' ':
            case 'k':
                e.preventDefault();
                // Нет паузы для iframe; можно добавить JS для симуляции, но пропустим
                break;
            case 'f':
                e.preventDefault();
                // Fullscreen для iframe
                const iframe = document.querySelector('#embed-container iframe');
                if (iframe) {
                    if (iframe.requestFullscreen) iframe.requestFullscreen();
                }
                break;
        }
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
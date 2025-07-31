// Основной JavaScript файл

// Глобальные переменные
let currentSeason = 1;
let currentEpisode = 1;

// Данные о сериях (embed-ссылки от Mega.nz)
const episodes = {
    1: [
        { episodes: "1-2", url: "https://mega.nz/embed/eRcC3CBJ#mOe8ad6aHoen5xtGh8_aTI-5HKL4sc8QyNPN1t8Arow" },
        { episodes: "3-4", url: "https://mega.nz/embed/iVFghJZS#doFIeufVJ1ZHhbcQcyIqwARDDuVN0WIFB4N7x-du3OM" },
        { episodes: "5-6", url: "https://mega.nz/embed/zdM2kQTB#k5AGkKrbcxP3rlri0Vl1GZIiJ6IdPvq-x0xuq2-13lg" },
        { episodes: "7-8", url: "https://mega.nz/embed/bcclgDDa#dIDGNdf8WYPANxjxZ_hIBUM27bigVR3iTO4Hu-x82I4" },
        { episodes: "9-10", url: "https://mega.nz/embed/DA9QAKhD#Qs58MwcpG6xcH9e3SIJXr-7FwyUgU7RJlnHmaLt5oSQ" },
        { episodes: "11-12", url: "https://mega.nz/embed/DY8G3SaC#FK64YTtMxRJ0wHCOSdSPrJgK9cP5G9zSy8cQEsrFx0c" },
        { episodes: "13-14", url: "https://mega.nz/embed/nQFhTT7I#6SrFxqYF9lPAraZ5JCToRze3eEUPl4qtRulaQNf2p_w" },
        { episodes: "15-16", url: "https://mega.nz/embed/eNUWBY4Q#-5JzvGc_ERlRUyu5JXSmNgN0loMwmHew4p5zSLRqyuc" },
        { episodes: "17-18", url: "https://mega.nz/embed/fV9SxRYT#yGtic8c42piNKWszSa3jiZym05OZc0uOURCKvUxnYGg" },
        { episodes: "19-20", url: "https://mega.nz/embed/eBk2xZBY#bBGRxVH3IC-VT5CW27DyAKY7m1E7GKMnNBQEr5uS-js" }
    ]
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeEpisodeSelector();
    loadEpisodeFromURL();
    setupSmoothScroll();
    initializeShareModal();
});

// Мобильное меню
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Инициализация селектора серий
function initializeEpisodeSelector() {
    const seasonSelect = document.getElementById('season');
    const episodeSelect = document.getElementById('episode');

    // Заполнение списка серий
    updateEpisodeList();

    // Обработчики изменений
    seasonSelect.addEventListener('change', (e) => {
        currentSeason = parseInt(e.target.value);
        updateEpisodeList();
        loadEpisode(currentSeason, 1);
    });

    episodeSelect.addEventListener('change', (e) => {
        currentEpisode = parseInt(e.target.value);
        loadEpisode(currentSeason, currentEpisode);
    });
}

// Обновление списка серий
function updateEpisodeList() {
    const episodeSelect = document.getElementById('episode');
    episodeSelect.innerHTML = '';

    const seasonEpisodes = episodes[currentSeason];
    seasonEpisodes.forEach((ep, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = `Серии ${ep.episodes}`;
        episodeSelect.appendChild(option);
    });
}

// Загрузка эпизода (вставляет iframe от Mega)
function loadEpisode(season, episode) {
    const episodeData = episodes[season][episode - 1];
    const embedContainer = document.getElementById('embed-container');
    
    if (episodeData && embedContainer) {
        // Очищаем контейнер и вставляем новый iframe
        embedContainer.innerHTML = `
            <iframe width="100%" height="100%" frameborder="0" src="${episodeData.url}" allowfullscreen></iframe>
        `;
        
        // Обновляем селекторы
        document.getElementById('season').value = season;
        document.getElementById('episode').value = episode;
        
        // Обновляем URL
        updateURL(season, episode);
        
        // Обновляем состояние кнопок
        updateNavigationButtons();
        
        // Прокручиваем к плееру
        scrollToPlayer();
    } else {
        console.error('Контейнер для embed не найден или данные эпизода отсутствуют.');
        if (embedContainer) {
            embedContainer.innerHTML = '<div style="text-align: center; color: red; padding: 20px;">Ошибка загрузки видео. Проверьте консоль (F12) или обновите страницу.</div>';
        }
    }
}

// Загрузка эпизода из URL
function loadEpisodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const season = parseInt(params.get('season')) || 1;
    const episode = parseInt(params.get('episode')) || 1;
    
    currentSeason = season;
    currentEpisode = episode;
    
    loadEpisode(season, episode);
}

// Обновление URL
function updateURL(season, episode) {
    const url = new URL(window.location);
    url.searchParams.set('season', season);
    url.searchParams.set('episode', episode);
    window.history.pushState({}, '', url);
}

// Навигация между сериями
function previousEpisode() {
    if (currentEpisode > 1) {
        currentEpisode--;
        loadEpisode(currentSeason, currentEpisode);
    }
}

function nextEpisode() {
    const maxEpisodes = episodes[currentSeason].length;
    if (currentEpisode < maxEpisodes) {
        currentEpisode++;
        loadEpisode(currentSeason, currentEpisode);
    }
}

// Обновление состояния кнопок навигации
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-episode');
    const nextBtn = document.querySelector('.next-episode');
    const maxEpisodes = episodes[currentSeason].length;
    
    if (prevBtn) prevBtn.disabled = currentEpisode === 1;
    if (nextBtn) nextBtn.disabled = currentEpisode === maxEpisodes;
}

// Плавная прокрутка
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Прокрутка к плееру
function scrollToPlayer() {
    const playerSection = document.getElementById('watch');
    if (playerSection) {
        playerSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Функция для кнопки CTA
window.scrollToPlayer = scrollToPlayer;

// Модальное окно для шеринга
function initializeShareModal() {
    const modal = document.getElementById('shareModal');
    const closeBtn = modal.querySelector('.close');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Копирование ссылки для шеринга
window.copyShareLink = function() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Ошибка при копировании:', err);
    }
};

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Глобальная ошибка:', e);
});

// Предзагрузка изображений
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Определение темы системы
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Проверка поддержки функций
function checkFeatureSupport() {
    const features = {
        webp: checkWebPSupport(),
        fullscreen: document.fullscreenEnabled || document.webkitFullscreenEnabled,
        clipboard: navigator.clipboard !== undefined
    };
    
    return features;
}

// Проверка поддержки WebP
function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
}

// Утилита для дебаунсинга
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Утилита для троттлинга
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Обработка изменения размера окна
window.addEventListener('resize', debounce(() => {
    // Адаптивные изменения при ресайзе
    if (window.innerWidth <= 768) {
        // Мобильная версия
    } else {
        // Десктопная версия
    }
}, 250));

// Определение устройства
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Экспорт функций для использования в других модулях
window.GumballSite = {
    loadEpisode,
    previousEpisode,
    nextEpisode,
    scrollToPlayer,
    copyShareLink,
    debounce,
    throttle,
    getDeviceType
};
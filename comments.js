// Система комментариев

// Конфигурация для Giscus
const giscusConfig = {
    repo: 'Ajopers/gumball-fan-site', // Замените на ваш репозиторий
    repoId: 'R_kgDOPUyQ5g', // Получите из настроек Giscus
    category: 'Announcements',
    categoryId: 'DIC_kwDOPUyQ5s4Ctl-S', // Получите из настроек Giscus
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'light',
    lang: 'ru'
};

// Функция для настройки Giscus (вызывается после создания репозитория)
function setupGiscus(config) {
    const script = document.querySelector('script[src="https://giscus.app/client.js"]');
    if (script) {
        Object.keys(config).forEach(key => {
            const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            script.setAttribute(`data-${attrName}`, config[key]);
        });
    }
}

// Экспорт для использования
window.CommentsSystem = {
    setupGiscus
};
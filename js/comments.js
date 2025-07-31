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

// Альтернативная система комментариев на localStorage (для демонстрации)
class LocalComments {
    constructor() {
        this.comments = this.loadComments();
        this.container = null;
        this.init();
    }
    
    init() {
        // Проверяем, если Giscus не загрузился, используем локальную систему
        setTimeout(() => {
            if (!document.querySelector('.giscus')) {
                this.createLocalCommentSystem();
            }
        }, 3000);
    }
    
    createLocalCommentSystem() {
        const container = document.getElementById('giscus-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="local-comments">
                <div class="comment-form">
                    <h3>Оставить комментарий</h3>
                    <form id="localCommentForm">
                        <div class="form-group">
                            <input type="text" id="commentName" placeholder="Ваше имя" required>
                        </div>
                        <div class="form-group">
                            <textarea id="commentText" rows="4" placeholder="Ваш комментарий" required></textarea>
                        </div>
                        <div class="form-group captcha-group">
                            <label id="captchaQuestion"></label>
                            <input type="number" id="captchaAnswer" placeholder="Ваш ответ" required>
                            <div id="captchaError" class="error-message" style="display: none; color: red; font-size: 0.875rem; margin-top: 0.5rem;">Неверный ответ. Попробуйте снова.</div>
                        </div>
                        <button type="submit" class="submit-comment-btn">
                            <i class="fas fa-paper-plane"></i> Отправить
                        </button>
                    </form>
                </div>
                <div class="comments-list" id="commentsList">
                    <h3>Комментарии (${this.comments.length})</h3>
                    <div class="comments-container">
                        ${this.renderComments()}
                    </div>
                </div>
            </div>
        `;
        
        this.addStyles();
        this.attachEventListeners();
        this.generateCaptcha(); // Генерация капчи при создании формы
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .local-comments {
                margin-top: 2rem;
                background: #f8f9fa; /* Светлый фон под сайт */
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: var(--shadow-1);
            }
            
            .comment-form {
                background: white;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                box-shadow: var(--shadow-1);
            }
            
            .comment-form h3 {
                margin-bottom: 1rem;
                color: var(--dark-color);
                font-size: 1.2rem;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1rem;
                transition: var(--transition);
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .submit-comment-btn {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: var(--transition);
            }
            
            .submit-comment-btn:hover {
                background: var(--secondary-color);
                transform: translateY(-2px);
            }
            
            .comments-list h3 {
                margin-bottom: 1rem;
                color: var(--dark-color);
                font-size: 1.2rem;
            }
            
            .comment-item {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                position: relative;
                transition: box-shadow 0.3s;
            }
            
            .comment-item:hover {
                box-shadow: var(--shadow-2);
            }
            
            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
            }
            
            .comment-author {
                font-weight: 600;
                color: var(--dark-color);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .comment-author::before {
                content: '';
                width: 32px;
                height: 32px;
                background: var(--primary-color);
                border-radius: 50%;
                display: inline-block;
            }
            
            .comment-date {
                font-size: 0.875rem;
                color: #999;
            }
            
            .comment-text {
                color: var(--text-color);
                line-height: 1.6;
            }
            
            .comment-actions {
                margin-top: 1rem;
                display: flex;
                gap: 1rem;
            }
            
            .comment-action {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 0.875rem;
                transition: var(--transition);
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .comment-action:hover {
                color: var(--primary-color);
            }
            
            .comment-action.liked {
                color: var(--secondary-color);
            }
            
            .no-comments {
                text-align: center;
                padding: 3rem;
                color: #999;
            }
            
            .reply-form {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .reply-form.active {
                display: block;
            }
            
            .reply-form input,
            .reply-form textarea {
                width: 100%;
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                border: 2px solid #e0e0e0;
                border-radius: 5px;
                transition: border-color 0.3s;
            }
            
            .reply-form input:focus,
            .reply-form textarea:focus {
                border-color: var(--primary-color);
            }
            
            .reply-form button {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .reply-form button:hover {
                background: var(--secondary-color);
            }
            
            .captcha-group {
                display: flex;
                flex-direction: column;
            }
            
            .captcha-group label {
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .replies {
                margin-top: 1rem;
                padding-left: 2rem;
                border-left: 2px solid #e0e0e0;
            }
            
            .reply-item {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 0.5rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Остальной код без изменений (addEventListeners, loadComments и т.д.)
    attachEventListeners() {
        const form = document.getElementById('localCommentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addComment();
            });
        }
        
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) {
                    this.toggleLike(e.target.closest('.like-btn'));
                }
                if (e.target.closest('.reply-btn')) {
                    this.toggleReplyForm(e.target.closest('.reply-btn'));
                }
                if (e.target.closest('.delete-btn')) {
                    this.deleteComment(e.target.closest('.delete-btn'));
                }
            });
        }
    }
    
    generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.captchaSum = num1 + num2;
        const questionElem = document.getElementById('captchaQuestion');
        if (questionElem) {
            questionElem.textContent = `Сколько будет ${num1} + ${num2}? (Защита от ботов)`;
        }
    }
    
    checkCaptcha() {
        const answerInput = document.getElementById('captchaAnswer');
        const errorElem = document.getElementById('captchaError');
        if (!answerInput || !errorElem) return false;
        
        const userAnswer = parseInt(answerInput.value);
        if (userAnswer === this.captchaSum) {
            errorElem.style.display = 'none';
            return true;
        } else {
            errorElem.style.display = 'block';
            return false;
        }
    }
    
    loadComments() {
        const saved = localStorage.getItem('gumballComments');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveComments() {
        localStorage.setItem('gumballComments', JSON.stringify(this.comments));
    }
    
    addComment() {
        if (!this.checkCaptcha()) return;
        
        const nameInput = document.getElementById('commentName');
        const textInput = document.getElementById('commentText');
        
        if (!nameInput || !textInput || !nameInput.value.trim() || !textInput.value.trim()) return;
        
        const comment = {
            id: Date.now(),
            name: this.sanitizeInput(nameInput.value),
            text: this.sanitizeInput(textInput.value),
            date: new Date().toISOString(),
            likes: 0,
            liked: false,
            replies: []
        };
        
        this.comments.unshift(comment);
        this.saveComments();
        this.updateCommentsList();
        
        // Очистка формы
        nameInput.value = '';
        textInput.value = '';
        document.getElementById('captchaAnswer').value = '';
        this.generateCaptcha(); // Новая капча
        
        // Анимация добавления
        this.animateNewComment();
    }
    
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    updateCommentsList() {
        const container = document.querySelector('.comments-container');
        if (container) {
            container.innerHTML = this.renderComments();
            
            const counter = document.querySelector('.comments-list h3');
            if (counter) {
                counter.textContent = `Комментарии (${this.comments.length})`;
            }
        }
    }
    
    renderComments() {
        if (this.comments.length === 0) {
            return '<div class="no-comments">Пока нет комментариев. Будьте первым!</div>';
        }
        
        return this.comments.map(comment => this.renderComment(comment)).join('');
    }
    
    renderComment(comment) {
        const date = new Date(comment.date);
        const formattedDate = this.formatDate(date);
        
        return `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${comment.name}</div>
                    <div class="comment-date">${formattedDate}</div>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <button class="comment-action like-btn ${comment.liked ? 'liked' : ''}" data-id="${comment.id}">
                        <i class="fas fa-heart"></i> ${comment.likes}
                    </button>
                    <button class="comment-action reply-btn" data-id="${comment.id}">
                        <i class="fas fa-reply"></i> Ответить
                    </button>
                    <button class="comment-action delete-btn" data-id="${comment.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
                ${comment.replies.length > 0 ? this.renderReplies(comment.replies) : ''}
                <div class="reply-form" id="replyForm-${comment.id}">
                    <input type="text" placeholder="Ваше имя" class="reply-name">
                    <textarea placeholder="Ваш ответ" rows="2" class="reply-text"></textarea>
                    <div class="form-group captcha-group">
                        <label id="replyCaptchaQuestion-${comment.id}"></label>
                        <input type="number" id="replyCaptchaAnswer-${comment.id}" placeholder="Ваш ответ" required>
                        <div id="replyCaptchaError-${comment.id}" class="error-message" style="display: none; color: red; font-size: 0.875rem; margin-top: 0.5rem;">Неверный ответ. Попробуйте снова.</div>
                    </div>
                    <button onclick="localComments.addReply(${comment.id})">Отправить</button>
                </div>
            </div>
        `;
    }
    
    renderReplies(replies) {
        return `
            <div class="replies">
                ${replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <strong>${reply.name}</strong>
                            <span class="reply-date">${this.formatDate(new Date(reply.date))}</span>
                        </div>
                        <div class="reply-text">${reply.text}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        if (hours < 24) return `${hours} ч. назад`;
        if (days < 7) return `${days} дн. назад`;
        
        return date.toLocaleDateString('ru-RU');
    }
    
    toggleLike(btn) {
        const id = parseInt(btn.dataset.id);
        const comment = this.comments.find(c => c.id === id);
        
        if (comment) {
            comment.liked = !comment.liked;
            comment.likes += comment.liked ? 1 : -1;
            this.saveComments();
            this.updateCommentsList();
        }
    }
    
    toggleReplyForm(btn) {
        const id = btn.dataset.id;
        const form = document.getElementById(`replyForm-${id}`);
        if (form) {
            form.classList.toggle('active');
            if (form.classList.contains('active')) {
                this.generateReplyCaptcha(id); // Генерация капчи при открытии формы ответа
            }
        }
    }
    
    generateReplyCaptcha(commentId) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.replyCaptchaSums = this.replyCaptchaSums || {};
        this.replyCaptchaSums[commentId] = num1 + num2;
        
        const questionElem = document.getElementById(`replyCaptchaQuestion-${commentId}`);
        if (questionElem) {
            questionElem.textContent = `Сколько будет ${num1} + ${num2}? (Защита от ботов)`;
        }
    }
    
    checkReplyCaptcha(commentId) {
        const answerInput = document.getElementById(`replyCaptchaAnswer-${commentId}`);
        const errorElem = document.getElementById(`replyCaptchaError-${commentId}`);
        if (!answerInput || !errorElem) return false;
        
        const userAnswer = parseInt(answerInput.value);
        if (userAnswer === this.replyCaptchaSums[commentId]) {
            errorElem.style.display = 'none';
            return true;
        } else {
            errorElem.style.display = 'block';
            return false;
        }
    }
    
    addReply(commentId) {
        if (!this.checkReplyCaptcha(commentId)) return;
        
        const form = document.getElementById(`replyForm-${commentId}`);
        if (!form) return;
        
        const nameInput = form.querySelector('.reply-name');
        const textInput = form.querySelector('.reply-text');
        
        if (!nameInput || !textInput || !nameInput.value.trim() || !textInput.value.trim()) return;
        
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.replies.push({
                name: this.sanitizeInput(nameInput.value),
                text: this.sanitizeInput(textInput.value),
                date: new Date().toISOString()
            });
            
            this.saveComments();
            this.updateCommentsList();
            
            // Очистка формы
            nameInput.value = '';
            textInput.value = '';
            document.getElementById(`replyCaptchaAnswer-${commentId}`).value = '';
            this.generateReplyCaptcha(commentId); // Новая капча
        }
    }
    
    deleteComment(btn) {
        if (confirm('Удалить этот комментарий?')) {
            const id = parseInt(btn.dataset.id);
            this.comments = this.comments.filter(c => c.id !== id);
            this.saveComments();
            this.updateCommentsList();
        }
    }
    
    animateNewComment() {
        const firstComment = document.querySelector('.comment-item');
        if (firstComment) {
            firstComment.style.animation = 'slideIn 0.5s ease';
        }
    }
}

// Инициализация системы комментариев
document.addEventListener('DOMContentLoaded', () => {
    window.localComments = new LocalComments();
});

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
    setupGiscus,
    LocalComments
};
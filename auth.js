// ============================================
// СИСТЕМА АУТЕНТИФИКАЦИИ И ПРОФИЛЯ
// ============================================

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    checkAuthStatus();
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const authBtn = document.getElementById('authBtn');
    
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        authBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        authBtn.title = userData.nickname;
        authBtn.onclick = () => openProfile();
    } else {
        authBtn.innerHTML = `<i class="fas fa-user"></i>`;
        authBtn.title = 'Войти';
        authBtn.onclick = () => openAuthModal();
    }
}

// Открыть модальное окно авторизации
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Открыть профиль
function openProfile() {
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        currentCommentsPage = 1; // Сброс страницы комментариев
        loadUserProfile();
        profilePage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Закрыть страницу профиля
function closeProfilePage() {
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        profilePage.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Закрытие модального окна профиля (для совместимости)
function closeProfileModal() {
    closeProfilePage();
}

// Регистрация
function register() {
    const nickname = document.getElementById('reg-nickname').value.trim();
    const login = document.getElementById('reg-login').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (!nickname || !login || !password) {
        alert('Заполните все поля!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов!');
        return;
    }
    
    // Проверка существования пользователя
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.login === login)) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        nickname: nickname,
        login: login,
        password: password,
        avatar: null,
        customCards: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Автоматический вход
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    closeAuthModal();
    checkAuthStatus();
    
    // Перезагружаем карточки
    if (typeof loadUserCardsToSections === 'function') {
        document.querySelectorAll('[data-modal-target^="modal-user-"]').forEach(el => el.remove());
        document.querySelectorAll('[id^="modal-user-"]').forEach(el => el.remove());
        loadUserCardsToSections();
    }
    
    alert('Регистрация успешна!');
}

// Вход
function login() {
    const login = document.getElementById('login-login').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!login || !password) {
        alert('Заполните все поля!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.login === login && u.password === password);
    
    if (!user) {
        alert('Неверный логин или пароль!');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    closeAuthModal();
    checkAuthStatus();
    
    // Перезагружаем карточки
    if (typeof loadUserCardsToSections === 'function') {
        document.querySelectorAll('[data-modal-target^="modal-user-"]').forEach(el => el.remove());
        document.querySelectorAll('[id^="modal-user-"]').forEach(el => el.remove());
        loadUserCardsToSections();
    }
    
    alert('Вход выполнен успешно!');
}

// Выход
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        checkAuthStatus();
        closeProfilePage();
        
        // Удаляем пользовательские карточки с главной страницы
        document.querySelectorAll('[data-modal-target^="modal-user-"]').forEach(el => el.remove());
        document.querySelectorAll('[id^="modal-user-"]').forEach(el => el.remove());
    }
}

// Загрузка профиля пользователя
function loadUserProfile(userId = null) {
    let user;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (userId) {
        // Загружаем профиль другого пользователя
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        user = users.find(u => u.id === userId);
        if (!user) return;
    } else {
        // Загружаем свой профиль
        user = currentUser;
        if (!user) return;
    }
    
    const isOwnProfile = currentUser && currentUser.id === user.id;
    
    document.getElementById('profile-nickname').textContent = user.nickname;
    document.getElementById('profile-login').textContent = '@' + user.login;
    
    // Показываем/скрываем кнопки редактирования
    document.getElementById('btn-change-avatar').style.display = isOwnProfile ? 'flex' : 'none';
    document.getElementById('btn-change-banner').style.display = isOwnProfile ? 'block' : 'none';
    document.getElementById('btn-edit-nickname').style.display = isOwnProfile ? 'inline-block' : 'none';
    document.getElementById('profile-actions-own').style.display = isOwnProfile ? 'flex' : 'none';
    document.getElementById('profile-search').style.display = isOwnProfile ? 'block' : 'none';
    document.getElementById('comment-form').style.display = currentUser ? 'block' : 'none';
    
    // Загрузка аватара
    const avatarImg = document.getElementById('profile-avatar-img');
    if (user.avatar) {
        avatarImg.src = user.avatar;
        avatarImg.style.background = 'transparent';
    } else {
        avatarImg.src = 'https://via.placeholder.com/150/0088ff/ffffff?text=' + user.nickname[0];
        avatarImg.style.background = 'var(--accent)';
    }
    
    // Загрузка баннера
    const bannerContainer = document.getElementById('profile-banner');
    let bannerMedia = document.getElementById('profile-banner-img');
    
    if (user.banner) {
        // Удаляем старый элемент если это видео
        const oldVideo = bannerContainer.querySelector('video');
        if (oldVideo) oldVideo.remove();
        
        if (user.bannerType === 'video') {
            // Скрываем img и создаем video
            if (bannerMedia) bannerMedia.style.display = 'none';
            
            let video = bannerContainer.querySelector('video');
            if (!video) {
                video = document.createElement('video');
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                bannerContainer.insertBefore(video, bannerContainer.firstChild);
            }
            video.src = user.banner;
            bannerContainer.style.background = 'transparent';
        } else {
            // Показываем img
            if (bannerMedia) {
                bannerMedia.src = user.banner;
                bannerMedia.style.display = 'block';
            }
            bannerContainer.style.background = 'transparent';
        }
    } else {
        // Если баннера нет, показываем синий градиент
        if (bannerMedia) {
            bannerMedia.src = '';
            bannerMedia.style.display = 'none';
        }
        const oldVideo = bannerContainer.querySelector('video');
        if (oldVideo) oldVideo.remove();
        bannerContainer.style.background = 'linear-gradient(135deg, var(--accent) 0%, rgba(0, 136, 255, 0.6) 100%)';
    }
    
    // Загрузка пользовательских карточек
    loadUserCardsInProfile(user);
    
    // Загрузка комментариев
    loadComments(user.id);
    
    // Инициализация поиска
    if (isOwnProfile) {
        initUserSearch();
    }
}

// Загрузка пользовательских карточек в профиле
function loadUserCardsInProfile(user) {
    const container = document.getElementById('user-cards-container');
    container.innerHTML = '';
    
    if (!user.customCards || user.customCards.length === 0) {
        container.innerHTML = '<p class="no-cards">Нет созданных карточек</p>';
        return;
    }
    
    user.customCards.forEach(card => {
        const cardEl = createProfileCardElement(card);
        container.appendChild(cardEl);
    });
}

function createProfileCardElement(card) {
    const div = document.createElement('div');
    div.className = 'user-card-item';
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOwner = currentUser && currentUser.customCards && 
                    currentUser.customCards.some(c => c.id === card.id);
    
    div.innerHTML = `
        <img src="${card.image || 'images/image.png'}" alt="${card.name}" onclick="openUserCardModal(${card.id})">
        <div class="user-card-info">
            <h4>${card.name}</h4>
            <p>${card.type === 'character' ? 'Персонаж' : card.type === 'technique' ? 'Техника' : 'Территория'}</p>
        </div>
        ${isOwner ? `
        <div class="user-card-actions">
            <button onclick="deleteCard(${card.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
        </div>
        ` : ''}
    `;
    return div;
}

function openUserCardModal(cardId) {
    // Закрываем страницу профиля перед открытием модального окна
    closeProfilePage();
    
    const modal = document.getElementById(`modal-user-${cardId}`);
    if (modal) {
        openModal(`modal-user-${cardId}`);
    }
}

// Открыть создание карточки
function openCardCreator() {
    const modal = document.getElementById('card-creator-modal');
    if (modal) {
        // Сброс формы
        document.getElementById('card-type-selector').style.display = 'block';
        document.getElementById('card-creator-form').style.display = 'none';
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Выбор типа карточки
function selectCardType(type) {
    document.getElementById('card-type-selector').style.display = 'none';
    document.getElementById('card-creator-form').style.display = 'block';
    document.getElementById('selected-card-type').value = type;
    
    // Обновление заголовка
    const titles = {
        'character': 'Создание персонажа',
        'technique': 'Создание техники',
        'domain': 'Создание территории'
    };
    document.getElementById('card-creator-title').textContent = titles[type];
}

// Предпросмотр изображения
function previewImage(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Сохранение карточки
function saveCard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const type = document.getElementById('selected-card-type').value;
    const name = document.getElementById('card-name').value.trim();
    const description = document.getElementById('card-description').value.trim();
    const color = document.getElementById('card-color').value;
    
    if (!name || !description) {
        alert('Заполните название и описание!');
        return;
    }
    
    // Получение изображений
    const cardImage = document.getElementById('card-image-preview').src;
    const modalImage = document.getElementById('modal-image-preview').src;
    
    const newCard = {
        id: Date.now(),
        type: type,
        name: name,
        description: description,
        color: color,
        image: cardImage.includes('placeholder') ? null : cardImage,
        modalImage: modalImage.includes('placeholder') ? null : modalImage,
        sections: []
    };
    
    // Добавление секций
    const sectionCount = document.querySelectorAll('.section-item').length;
    for (let i = 0; i < sectionCount; i++) {
        const title = document.getElementById(`section-title-${i}`)?.value;
        const content = document.getElementById(`section-content-${i}`)?.value;
        if (title && content) {
            newCard.sections.push({ title, content });
        }
    }
    
    // Обновление пользователя
    if (!currentUser.customCards) currentUser.customCards = [];
    currentUser.customCards.push(newCard);
    
    // Сохранение в localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    closeCardCreatorModal();
    loadUserCardsInProfile(currentUser);
    
    // Перезагружаем карточки на главной странице
    if (typeof loadUserCardsToSections === 'function') {
        // Удаляем старые пользовательские карточки
        document.querySelectorAll('[data-modal-target^="modal-user-"]').forEach(el => el.remove());
        document.querySelectorAll('[id^="modal-user-"]').forEach(el => el.remove());
        // Загружаем заново
        loadUserCardsToSections();
    }
    
    alert('Карточка успешно создана!');
}

// Добавление секции
let sectionCounter = 0;
function addSection() {
    const container = document.getElementById('sections-container');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.innerHTML = `
        <input type="text" id="section-title-${sectionCounter}" placeholder="Заголовок секции" class="form-input">
        <textarea id="section-content-${sectionCounter}" placeholder="Содержание секции" class="form-textarea"></textarea>
        <button onclick="this.parentElement.remove()" class="btn-remove-section">Удалить секцию</button>
    `;
    container.appendChild(sectionDiv);
    sectionCounter++;
}

// Удаление карточки
function deleteCard(cardId) {
    if (!confirm('Вы уверены, что хотите удалить эту карточку?')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    currentUser.customCards = currentUser.customCards.filter(c => c.id !== cardId);
    
    // Сохранение
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    loadUserCardsInProfile(currentUser);
    
    // Перезагружаем карточки на главной странице
    if (typeof loadUserCardsToSections === 'function') {
        document.querySelectorAll('[data-modal-target^="modal-user-"]').forEach(el => el.remove());
        document.querySelectorAll('[id^="modal-user-"]').forEach(el => el.remove());
        loadUserCardsToSections();
    }
}

// Изменение никнейма
function changeNickname() {
    const newNickname = prompt('Введите новый никнейм:');
    if (!newNickname || !newNickname.trim()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    currentUser.nickname = newNickname.trim();
    
    // Сохранение
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    checkAuthStatus();
    loadUserProfile();
}

// Изменение аватара
function changeAvatar() {
    document.getElementById('avatar-upload').click();
}

function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        currentUser.avatar = e.target.result;
        
        // Сохранение
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        loadUserProfile();
    };
    reader.readAsDataURL(file);
}

// Закрытие модальных окон
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function closeCardCreatorModal() {
    const modal = document.getElementById('card-creator-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Переключение между формами входа и регистрации
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Инициализация
function initAuth() {
    // Закрытие модальных окон по клику вне их
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-modal')) {
            closeAuthModal();
        }
        if (e.target.classList.contains('card-creator-modal')) {
            closeCardCreatorModal();
        }
    });
}


// ============================================
// БАННЕР ПРОФИЛЯ
// ============================================

function changeBanner() {
    document.getElementById('banner-upload').click();
}

function uploadBanner(input) {
    const file = input.files[0];
    if (!file) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentUser.banner = e.target.result;
        currentUser.bannerType = file.type.startsWith('video') ? 'video' : 'image';
        
        // Сохранение
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Перезагружаем профиль
        loadUserProfile();
    };
    reader.readAsDataURL(file);
}

// ============================================
// ПОИСК ПОЛЬЗОВАТЕЛЕЙ
// ============================================

function initUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    if (!searchInput) return;
    
    // Поиск по вводу (автодополнение)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }
        
        searchUsers(query);
    });
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim().toLowerCase();
            if (query.length >= 2) {
                searchUsers(query);
            }
        }
    });
}

function searchUsers(query) {
    if (typeof query !== 'string') {
        query = document.getElementById('user-search-input').value;
    }
    
    query = query.trim().toLowerCase();
    
    if (query.length < 2) {
        document.getElementById('search-results').innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">Введите минимум 2 символа</p>';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const results = users.filter(u => 
        u.id !== currentUser.id && 
        u.nickname.toLowerCase().includes(query)
    ).slice(0, 10);
    
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">Пользователи не найдены</p>';
        return;
    }
    
    results.forEach(user => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.onclick = () => openUserProfile(user.id);
        
        const avatar = user.avatar || `https://via.placeholder.com/40/0088ff/ffffff?text=${user.nickname[0]}`;
        
        item.innerHTML = `
            <img src="${avatar}" alt="${user.nickname}" class="search-result-avatar">
            <div class="search-result-info">
                <h4>${user.nickname}</h4>
                <p>@${user.login}</p>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function openUserProfile(userId) {
    document.getElementById('user-search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    currentCommentsPage = 1; // Сброс страницы комментариев
    loadUserProfile(userId);
}

// ============================================
// КОММЕНТАРИИ
// ============================================

let currentCommentsPage = 1;
const commentsPerPage = 5;
const maxPages = 5;

function loadComments(userId) {
    const comments = JSON.parse(localStorage.getItem('comments') || '{}');
    const userComments = comments[userId] || [];
    
    const totalPages = Math.min(Math.ceil(userComments.length / commentsPerPage), maxPages);
    const start = (currentCommentsPage - 1) * commentsPerPage;
    const end = start + commentsPerPage;
    const pageComments = userComments.slice(start, end);
    
    const container = document.getElementById('comments-list');
    container.innerHTML = '';
    
    if (pageComments.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Комментариев пока нет</p>';
    } else {
        pageComments.forEach(comment => {
            const commentEl = createCommentElement(comment, userId);
            container.appendChild(commentEl);
        });
    }
    
    // Пагинация
    renderPagination(totalPages, userId);
}

function createCommentElement(comment, profileOwnerId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const author = users.find(u => u.id === comment.authorId);
    
    if (!author) return div;
    
    const canDelete = currentUser && (currentUser.id === profileOwnerId || currentUser.id === comment.authorId);
    const avatar = author.avatar || `https://via.placeholder.com/50/0088ff/ffffff?text=${author.nickname[0]}`;
    
    const date = new Date(comment.timestamp);
    const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    
    div.innerHTML = `
        <div class="comment-header">
            <img src="${avatar}" alt="${author.nickname}" class="comment-avatar">
            <div class="comment-author-info">
                <h4>${author.nickname}</h4>
                <span class="comment-date">${dateStr}</span>
            </div>
            ${canDelete ? `<button onclick="deleteComment(${profileOwnerId}, ${comment.id})" class="btn-delete-comment">Удалить</button>` : ''}
        </div>
        <p class="comment-text">${comment.text}</p>
        ${comment.attachment ? `
            <div class="comment-attachment">
                ${comment.attachmentType === 'video' ? 
                    `<video controls src="${comment.attachment}"></video>` : 
                    `<img src="${comment.attachment}" alt="Attachment">`
                }
            </div>
        ` : ''}
    `;
    
    return div;
}

function renderPagination(totalPages, userId) {
    const container = document.getElementById('comments-pagination');
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentCommentsPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => {
            currentCommentsPage = i;
            loadComments(userId);
        };
        container.appendChild(btn);
    }
}

function postComment() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Войдите, чтобы оставить комментарий');
        return;
    }
    
    const text = document.getElementById('comment-text').value.trim();
    if (!text) {
        alert('Введите текст комментария');
        return;
    }
    
    // Получаем ID профиля, на котором оставляем комментарий
    const profileNickname = document.getElementById('profile-nickname').textContent;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const profileOwner = users.find(u => u.nickname === profileNickname);
    
    if (!profileOwner) return;
    
    const comments = JSON.parse(localStorage.getItem('comments') || '{}');
    if (!comments[profileOwner.id]) {
        comments[profileOwner.id] = [];
    }
    
    // Проверка лимита комментариев
    if (comments[profileOwner.id].length >= maxPages * commentsPerPage) {
        alert('Достигнут лимит комментариев (25 максимум)');
        return;
    }
    
    const attachmentInput = document.getElementById('comment-attachment');
    const attachment = attachmentInput.files[0];
    
    if (attachment) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveComment(profileOwner.id, text, e.target.result, attachment.type.startsWith('video') ? 'video' : 'image');
        };
        reader.readAsDataURL(attachment);
    } else {
        saveComment(profileOwner.id, text, null, null);
    }
}

function saveComment(profileOwnerId, text, attachment, attachmentType) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const comments = JSON.parse(localStorage.getItem('comments') || '{}');
    if (!comments[profileOwnerId]) {
        comments[profileOwnerId] = [];
    }
    
    const newComment = {
        id: Date.now(),
        authorId: currentUser.id,
        text: text,
        attachment: attachment,
        attachmentType: attachmentType,
        timestamp: Date.now()
    };
    
    comments[profileOwnerId].unshift(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    // Очистка формы
    document.getElementById('comment-text').value = '';
    document.getElementById('comment-attachment').value = '';
    document.getElementById('attachment-preview').innerHTML = '';
    
    // Перезагрузка комментариев
    currentCommentsPage = 1;
    loadComments(profileOwnerId);
}

function deleteComment(profileOwnerId, commentId) {
    if (!confirm('Удалить комментарий?')) return;
    
    const comments = JSON.parse(localStorage.getItem('comments') || '{}');
    if (!comments[profileOwnerId]) return;
    
    comments[profileOwnerId] = comments[profileOwnerId].filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    loadComments(profileOwnerId);
}

function previewCommentAttachment(input) {
    const file = input.files[0];
    if (!file) return;
    
    const preview = document.getElementById('attachment-preview');
    preview.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (file.type.startsWith('video')) {
            const video = document.createElement('video');
            video.src = e.target.result;
            video.controls = true;
            preview.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        }
    };
    reader.readAsDataURL(file);
}

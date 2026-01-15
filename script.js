// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен, скрипты активны');

    // ---------- ТЕМА ----------
    const savedTheme = localStorage.getItem('jk-theme') || 'blue';
    setTheme(savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // ---------- ЗАГРУЗКА ПОЛЬЗОВАТЕЛЬСКИХ КАРТОЧЕК ----------
    loadUserCardsToSections();

    // ---------- ДЕЛЕГИРОВАНИЕ КЛИКОВ ПО КАРТОЧКАМ ----------
    document.addEventListener('click', handleCardClick);

    // ---------- ССЫЛКИ НА ПЕРСОНАЖЕЙ ----------
    document.addEventListener('click', handleCharacterLinkClick);

    // ---------- СВЯЗАННЫЕ ЭЛЕМЕНТЫ В МОДАЛКАХ ----------
    document.addEventListener('click', handleRelatedLinks);

    // ---------- ЗАКРЫТИЕ МОДАЛОК ----------
    document.addEventListener('click', handleModalClose);
    document.addEventListener('keydown', handleEscape);

    // ---------- НАВИГАЦИЯ ----------
    initSmoothScroll();

    // ---------- МУЗЫКАЛЬНЫЙ ПЛЕЕР ----------
    initMusicPlayers();
});

// ============================================
// ОБРАБОТЧИКИ
// ============================================

function handleCardClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    // если это ссылка — ОТМЕНЯЕМ ПЕРЕХОД СРАЗУ
    if (card.tagName === 'A') {
        e.preventDefault();
        e.stopPropagation();
    }

    // если клик по имени персонажа — не открываем карточку
    if (e.target.closest('.character-link')) return;

    const modalId = card.getAttribute('data-modal-target');
    if (modalId) {
        openModal(modalId);
    }
}


function handleCharacterLinkClick(e) {
    const link = e.target.closest('.character-link');
    if (!link) return;

    e.preventDefault();
    e.stopPropagation();

    const targetModalId = link.getAttribute('data-target');
    if (!targetModalId) return;

    openModal(targetModalId);
}

function handleRelatedLinks(e) {
    const link = e.target.closest('.related-links a');
    if (!link) return;

    e.preventDefault();

    const targetModalId = link.getAttribute('data-modal-target');
    if (!targetModalId) return;

    openModal(targetModalId);
}

function handleModalClose(e) {
    // крестик
    if (e.target.classList.contains('modal-close')) {
        closeAllModals();
        return;
    }

    // клик по затемнению
    if (e.target.classList.contains('modal')) {
        closeAllModals();
    }
}

function handleEscape(e) {
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

// ============================================
// МОДАЛКИ
// ============================================

function openModal(modalId) {
    closeAllModals();

    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Модалка ${modalId} не найдена`);
        return;
    }

    document.body.style.overflow = 'hidden';
    modal.style.display = 'block';

    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    // Если это музыкальная модалка, инициализируем плеер
    if (modalId.includes('music')) {
        initModalMusicPlayer(modal);
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Останавливаем музыку при закрытии
        const audio = modal.querySelector('.hidden-audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    });

    document.body.style.overflow = '';
}

// ============================================
// ТЕМА
// ============================================

function toggleTheme() {
    const currentTheme = document.body.classList.contains('red-theme') ? 'red' : 'blue';
    setTheme(currentTheme === 'blue' ? 'red' : 'blue');

    const btn = document.getElementById('themeToggle');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => (btn.style.transform = 'scale(1)'), 150);
}

function setTheme(theme) {
    const body = document.body;
    const btn = document.getElementById('themeToggle');

    body.classList.remove('blue-theme', 'red-theme');

    if (theme === 'red') {
        body.classList.add('red-theme');
        btn.innerHTML = '<i class="fas fa-palette"></i> Синяя тема';
    } else {
        body.classList.add('blue-theme');
        btn.innerHTML = '<i class="fas fa-palette"></i> Красная тема';
    }

    localStorage.setItem('jk-theme', theme);

    toggleVideos(theme);
}

function toggleVideos(theme) {
    const blueVideo = document.querySelector('.blue-video');
    const redVideo = document.querySelector('.red-video');

    if (theme === 'red') {
        if (blueVideo) blueVideo.style.display = 'none';
        if (redVideo) {
            redVideo.style.display = 'block';
            redVideo.currentTime = 0;
            redVideo.play().catch(() => {});
        }
    } else {
        if (redVideo) redVideo.style.display = 'none';
        if (blueVideo) {
            blueVideo.style.display = 'block';
            blueVideo.currentTime = 0;
            blueVideo.play().catch(() => {});
        }
    }
}

// ============================================
// ПЛАВНЫЙ СКРОЛЛ
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);

            if (!target) return;

            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
}

// ============================================
// МУЗЫКАЛЬНЫЙ ПЛЕЕР
// ============================================

function initMusicPlayers() {
    // Инициализация будет происходить при открытии модалки
}

function initModalMusicPlayer(modal) {
    const audio = modal.querySelector('.hidden-audio');
    const playPauseBtn = modal.querySelector('.play-pause-btn');
    const progressBar = modal.querySelector('.progress-bar');
    const progressFill = modal.querySelector('.progress-fill');
    const progressHandle = modal.querySelector('.progress-handle');
    const currentTimeEl = modal.querySelector('.current-time');
    const totalTimeEl = modal.querySelector('.total-time');
    const volumeBar = modal.querySelector('.volume-bar');
    const volumeFill = modal.querySelector('.volume-fill');
    const volumeHandle = modal.querySelector('.volume-handle');
    const volumeIcon = modal.querySelector('.volume-icon');
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');
    const trackCover = modal.querySelector('.track-cover');

    if (!audio) return;

    let isPlaying = false;
    let currentVolume = 0.1; // 10% громкости по умолчанию
    audio.volume = currentVolume;

    // Обновляем отображение громкости
    updateVolumeDisplay();

    // Определяем текущий трек и обновляем состояние кнопок
    const currentModalId = modal.id;
    const currentTrackNumber = parseInt(currentModalId.replace('modal-music-', ''));
    updateNavigationButtons();

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
            // Убираем класс playing для скрытия визуализатора
            if (trackCover) trackCover.classList.remove('playing');
        } else {
            audio.play().catch(() => {});
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            // Добавляем класс playing для показа визуализатора
            if (trackCover) trackCover.classList.add('playing');
        }
    });

    // Обработчики событий аудио для визуализатора
    audio.addEventListener('play', () => {
        if (trackCover) trackCover.classList.add('playing');
    });

    audio.addEventListener('pause', () => {
        if (trackCover) trackCover.classList.remove('playing');
    });

    audio.addEventListener('ended', () => {
        if (trackCover) trackCover.classList.remove('playing');
    });

    // Навигация между треками
    prevBtn.addEventListener('click', () => {
        if (currentTrackNumber > 1) {
            switchToTrack(currentTrackNumber - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentTrackNumber < 6) { // У нас 6 треков
            switchToTrack(currentTrackNumber + 1);
        }
    });

    // Обновление прогресса
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    // Загрузка метаданных
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    // Клик по прогресс бару
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = clickX / rect.width;
        audio.currentTime = progress * audio.duration;
    });

    // Управление громкостью
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        currentVolume = clickX / rect.width;
        audio.volume = currentVolume;
        updateVolumeDisplay();
    });

    // Иконка громкости
    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            currentVolume = 0;
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else {
            audio.volume = 0.1; // Восстанавливаем до 10%
            currentVolume = 0.1;
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        }
        updateVolumeDisplay();
    });

    function updateVolumeDisplay() {
        const volumePercent = currentVolume * 100;
        volumeFill.style.width = volumePercent + '%';
        volumeHandle.style.left = volumePercent + '%';
        
        if (currentVolume === 0) {
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (currentVolume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }

    function updateNavigationButtons() {
        // Отключаем кнопку "назад" для первого трека
        if (currentTrackNumber === 1) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }

        // Отключаем кнопку "вперед" для последнего трека
        if (currentTrackNumber === 6) {
            nextBtn.style.opacity = '0.3';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Функция переключения между треками
function switchToTrack(trackNumber) {
    // Закрываем текущее модальное окно
    closeAllModals();
    
    // Небольшая задержка для анимации закрытия
    setTimeout(() => {
        // Открываем новое модальное окно
        const newModalId = `modal-music-${trackNumber}`;
        const newModal = document.getElementById(newModalId);
        
        if (newModal) {
            // Открываем модальное окно
            document.body.style.overflow = 'hidden';
            newModal.style.display = 'block';
            
            requestAnimationFrame(() => {
                newModal.classList.add('active');
                
                // Инициализируем плеер для нового трека
                initModalMusicPlayer(newModal);
                
                // Автоматически запускаем воспроизведение
                setTimeout(() => {
                    const audio = newModal.querySelector('.hidden-audio');
                    const playPauseBtn = newModal.querySelector('.play-pause-btn');
                    
                    if (audio && playPauseBtn) {
                        audio.play().then(() => {
                            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        }).catch(() => {
                            // Если автовоспроизведение заблокировано браузером
                            console.log('Автовоспроизведение заблокировано');
                        });
                    }
                }, 100);
            });
        }
    }, 300); // Задержка для плавного перехода
}


// ============================================
// ПОЛЬЗОВАТЕЛЬСКИЕ КАРТОЧКИ
// ============================================

function loadUserCardsToSections() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.customCards || currentUser.customCards.length === 0) {
        return;
    }

    // Группируем карточки по типам
    const cardsByType = {
        character: [],
        technique: [],
        domain: []
    };

    currentUser.customCards.forEach(card => {
        if (cardsByType[card.type]) {
            cardsByType[card.type].push(card);
        }
    });

    // Добавляем карточки в соответствующие секции
    addCardsToSection('characters', cardsByType.character);
    addCardsToSection('techniques', cardsByType.technique);
    addCardsToSection('domains', cardsByType.domain);
}

function addCardsToSection(sectionId, cards) {
    if (cards.length === 0) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    const grid = section.querySelector('.cards-grid');
    if (!grid) return;

    cards.forEach(card => {
        const cardElement = createUserCardElement(card, sectionId);
        grid.appendChild(cardElement);
        
        // Создаем модальное окно для карточки
        createUserCardModal(card, sectionId);
    });
}

function createUserCardElement(card, sectionId) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-modal-target', `modal-user-${card.id}`);
    
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-img-container';
    
    const img = document.createElement('img');
    img.src = card.image || 'images/image.png';
    img.alt = card.name;
    img.className = 'card-img';
    
    imgContainer.appendChild(img);
    
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    
    const cardName = document.createElement('h3');
    cardName.className = 'card-name';
    cardName.textContent = card.name;
    
    const cardDesc = document.createElement('p');
    cardDesc.className = 'card-description';
    cardDesc.textContent = card.description;
    
    cardInfo.appendChild(cardName);
    cardInfo.appendChild(cardDesc);
    
    cardInner.appendChild(imgContainer);
    cardInner.appendChild(cardInfo);
    cardDiv.appendChild(cardInner);
    
    return cardDiv;
}

function createUserCardModal(card, sectionId) {
    const modal = document.createElement('div');
    modal.id = `modal-user-${card.id}`;
    modal.className = 'modal';
    
    // Применяем пользовательский цвет
    modal.style.setProperty('--user-accent', card.color);
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.borderColor = card.color;
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.borderBottomColor = card.color;
    
    const title = document.createElement('h2');
    title.textContent = card.name;
    title.style.color = card.color;
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    
    modalHeader.appendChild(title);
    modalHeader.appendChild(closeBtn);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const modalHero = document.createElement('div');
    modalHero.className = 'modal-hero';
    
    const heroImg = document.createElement('img');
    heroImg.src = card.modalImage || card.image || 'images/image.png';
    heroImg.alt = card.name;
    heroImg.className = 'modal-hero-img';
    
    modalHero.appendChild(heroImg);
    modalBody.appendChild(modalHero);
    
    // Добавляем основное описание
    const mainSection = document.createElement('div');
    mainSection.className = 'info-section';
    const mainTitle = document.createElement('h3');
    mainTitle.textContent = 'Описание';
    mainTitle.style.color = card.color;
    const mainText = document.createElement('p');
    mainText.textContent = card.description;
    mainSection.appendChild(mainTitle);
    mainSection.appendChild(mainText);
    modalBody.appendChild(mainSection);
    
    // Добавляем дополнительные секции
    if (card.sections && card.sections.length > 0) {
        card.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'info-section';
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.title;
            sectionTitle.style.color = card.color;
            
            const sectionText = document.createElement('p');
            sectionText.textContent = section.content;
            
            sectionDiv.appendChild(sectionTitle);
            sectionDiv.appendChild(sectionText);
            modalBody.appendChild(sectionDiv);
        });
    }
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
}

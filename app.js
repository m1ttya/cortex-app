/**
 * CORTEX — Персональный Второй Мозг (Second Brain)
 * Логика приложения, расширяемые теги, синхронизация с файлом на диске без серверов
 */

// Ключи хранилища
const STORAGE_KEY = 'cortex_second_brain_data_v1';
const THEME_KEY = 'cortex_theme_v1';
const IDB_NAME = 'cortex_storage_db';
const IDB_STORE = 'handles';
const IDB_KEY = 'cortex_db_file_handle';
const LAST_DB_INFO_KEY = 'cortex_last_db_info_v1';
const GITHUB_CONFIG_KEY = 'cortex_github_sync_config_v1';
const NEWS_DIGEST_KEY = 'cortex_news_digest_v6';
const NEWS_SOURCES_KEY = 'cortex_news_sources_v1';
const LLM_CONFIG_KEY = 'cortex_llm_config_v1';

// ==========================================================================
// Пак иконок Apple Color Emoji (высокое разрешение 64x64)
// ==========================================================================
const APPLE_EMOJI_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/';

const APPLE_EMOJI_HEX = {
  // Системные форматы и статусы
  'read': '1f4d6',         // 📖
  'watch': '1f3ac',        // 🎬
  'study': '1f9e0',        // 🧠
  'do': '26a1',            // ⚡
  'sparkles': '2728',      // ✨
  'notes': '1f4dd',        // 📝
  'disk': '1f4be',         // 💾
  'folder': '1f4c1',       // 📁
  'inbox': '1f4e5',        // 📥
  'refresh': '1f504',      // 🔄
  'planned': '1f4cb',      // 📋
  'progress': '23f3',      // ⏳
  'done': '2705',          // ✅
  'brain': '1f9e0',        // 🧠
  'warning': '26a0-fe0f',  // ⚠️
  'star': '2b50',          // ⭐

  // Теги и категории материалов
  'книга': '1f4da',        // 📚
  'статья': '1f4c4',       // 📄
  'документация': '1f4d1', // 📑
  'лонгрид': '1f4dc',      // 📜
  'архитектура': '1f3db-fe0f', // 🏛️
  'фильм': '1f37f',        // 🍿
  'сериал': '1f4fa',       // 📺
  'аниме': '1f338',        // 🌸
  'youtube': '25b6-fe0f',  // ▶️
  'лекция': '1f393',       // 🎓
  'подкаст': '1f399-fe0f', // 🎙️
  'курс': '1f4d8',         // 📘
  'технология': '1f4bb',   // 💻
  'фреймворк': '1f9e9',    // 🧩
  'алгоритмы': '1f4d0',    // 📐
  'практика': '1f6e0-fe0f',// 🛠️
  'пет-проект': '1f680',   // 🚀
  'рефакторинг': '267b-fe0f', // ♻️
  'настройка': '2699-fe0f',// ⚙️
  'идея': '1f4a1'          // 💡
};

function getAppleEmoji(key, fallback = '', className = '') {
  if (!key) return fallback;
  const cleanKey = String(key).toLowerCase().trim();
  const hex = APPLE_EMOJI_HEX[cleanKey] || null;
  if (!hex) {
    return fallback ? `<span class="emoji-fallback">${fallback}</span>` : '';
  }
  return `<img src="${APPLE_EMOJI_BASE}${hex}.png" class="apple-emoji ${className}" alt="${fallback || key}" loading="lazy" onerror="this.replaceWith('${fallback || '•'}')">`;
}
const DEFAULT_TAGS = {
  read: ['Книга', 'Статья', 'Документация', 'Лонгрид', 'Архитектура'],
  watch: ['Фильм', 'Сериал', 'Аниме', 'YouTube', 'Лекция', 'Подкаст'],
  study: ['Курс', 'Технология', 'Фреймворк', 'Алгоритмы', 'Практика'],
  do: ['Пет-проект', 'Рефакторинг', 'Настройка', 'Идея'],
  custom: []
};

// Демонстрационные данные (для загрузки примеров по желанию)
const DEMO_ITEMS = [
  {
    id: 'item-1',
    title: 'Мартин Фаулер — Шаблоны корпоративных приложений',
    type: 'read',
    status: 'progress',
    progress: 45,
    progressNote: 'Глава 5: Data Mapper & Repository',
    priority: 'high',
    url: 'https://martinfowler.com/books/eaa.html',
    notes: 'Отличный разбор разницы между Active Record и Data Mapper. Изучить Unit of Work для транзакций.',
    rating: 0,
    tags: ['Книга', 'Архитектура'],
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'item-2',
    title: 'MIT 6.824: Distributed Systems (Консенсус Raft)',
    type: 'watch',
    status: 'progress',
    progress: 60,
    progressNote: 'Лекция 4 из 10 (Leader Election)',
    priority: 'high',
    url: 'https://pdos.csail.mit.edu/6.824/',
    notes: 'Понять алгоритм голосования кандидатов и поддержание консистентности журнала в Raft.',
    rating: 0,
    tags: ['Лекция', 'Архитектура'],
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'item-3',
    title: 'Model Context Protocol (MCP) и архитектура AI-агентов',
    type: 'study',
    status: 'planned',
    progress: 0,
    progressNote: '',
    priority: 'high',
    url: 'https://modelcontextprotocol.io',
    notes: 'Разобраться со стандартом взаимодействия LLM с локальными инструментами и контекстом.',
    rating: 0,
    tags: ['Технология', 'Практика'],
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'item-4',
    title: 'Пет-проект: интерактивный канбан-трекер фокуса',
    type: 'do',
    status: 'planned',
    progress: 0,
    progressNote: '',
    priority: 'medium',
    url: '',
    notes: 'Сделать поддержку горячих клавиш, офлайн-работу и экспорт в JSON.',
    rating: 0,
    tags: ['Пет-проект'],
    createdAt: Date.now() - 86400000
  },
  {
    id: 'item-5',
    title: 'Мартин Клеппманн — Высоконагруженные приложения (DDIA)',
    type: 'read',
    status: 'done',
    progress: 100,
    progressNote: 'Прочитано полностью',
    priority: 'high',
    url: 'https://dataintensive.net',
    notes: 'Фундаментальная книга: партиционирование данных, репликация, B-деревья vs LSM-деревья.',
    rating: 5,
    tags: ['Книга', 'Архитектура'],
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'item-6',
    title: 'Andrej Karpathy — Intro to Large Language Models',
    type: 'watch',
    status: 'done',
    progress: 100,
    progressNote: '1 час просмотр',
    priority: 'medium',
    url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    notes: 'Лучшее введение в архитектуру трансформеров, pre-training, SFT и RLHF.',
    rating: 5,
    tags: ['YouTube', 'Лекция'],
    createdAt: Date.now() - 86400000 * 8
  }
];

// Чистый стартовый массив (база пуста для сбора с нуля)
const INITIAL_ITEMS = [];

// Состояние приложения
const state = {
  items: [],
  folders: [],
  currentFolderId: null, // null — корень («Все материалы») или ID папки
  tags: {
    read: [...DEFAULT_TAGS.read],
    watch: [...DEFAULT_TAGS.watch],
    study: [...DEFAULT_TAGS.study],
    do: [...DEFAULT_TAGS.do],
    custom: []
  },
  activeFilterType: 'all',
  activeFilterStatus: 'all',
  activeFilterTag: 'all',
  searchQuery: '',
  viewMode: 'list', // 'list' | 'board'
  selectedCaptureType: 'read',
  captureSelectedTags: [],
  modalSelectedTags: [],
  theme: 'dark',
  fileHandle: null,
  isDiskConnected: false,
  hasUnsavedChanges: false,
  savingItemIds: new Map(),

  // Раздел новостей и LLM
  currentSection: 'brain', // 'brain' | 'news'
  newsItems: [],
  newsSources: [],
  activeNewsCategory: 'all',
  newsSearchQuery: '',
  newsGeneratedAt: null,
  llmConfig: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash'
  },
  _extraDbData: {} // Неизвестные верхнеуровневые свойства для 100% обратной совместимости
};

// ==========================================================================
// Инициализация
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  loadData();
  setupEventListeners();
  setupFolderEvents();
  renderCaptureTags();
  populateFolderSelects();
  renderFolderExplorer();
  renderApp();
  await tryAutoConnectDiskFile();
  if (window.githubSync) {
    await githubSync.init();
  }
  updateStorageHubUI();
  if (window.newsManager) {
    await newsManager.init();
  }

  // Восстановление активного экрана (Второй мозг или Сводка новостей)
  let initialSection = 'brain';
  const currentHash = (window.location.hash || '').toLowerCase();
  if (currentHash === '#news') {
    initialSection = 'news';
  } else if (currentHash === '#brain') {
    initialSection = 'brain';
  } else {
    try {
      const savedSection = localStorage.getItem('cortex_active_section');
      if (savedSection === 'news' || savedSection === 'brain') {
        initialSection = savedSection;
      }
    } catch (e) {}
  }
  switchSection(initialSection, true);

  window.addEventListener('hashchange', () => {
    const h = (window.location.hash || '').toLowerCase();
    if (h === '#news' && state.currentSection !== 'news') {
      switchSection('news', false);
    } else if (h === '#brain' && state.currentSection !== 'brain') {
      switchSection('brain', false);
    }
  });
});

// Коллекция тем оформления (6 выверенных темных тем + 1 светлая)
const THEMES = [
  { id: 'dark-amber', name: 'Эспрессо (Янтарь)', color: '#d89f6d' },
  { id: 'dark-emerald', name: 'Северная хвоя (Изумруд)', color: '#65a37f' },
  { id: 'dark-sapphire', name: 'Полуночный сапфир', color: '#6c9bc2' },
  { id: 'dark-amethyst', name: 'Сумеречный аметист', color: '#a882bf' },
  { id: 'dark-terracotta', name: 'Тёплая терракота', color: '#cf7363' },
  { id: 'dark-carbon', name: 'OLED Графит (Титан)', color: '#c4beb5' },
  { id: 'light', name: 'Светлый лён', color: '#ba7640' }
];

function applyTheme(themeId, notify = false) {
  if (themeId === 'dark') themeId = 'dark-amber';
  state.theme = themeId;
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem(THEME_KEY, themeId);

  // Обновление цветного индикатора на кнопке темы
  const found = THEMES.find(t => t.id === themeId);
  const indicator = document.getElementById('themeAccentIndicator');
  if (indicator && found) {
    indicator.style.background = found.color;
    indicator.style.boxShadow = `0 0 7px ${found.color}`;
  }

  // Обновление галочек в выпадающем списке
  const themeItems = document.querySelectorAll('.theme-item');
  themeItems.forEach(item => {
    const isActive = item.dataset.setTheme === themeId;
    item.classList.toggle('active', isActive);
    const check = item.querySelector('.theme-check');
    if (check) check.textContent = isActive ? '✓' : '';
  });

  if (notify && found) {
    showToast(`Тема: ${found.name}`);
  }
}

// Загрузка сохраненной темы
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark-amber';
  applyTheme(savedTheme, false);
}

// ==========================================================================
// Безопасная миграция схемы и 100% обратная совместимость базы данных
// ==========================================================================

/**
 * Валидация и безопасная миграция базы данных cortex_db.json
 * - Создает аварийный снимок базы перед изменениями
 * - Сохраняет все неизвестные верхнеуровневые ключи в state._extraDbData
 * - Сохраняет все пользовательские поля каждого объекта материала ({ ...item })
 */
function migrateDbSchema(parsed) {
  if (!parsed) {
    return {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      tags: { ...DEFAULT_TAGS, custom: [] },
      folders: [],
      items: []
    };
  }

  // Создаем аварийный снимок перед миграцией в localStorage
  try {
    localStorage.setItem('cortex_db_backup_pre_migration', JSON.stringify(parsed));
  } catch (e) {
    console.warn('Не удалось создать резервную копию перед миграцией:', e);
  }

  // Если это массив элементов
  if (Array.isArray(parsed)) {
    return {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      tags: { ...DEFAULT_TAGS, custom: [] },
      folders: [],
      items: parsed.map(sanitizeItem)
    };
  }

  // Сохраняем все неизвестные верхнеуровневые поля для 100% обратной совместимости
  const standardKeys = ['version', 'updatedAt', 'tags', 'items', 'folders'];
  state._extraDbData = {};
  for (const k of Object.keys(parsed)) {
    if (!standardKeys.includes(k)) {
      state._extraDbData[k] = parsed[k];
    }
  }

  const items = Array.isArray(parsed.items) ? parsed.items.map(sanitizeItem) : [];
  const folders = Array.isArray(parsed.folders) ? parsed.folders.map(sanitizeFolder) : [];
  const tags = {
    read: Array.from(new Set([...(DEFAULT_TAGS.read || []), ...(parsed.tags?.read || [])])),
    watch: Array.from(new Set([...(DEFAULT_TAGS.watch || []), ...(parsed.tags?.watch || [])])),
    study: Array.from(new Set([...(DEFAULT_TAGS.study || []), ...(parsed.tags?.study || [])])),
    do: Array.from(new Set([...(DEFAULT_TAGS.do || []), ...(parsed.tags?.do || [])])),
    custom: Array.from(new Set([...(parsed.tags?.custom || [])]))
  };

  return {
    version: parsed.version || '1.0',
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    tags,
    folders,
    items
  };
}

/**
 * Валидация папки: гарантирует наличие всех базовых полей
 */
function sanitizeFolder(f) {
  if (!f || typeof f !== 'object') {
    return {
      id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: 'Новая папка',
      parentId: null,
      icon: '📁',
      color: '#d89f6d',
      createdAt: Date.now()
    };
  }

  return {
    ...f,
    id: f.id || ('folder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
    name: (f.name && String(f.name).trim()) || 'Без названия',
    parentId: (f.parentId && typeof f.parentId === 'string') ? f.parentId : null,
    icon: (f.icon && String(f.icon).trim()) || '📁',
    color: f.color || '#d89f6d',
    createdAt: f.createdAt || Date.now()
  };
}

/**
 * Валидация элемента: гарантирует наличие базовых полей, сохраняя ВСЕ исходные поля объекта
 */
function sanitizeItem(item) {
  if (!item || typeof item !== 'object') {
    return {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: 'Без названия',
      type: 'read',
      status: 'planned',
      progress: 0,
      tags: [],
      folderId: null,
      createdAt: Date.now()
    };
  }

  return {
    ...item,
    id: item.id || ('item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
    title: item.title || 'Без названия',
    type: item.type || 'read',
    status: item.status || 'planned',
    progress: typeof item.progress === 'number' ? item.progress : 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    folderId: (item.folderId && typeof item.folderId === 'string') ? item.folderId : null,
    createdAt: item.createdAt || Date.now()
  };
}

// Загрузка данных из LocalStorage
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const migrated = migrateDbSchema(parsed);
      state.items = migrated.items;
      state.tags = migrated.tags;
      state.folders = migrated.folders || [];
    } else {
      state.items = [...INITIAL_ITEMS];
      state.folders = [];
      saveData();
    }
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    state.items = [...INITIAL_ITEMS];
    state.folders = [];
  }
}

// Сохранение данных (с сохранением неизвестных верхнеуровневых полей для обратной совместимости)
async function saveData() {
  try {
    const payload = {
      ...state._extraDbData,
      version: '1.0',
      updatedAt: new Date().toISOString(),
      tags: state.tags,
      folders: state.folders || [],
      items: state.items
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    updateMetrics();
    const ok = await writeToDiskFile(true);
    if (window.githubSync && githubSync.isConfigured()) {
      githubSync.debouncedPush();
    }
    return ok;
  } catch (err) {
    console.error('Ошибка сохранения данных:', err);
    showToast('Ошибка при сохранении данных', 'error');
    return false;
  }
}

// ==========================================================================
// Работа с физическим файлом на диске (File System Access API + IndexedDB)
// ==========================================================================
function openHandleDB() {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) return resolve(null);
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function getStoredFileHandle() {
  const db = await openHandleDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function storeFileHandle(handle) {
  const db = await openHandleDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(handle, IDB_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function verifyPermission(fileHandle, readWrite = true) {
  const options = {};
  if (readWrite) options.mode = 'readwrite';
  try {
    if ((await fileHandle.queryPermission(options)) === 'granted') return true;
    if ((await fileHandle.requestPermission(options)) === 'granted') return true;
  } catch {
    return false;
  }
  return false;
}

// ==========================================================================
// Ручное и автоматическое сохранение базы в файл (Ctrl+S / кнопка «Сохранить»)
// ==========================================================================
function getSaveIndicatorHtml(itemId) {
  if (!state.savingItemIds || !state.savingItemIds.has(itemId)) return '';
  const status = state.savingItemIds.get(itemId);
  if (status === 'saving') {
    return `
      <span class="item-save-badge saving" id="itemSaveBadge_${itemId}">
        <span class="save-spinner"></span>
        <span class="save-badge-text">Запись на диск...</span>
      </span>
    `;
  } else if (status === 'saved') {
    return `
      <span class="item-save-badge saved" id="itemSaveBadge_${itemId}">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#79c991" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="save-badge-text">Сохранено</span>
      </span>
    `;
  }
  return '';
}

function markUnsaved() {
  state.hasUnsavedChanges = true;
}

function markSaved(message) {
  state.hasUnsavedChanges = false;
  if (message) showToast(message);
}

async function manualSaveDatabase() {
  await saveData();
  state.hasUnsavedChanges = false;
  showToast('База данных сохранена ✓', 'success');
}

async function disconnectDiskFile() {
  state.fileHandle = null;
  state.isDiskConnected = false;
  state.linkedFileName = null;
  localStorage.removeItem(LAST_DB_INFO_KEY);
  const db = await openHandleDB();
  if (db) {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
    } catch {}
  }
  updateStorageStatusUI(false, 'cortex_db.json');
  showToast('Локальный файл отключен. Данные сохранены в браузере.');
}

function openBraveNoticeModal() {
  const modal = document.getElementById('braveNoticeModalBackdrop');
  if (modal) modal.classList.add('show');
}

function closeBraveNoticeModal() {
  const modal = document.getElementById('braveNoticeModalBackdrop');
  if (modal) modal.classList.remove('show');
}

async function tryAutoConnectDiskFile() {
  const savedInfoRaw = localStorage.getItem(LAST_DB_INFO_KEY);
  const hasOnboarded = localStorage.getItem('cortex_user_onboarded_v1');

  // 1. Для Chrome/Edge: проверяем сохраненный дескриптор в IndexedDB
  if ('showOpenFilePicker' in window) {
    try {
      const handle = await getStoredFileHandle();
      if (handle) {
        state.fileHandle = handle;
        state.linkedFileName = handle.name;
        // Читаем актуальное состояние базы с физического диска
        try {
          await readFromDiskFile(handle, false);
        } catch (readErr) {
          console.warn('Чтение при автоподключении:', readErr);
        }
        state.isDiskConnected = true;
        updateStorageStatusUI(true, state.linkedFileName);
        return;
      }
    } catch (err) {
      console.log('Восстановление дескриптора:', err);
    }
  }

  // 2. Для Brave и других браузеров: если была сохранена база ранее
  if (savedInfoRaw) {
    let savedName = 'cortex_db.json';
    try {
      const parsed = JSON.parse(savedInfoRaw);
      if (parsed && parsed.name) savedName = parsed.name;
    } catch {}
    state.isDiskConnected = true;
    state.linkedFileName = savedName;
    updateStorageStatusUI(true, savedName);
    return;
  }

  // 3. Новый пользователь: еще нет сохраненной или подключенной базы
  state.isDiskConnected = false;
  state.linkedFileName = null;
  updateStorageStatusUI(false, 'Подключить базу');

  if (!hasOnboarded) {
    setTimeout(() => {
      openWelcomeModal();
    }, 400);
  }
}

function openWelcomeModal() {
  if (window.openStorageModal) {
    window.openStorageModal();
  } else {
    const modal = document.getElementById('welcomeModalBackdrop');
    if (modal) modal.classList.add('show');
  }
}

function closeWelcomeModal() {
  const modal = document.getElementById('welcomeModalBackdrop');
  if (modal) modal.classList.remove('show');
  localStorage.setItem('cortex_user_onboarded_v1', 'true');
}

async function createNewDatabase(skipConfirm = false) {
  if (state.items.length > 0 && !skipConfirm) {
    const ok = confirm(
      'Создать новую пустую базу данных?\n\n' +
      'Все текущие материалы будут очищены для нового чистого файла базы.\n' +
      'Рекомендуется сделать резервную копию перед созданием новой базы.\n\n' +
      'Продолжить создание новой базы?'
    );
    if (!ok) return false;
  }

  const initialDb = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: JSON.parse(JSON.stringify(DEFAULT_TAGS)),
    folders: [],
    items: []
  };

  // 1. Для браузеров с поддержкой File System Access API (Chrome, Edge и др.)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'cortex_db.json',
        types: [
          {
            description: 'JSON Database (*.json)',
            accept: { 'application/json': ['.json'] }
          }
        ]
      });

      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(initialDb, null, 2));
        await writable.close();

        state.fileHandle = handle;
        state.isDiskConnected = true;
        state.linkedFileName = handle.name;
        state.items = [];
        state.folders = [];
        state.currentFolderId = null;
        state.tags = JSON.parse(JSON.stringify(DEFAULT_TAGS));

        await storeFileHandle(handle);
        localStorage.setItem(LAST_DB_INFO_KEY, JSON.stringify({
          name: handle.name,
          mode: 'filesystem-api',
          savedAt: new Date().toISOString()
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
        localStorage.setItem('cortex_user_onboarded_v1', 'true');

        updateStorageStatusUI(true, handle.name);
        renderCaptureTags();
        populateFolderSelects();
        renderFolderExplorer();
        renderApp();
        updateMetrics();
        showToast(`✨ Новая база «${handle.name}» создана и подключена!`);
        return true;
      }
    } catch (err) {
      if (err.name === 'AbortError') return false;
      console.warn('showSaveFilePicker недоступен или отклонен:', err);
    }
  }

  // 2. Фолбэк для Brave, Firefox, Safari (диалог имени + авто-скачивание файла)
  const inputName = prompt('Введите имя новой базы данных (например: cortex_db.json):', 'cortex_db.json');
  if (!inputName || !inputName.trim()) return false;
  const cleanName = inputName.trim();
  const fileName = cleanName.toLowerCase().endsWith('.json') ? cleanName : `${cleanName}.json`;

  const blob = new Blob([JSON.stringify(initialDb, null, 2)], { type: 'application/json;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  state.fileHandle = null;
  state.isDiskConnected = true;
  state.linkedFileName = fileName;
  state.items = [];
  state.folders = [];
  state.currentFolderId = null;
  state.tags = JSON.parse(JSON.stringify(DEFAULT_TAGS));

  localStorage.setItem(LAST_DB_INFO_KEY, JSON.stringify({
    name: fileName,
    mode: 'fallback-file',
    savedAt: new Date().toISOString()
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
  localStorage.setItem('cortex_user_onboarded_v1', 'true');

  updateStorageStatusUI(true, fileName);
  renderCaptureTags();
  populateFolderSelects();
  renderFolderExplorer();
  renderApp();
  updateMetrics();
  showToast(`✨ Новая база «${fileName}» создана и сохранена на ваш диск!`);
  return true;
}

async function connectDiskFile(forceNewPicker = false) {
  // Если не запрошен принудительный выбор нового файла и права просто надо подтвердить в 1 клик
  if (!forceNewPicker && state.fileHandle && !state.isDiskConnected) {
    try {
      const hasPerm = await verifyPermission(state.fileHandle, true);
      if (hasPerm) {
        state.isDiskConnected = true;
        updateStorageStatusUI(true, state.fileHandle.name);
        if (state.items.length > 0) {
          await writeToDiskFile();
        } else {
          await readFromDiskFile(state.fileHandle, true);
        }
        showToast(`✨ Связь с базой ${state.fileHandle.name} подтверждена!`);
        return;
      }
    } catch {}
  }

  if (!('showOpenFilePicker' in window)) {
    // Бесшовный фолбэк для Brave, Firefox, Safari
    const fallbackInput = document.getElementById('fallbackDiskFileInput');
    if (fallbackInput) {
      fallbackInput.click();
    } else {
      showToast('Используйте меню Данные ➔ Выбрать cortex_db.json');
    }
    return;
  }
  try {
    const pickerOpts = {
      types: [
        {
          description: 'JSON Database (*.json)',
          accept: { 'application/json': ['.json'] }
        }
      ],
      multiple: false
    };
    if (state.fileHandle) {
      pickerOpts.startIn = state.fileHandle;
    }
    const [handle] = await window.showOpenFilePicker(pickerOpts);

    if (handle) {
      const hasPerm = await verifyPermission(handle, true);
      if (hasPerm) {
        state.fileHandle = handle;
        state.isDiskConnected = true;
        state.linkedFileName = handle.name;
        await storeFileHandle(handle);
        localStorage.setItem(LAST_DB_INFO_KEY, JSON.stringify({
          name: handle.name,
          mode: 'filesystem-api',
          savedAt: new Date().toISOString()
        }));
        localStorage.setItem('cortex_user_onboarded_v1', 'true');
        updateStorageStatusUI(true, handle.name);
        await readFromDiskFile(handle, true);
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('API выбора недоступно, переключаемся на стандартный диалог:', err);
      const fallbackInput = document.getElementById('fallbackDiskFileInput');
      if (fallbackInput) fallbackInput.click();
    }
  }
}

// Обработчик стандартного выбора файла (для Brave и других браузеров)
async function handleFallbackDiskFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    if (text && text.trim()) {
      const parsed = JSON.parse(text);

      // Защита от стирания: если выбран пустой файл на диске, а в приложении уже есть записи:
      if (Array.isArray(parsed.items) && parsed.items.length === 0 && state.items.length > 0) {
        state.linkedFileName = file.name;
        downloadDatabase();
        showToast(`Файл на диске был пуст. Скачана актуальная версия с вашими записями (${state.items.length})!`);
        return;
      }

      if (parsed.items && Array.isArray(parsed.items)) {
        if (state.items.length > 0) {
          const diskIds = new Set(parsed.items.map(i => i.id));
          const unsavedLocal = state.items.filter(i => !diskIds.has(i.id));
          state.items = [...unsavedLocal, ...parsed.items];
        } else {
          state.items = parsed.items;
        }
      }
      if (parsed.folders && Array.isArray(parsed.folders)) {
        state.folders = parsed.folders.map(sanitizeFolder);
      }
      if (parsed.tags) {
        state.tags = {
          read: Array.from(new Set([...(DEFAULT_TAGS.read), ...(parsed.tags.read || [])])),
          watch: Array.from(new Set([...(DEFAULT_TAGS.watch), ...(parsed.tags.watch || [])])),
          study: Array.from(new Set([...(DEFAULT_TAGS.study), ...(parsed.tags.study || [])])),
          do: Array.from(new Set([...(DEFAULT_TAGS.do), ...(parsed.tags.do || [])])),
          custom: Array.from(new Set([...(parsed.tags.custom || [])]))
        };
      }
      state.items.forEach(i => { if (!i.tags) i.tags = []; });
      state.isDiskConnected = true;
      state.linkedFileName = file.name;
      localStorage.setItem(LAST_DB_INFO_KEY, JSON.stringify({
        name: file.name,
        mode: 'fallback',
        savedAt: new Date().toISOString()
      }));
      localStorage.setItem('cortex_user_onboarded_v1', 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state._extraDbData,
        version: '1.0',
        updatedAt: new Date().toISOString(),
        tags: state.tags,
        folders: state.folders || [],
        items: state.items
      }));
      updateStorageStatusUI(true, file.name);
      renderCaptureTags();
      populateFolderSelects();
      renderFolderExplorer();
      renderApp();
      showToast(`✨ База ${file.name} успешно загружена!`);
    }
  } catch (err) {
    console.error('Ошибка чтения выбранного файла:', err);
    showToast('Ошибка чтения JSON: ' + err.message, 'error');
  }
  e.target.value = '';
}

// Прямое скачивание актуальной базы данных cortex_db.json
function downloadDatabase() {
  try {
    const fileName = state.linkedFileName || 'cortex_db.json';
    const payload = {
      ...state._extraDbData,
      version: '1.0',
      updatedAt: new Date().toISOString(),
      tags: state.tags,
      folders: state.folders || [],
      items: state.items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    showToast(`Файл ${a.download} успешно сохранен!`);
  } catch (err) {
    console.error('Ошибка скачивания базы:', err);
    showToast('Ошибка при скачивании файла', 'error');
  }
}

async function readFromDiskFile(handle, notify = true) {
  try {
    const file = await handle.getFile();
    const text = await file.text();
    if (text && text.trim()) {
      const parsed = JSON.parse(text);

      // КЛЮЧЕВАЯ ЗАЩИТА:
      // Если выбранный файл пустой (0 записей), а в приложении уже есть записи:
      // Мы НЕ затираем текущие записи! Наоборот, мы мгновенно сохраняем их в этот файл на диск!
      if (Array.isArray(parsed.items) && parsed.items.length === 0 && state.items.length > 0) {
        state.fileHandle = handle;
        state.linkedFileName = handle.name;
        state.isDiskConnected = true;
        await writeToDiskFile();
        updateStorageStatusUI(true, handle.name);
        if (notify) {
          showToast(`✨ Текущие записи (${state.items.length}) успешно сохранены в файл ${handle.name}!`);
        }
        return;
      }

      if (parsed.items && Array.isArray(parsed.items)) {
        // Если и в файле есть записи, и в памяти есть новые записи, которых нет в файле — объединяем!
        if (state.items.length > 0) {
          const diskIds = new Set(parsed.items.map(i => i.id));
          const unsavedLocal = state.items.filter(i => !diskIds.has(i.id));
          if (unsavedLocal.length > 0) {
            state.items = [...unsavedLocal, ...parsed.items];
            state.fileHandle = handle;
            state.linkedFileName = handle.name;
            state.isDiskConnected = true;
            await writeToDiskFile();
            if (notify) {
              showToast(`✨ База синхронизирована: объединено ${state.items.length} записей!`);
            }
            return;
          }
        }
        state.items = parsed.items;
      }

      if (parsed.folders && Array.isArray(parsed.folders)) {
        state.folders = parsed.folders.map(sanitizeFolder);
      }

      if (parsed.tags) {
        state.tags = {
          read: Array.from(new Set([...(DEFAULT_TAGS.read), ...(parsed.tags.read || [])])),
          watch: Array.from(new Set([...(DEFAULT_TAGS.watch), ...(parsed.tags.watch || [])])),
          study: Array.from(new Set([...(DEFAULT_TAGS.study), ...(parsed.tags.study || [])])),
          do: Array.from(new Set([...(DEFAULT_TAGS.do), ...(parsed.tags.do || [])])),
          custom: Array.from(new Set([...(parsed.tags.custom || [])]))
        };
      }
      state.items.forEach(i => { if (!i.tags) i.tags = []; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state._extraDbData,
        version: '1.0',
        updatedAt: new Date().toISOString(),
        tags: state.tags,
        folders: state.folders || [],
        items: state.items
      }));
      state.isDiskConnected = true;
      state.linkedFileName = handle.name;
      updateStorageStatusUI(true, handle.name);
      renderCaptureTags();
      populateFolderSelects();
      renderFolderExplorer();
      renderApp();
      if (notify) {
        showToast(`Файл базы подключен: ${handle.name} (${state.items.length} записей) 🟢`);
      }
    } else if (state.items.length > 0) {
      // Файл на диске пустой (0 байт), записываем в него текущие данные приложения
      state.fileHandle = handle;
      state.linkedFileName = handle.name;
      state.isDiskConnected = true;
      await writeToDiskFile();
      updateStorageStatusUI(true, handle.name);
      if (notify) {
        showToast(`✨ Записи (${state.items.length}) записаны в файл ${handle.name}!`);
      }
    }
  } catch (err) {
    console.error('Ошибка чтения файла базы:', err);
    showToast('Ошибка чтения ' + handle.name + ': ' + err.message, 'error');
  }
}

async function writeToDiskFile(silent = true) {
  if (state.fileHandle) {
    try {
      let perm = await state.fileHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        try {
          perm = await state.fileHandle.requestPermission({ mode: 'readwrite' });
        } catch {}
      }
      if (perm === 'granted') {
        const writable = await state.fileHandle.createWritable();
        const payload = {
          version: '1.0',
          updatedAt: new Date().toISOString(),
          tags: state.tags,
          items: state.items
        };
        await writable.write(JSON.stringify(payload, null, 2));
        await writable.close();
        state.isDiskConnected = true;
        updateStorageStatusUI(true, state.fileHandle.name);
        // Запись на диск прошла успешно — гасим флаг несохраненных изменений
        state.hasUnsavedChanges = false;
        return true;
      }
    } catch (err) {
      console.warn('Автозапись на диск:', err);
    }
  }
  markUnsaved();
  return false;
}

function updateStorageHubUI(ghStatus = 'auto') {
  const btn = document.getElementById('storageHubBtn');
  const dot = document.getElementById('storageHubDot');
  const icon = document.getElementById('storageHubIcon');
  const text = document.getElementById('storageHubText');
  if (!btn || !dot || !icon || !text) return;

  const isGh = window.githubSync && githubSync.isConfigured();
  const isDisk = !!(state.isDiskConnected && state.fileHandle);
  const ghCfg = isGh ? githubSync.getConfig() : null;

  if (ghStatus === 'syncing') {
    dot.className = 'storage-hub-dot syncing';
    icon.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
    text.textContent = 'Синхронизация...';
    btn.title = 'Синхронизация с GitHub...';
    return;
  }

  if (isGh && isDisk) {
    dot.className = 'storage-hub-dot connected';
    icon.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
    const repoParts = ghCfg.repo.split('/');
    const shortRepo = repoParts[1] || repoParts[0];
    text.textContent = `GitHub: ${shortRepo}`;
    btn.title = `Синхронизация активна: GitHub (${ghCfg.repo}) + локальный диск (${state.fileHandle.name}). Автосохранение включено.`;
  } else if (isGh) {
    dot.className = 'storage-hub-dot connected';
    icon.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
    const repoParts = ghCfg.repo.split('/');
    const shortRepo = repoParts[1] || repoParts[0];
    text.textContent = `GitHub: ${shortRepo}`;
    btn.title = `Синхронизация с GitHub активна (${ghCfg.repo}). Нажмите для настроек базы.`;
  } else if (isDisk) {
    dot.className = 'storage-hub-dot connected';
    icon.innerHTML = `<img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f4c1.png" class="apple-emoji apple-emoji-sm" alt="📁">`;
    const fileName = state.fileHandle.name || state.linkedFileName || 'cortex_db.json';
    text.textContent = `Диск: ${fileName}`;
    btn.title = `Файл на диске подключен (${fileName}). Автосохранение включено.`;
  } else {
    dot.className = 'storage-hub-dot';
    icon.innerHTML = `<img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f4be.png" class="apple-emoji apple-emoji-sm" alt="💾">`;
    text.textContent = `База данных`;
    btn.title = `Нажмите, чтобы выбрать способ хранения базы: через GitHub или локально на диске.`;
  }
}

function updateStorageStatusUI(connected, text) {
  const diskCard = document.getElementById('diskStatusCard');
  const diskDot = document.getElementById('diskStatusDot');
  const diskTitle = document.getElementById('diskStatusTitle');
  const diskDesc = document.getElementById('diskStatusDesc');
  const disconnectBtn = document.getElementById('diskDisconnectBtn');
  const tabDot = document.getElementById('tabDiskActiveDot');

  const fileName = text || (state.fileHandle ? state.fileHandle.name : state.linkedFileName) || 'cortex_db.json';

  if (diskCard) diskCard.classList.toggle('connected', !!connected);
  if (diskDot) {
    diskDot.className = connected ? 'github-status-indicator connected' : 'github-status-indicator';
  }
  if (tabDot) {
    tabDot.classList.toggle('connected', !!connected);
  }
  if (diskTitle) {
    diskTitle.textContent = connected ? `Подключен файл: ${fileName}` : 'Файл на диске не выбран';
  }
  if (diskDesc) {
    diskDesc.textContent = connected
      ? `Прямая запись на диск активна. Все изменения автоматически записываются в ${fileName}.`
      : 'Выберите файл cortex_db.json на диске или создайте новый. Все изменения автоматически записываются на диск.';
  }
  if (disconnectBtn) {
    disconnectBtn.style.display = connected ? 'inline-flex' : 'none';
  }

  updateStorageHubUI();
}

// ==========================================================================
// Синхронизация с GitHub (Client-side zero-backend REST API)
// ==========================================================================

/**
 * Надежное кодирование UTF-8 строки в Base64 (поддержка кириллицы и любых Unicode символов)
 */
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

/**
 * Надежное декодирование Base64 в UTF-8 строку (с удалением переводов строк)
 */
function base64ToUtf8(b64) {
  const cleanB64 = b64.replace(/\s+/g, '');
  const bin = atob(cleanB64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Нормализация имени репозитория из URL или сырой строки
 */
function normalizeGitHubRepo(input) {
  if (!input) return '';
  let str = input.trim();
  str = str.replace(/^https?:\/\/github\.com\//i, '');
  str = str.replace(/^github\.com\//i, '');
  str = str.replace(/\.git$/i, '');
  str = str.replace(/^\/+|\/+$/g, '');
  return str;
}

/**
 * Интеллектуальное слияние локальных и удаленных данных по ID
 * При совпадении ID побеждает запись с более свежим updatedAt/createdAt
 */
function mergeDbData(localData, remoteData) {
  if (!remoteData || !Array.isArray(remoteData.items)) return localData;
  if (!localData || !Array.isArray(localData.items)) return remoteData;

  const itemMap = new Map();
  // 1. Сначала загружаем удаленные элементы
  for (const item of remoteData.items) {
    if (item && item.id) {
      itemMap.set(item.id, item);
    }
  }

  // 2. Накладываем локальные элементы с проверкой времени обновления
  for (const item of localData.items) {
    if (!item || !item.id) continue;
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, item);
    } else {
      const existing = itemMap.get(item.id);
      const localTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      const remoteTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      if (localTime >= remoteTime) {
        itemMap.set(item.id, item);
      }
    }
  }

  // 3. Слияние папок по ID
  const folderMap = new Map();
  if (Array.isArray(remoteData.folders)) {
    for (const f of remoteData.folders) {
      if (f && f.id) folderMap.set(f.id, sanitizeFolder(f));
    }
  }
  if (Array.isArray(localData.folders)) {
    for (const f of localData.folders) {
      if (!f || !f.id) continue;
      const sanitized = sanitizeFolder(f);
      if (!folderMap.has(f.id)) {
        folderMap.set(f.id, sanitized);
      } else {
        const existing = folderMap.get(f.id);
        const localTime = new Date(f.updatedAt || f.createdAt || 0).getTime();
        const remoteTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        if (localTime >= remoteTime) {
          folderMap.set(f.id, sanitized);
        }
      }
    }
  }

  // 4. Объединяем теги
  const mergedTags = {
    read: Array.from(new Set([...(DEFAULT_TAGS.read || []), ...(localData.tags?.read || []), ...(remoteData.tags?.read || [])])),
    watch: Array.from(new Set([...(DEFAULT_TAGS.watch || []), ...(localData.tags?.watch || []), ...(remoteData.tags?.watch || [])])),
    study: Array.from(new Set([...(DEFAULT_TAGS.study || []), ...(localData.tags?.study || []), ...(remoteData.tags?.study || [])])),
    do: Array.from(new Set([...(DEFAULT_TAGS.do || []), ...(localData.tags?.do || []), ...(remoteData.tags?.do || [])])),
    custom: Array.from(new Set([...(localData.tags?.custom || []), ...(remoteData.tags?.custom || [])]))
  };

  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    tags: mergedTags,
    folders: Array.from(folderMap.values()),
    items: Array.from(itemMap.values())
  };
}

const githubSync = {
  lastSha: null,
  syncTimeout: null,
  isSyncing: false,

  getConfig() {
    try {
      const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveConfig(cfg) {
    try {
      localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.error('Ошибка сохранения конфигурации GitHub:', e);
    }
  },

  clearConfig() {
    localStorage.removeItem(GITHUB_CONFIG_KEY);
    this.lastSha = null;
    this.updateUI('disconnected');
  },

  isConfigured() {
    const cfg = this.getConfig();
    return !!(cfg && cfg.token && cfg.repo);
  },

  updateUI(status = 'auto', customMsg = '') {
    const cfg = this.getConfig();
    const isConfigured = this.isConfigured();

    const headerBtn = document.getElementById('githubSyncHeaderBtn');
    const headerDot = document.getElementById('githubSyncHeaderDot');
    const headerText = document.getElementById('githubSyncHeaderText');
    const statusCard = document.getElementById('githubStatusCard');
    const statusDot = document.getElementById('githubStatusDot');
    const statusTitle = document.getElementById('githubStatusTitle');
    const statusDesc = document.getElementById('githubStatusDesc');
    const disconnectBtn = document.getElementById('ghDisconnectBtn');
    const syncNowBtn = document.getElementById('ghSyncNowBtn');
    const connectBtn = document.getElementById('ghConnectBtn');
    const tabDot = document.getElementById('tabGithubActiveDot');

    if (tabDot) tabDot.classList.toggle('connected', isConfigured);

    if (!isConfigured) {
      if (statusCard) statusCard.classList.remove('connected', 'syncing', 'error');
      if (statusDot) statusDot.className = 'github-status-indicator';
      if (statusTitle) statusTitle.textContent = 'Не подключено';
      if (statusDesc) statusDesc.textContent = 'Синхронизируйте базу cortex_db.json с вашим личным репозиторием на GitHub. Изменения сохраняются автоматически.';
      if (disconnectBtn) disconnectBtn.style.display = 'none';
      if (syncNowBtn) syncNowBtn.style.display = 'none';
      if (connectBtn) connectBtn.textContent = 'Подключить GitHub';
      updateStorageHubUI();
      return;
    }

    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
    if (syncNowBtn) syncNowBtn.style.display = 'inline-flex';
    if (connectBtn) connectBtn.textContent = 'Обновить';

    const repoName = cfg.repo || '';
    const branch = cfg.branch || 'main';
    const path = cfg.path || 'cortex_db.json';

    let lastSyncStr = '';
    if (cfg.lastSync) {
      const syncDate = new Date(cfg.lastSync);
      const isToday = syncDate.toDateString() === new Date().toDateString();
      const timeStr = syncDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      lastSyncStr = isToday ? ` • Синхр.: ${timeStr}` : ` • Синхр.: ${syncDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} ${timeStr}`;
    }

    if (status === 'syncing') {
      if (statusCard) {
        statusCard.classList.remove('connected', 'error');
        statusCard.classList.add('syncing');
      }
      if (statusDot) statusDot.className = 'github-status-indicator syncing';
      if (statusTitle) statusTitle.textContent = `Синхронизация с ${repoName}...`;
      if (statusDesc) statusDesc.textContent = customMsg || 'Отправка и получение обновлений...';
      if (syncNowBtn) syncNowBtn.disabled = true;
      updateStorageHubUI('syncing');
    } else if (status === 'error') {
      if (statusCard) {
        statusCard.classList.remove('connected', 'syncing');
        statusCard.classList.add('error');
      }
      if (statusDot) statusDot.className = 'github-status-indicator error';
      if (statusTitle) statusTitle.textContent = 'Ошибка синхронизации';
      if (statusDesc) statusDesc.textContent = customMsg || 'Проверьте токен или интернет-соединение';
      if (syncNowBtn) syncNowBtn.disabled = false;
      updateStorageHubUI('error');
    } else {
      if (statusCard) {
        statusCard.classList.remove('syncing', 'error');
        statusCard.classList.add('connected');
      }
      if (statusDot) statusDot.className = 'github-status-indicator connected';
      if (statusTitle) statusTitle.textContent = `Подключено: ${repoName}`;
      if (statusDesc) statusDesc.textContent = `Ветка: ${branch}, файл: ${path}${lastSyncStr} • Автосохранение включено`;
      if (syncNowBtn) syncNowBtn.disabled = false;
      updateStorageHubUI();
    }
  },

  async testConnection(token, repo, branch = 'main', path = 'cortex_db.json') {
    const cleanRepo = normalizeGitHubRepo(repo);
    if (!cleanRepo || !cleanRepo.includes('/')) {
      throw new Error('Укажите репозиторий в формате "username/repository"');
    }

    // 1. Проверяем доступ к репозиторию
    const repoRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (repoRes.status === 401) {
      throw new Error('Неверный Personal Access Token (401 Unauthorized)');
    }
    if (repoRes.status === 404) {
      throw new Error(`Репозиторий "${cleanRepo}" не найден или токен не имеет к нему доступа`);
    }
    if (repoRes.status === 403) {
      const data = await repoRes.json().catch(() => ({}));
      throw new Error(data.message || 'Доступ запрещен (403 Forbidden). Проверьте права токена');
    }
    if (!repoRes.ok) {
      throw new Error(`Ошибка GitHub API (${repoRes.status}): ${repoRes.statusText}`);
    }

    // 2. Проверяем ветку / файл
    const fileRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (fileRes.status === 200) {
      const fileData = await fileRes.json();
      return { ok: true, fileExists: true, sha: fileData.sha, content: fileData.content };
    } else if (fileRes.status === 404) {
      // Файл еще не создан в репозитории — создадим его при первой отправке
      return { ok: true, fileExists: false, sha: null };
    } else {
      const errData = await fileRes.json().catch(() => ({}));
      throw new Error(errData.message || `Ошибка доступа к ветке/файлу (${fileRes.status})`);
    }
  },

  async fetchRemoteFile() {
    const cfg = this.getConfig();
    if (!cfg) throw new Error('GitHub не настроен');

    const cleanRepo = normalizeGitHubRepo(cfg.repo);
    const branch = cfg.branch || 'main';
    const path = cfg.path || 'cortex_db.json';

    const res = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
      headers: {
        'Authorization': `Bearer ${cfg.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.status === 404) {
      return { exists: false, sha: null, data: null };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    this.lastSha = data.sha;
    let parsedContent = null;
    if (data.content) {
      try {
        const text = base64ToUtf8(data.content);
        parsedContent = JSON.parse(text);
      } catch (e) {
        console.warn('Не удалось распарсить JSON из репозитория:', e);
      }
    }
    return { exists: true, sha: data.sha, data: parsedContent };
  },

  async pull(notify = false) {
    const cfg = this.getConfig();
    if (!cfg || !this.isConfigured()) return false;

    try {
      this.updateUI('syncing', 'Получение данных с GitHub...');
      const remote = await this.fetchRemoteFile();

      if (!remote.exists) {
        // Файла еще нет на GitHub — отправим текущую локальную базу
        await this.push(notify);
        return true;
      }

      if (remote.data && (Array.isArray(remote.data) || (remote.data.items && Array.isArray(remote.data.items)))) {
        const remoteItems = Array.isArray(remote.data) ? remote.data : (remote.data.items || []);
        const remoteFolders = (remote.data && Array.isArray(remote.data.folders)) ? remote.data.folders : [];
        const remoteTags = remote.data.tags || null;

        const localPayload = {
          version: '1.0',
          updatedAt: new Date().toISOString(),
          tags: state.tags,
          folders: state.folders || [],
          items: state.items
        };

        const merged = mergeDbData(localPayload, {
          tags: remoteTags,
          folders: remoteFolders,
          items: remoteItems
        });

        state.items = merged.items;
        state.tags = merged.tags;
        state.folders = merged.folders || [];
        this.lastSha = remote.sha;

        // Сохраняем объединенные данные локально
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        updateMetrics();
        renderCaptureTags();
        populateFolderSelects();
        renderFolderExplorer();
        renderApp();
        await writeToDiskFile(true);

        cfg.lastSync = Date.now();
        this.saveConfig(cfg);
        this.updateUI('connected');

        if (notify) {
          showToast(`Синхронизировано: ${state.items.length} записей из GitHub`, 'success');
        }
        return true;
      }

      this.updateUI('connected');
      return true;
    } catch (err) {
      console.error('Ошибка GitHub pull:', err);
      this.updateUI('error', err.message);
      if (notify) {
        showToast(`Ошибка загрузки из GitHub: ${err.message}`, 'error');
      }
      return false;
    }
  },

  async push(notify = false) {
    const cfg = this.getConfig();
    if (!cfg || !this.isConfigured()) return false;
    if (this.isSyncing) return false;

    this.isSyncing = true;
    this.updateUI('syncing', 'Отправка изменений на GitHub...');

    try {
      const cleanRepo = normalizeGitHubRepo(cfg.repo);
      const branch = cfg.branch || 'main';
      const path = cfg.path || 'cortex_db.json';

      // Если SHA неизвестен — проверим его на сервере
      if (!this.lastSha) {
        try {
          const remote = await this.fetchRemoteFile();
          if (remote.exists) {
            this.lastSha = remote.sha;
          }
        } catch {
          // Игнорируем ошибку получения SHA перед отправкой
        }
      }

      const payload = {
        ...state._extraDbData,
        version: '1.0',
        updatedAt: new Date().toISOString(),
        tags: state.tags,
        folders: state.folders || [],
        items: state.items
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const base64Content = utf8ToBase64(jsonStr);

      const commitBody = {
        message: `sync: update ${path} [${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}]`,
        content: base64Content,
        branch: branch
      };

      if (this.lastSha) {
        commitBody.sha = this.lastSha;
      }

      let res = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfg.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
      });

      // Обработка конфликта 409 (изменения с другого устройства)
      if (res.status === 409) {
        console.warn('Конфликт версий 409 на GitHub, выполняем автоматическое слияние...');
        this.updateUI('syncing', 'Обнаружены изменения с другого устройства, слияние...');
        const remote = await this.fetchRemoteFile();
        if (remote.exists && remote.data) {
          const merged = mergeDbData({ tags: state.tags, folders: state.folders, items: state.items }, remote.data);
          state.items = merged.items;
          state.tags = merged.tags;
          state.folders = merged.folders || [];
          this.lastSha = remote.sha;

          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          updateMetrics();
          renderCaptureTags();
          populateFolderSelects();
          renderFolderExplorer();
          renderApp();
          await writeToDiskFile(true);

          // Повторная отправка объединенных данных с актуальным SHA
          const mergedBase64 = utf8ToBase64(JSON.stringify(merged, null, 2));
          res = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${encodeURIComponent(path)}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfg.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `sync: auto-merge ${path} [${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}]`,
              content: mergedBase64,
              sha: this.lastSha,
              branch: branch
            })
          });
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Ошибка HTTP ${res.status}`);
      }

      const resData = await res.json();
      if (resData.content && resData.content.sha) {
        this.lastSha = resData.content.sha;
      }

      cfg.lastSync = Date.now();
      this.saveConfig(cfg);
      this.updateUI('connected');

      if (notify) {
        showToast('База успешно сохранена в GitHub', 'success');
      }
      return true;
    } catch (err) {
      console.error('Ошибка GitHub push:', err);
      this.updateUI('error', err.message);
      if (notify) {
        showToast(`Ошибка отправки в GitHub: ${err.message}`, 'error');
      }
      return false;
    } finally {
      this.isSyncing = false;
    }
  },

  debouncedPush() {
    if (!this.isConfigured()) return;
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.push(false);
    }, 1800);
  },

  async syncNow(notify = true) {
    if (!this.isConfigured()) {
      showToast('Сначала подключите GitHub в настройках', 'warning');
      return;
    }
    try {
      this.updateUI('syncing', 'Синхронизация...');
      await this.pull(false);
      await this.push(false);
      this.updateUI('connected');
      if (notify) {
        showToast('Синхронизация с GitHub успешно завершена', 'success');
      }
    } catch (err) {
      this.updateUI('error', err.message);
      if (notify) {
        showToast(`Ошибка синхронизации: ${err.message}`, 'error');
      }
    }
  },

  async init() {
    window.githubSync = this;
    this.updateUI();
    if (this.isConfigured()) {
      // Фоновая тихая проверка обновлений при старте страницы
      this.pull(false).catch(err => {
        console.warn('Фоновая синхронизация GitHub при старте:', err);
      });
    }
  }
};
window.githubSync = githubSync;

function setupStorageModalEvents() {
  const modalBackdrop = document.getElementById('storageModalBackdrop') || document.getElementById('githubModalBackdrop');
  const hubBtn = document.getElementById('storageHubBtn') || document.getElementById('githubSyncHeaderBtn');
  const closeBtn = document.getElementById('closeStorageModalBtn') || document.getElementById('closeGithubModalBtn');
  const closeFooterBtn = document.getElementById('closeStorageModalFooterBtn');

  const tabBtnGithub = document.getElementById('tabBtnGithub');
  const tabBtnDisk = document.getElementById('tabBtnDisk');
  const tabPaneGithub = document.getElementById('tabPaneGithub');
  const tabPaneDisk = document.getElementById('tabPaneDisk');

  const toggleTokenBtn = document.getElementById('ghToggleTokenBtn');
  const tokenInput = document.getElementById('ghTokenInput');
  const repoInput = document.getElementById('ghRepoInput');
  const branchInput = document.getElementById('ghBranchInput');
  const pathInput = document.getElementById('ghPathInput');
  const connectBtn = document.getElementById('ghConnectBtn');
  const disconnectBtn = document.getElementById('ghDisconnectBtn');
  const syncNowBtn = document.getElementById('ghSyncNowBtn');

  const diskChooseFileBtn = document.getElementById('diskChooseFileBtn');
  const diskCreateFileBtn = document.getElementById('diskCreateFileBtn');
  const diskDisconnectBtn = document.getElementById('diskDisconnectBtn');

  const downloadJsonBtn = document.getElementById('storageDownloadJsonBtn');
  const importJsonBtn = document.getElementById('storageImportJsonBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearAllBtn = document.getElementById('storageClearAllBtn');

  function switchTab(tab) {
    if (tab === 'disk') {
      if (tabBtnDisk) tabBtnDisk.classList.add('active');
      if (tabBtnGithub) tabBtnGithub.classList.remove('active');
      if (tabPaneDisk) tabPaneDisk.style.display = 'block';
      if (tabPaneGithub) tabPaneGithub.style.display = 'none';
      if (connectBtn) connectBtn.style.display = 'none';
      if (syncNowBtn) syncNowBtn.style.display = 'none';
      if (disconnectBtn) disconnectBtn.style.display = 'none';
    } else {
      if (tabBtnGithub) tabBtnGithub.classList.add('active');
      if (tabBtnDisk) tabBtnDisk.classList.remove('active');
      if (tabPaneGithub) tabPaneGithub.style.display = 'block';
      if (tabPaneDisk) tabPaneDisk.style.display = 'none';
      if (connectBtn) connectBtn.style.display = 'inline-flex';
      const isGh = githubSync.isConfigured();
      if (syncNowBtn) syncNowBtn.style.display = isGh ? 'inline-flex' : 'none';
      if (disconnectBtn) disconnectBtn.style.display = isGh ? 'inline-flex' : 'none';
    }
  }

  function openStorageModal(preferredTab = 'auto') {
    const cfg = githubSync.getConfig();
    if (cfg) {
      if (tokenInput) tokenInput.value = cfg.token || '';
      if (repoInput) repoInput.value = cfg.repo || '';
      if (branchInput) branchInput.value = cfg.branch || 'main';
      if (pathInput) pathInput.value = cfg.path || 'cortex_db.json';
    } else {
      if (branchInput && !branchInput.value) branchInput.value = 'main';
      if (pathInput && !pathInput.value) pathInput.value = 'cortex_db.json';
    }

    githubSync.updateUI();
    updateStorageStatusUI(state.isDiskConnected, state.fileHandle ? state.fileHandle.name : state.linkedFileName);

    if (preferredTab === 'disk') {
      switchTab('disk');
    } else if (preferredTab === 'github') {
      switchTab('github');
    } else {
      if (state.isDiskConnected && !githubSync.isConfigured()) {
        switchTab('disk');
      } else {
        switchTab('github');
      }
    }

    if (modalBackdrop) modalBackdrop.classList.add('show');
  }

  function closeStorageModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('show');
  }

  window.openStorageModal = openStorageModal;
  window.closeStorageModal = closeStorageModal;

  if (hubBtn) hubBtn.addEventListener('click', () => openStorageModal());
  if (closeBtn) closeBtn.addEventListener('click', closeStorageModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeStorageModal);

  if (tabBtnGithub) tabBtnGithub.addEventListener('click', () => switchTab('github'));
  if (tabBtnDisk) tabBtnDisk.addEventListener('click', () => switchTab('disk'));

  if (diskChooseFileBtn) {
    diskChooseFileBtn.addEventListener('click', async () => {
      await connectDiskFile(true);
    });
  }

  if (diskCreateFileBtn) {
    diskCreateFileBtn.addEventListener('click', async () => {
      await createNewDatabase(false);
    });
  }

  if (diskDisconnectBtn) {
    diskDisconnectBtn.addEventListener('click', async () => {
      await disconnectDiskFile();
    });
  }

  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => downloadDatabase());
  }

  if (importJsonBtn && importFileInput) {
    importJsonBtn.addEventListener('click', () => importFileInput.click());
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => clearAllItems());
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeStorageModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('show')) {
      closeStorageModal();
    }
  });

  if (toggleTokenBtn && tokenInput) {
    toggleTokenBtn.addEventListener('click', () => {
      const isPassword = tokenInput.type === 'password';
      tokenInput.type = isPassword ? 'text' : 'password';
      toggleTokenBtn.textContent = isPassword ? '🔒' : '👁️';
      toggleTokenBtn.title = isPassword ? 'Скрыть токен' : 'Показать токен';
    });
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      const token = tokenInput ? tokenInput.value.trim() : '';
      const rawRepo = repoInput ? repoInput.value.trim() : '';
      const branch = (branchInput ? branchInput.value.trim() : '') || 'main';
      const path = (pathInput ? pathInput.value.trim() : '') || 'cortex_db.json';

      if (!token) {
        showToast('Пожалуйста, введите Personal Access Token', 'warning');
        if (tokenInput) tokenInput.focus();
        return;
      }

      const cleanRepo = normalizeGitHubRepo(rawRepo);
      if (!cleanRepo || !cleanRepo.includes('/')) {
        showToast('Укажите репозиторий в формате "пользователь/репозиторий"', 'warning');
        if (repoInput) repoInput.focus();
        return;
      }

      connectBtn.disabled = true;
      connectBtn.textContent = 'Проверка соединения...';

      try {
        const testRes = await githubSync.testConnection(token, cleanRepo, branch, path);
        const cfg = {
          token: token,
          repo: cleanRepo,
          branch: branch,
          path: path,
          lastSync: Date.now()
        };
        githubSync.saveConfig(cfg);
        if (testRes.sha) {
          githubSync.lastSha = testRes.sha;
        }

        showToast('GitHub успешно подключен! Синхронизация данных...', 'success');
        githubSync.updateUI('connected');

        await githubSync.syncNow(true);
      } catch (err) {
        console.error('Ошибка проверки соединения с GitHub:', err);
        showToast(`Ошибка: ${err.message}`, 'error');
        githubSync.updateUI('error', err.message);
      } finally {
        connectBtn.disabled = false;
        githubSync.updateUI();
      }
    });
  }

  if (syncNowBtn) {
    syncNowBtn.addEventListener('click', async () => {
      syncNowBtn.disabled = true;
      try {
        await githubSync.syncNow(true);
      } finally {
        syncNowBtn.disabled = false;
        githubSync.updateUI();
      }
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (confirm('Отключить синхронизацию с GitHub? Ваши данные в репозитории и локально сохранятся.')) {
        githubSync.clearConfig();
        if (tokenInput) tokenInput.value = '';
        if (repoInput) repoInput.value = '';
        githubSync.updateUI();
        showToast('Синхронизация с GitHub отключена');
      }
    });
  }
}

function setupGitHubEvents() {
  setupStorageModalEvents();
}

// ==========================================================================
// Модуль: Сводка новостей и управление источниками (RSS + Telegram + LLM)
// ==========================================================================

function switchSection(sectionId, updateHash = true) {
  state.currentSection = sectionId;

  try {
    localStorage.setItem('cortex_active_section', sectionId);
  } catch (e) {}

  if (updateHash) {
    const targetHash = sectionId === 'news' ? '#news' : '#brain';
    if (window.location.hash !== targetHash) {
      try {
        history.replaceState(null, '', targetHash);
      } catch (e) {
        window.location.hash = targetHash;
      }
    }
  }

  const brainBtn = document.getElementById('navBrainBtn');
  const newsBtn = document.getElementById('navNewsBtn');
  const brainSection = document.getElementById('brainViewSection');
  const newsSection = document.getElementById('newsViewSection');

  if (sectionId === 'news') {
    if (brainBtn) brainBtn.classList.remove('active');
    if (newsBtn) newsBtn.classList.add('active');
    if (brainSection) brainSection.style.display = 'none';
    if (newsSection) newsSection.style.display = 'block';
    if (window.newsManager) newsManager.renderNewsApp();
  } else {
    if (brainBtn) brainBtn.classList.add('active');
    if (newsBtn) newsBtn.classList.remove('active');
    if (brainSection) brainSection.style.display = 'block';
    if (newsSection) newsSection.style.display = 'none';
    renderApp();
  }
}

// ==========================================================================
// Вспомогательные функции для времени и дат в новостях
// ==========================================================================
function ruPlural(n, one, two, five) {
  const num = Math.abs(Number(n)) || 0;
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 19) return five;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return two;
  return five;
}

function formatRelativeNewsTime(publishedAt, fallbackStr = 'Свежее') {
  if (!publishedAt) return fallbackStr;
  const pubDate = new Date(publishedAt);
  if (isNaN(pubDate.getTime())) return fallbackStr;

  const now = new Date();
  const diffMs = now.getTime() - pubDate.getTime();

  if (diffMs < 60 * 1000) {
    return 'Только что';
  }

  // Меньше 1 часа
  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${mins} ${ruPlural(mins, 'минуту', 'минуты', 'минут')} назад`;
  }

  // Тот же календарный день (сегодня)
  const isToday = now.getDate() === pubDate.getDate() &&
                  now.getMonth() === pubDate.getMonth() &&
                  now.getFullYear() === pubDate.getFullYear();
  if (isToday) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${hours} ${ruPlural(hours, 'час', 'часа', 'часов')} назад`;
  }

  // Вчера
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.getDate() === pubDate.getDate() &&
                      yesterday.getMonth() === pubDate.getMonth() &&
                      yesterday.getFullYear() === pubDate.getFullYear();

  const hh = String(pubDate.getHours()).padStart(2, '0');
  const mm = String(pubDate.getMinutes()).padStart(2, '0');

  if (isYesterday) {
    return `Вчера в ${hh}:${mm}`;
  }

  // До 7 дней назад
  const monthsShort = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${pubDate.getDate()} ${monthsShort[pubDate.getMonth()]}, ${hh}:${mm}`;
}

/**
 * Форматирует точное время публикации статьи/поста (14:35, Вчера 18:20, 4 сен, 16:40)
 */
function formatNewsPublishTime(publishedAt, fallbackStr = '') {
  if (!publishedAt) return fallbackStr || 'Сегодня';
  const pubDate = new Date(publishedAt);
  if (isNaN(pubDate.getTime())) return fallbackStr || 'Сегодня';

  const now = new Date();
  const isToday = now.getDate() === pubDate.getDate() &&
                  now.getMonth() === pubDate.getMonth() &&
                  now.getFullYear() === pubDate.getFullYear();

  const hh = String(pubDate.getHours()).padStart(2, '0');
  const mm = String(pubDate.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  if (isToday) {
    return timeStr;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.getDate() === pubDate.getDate() &&
                      yesterday.getMonth() === pubDate.getMonth() &&
                      yesterday.getFullYear() === pubDate.getFullYear();

  if (isYesterday) {
    return `Вчера, ${timeStr}`;
  }

  const monthsShort = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${pubDate.getDate()} ${monthsShort[pubDate.getMonth()]}, ${timeStr}`;
}

/**
 * Форматирует относительное время последнего сбора сводки системой CORTEX
 */
function formatRelativeSyncTime(isoString) {
  let desktopText = 'Обновлено недавно';
  let mobileText = 'Недавно';

  if (isoString) {
    const syncDate = new Date(isoString);
    if (!isNaN(syncDate.getTime())) {
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - syncDate.getTime());
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);

      if (diffMin < 1) {
        desktopText = 'Обновлено только что';
        mobileText = 'Только что';
      } else if (diffMin < 60) {
        desktopText = `Обновлено ${diffMin} ${ruPlural(diffMin, 'минуту', 'минуты', 'минут')} назад`;
        mobileText = `${diffMin} мин назад`;
      } else if (diffHour < 24) {
        desktopText = `Обновлено ${diffHour} ${ruPlural(diffHour, 'час', 'часа', 'часов')} назад`;
        mobileText = `${diffHour} ч назад`;
      } else {
        const diffDays = Math.floor(diffHour / 24);
        desktopText = `Обновлено ${diffDays} ${ruPlural(diffDays, 'день', 'дня', 'дней')} назад`;
        mobileText = `${diffDays} дн назад`;
      }
    }
  }

  return `<span class="sync-text-desktop">${escapeHtml(desktopText)}</span><span class="sync-text-mobile">${escapeHtml(mobileText)}</span>`;
}

function getDayGroupInfo(publishedAt) {
  if (!publishedAt) {
    return { key: 'today', title: '🌟 Сегодня' };
  }
  const d = new Date(publishedAt);
  if (isNaN(d.getTime())) {
    return { key: 'today', title: '🌟 Сегодня' };
  }

  const now = new Date();
  const isToday = now.getDate() === d.getDate() &&
                  now.getMonth() === d.getMonth() &&
                  now.getFullYear() === d.getFullYear();

  const monthsFull = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const weekdays = [
    'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'
  ];

  if (isToday) {
    return {
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      title: `🌟 Сегодня, ${d.getDate()} ${monthsFull[d.getMonth()]}`
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.getDate() === d.getDate() &&
                      yesterday.getMonth() === d.getMonth() &&
                      yesterday.getFullYear() === d.getFullYear();

  if (isYesterday) {
    return {
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      title: `📅 Вчера, ${d.getDate()} ${monthsFull[d.getMonth()]}`
    };
  }

  return {
    key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    title: `🗓️ ${d.getDate()} ${monthsFull[d.getMonth()]}, ${weekdays[d.getDay()]}`
  };
}

const newsManager = {
  defaultSources: [
    { id: 'rbc-main', name: 'РБК', type: 'rss', url: 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss', category: 'main', enabled: true },
    { id: 'kommersant-news', name: 'Коммерсантъ', type: 'rss', url: 'https://www.kommersant.ru/RSS/news.xml', category: 'russia', enabled: true },
    { id: 'tass-main', name: 'ТАСС', type: 'rss', url: 'https://tass.ru/rss/v2.xml', category: 'russia', enabled: true },
    { id: 'habr-tech', name: 'Хабр', type: 'rss', url: 'https://habr.com/ru/rss/all/all/', category: 'tech', enabled: true },
    { id: '3dnews-tech', name: '3DNews', type: 'rss', url: 'https://3dnews.ru/news/rss/', category: 'tech', enabled: true },
    { id: 'tg-durov', name: "Durov's Channel", type: 'telegram', url: 'durov', category: 'tech', enabled: true },
    { id: 'tg-mash', name: 'Mash', type: 'telegram', url: 'mash', category: 'main', enabled: true },
    { id: 'tg-rian', name: 'РИА Новости', type: 'telegram', url: 'rian_ru', category: 'russia', enabled: true }
  ],

  async loadSources() {
    let savedPrefs = {};
    try {
      const stored = localStorage.getItem(NEWS_SOURCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(s => { if (s && s.id) savedPrefs[s.id] = s.enabled; });
        }
      }
    } catch (e) {
      console.warn('Ошибка чтения источников из localStorage:', e);
    }

    // Пробуем подгрузить скомпилированный news_sources.json
    let list = [...this.defaultSources];
    try {
      const res = await fetch('news_sources.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.sources) && data.sources.length > 0) {
          list = data.sources;
        }
      }
    } catch (err) {
      // Игнорируем сетевые ошибки, оставаясь на defaultSources
    }

    state.newsSources = list.map(s => ({
      ...s,
      enabled: savedPrefs[s.id] !== undefined ? savedPrefs[s.id] : (s.enabled !== false)
    }));
  },

  saveSources() {
    try {
      localStorage.setItem(NEWS_SOURCES_KEY, JSON.stringify(state.newsSources));
    } catch (e) {
      console.error('Ошибка сохранения источников:', e);
    }
  },

  loadLlmConfig() {
    try {
      const stored = localStorage.getItem(LLM_CONFIG_KEY);
      if (stored) {
        state.llmConfig = JSON.parse(stored);
        return;
      }
    } catch (e) {
      console.warn('Ошибка чтения LLM config:', e);
    }
    state.llmConfig = {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash'
    };
  },

  saveLlmConfig(cfg) {
    state.llmConfig = { ...state.llmConfig, ...cfg };
    try {
      localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(state.llmConfig));
    } catch (e) {
      console.error('Ошибка сохранения LLM config:', e);
    }
  },

  async loadDigest() {
    // 1. Сначала подгружаем из кэша
    try {
      const cached = localStorage.getItem(NEWS_DIGEST_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.items)) {
          state.newsItems = parsed.items;
          this.updateDigestMeta(parsed);
        }
      }
    } catch (e) {
      console.warn('Ошибка кэша новостей:', e);
    }

    // 2. Пробуем получить свежий news_digest.json
    try {
      const res = await fetch('news_digest.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          state.newsItems = data.items;
          this.updateDigestMeta(data);
          localStorage.setItem(NEWS_DIGEST_KEY, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.info('Загрузка локального news_digest.json завершилась с фолбэком:', e.message);
    }

    // Ротация: фильтрация новостей старше 7 дней
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();
    if (Array.isArray(state.newsItems)) {
      state.newsItems = state.newsItems.filter(it => {
        if (!it.publishedAt) return true;
        const pt = new Date(it.publishedAt).getTime();
        return isNaN(pt) || (nowTime - pt) <= maxAgeMs;
      });
    }

    // Если кэша нет и fetch недоступен, подставляем стартовый демонстрационный срез
    if (!state.newsItems || state.newsItems.length === 0) {
      state.newsItems = [
        {
          id: 'digest-demo-1',
          category: 'main',
          categoryName: 'Главное',
          title: 'Президент Аргентины пригрозил санкциями компаниям на Фолклендах',
          tldr: [
            'Президент Аргентины Хавьер Милей объявил о введении жестких санкций против иностранных корпораций, ведущих добычу на шельфе Фолклендских островов без согласия Буэнос-Айреса.',
            'Указ предусматривает арест счетов, запрет на любые коммерческие операции в стране и лишение лицензий на шельфовые проекты.'
          ],
          importance: 'high',
          publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          sources: [
            { name: 'РБК', url: 'https://www.rbc.ru/rbcfreenews/6a9abdba5c85bd2adebcdc93', type: 'rss' },
            { name: 'Коммерсантъ', url: 'https://www.kommersant.ru/doc/6938210', type: 'rss' }
          ]
        },
        {
          id: 'digest-demo-2',
          category: 'tech',
          categoryName: 'Технологии',
          title: 'Релиз архитектуры DeepSeek-V3 и новые методы оптимизации внимания',
          tldr: [
            'Инженеры представили открытую модель MoE на 671 млрд параметров со сжатием скрытых представлений внимания (MLA), снижающим объем кэша KV в несколько раз.',
            'Бенчмарки демонстрируют паритет с коммерческими проприетарными сетями при существенном снижении затрат на обучение и инференс.'
          ],
          importance: 'high',
          publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
          sources: [
            { name: 'Хабр', url: 'https://habr.com/ru/articles/869408/', type: 'rss' },
            { name: 'Telegram Info', url: 'https://t.me/tginfo/4112', type: 'telegram' }
          ]
        },
        {
          id: 'digest-demo-3',
          category: 'telegram',
          categoryName: 'Telegram',
          title: 'Telegram расширил платформу мини-приложений и монетизацию для авторов',
          tldr: [
            'Добавлены новые API для полноэкранного режима, доступа к аппаратному виброотклику и бесшовных платежей через Face ID / Touch ID.',
            'Каналы получили расширенные инструменты аналитики аудитории и монетизации цифровых товаров за внутреннюю валюту Stars.'
          ],
          importance: 'medium',
          publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          sources: [
            { name: "Durov's Channel", url: 'https://t.me/durov/342', type: 'telegram' }
          ]
        }
      ];
    }

    this.renderNewsApp();
  },

  updateDigestMeta(data) {
    if (data && data.generatedAt) {
      state.newsGeneratedAt = data.generatedAt;
    }
    const badge = document.getElementById('newsCountBadge');
    if (badge) {
      badge.textContent = state.newsItems.length || 0;
    }
    this.renderSyncStatus();
  },

  renderSyncStatus() {
    const syncText = document.getElementById('newsSyncTimeText');
    const syncStatus = document.getElementById('newsSyncStatus');
    if (!syncText) return;

    if (!state.newsGeneratedAt) {
      syncText.innerHTML = '<span class="sync-text-desktop">Обновлено недавно</span><span class="sync-text-mobile">Недавно</span>';
      return;
    }

    syncText.innerHTML = formatRelativeSyncTime(state.newsGeneratedAt);

    const genDate = new Date(state.newsGeneratedAt);
    if (!isNaN(genDate.getTime()) && syncStatus) {
      syncStatus.title = `Время последнего обновления данных: ${genDate.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`;
    }
  },

  renderNewsApp() {
    const container = document.getElementById('newsDigestGrid');
    const emptyState = document.getElementById('newsEmptyState');
    if (!container) return;

    let items = state.newsItems || [];

    // Ротация: не показывать новости старше 7 дней
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();
    items = items.filter(it => {
      if (!it.publishedAt) return true;
      const pt = new Date(it.publishedAt).getTime();
      return isNaN(pt) || (nowTime - pt) <= maxAgeMs;
    });

    // Фильтр по активным источникам пользователя (чекбоксы в модальном окне)
    const enabledSources = new Set(
      (state.newsSources || []).filter(s => s.enabled).map(s => s.name.trim().toLowerCase())
    );
    if (enabledSources.size < (state.newsSources || []).length) {
      items = items.filter(it => {
        if (!Array.isArray(it.sources) || it.sources.length === 0) return true;
        return it.sources.some(s => enabledSources.has(s.name.trim().toLowerCase()));
      });
    }

    // Фильтр по выбранной категории
    if (state.activeNewsCategory && state.activeNewsCategory !== 'all') {
      items = items.filter(it => it.category === state.activeNewsCategory);
    }

    // Фильтр по поисковой строке
    if (state.newsSearchQuery) {
      const q = state.newsSearchQuery.toLowerCase().trim();
      items = items.filter(it => {
        const titleMatch = (it.title || '').toLowerCase().includes(q);
        const tldrMatch = Array.isArray(it.tldr) && it.tldr.some(t => t.toLowerCase().includes(q));
        const srcMatch = Array.isArray(it.sources) && it.sources.some(s => s.name.toLowerCase().includes(q));
        return titleMatch || tldrMatch || srcMatch;
      });
    }

    const badge = document.getElementById('newsCountBadge');
    if (badge) badge.textContent = items.length || 0;

    if (items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Группировка новостей по дням
    const dayGroups = [];
    const groupMap = new Map();

    items.forEach(item => {
      const dayInfo = getDayGroupInfo(item.publishedAt);
      if (!groupMap.has(dayInfo.key)) {
        const groupObj = { ...dayInfo, items: [] };
        groupMap.set(dayInfo.key, groupObj);
        dayGroups.push(groupObj);
      }
      groupMap.get(dayInfo.key).items.push(item);
    });

    const tgIconSvg = `<svg class="tg-svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" style="vertical-align: -2px; margin-right: 3px; display: inline-block;"><circle cx="12" cy="12" r="12" fill="#24A1DE"/><path fill="#fff" d="M5.41 12.08L16.27 7.5c.5-.2.96.12.8.68l-1.85 8.72c-.14.63-.51.78-1.04.49l-2.82-2.08-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.88 5.24-4.73c.23-.2-.05-.32-.36-.11l-6.48 4.08-2.8-.87c-.61-.19-.62-.61.13-.9z"/></svg>`;

    const categoryNames = {
      main: '🔥 Главное',
      russia: '🇷🇺 Россия',
      city: '🏙️ Город',
      world: '🌍 Мир',
      tech: '⚡ Технологии',
      telegram: 'Telegram'
    };

    container.innerHTML = dayGroups.map(group => {
      const countLabel = `${group.items.length} ${ruPlural(group.items.length, 'новость', 'новости', 'новостей')}`;
      const dividerHtml = `
        <div class="news-day-divider">
          <div class="news-day-title-wrap">
            <span class="news-day-title">${escapeHtml(group.title)}</span>
            <span class="news-day-count">${countLabel}</span>
          </div>
          <div class="news-day-line"></div>
        </div>
      `;

      const cardsHtml = group.items.map(item => {
        const isTgCategory = item.category === 'telegram';
        const catLabel = categoryNames[item.category] || item.categoryName || 'Новость';
        const catBadgeHtml = isTgCategory
          ? `<span class="news-cat-badge">${tgIconSvg}Telegram</span>`
          : `<span class="news-cat-badge">${escapeHtml(catLabel)}</span>`;
        const timeStr = formatNewsPublishTime(item.publishedAt, item.time || '');
        const tldrHtml = Array.isArray(item.tldr)
          ? item.tldr.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')
          : `<li>${escapeHtml(item.text || '')}</li>`;

        const sourcesHtml = Array.isArray(item.sources)
          ? item.sources.map(src => {
              const isTg = src.type === 'telegram';
              const iconHtml = isTg ? tgIconSvg : '📰 ';
              let targetUrl = src.url || '#';
              if (isTg && !targetUrl.startsWith('http')) {
                targetUrl = `https://t.me/${targetUrl.replace('@', '')}`;
              }
              const postMatch = targetUrl.match(/t\.me\/[^/]+\/(\d+)/);
              const postLabel = postMatch ? ` #${postMatch[1]}` : '';
              const tooltipTitle = postMatch
                ? `Открыть пост #${postMatch[1]} в Telegram-канале ${escapeHtml(src.name)}`
                : `Открыть первоисточник: ${escapeHtml(src.name)}`;

              return `<a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="news-source-chip" title="${tooltipTitle}">
                <span>${iconHtml}${escapeHtml(src.name)}${postLabel ? `<span class="source-post-num">${postLabel}</span>` : ''}</span>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>`;
            }).join('')
          : '';

        const exactTimeFormatted = item.publishedAt
          ? `Опубликовано: ${new Date(item.publishedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
          : 'Время публикации';

        return `
          <article class="news-card" data-news-id="${escapeHtml(item.id)}">
            <div class="news-card-header">
              ${catBadgeHtml}
              <span class="news-time" title="${escapeHtml(exactTimeFormatted)}">${escapeHtml(timeStr)}</span>
            </div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <ul class="news-tldr-list">
              ${tldrHtml}
            </ul>
            <div class="news-card-footer">
              <div class="news-sources-group">
                ${sourcesHtml}
              </div>
              <div class="news-card-actions">
                <button type="button" class="btn-save-to-brain" onclick="newsManager.saveToBrain('${escapeHtml(item.id)}')" title="Сохранить эту выжимку в личную базу знаний">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>В базу знаний</span>
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      return dividerHtml + cardsHtml;
    }).join('');

    // Подключаем плавную горизонтальную прокрутку колесиком и свайп для чипов источников
    container.querySelectorAll('.news-sources-group').forEach(group => {
      enableSmoothHorizontalScroll(group);
    });
  },

  async saveToBrain(newsId) {
    const item = (state.newsItems || []).find(n => n.id === newsId);
    if (!item) return;

    const primaryUrl = (item.sources && item.sources[0]) ? item.sources[0].url : '';
    const bulletsText = Array.isArray(item.tldr) ? item.tldr.map(b => '• ' + b).join('\n') : (item.text || '');
    const sourcesText = Array.isArray(item.sources)
      ? item.sources.map(s => `• ${s.name}: ${s.url}`).join('\n')
      : '';
    const categoryName = item.categoryName || 'Новость';

    const newItem = {
      id: 'item-' + Date.now(),
      title: item.title,
      type: 'read',
      status: 'planned',
      progress: 0,
      priority: item.importance === 'high' ? 'high' : 'medium',
      url: primaryUrl,
      notes: `⚡ Ключевые тезисы из сводки:\n${bulletsText}\n\n🔗 Источники:\n${sourcesText}`,
      tags: ['Новость', categoryName],
      createdAt: Date.now()
    };

    state.items.unshift(newItem);
    await saveData();
    renderApp();
    showToast(`Материал сохранен в базу знаний!`, 'success');
  },

  async init() {
    window.newsManager = this;
    await this.loadSources();
    this.loadLlmConfig();
    await this.loadDigest();
  }
};
window.newsManager = newsManager;

function setupNewsEvents() {
  const brainBtn = document.getElementById('navBrainBtn');
  const newsBtn = document.getElementById('navNewsBtn');
  if (brainBtn) brainBtn.addEventListener('click', () => switchSection('brain'));
  if (newsBtn) newsBtn.addEventListener('click', () => switchSection('news'));

  // Переключение категорий новостей
  const catPills = document.getElementById('newsCategoryPills');
  if (catPills) {
    catPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      catPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeNewsCategory = btn.dataset.category || 'all';
      newsManager.renderNewsApp();
    });
    enableSmoothHorizontalScroll(catPills);
  }

  // Поиск по новостям
  const searchInput = document.getElementById('newsSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.newsSearchQuery = e.target.value;
      newsManager.renderNewsApp();
    });
  }


  // Модальное окно настройки источников новостей
  const settingsModal = document.getElementById('newsSettingsModalBackdrop');
  const openSettingsBtn = document.getElementById('newsSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeNewsSettingsModalBtn');
  const closeFooterBtn = document.getElementById('closeNewsSettingsFooterBtn');

  function openSettingsModal() {
    renderSourcesManager();
    if (settingsModal) settingsModal.classList.add('show');
  }

  function closeSettingsModal() {
    if (settingsModal) settingsModal.classList.remove('show');
  }

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettingsModal);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeSettingsModal);
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }

  // Быстрое включение/отключение всех источников
  const selectAllBtn = document.getElementById('selectAllSourcesBtn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      (state.newsSources || []).forEach(s => s.enabled = true);
      newsManager.saveSources();
      renderSourcesManager();
      newsManager.renderNewsApp();
      showToast('Все источники включены', 'info');
    });
  }

  const deselectAllBtn = document.getElementById('deselectAllSourcesBtn');
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      (state.newsSources || []).forEach(s => s.enabled = false);
      newsManager.saveSources();
      renderSourcesManager();
      newsManager.renderNewsApp();
      showToast('Все источники отключены', 'info');
    });
  }

  // Периодическое обновление относительного времени генерации дайджеста каждые 30 секунд
  setInterval(() => {
    if (window.newsManager && typeof window.newsManager.renderSyncStatus === 'function') {
      window.newsManager.renderSyncStatus();
    }
  }, 30000);
}

function renderSourcesManager() {
  const container = document.getElementById('sourcesListContainer');
  const countBadge = document.getElementById('sourcesCountBadge');
  if (!container) return;

  const sources = state.newsSources || [];
  const activeCount = sources.filter(s => s.enabled).length;
  if (countBadge) countBadge.textContent = `${activeCount} активных из ${sources.length}`;

  if (sources.length === 0) {
    container.innerHTML = '<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">Источников пока нет.</div>';
    return;
  }

  container.innerHTML = sources.map((s) => {
    const icon = s.type === 'telegram'
      ? `<svg class="tg-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" style="vertical-align: -3px;"><circle cx="12" cy="12" r="12" fill="#24A1DE"/><path fill="#fff" d="M5.41 12.08L16.27 7.5c.5-.2.96.12.8.68l-1.85 8.72c-.14.63-.51.78-1.04.49l-2.82-2.08-1.36 1.31c-.15.15-.28.28-.57.28l.2-2.88 5.24-4.73c.23-.2-.05-.32-.36-.11l-6.48 4.08-2.8-.87c-.61-.19-.62-.61.13-.9z"/></svg>`
      : '📰';
    const isChecked = s.enabled ? 'checked' : '';

    return `
      <div class="source-item-row" data-source-id="${escapeHtml(s.id)}">
        <div class="source-item-info">
          <span class="source-item-icon">${icon}</span>
          <span class="source-item-name" title="${escapeHtml(s.url)}">${escapeHtml(s.name)}</span>
          <span class="source-item-tag">${escapeHtml(s.category)}</span>
        </div>
        <div class="source-item-actions">
          <label style="margin: 0; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text-muted);">
            <input type="checkbox" ${isChecked} onchange="toggleSourceEnabled('${escapeHtml(s.id)}', this.checked)">
            <span>Вкл</span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSourceEnabled(sourceId, enabled) {
  const s = (state.newsSources || []).find(src => src.id === sourceId);
  if (s) {
    s.enabled = enabled;
    newsManager.saveSources();
    renderSourcesManager();
    newsManager.renderNewsApp();
  }
}
window.toggleSourceEnabled = toggleSourceEnabled;

// ==========================================================================
// Настройка обработчиков событий
// ==========================================================================
function setupEventListeners() {
  // Выпадающее меню выбора тем оформления
  const themeMenuBtn = document.getElementById('themeMenuBtn');
  const themeMenu = document.getElementById('themeMenu');

  if (themeMenuBtn && themeMenu) {
    themeMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    themeMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.theme-item');
      if (!item) return;
      const themeId = item.dataset.setTheme;
      if (themeId) {
        applyTheme(themeId, true);
        themeMenu.classList.remove('show');
      }
    });

    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeMenuBtn) {
        themeMenu.classList.remove('show');
      }
    });
  }

  // Горячая клавиша Ctrl+S / Cmd+S для быстрого сохранения
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      manualSaveDatabase();
    }
  });

  // Предупреждение о несохраненных данных при закрытии вкладки
  window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Модальное окно подсказки для Brave
  const closeBraveNoticeBtn = document.getElementById('closeBraveNoticeModalBtn');
  const braveNoticeOkBtn = document.getElementById('braveNoticeOkBtn');
  const braveDownloadBackupBtn = document.getElementById('braveDownloadBackupBtn');
  const braveModalBackdrop = document.getElementById('braveNoticeModalBackdrop');

  if (closeBraveNoticeBtn) closeBraveNoticeBtn.addEventListener('click', closeBraveNoticeModal);
  if (braveNoticeOkBtn) braveNoticeOkBtn.addEventListener('click', closeBraveNoticeModal);
  if (braveModalBackdrop) {
    braveModalBackdrop.addEventListener('click', (e) => {
      if (e.target === braveModalBackdrop) closeBraveNoticeModal();
    });
  }
  if (braveDownloadBackupBtn) {
    braveDownloadBackupBtn.addEventListener('click', () => {
      closeBraveNoticeModal();
      downloadDatabase();
    });
  }

  // Фолбэк-инпут выбора файла
  const fallbackDiskFileInput = document.getElementById('fallbackDiskFileInput');
  if (fallbackDiskFileInput) {
    fallbackDiskFileInput.addEventListener('change', handleFallbackDiskFile);
  }

  // Онбординг / Приветственное окно
  const welcomeModalBackdrop = document.getElementById('welcomeModalBackdrop');
  const welcomeCreateNewBtn = document.getElementById('welcomeCreateNewBtn');
  const welcomeChooseExistingBtn = document.getElementById('welcomeChooseExistingBtn');
  const welcomeSkipBtn = document.getElementById('welcomeSkipBtn');
  const closeWelcomeModalBtn = document.getElementById('closeWelcomeModalBtn');

  if (welcomeCreateNewBtn) {
    welcomeCreateNewBtn.addEventListener('click', () => {
      closeWelcomeModal();
      createNewDatabase(true);
    });
  }
  if (welcomeChooseExistingBtn) {
    welcomeChooseExistingBtn.addEventListener('click', () => {
      closeWelcomeModal();
      connectDiskFile(true);
    });
  }
  if (welcomeSkipBtn) {
    welcomeSkipBtn.addEventListener('click', () => {
      closeWelcomeModal();
      showToast('💡 Вы можете настроить базу в любой момент по кнопке «База данных»');
    });
  }
  if (closeWelcomeModalBtn) {
    closeWelcomeModalBtn.addEventListener('click', closeWelcomeModal);
  }
  if (welcomeModalBackdrop) {
    welcomeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === welcomeModalBackdrop) closeWelcomeModal();
    });
  }

  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', importData);
  }
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) exportDataBtn.addEventListener('click', exportData);
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllItems);
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', resetToDemo);
  }

  // Быстрый захват: выбор формата (сегментированные кнопки)
  const captureTypeGroup = document.getElementById('captureTypeGroup');
  captureTypeGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    captureTypeGroup.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedCaptureType = btn.dataset.type;
    renderCaptureTags();
  });

  // Ввод своего тега в быстром захвате
  const quickCustomTagInput = document.getElementById('quickCustomTagInput');
  if (quickCustomTagInput) {
    quickCustomTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = quickCustomTagInput.value.trim().replace(/^#/, '');
        if (!val) return;
        addTagToCapture(val);
        quickCustomTagInput.value = '';
      }
    });
  }

  // Быстрый захват: форма
  const quickCaptureForm = document.getElementById('quickCaptureForm');
  quickCaptureForm.addEventListener('submit', handleQuickCapture);

  // Очистка ввода быстрого захвата
  const quickTitleInput = document.getElementById('quickTitleInput');
  const clearQuickInputBtn = document.getElementById('clearQuickInputBtn');
  quickTitleInput.addEventListener('input', () => {
    clearQuickInputBtn.style.display = quickTitleInput.value.trim() ? 'block' : 'none';
  });
  clearQuickInputBtn.addEventListener('click', () => {
    quickTitleInput.value = '';
    clearQuickInputBtn.style.display = 'none';
    quickTitleInput.focus();
  });

  // Поиск
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderApp();
  });

  // Горячая клавиша / для поиска
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Фильтр по типам
  const typeFilterPills = document.getElementById('typeFilterPills');
  typeFilterPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn) return;
    typeFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeFilterType = btn.dataset.filterType;
    renderApp();
  });

  // Фильтр по статусу (в режиме списка)
  const statusFilterPills = document.getElementById('statusFilterPills');
  statusFilterPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn) return;
    statusFilterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeFilterStatus = btn.dataset.filterStatus;
    renderApp();
  });

  // Фильтр по тегам
  const tagFilterPills = document.getElementById('tagFilterPills');
  if (tagFilterPills) {
    tagFilterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      const clicked = btn.dataset.filterTag;
      state.activeFilterTag = (state.activeFilterTag === clicked && clicked !== 'all') ? 'all' : clicked;
      renderApp();
    });
  }

  // Переключение вида (Список / Канбан)
  const viewModeSwitch = document.getElementById('viewModeSwitch');
  viewModeSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    viewModeSwitch.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.viewMode = btn.dataset.view;
    renderApp();
  });

  // Сброс фильтров в empty state
  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    state.activeFilterType = 'all';
    state.activeFilterStatus = 'all';
    state.activeFilterTag = 'all';
    state.searchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('.filter-pills .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filterType === 'all' || b.dataset.filterStatus === 'all' || b.dataset.filterTag === 'all');
    });
    renderApp();
  });

  // Модальное окно редактирования
  setupModalEvents();

  // Настройка Drag and Drop для канбана
  setupDragAndDrop();

  // Настройка синхронизации с GitHub
  setupGitHubEvents();

  // Настройка модуля новостей и LLM-суммаризации
  setupNewsEvents();

  // Плавная прокрутка тегов и фильтров колесиком мыши и свайпом без скроллбаров
  enableSmoothHorizontalScroll(document.getElementById('tagFilterPills'));
  enableSmoothHorizontalScroll(document.getElementById('typeFilterPills'));
  enableSmoothHorizontalScroll(document.getElementById('statusFilterPills'));
  enableSmoothHorizontalScroll(document.getElementById('captureTagsChips'));
  enableSmoothHorizontalScroll(document.getElementById('captureTypeGroup'));

  // Слушатели для Virtual Scrolling (высокопроизводительный виртуальный список)
  window.addEventListener('scroll', onVirtualScrollWindow, { passive: true });
  window.addEventListener('resize', onVirtualScrollResize, { passive: true });
}

/**
 * Включает горизонтальную прокрутку колесиком мыши (с плавным ходом)
 * и drag-to-scroll свайп мышью / тачем без отображения скроллбаров
 */
function enableSmoothHorizontalScroll(el) {
  if (!el) return;

  // 1. Прокрутка колесиком мыши (конвертация вертикального движения в горизонтальное при наличии переполнения)
  el.addEventListener('wheel', (e) => {
    if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
      const canScrollLeft = el.scrollLeft > 0 && e.deltaY < 0;
      const canScrollRight = (el.scrollLeft + el.clientWidth < el.scrollWidth - 2) && e.deltaY > 0;
      if (canScrollLeft || canScrollRight) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    }
  }, { passive: false });

  // 2. Свайп перетаскиванием мыши (drag to scroll)
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasMoved = false;

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDown = true;
    hasMoved = false;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      setTimeout(() => {
        el.classList.remove('is-dragging');
        hasMoved = false;
      }, 50);
    }
  });

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 5) {
      hasMoved = true;
      el.classList.add('is-dragging');
      e.preventDefault();
      el.scrollLeft = scrollLeft - walk;
    }
  });

  // Предотвратить непреднамеренный клик по тегу при завершении свайпа
  el.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      e.preventDefault();
      hasMoved = false;
    }
  }, true);
}

// ==========================================================================
// Быстрый захват: Теги
// ==========================================================================
function renderCaptureTags() {
  const container = document.getElementById('captureTagsChips');
  if (!container) return;
  container.innerHTML = '';

  const formatTags = state.tags[state.selectedCaptureType] || [];
  const customTags = state.tags.custom || [];
  const allAvailable = Array.from(new Set([...formatTags, ...customTags]));

  allAvailable.forEach(tag => {
    const isSelected = state.captureSelectedTags.includes(tag);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `tag-chip ${isSelected ? 'active' : ''}`;
    const emojiHtml = getAppleEmoji(tag, '', 'apple-emoji-sm');
    chip.innerHTML = `${emojiHtml ? emojiHtml + ' ' : ''}<span>${escapeHtml(tag)}</span>`;
    chip.onclick = () => toggleCaptureTag(tag);
    container.appendChild(chip);
  });
}

function toggleCaptureTag(tag) {
  if (state.captureSelectedTags.includes(tag)) {
    state.captureSelectedTags = state.captureSelectedTags.filter(t => t !== tag);
  } else {
    state.captureSelectedTags.push(tag);
  }
  renderCaptureTags();
}

function addTagToCapture(tag) {
  if (!state.tags.custom.includes(tag)) {
    state.tags.custom.push(tag);
  }
  if (!state.captureSelectedTags.includes(tag)) {
    state.captureSelectedTags.push(tag);
  }
  renderCaptureTags();
  saveData();
}

// ==========================================================================
// Иерархическая система папок (Folder Hierarchy Engine)
// Поддерживает произвольный уровень вложенности, хлебные крошки, чипсы и перемещение
// ==========================================================================

function getFolderById(id) {
  if (!id) return null;
  return (state.folders || []).find(f => f.id === id) || null;
}

function getFolderPath(folderId) {
  if (!folderId) return [];
  const path = [];
  const visited = new Set();
  let curr = getFolderById(folderId);

  while (curr && !visited.has(curr.id)) {
    visited.add(curr.id);
    path.unshift(curr);
    if (!curr.parentId) break;
    curr = getFolderById(curr.parentId);
  }
  return path;
}

function getSubfolders(parentId = null) {
  const normParent = parentId || null;
  return (state.folders || []).filter(f => (f.parentId || null) === normParent);
}

function getAllDescendantFolderIds(folderId) {
  if (!folderId) return [];
  const descendants = [];
  const queue = [folderId];
  const visited = new Set([folderId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = getSubfolders(currentId);
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        descendants.push(child.id);
        queue.push(child.id);
      }
    }
  }
  return descendants;
}

function getItemCountInFolder(folderId, includeDescendants = true) {
  if (!folderId) {
    return (state.items || []).length;
  }
  if (!includeDescendants) {
    return (state.items || []).filter(i => i.folderId === folderId).length;
  }
  const folderIds = new Set([folderId, ...getAllDescendantFolderIds(folderId)]);
  return (state.items || []).filter(i => i.folderId && folderIds.has(i.folderId)).length;
}

function navigateToFolder(folderId) {
  if (folderId && !getFolderById(folderId)) {
    folderId = null;
  }
  state.currentFolderId = folderId || null;

  const captureSelect = document.getElementById('captureFolderSelect');
  if (captureSelect) {
    captureSelect.value = state.currentFolderId || '';
  }

  renderFolderExplorer();
  renderApp();
}

function createFolder({ name, parentId = null, icon = '📁', color = '#d89f6d' }) {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    showToast('Укажите название папки', 'warning');
    return null;
  }

  const newFolder = {
    id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    name: cleanName,
    parentId: parentId || null,
    icon: (icon || '📁').trim(),
    color: color || '#d89f6d',
    createdAt: Date.now()
  };

  if (!Array.isArray(state.folders)) state.folders = [];
  state.folders.push(newFolder);

  saveData();
  populateFolderSelects();
  renderFolderExplorer();
  showToast(`Папка "${cleanName}" создана`);
  return newFolder;
}

function updateFolder(folderId, { name, parentId = null, icon = '📁', color = '#d89f6d' }) {
  const folder = getFolderById(folderId);
  if (!folder) return false;

  const cleanName = (name || '').trim();
  if (!cleanName) {
    showToast('Укажите название папки', 'warning');
    return false;
  }

  const targetParent = parentId || null;
  if (targetParent) {
    if (targetParent === folderId) {
      showToast('Папка не может быть вложена в саму себя', 'warning');
      return false;
    }
    const descendants = getAllDescendantFolderIds(folderId);
    if (descendants.includes(targetParent)) {
      showToast('Нельзя переместить папку в её собственную подпапку', 'warning');
      return false;
    }
  }

  folder.name = cleanName;
  folder.parentId = targetParent;
  folder.icon = (icon || '📁').trim();
  folder.color = color || folder.color || '#d89f6d';
  folder.updatedAt = Date.now();

  saveData();
  populateFolderSelects();
  renderFolderExplorer();
  renderFolderTreeModal();
  renderApp();
  showToast(`Папка "${cleanName}" обновлена`);
  return true;
}

function deleteFolder(folderId, mode = 'preserve') {
  const folder = getFolderById(folderId);
  if (!folder) return false;

  const parentId = folder.parentId || null;
  const descendantIds = getAllDescendantFolderIds(folderId);
  const allFolderIdsToDelete = [folderId, ...descendantIds];

  if (mode === 'preserve') {
    state.items.forEach(item => {
      if (item.folderId && allFolderIdsToDelete.includes(item.folderId)) {
        item.folderId = parentId;
      }
    });
  } else {
    state.items = state.items.filter(item => !item.folderId || !allFolderIdsToDelete.includes(item.folderId));
  }

  state.folders = state.folders.filter(f => !allFolderIdsToDelete.includes(f.id));

  if (state.currentFolderId && allFolderIdsToDelete.includes(state.currentFolderId)) {
    state.currentFolderId = parentId;
  }

  saveData();
  populateFolderSelects();
  renderFolderExplorer();
  renderFolderTreeModal();
  renderApp();
  showToast(`Папка "${folder.name}" удалена`);
  return true;
}

function buildFolderOptionsHtml(excludeId = null, selectedId = null) {
  let html = '';
  const forbiddenIds = new Set();
  if (excludeId) {
    forbiddenIds.add(excludeId);
    getAllDescendantFolderIds(excludeId).forEach(id => forbiddenIds.add(id));
  }

  function appendLevel(parentId, depth) {
    const children = getSubfolders(parentId);
    for (const f of children) {
      if (forbiddenIds.has(f.id)) continue;
      const indent = depth > 0 ? '— '.repeat(depth) : '';
      const isSelected = (f.id === selectedId) ? 'selected' : '';
      html += `<option value="${f.id}" ${isSelected}>${indent}${f.icon || '📁'} ${escapeHtml(f.name)}</option>`;
      appendLevel(f.id, depth + 1);
    }
  }

  appendLevel(null, 0);
  return html;
}

function populateFolderSelects() {
  const captureSelect = document.getElementById('captureFolderSelect');
  if (captureSelect) {
    const curVal = captureSelect.value;
    const targetVal = (state.currentFolderId !== null) ? state.currentFolderId : curVal;
    captureSelect.innerHTML = `<option value="">📁 Без папки (Корень)</option>` + buildFolderOptionsHtml(null, targetVal);
    captureSelect.value = targetVal || '';
  }

  const editItemSelect = document.getElementById('editFolderSelect');
  if (editItemSelect) {
    const curVal = editItemSelect.value;
    editItemSelect.innerHTML = `<option value="">📁 Без папки (Корень)</option>` + buildFolderOptionsHtml(null, curVal);
    editItemSelect.value = curVal || '';
  }

  const folderParentSelect = document.getElementById('folderParentSelect');
  const folderEditId = document.getElementById('folderEditId')?.value || null;
  if (folderParentSelect) {
    const curParent = folderParentSelect.value;
    folderParentSelect.innerHTML = `<option value="">📁 Корень (верхний уровень)</option>` + buildFolderOptionsHtml(folderEditId, curParent);
    folderParentSelect.value = curParent || '';
  }
}

function declOfNum(n, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[(n % 10 < 5) ? n % 10 : 5]];
}

function moveItemToFolder(itemId, targetFolderId) {
  if (!itemId) return;
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;

  const resolvedTarget = targetFolderId || null;
  if (item.folderId === resolvedTarget) {
    return;
  }

  item.folderId = resolvedTarget;
  saveData();
  renderApp();

  const targetFolder = resolvedTarget ? getFolderById(resolvedTarget) : null;
  const targetName = targetFolder ? `«${targetFolder.name}»` : 'корень (Все материалы)';
  showToast(`«${item.title}» перемещен в ${targetName} 📁`);
}

function setupDropTarget(element, targetFolderId, label = '') {
  if (!element) return;

  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    element.classList.add('drag-over');
  });

  element.addEventListener('dragleave', (e) => {
    if (!element.contains(e.relatedTarget)) {
      element.classList.remove('drag-over');
    }
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      moveItemToFolder(itemId, targetFolderId);
    }
  });
}

function createFolderRow(folder) {
  const row = document.createElement('div');
  row.className = 'folder-row';
  row.dataset.folderId = folder.id;

  const directItemCount = getItemCountInFolder(folder.id, false);
  const subfolderCount = getSubfolders(folder.id).length;

  let countText = `${directItemCount} ${declOfNum(directItemCount, ['материал', 'материала', 'материалов'])}`;
  if (subfolderCount > 0) {
    countText += ` · ${subfolderCount} ${declOfNum(subfolderCount, ['подпапка', 'подпапки', 'подпапок'])}`;
  }

  row.innerHTML = `
    <div class="folder-row-left">
      <div class="folder-row-icon">${folder.icon || '📁'}</div>
      <div class="folder-row-info">
        <span class="folder-row-title">${escapeHtml(folder.name)}</span>
        <span class="folder-row-count">${countText}</span>
      </div>
    </div>
    <div class="folder-row-right">
      <div class="folder-row-actions">
        <button type="button" class="btn-folder-action" title="Редактировать папку" onclick="event.stopPropagation(); openFolderEditModal('${folder.id}')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button type="button" class="btn-folder-action btn-delete" title="Удалить папку" onclick="event.stopPropagation(); confirmDeleteFolder('${folder.id}')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="folder-open-arrow">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </div>
  `;

  row.addEventListener('click', () => {
    navigateToFolder(folder.id);
  });

  setupDropTarget(row, folder.id, folder.name);

  return row;
}

function renderExplorerAddressBar() {
  const configs = [
    {
      bar: document.getElementById('explorerAddressBar'),
      breadcrumbs: document.getElementById('explorerBreadcrumbs'),
      actions: document.getElementById('explorerCurrentFolderActions'),
      upBtn: document.getElementById('explorerUpBtn')
    },
    {
      bar: document.getElementById('kanbanAddressBar'),
      breadcrumbs: document.getElementById('kanbanBreadcrumbs'),
      actions: document.getElementById('kanbanCurrentFolderActions'),
      upBtn: document.getElementById('kanbanUpBtn')
    }
  ];

  const currentFolder = getFolderById(state.currentFolderId);
  const path = getFolderPath(state.currentFolderId);
  const parentFolderId = currentFolder ? currentFolder.parentId : null;

  configs.forEach(({ bar, breadcrumbs, actions, upBtn }) => {
    if (!bar) return;

    if (state.currentFolderId === null) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';

    if (upBtn) {
      upBtn.onclick = () => navigateToFolder(parentFolderId);
      upBtn.title = parentFolderId ? 'На уровень выше (перетащите запись сюда)' : 'Вернуться в корень (Все материалы)';
      setupDropTarget(upBtn, parentFolderId, 'на уровень выше');
    }

    if (!breadcrumbs) return;

    let breadcrumbHtml = `
      <span class="breadcrumb-item" data-folder-id="" title="Все материалы (Корень)">
        <span class="breadcrumb-icon">📁</span>
        <span class="breadcrumb-name">Все материалы</span>
      </span>
    `;

    for (let i = 0; i < path.length; i++) {
      const f = path[i];
      const isLast = (i === path.length - 1);
      breadcrumbHtml += `
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-item ${isLast ? 'active' : ''}" data-folder-id="${f.id}" title="${escapeHtml(f.name)}">
          <span class="breadcrumb-icon">${f.icon || '📁'}</span>
          <span class="breadcrumb-name">${escapeHtml(f.name)}</span>
        </span>
      `;
    }

    breadcrumbs.innerHTML = breadcrumbHtml;

    breadcrumbs.querySelectorAll('.breadcrumb-item').forEach(itemEl => {
      const targetId = itemEl.dataset.folderId || null;
      itemEl.addEventListener('click', () => {
        navigateToFolder(targetId);
      });
      if (targetId !== state.currentFolderId) {
        setupDropTarget(itemEl, targetId, targetId ? 'в выбранную папку' : 'в корень');
      }
    });

    if (actions && currentFolder) {
      actions.innerHTML = `
        <button type="button" class="btn-breadcrumb-action" onclick="openFolderEditModal('${currentFolder.id}')" title="Настроить эту папку (переименовать / сменить иконку)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button type="button" class="btn-breadcrumb-action btn-danger" onclick="confirmDeleteFolder('${currentFolder.id}')" title="Удалить эту папку">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
    }
  });
}

function renderKanbanFolders(subfolders = []) {
  const bar = document.getElementById('kanbanFoldersBar');
  if (!bar) return;

  if (!subfolders || subfolders.length === 0) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }

  bar.style.display = 'flex';
  bar.innerHTML = '';
  subfolders.forEach(f => {
    const tile = document.createElement('div');
    tile.className = 'kanban-folder-tile';
    tile.dataset.folderId = f.id;
    tile.innerHTML = `
      <span class="kanban-folder-tile-icon">${f.icon || '📁'}</span>
      <span class="kanban-folder-tile-name">${escapeHtml(f.name)}</span>
      <span class="kanban-folder-tile-count">${getItemCountInFolder(f.id, true)}</span>
    `;
    tile.addEventListener('click', () => navigateToFolder(f.id));
    setupDropTarget(tile, f.id, f.name);
    bar.appendChild(tile);
  });
}

// Заглушки для обратной совместимости вызовов
function renderFolderExplorer() {
  renderExplorerAddressBar();
}
function renderFolderTreeModal() {}

function openFolderEditModal(folderId = null, defaultParentId = null) {
  const backdrop = document.getElementById('folderEditModalBackdrop');
  const titleEl = document.getElementById('folderEditModalTitle');
  const idInput = document.getElementById('folderEditId');
  const nameInput = document.getElementById('folderNameInput');
  const parentSelect = document.getElementById('folderParentSelect');
  const iconInput = document.getElementById('folderIconInput');
  if (!backdrop) return;

  const isEdit = !!folderId;
  const folder = isEdit ? getFolderById(folderId) : null;

  idInput.value = folderId || '';
  titleEl.innerHTML = isEdit ? '✏️ Редактировать папку' : '📁 Создать папку';
  nameInput.value = folder ? folder.name : '';
  iconInput.value = folder ? (folder.icon || '📁') : '📁';

  const targetParent = folder ? folder.parentId : (defaultParentId !== null ? defaultParentId : (state.currentFolderId || ''));
  parentSelect.innerHTML = `<option value="">📁 Корень (верхний уровень)</option>` + buildFolderOptionsHtml(folderId, targetParent);
  parentSelect.value = targetParent || '';

  backdrop.classList.add('show');
  setTimeout(() => nameInput.focus(), 80);
}

function closeFolderEditModal() {
  const backdrop = document.getElementById('folderEditModalBackdrop');
  if (backdrop) backdrop.classList.remove('show');
}

function openFolderTreeModal() {}
function closeFolderTreeModal() {}

function confirmDeleteFolder(folderId) {
  const folder = getFolderById(folderId);
  if (!folder) return;

  const itemCount = getItemCountInFolder(folderId, true);
  const descendants = getAllDescendantFolderIds(folderId);
  const hasSubs = descendants.length > 0;

  let msg = `Удалить папку "${folder.name}"?`;
  if (hasSubs) {
    msg += `\nВнимание: в ней есть ${descendants.length} подпапок. Они также будут удалены.`;
  }
  if (itemCount > 0) {
    msg += `\nВсе записи (${itemCount} шт.) будут сохранены и перенесены на уровень выше.`;
  }

  if (confirm(msg)) {
    deleteFolder(folderId, 'preserve');
  }
}

function setupFolderEvents() {
  const createFolderBtn = document.getElementById('createFolderBtn');
  if (createFolderBtn) {
    createFolderBtn.addEventListener('click', () => {
      openFolderEditModal(null, state.currentFolderId);
    });
  }

  document.getElementById('closeFolderEditModalBtn')?.addEventListener('click', closeFolderEditModal);
  document.getElementById('cancelFolderEditBtn')?.addEventListener('click', closeFolderEditModal);
  document.getElementById('folderEditModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'folderEditModalBackdrop') closeFolderEditModal();
  });

  const presetsContainer = document.getElementById('folderIconPresets');
  if (presetsContainer) {
    presetsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.preset-icon-btn');
      if (!btn) return;
      const icon = btn.dataset.icon;
      const iconInput = document.getElementById('folderIconInput');
      if (iconInput) iconInput.value = icon;
    });
  }

  const folderEditForm = document.getElementById('folderEditForm');
  if (folderEditForm) {
    folderEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('folderEditId').value.trim();
      const name = document.getElementById('folderNameInput').value.trim();
      const parentId = document.getElementById('folderParentSelect').value || null;
      const icon = document.getElementById('folderIconInput').value.trim() || '📁';

      if (!name) return;

      if (id) {
        updateFolder(id, { name, parentId, icon });
      } else {
        createFolder({ name, parentId, icon });
      }
      closeFolderEditModal();
      renderApp();
    });
  }
}

// ==========================================================================
// Быстрый захват (Quick Capture)
// ==========================================================================
function handleQuickCapture(e) {
  e.preventDefault();
  const titleInput = document.getElementById('quickTitleInput');
  const rawText = titleInput.value.trim();
  if (!rawText) return;

  const priority = document.getElementById('capturePrioritySelect').value;
  const status = document.getElementById('captureStatusSelect').value;
  const folderSelect = document.getElementById('captureFolderSelect');
  const folderId = (folderSelect && folderSelect.value) ? folderSelect.value : (state.currentFolderId || null);

  // Автоопределение: если введена ссылка
  let title = rawText;
  let url = '';
  if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
    url = rawText;
    try {
      const parsedUrl = new URL(rawText);
      title = `${parsedUrl.hostname.replace('www.', '')}${parsedUrl.pathname}`;
    } catch {
      title = rawText;
    }
  }

  let progress = 0;
  if (status === 'progress') progress = 25;
  if (status === 'done') progress = 100;

  const newItem = {
    id: 'item-' + Date.now(),
    title: title,
    type: state.selectedCaptureType,
    status: status,
    progress: progress,
    progressNote: status === 'progress' ? 'Начато' : '',
    priority: priority,
    url: url,
    notes: '',
    rating: 0,
    tags: [...state.captureSelectedTags],
    folderId: folderId,
    createdAt: Date.now()
  };

  if (!state.savingItemIds) state.savingItemIds = new Map();
  state.savingItemIds.set(newItem.id, 'saving');

  state.items.unshift(newItem);
  state.captureSelectedTags = [];
  renderCaptureTags();
  renderApp();

  titleInput.value = '';
  document.getElementById('clearQuickInputBtn').style.display = 'none';

  // Моментальная запись в открытую базу на диске
  saveData().then(written => {
    state.savingItemIds.set(newItem.id, 'saved');
    const badge = document.getElementById(`itemSaveBadge_${newItem.id}`);
    if (badge) {
      badge.className = 'item-save-badge saved';
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#79c991" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="save-badge-text">Сохранено</span>
      `;
      setTimeout(() => {
        badge.classList.add('fade-out');
        setTimeout(() => {
          if (state.savingItemIds) state.savingItemIds.delete(newItem.id);
          badge.remove();
        }, 400);
      }, 2500);
    }
  });
}

// ==========================================================================
// Умный 3-позиционный чекбокс (Cycle Status)
// Planned (0%) ➔ Progress (50%) ➔ Done (100%) ➔ Planned (0%)
// ==========================================================================
function cycleItemStatus(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  if (item.status === 'planned') {
    item.status = 'progress';
    item.progress = item.progress > 0 ? item.progress : 25;
    if (!item.progressNote) item.progressNote = 'В процессе';
    showToast(`Переведено в статус «В процессе»: ${item.title}`);
  } else if (item.status === 'progress') {
    item.status = 'done';
    item.progress = 100;
    if (item.progressNote && ['в процессе', 'начато'].includes(item.progressNote.toLowerCase().trim())) {
      item.progressNote = '';
    }
    showToast(`Завершено: ${item.title} 🎉`);
  } else {
    item.status = 'planned';
    item.progress = 0;
    item.progressNote = '';
    showToast(`Вернулось в бэклог: ${item.title}`);
  }

  saveData();
  renderApp();
}

// Мгновенная отметка чекбоксом в Готово (или возврат в план)
function toggleItemDone(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  if (item.status === 'done') {
    item.status = 'planned';
    item.progress = 0;
    item.progressNote = '';
  } else {
    item.status = 'done';
    item.progress = 100;
    if (item.progressNote && ['в процессе', 'начато'].includes(item.progressNote.toLowerCase().trim())) {
      item.progressNote = '';
    }
  }

  saveData();
  renderApp();
}

// Быстрое перемещение между статусами на карточке
function moveItemStatus(id, targetStatus) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  item.status = targetStatus;
  if (targetStatus === 'planned') {
    item.progress = 0;
    item.progressNote = '';
  } else if (targetStatus === 'progress') {
    item.progress = (item.progress > 0 && item.progress < 100) ? item.progress : 50;
    if (!item.progressNote) item.progressNote = 'В процессе';
  } else if (targetStatus === 'done') {
    item.progress = 100;
    if (item.progressNote && ['в процессе', 'начато'].includes(item.progressNote.toLowerCase().trim())) {
      item.progressNote = '';
    }
  }

  saveData();
  renderApp();
  showToast(`Статус обновлен: ${targetStatus === 'done' ? 'Изучено' : targetStatus === 'progress' ? 'В процессе' : 'В планах'}`);
}

// Удаление элемента
function deleteItem(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  if (confirm(`Удалить "${item.title}"?`)) {
    state.items = state.items.filter(i => i.id !== id);
    saveData();
    renderApp();
    showToast('Материал удален');
  }
}

// ==========================================================================
// Рендеринг приложения
// ==========================================================================
function renderApp() {
  updateMetrics();
  renderTagFilters();
  populateFolderSelects();
  renderExplorerAddressBar();

  // Папки текущего уровня
  const allSubfolders = getSubfolders(state.currentFolderId);
  const visibleSubfolders = state.searchQuery
    ? allSubfolders.filter(f => f.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
    : allSubfolders;

  // Фильтрация элементов (в стиле проводника Windows)
  const filteredItems = state.items.filter(item => {
    // При поиске: если открыта папка, ищем в ней и ее подпапках; если в корне — по всей базе
    if (state.searchQuery) {
      if (state.currentFolderId) {
        const allowedIds = new Set([state.currentFolderId, ...getAllDescendantFolderIds(state.currentFolderId)]);
        if (!item.folderId || !allowedIds.has(item.folderId)) return false;
      }
    } else {
      // Без поиска: показываем строго записи текущего уровня (в корне — item.folderId == null, в папке — item.folderId == currentFolderId)
      const currentFId = state.currentFolderId || null;
      const itemFId = item.folderId || null;
      if (itemFId !== currentFId) return false;
    }

    // Фильтр по типу
    if (state.activeFilterType !== 'all' && item.type !== state.activeFilterType) {
      return false;
    }
    // Фильтр по статусу (применяется в режиме списка)
    if (state.viewMode === 'list' && state.activeFilterStatus !== 'all' && item.status !== state.activeFilterStatus) {
      return false;
    }
    // Фильтр по тегам
    if (state.activeFilterTag !== 'all') {
      if (!item.tags || !item.tags.includes(state.activeFilterTag)) {
        return false;
      }
    }
    // Поиск по тексту, заметкам и тегам
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = item.title && item.title.toLowerCase().includes(q);
      const matchNotes = item.notes && item.notes.toLowerCase().includes(q);
      const matchProgressNote = item.progressNote && item.progressNote.toLowerCase().includes(q);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchProgressNote && !matchTags) {
        return false;
      }
    }
    return true;
  });

  const listView = document.getElementById('listView');
  const boardView = document.getElementById('boardView');
  const statusFilterPills = document.getElementById('statusFilterPills');
  const emptyState = document.getElementById('emptyState');

  const hasSubfolders = visibleSubfolders.length > 0;
  const hasItems = filteredItems.length > 0;
  const isInsideFolder = state.currentFolderId !== null;

  // Пустое состояние показываем только на корневом уровне, если нет ни материалов, ни папок
  if (!hasItems && !hasSubfolders && !isInsideFolder) {
    listView.classList.remove('active');
    boardView.classList.remove('active');
    statusFilterPills.style.display = state.viewMode === 'list' ? 'flex' : 'none';
    emptyState.style.display = 'block';

    const foldersContainer = document.getElementById('foldersListContainer');
    if (foldersContainer) foldersContainer.innerHTML = '';
    const container = document.getElementById('itemsListContainer');
    if (container) {
      container.style.paddingTop = '0px';
      container.style.paddingBottom = '0px';
      container.innerHTML = '';
    }

    const emptyIllustration = document.getElementById('emptyIllustration');
    const emptyTitle = document.getElementById('emptyTitle') || emptyState.querySelector('h3');
    const emptyDesc = document.getElementById('emptyDesc') || emptyState.querySelector('p');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (state.items.length === 0 && (state.folders || []).length === 0) {
      if (emptyIllustration) emptyIllustration.innerHTML = getAppleEmoji('sparkles', '✨');
      if (emptyTitle) emptyTitle.textContent = 'Пока ничего нет';
      if (emptyDesc) emptyDesc.textContent = 'Добавьте первый материал через строку быстрого захвата выше';
      if (resetBtn) resetBtn.style.display = 'none';
    } else {
      if (emptyIllustration) emptyIllustration.textContent = '🔍';
      if (emptyTitle) emptyTitle.textContent = 'Ничего не найдено';
      if (emptyDesc) emptyDesc.textContent = 'Попробуйте изменить запрос поиска или сбросить активные фильтры';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    }
  } else {
    emptyState.style.display = 'none';
    if (state.viewMode === 'list') {
      listView.classList.add('active');
      boardView.classList.remove('active');
      statusFilterPills.style.display = 'flex';

      // Рендерим папки текущего уровня в специальный контейнер перед материалами
      const foldersContainer = document.getElementById('foldersListContainer');
      if (foldersContainer) {
        foldersContainer.innerHTML = '';
        visibleSubfolders.forEach(f => {
          foldersContainer.appendChild(createFolderRow(f));
        });
      }

      if (!hasItems && isInsideFolder && !hasSubfolders) {
        // Внутри папки без элементов: отображаем красивую drop-зону, при этом .list-headers остается на месте!
        const container = document.getElementById('itemsListContainer');
        if (container) {
          container.style.paddingTop = '0px';
          container.style.paddingBottom = '0px';
          const curF = getFolderById(state.currentFolderId);
          container.innerHTML = `
            <div class="empty-folder-dropzone" id="emptyFolderDropzone">
              <div class="empty-folder-icon">${curF?.icon || '📁'}</div>
              <div class="empty-folder-title">В папке «${escapeHtml(curF?.name || 'Папка')}» пока нет материалов</div>
              <div class="empty-folder-hint">Перетащите сюда записи мышью или добавьте новый материал через форму вверху</div>
            </div>
          `;
          const dropzone = document.getElementById('emptyFolderDropzone');
          if (dropzone) {
            setupDropTarget(dropzone, state.currentFolderId, curF?.name || 'текущую папку');
          }
        }
      } else {
        renderListView(filteredItems);
      }
    } else {
      listView.classList.remove('active');
      boardView.classList.add('active');
      statusFilterPills.style.display = 'none';

      renderKanbanFolders(visibleSubfolders);
      renderBoardView(filteredItems);
    }
  }
}

// Рендеринг чипсов фильтрации по тегам
function renderTagFilters() {
  const container = document.getElementById('tagFilterPills');
  if (!container) return;

  const activeTagsSet = new Set();
  state.items.forEach(i => {
    if (i.tags && Array.isArray(i.tags)) {
      i.tags.forEach(t => activeTagsSet.add(t));
    }
  });

  // Также добавляем пресеты для текущего выбранного типа контента
  if (state.activeFilterType !== 'all') {
    (state.tags[state.activeFilterType] || []).forEach(t => activeTagsSet.add(t));
  } else {
    // Если выбрано 'Все форматы', предлагаем ключевые теги из всех категорий
    ['Книга', 'Фильм', 'Сериал', 'Аниме', 'Лекция', 'Технология', 'Пет-проект'].forEach(t => activeTagsSet.add(t));
  }

  const sortedTags = Array.from(activeTagsSet).sort();

  container.innerHTML = `
    <button class="pill-btn pill-tag ${state.activeFilterTag === 'all' ? 'active' : ''}" data-filter-tag="all">
      ${getAppleEmoji('sparkles', '✨', 'apple-emoji-sm')}
      <span>Все теги</span>
    </button>
    ${sortedTags.map(tag => {
      const emojiHtml = getAppleEmoji(tag, '', 'apple-emoji-sm');
      return `
        <button class="pill-btn pill-tag ${state.activeFilterTag === tag ? 'active' : ''}" data-filter-tag="${escapeHtml(tag)}">
          ${emojiHtml ? emojiHtml : '#'}
          <span>${escapeHtml(tag)}</span>
        </button>
      `;
    }).join('')}
  `;
}

// 1. Рендеринг режима СПИСКА
// Создание DOM-элемента отдельной строки списка
function createItemRow(item) {
  const row = document.createElement('div');
  row.className = `list-item-row ${item.status === 'done' ? 'item-done' : ''}`;
  row.dataset.id = item.id;
  row.dataset.status = item.status;

  // Drag & drop перетаскивание записи в папки (как в проводнике Windows)
  row.draggable = true;
  row.addEventListener('dragstart', (e) => {
    draggedItemId = item.id;
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    row.classList.add('is-dragging');
  });
  row.addEventListener('dragend', () => {
    row.classList.remove('is-dragging');
    draggedItemId = null;
  });

  // Бейдж типа контента
  const typeInfo = getTypeMetadata(item.type);
  // Бейдж приоритета
  const priorityInfo = getPriorityMetadata(item.priority);

  // Класс и иконка статуса чекбокса
  let checkboxClass = 'state-planned';
  let checkboxIcon = '';
  let statusText = 'В планах';
  let statusBadgeClass = 'badge-planned';

  if (item.status === 'progress') {
    checkboxClass = 'state-progress';
    statusText = `${item.progress}%`;
    statusBadgeClass = 'badge-progress';
  } else if (item.status === 'done') {
    checkboxClass = 'state-done';
    checkboxIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    statusText = 'Готово';
    statusBadgeClass = 'badge-done';
  }

  // Звездочки рейтинга
  let starsHtml = '';
  if (item.status === 'done' && item.rating > 0) {
    starsHtml = `<span class="item-rating-stars" title="Оценка: ${item.rating}/5">${'★'.repeat(item.rating)}</span>`;
  }

  // Не показываем устаревшую плашку "В процессе", если задача уже завершена
  const hasValidProgressNote = item.progressNote && (
    item.status === 'progress' ||
    (item.status === 'done' && !['в процессе', 'начато', 'в планах', 'завершено'].includes(item.progressNote.toLowerCase().trim()))
  );

  // Бейджи тегов
  const tagsHtml = item.tags && item.tags.length ? item.tags.map(t => {
    const emojiHtml = getAppleEmoji(t, '', 'apple-emoji-sm');
    return `<span class="item-tag-pill">${emojiHtml ? emojiHtml : '#'}<span>${escapeHtml(t)}</span></span>`;
  }).join('') : '';

  // Бейдж папки
  let folderBadgeHtml = '';
  if (item.folderId) {
    const folder = getFolderById(item.folderId);
    if (folder) {
      folderBadgeHtml = `
        <span class="item-folder-badge" onclick="event.stopPropagation(); navigateToFolder('${folder.id}')" title="Папка: ${escapeHtml(folder.name)}">
          <span class="item-folder-badge-icon">${folder.icon || '📁'}</span>
          <span class="item-folder-badge-name">${escapeHtml(folder.name)}</span>
        </span>
      `;
    }
  }

  row.innerHTML = `
    <!-- Статус и умный 3-позиционный чекбокс -->
    <div class="status-toggle-wrapper">
      <div class="smart-status-checkbox ${checkboxClass}" onclick="cycleItemStatus('${item.id}')" title="Кликните для циклической смены статуса (План ➔ В процессе ➔ Готово)">
        ${checkboxIcon}
      </div>
      <span class="status-badge-text ${statusBadgeClass}" onclick="cycleItemStatus('${item.id}')" title="Сменить статус">
        ${statusText}
      </span>
    </div>

    <!-- Название и метаданные -->
    <div class="item-info">
      <div class="item-title-wrapper">
        <span class="item-title" onclick="openEditModal('${item.id}')" title="Нажмите для редактирования">${escapeHtml(item.title)}</span>
        ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="item-link-inline" title="Открыть ссылку: ${escapeHtml(item.url)}" onclick="event.stopPropagation()">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>` : ''}
        ${getSaveIndicatorHtml(item.id)}
      </div>
      <div class="item-meta-row">
        ${folderBadgeHtml}
        ${tagsHtml}
        ${hasValidProgressNote ? `<span class="item-progress-note">${escapeHtml(item.progressNote)}</span>` : ''}
        ${starsHtml}
        ${item.notes ? `<span title="${escapeHtml(item.notes)}">${getAppleEmoji('notes', '📝', 'apple-emoji-sm')} Есть заметка</span>` : ''}
      </div>
    </div>

    <!-- Метаданные (Формат, Приоритет, Прогресс) -->
    <div class="item-meta-bar">
      <!-- Формат -->
      <div class="item-format-cell">
        <span class="type-badge ${typeInfo.className}">
          <span>${typeInfo.icon}</span> ${typeInfo.label}
        </span>
      </div>

      <!-- Приоритет -->
      <div class="item-priority-cell">
        <span class="priority-pill ${priorityInfo.className}">
          <span class="priority-dot"></span>
          ${priorityInfo.label}
        </span>
      </div>

      <!-- Прогресс-бар -->
      <div class="list-progress-cell">
        <div class="mini-progress-bar" title="Прогресс: ${item.progress}%">
          <div class="mini-progress-fill prog-${item.status}" style="width: ${item.progress}%"></div>
        </div>
        <span class="list-progress-val">${item.progress}%</span>
      </div>
    </div>

    <!-- Действия -->
    <div class="row-actions">
      <button class="action-btn" onclick="openEditModal('${item.id}')" title="Редактировать">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')" title="Удалить">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `;

  return row;
}

// ==========================================================================
// Virtual Scrolling Engine (Виртуальный скроллинг без сторонних зависимостей)
// Позволяет мгновенно отображать 10 000+ элементов со стабильными 60-120 FPS
// ==========================================================================
const VIRTUAL_SCROLL = {
  threshold: 30,         // Порог включения виртуализации
  buffer: 12,            // Запас элементов выше и ниже видимой зоны для плавного скролла
  rowHeightDesktop: 72,  // 64px высота карточки + 8px flex-gap
  rowHeightMobile: 78,   // Компактная двухстрочная мобильная карточка + 8px gap
  items: [],
  lastStartIndex: -1,
  lastEndIndex: -1,
  isTicking: false,
  heightCache: new Map()
};

function getEstimatedItemHeight(item) {
  if (VIRTUAL_SCROLL.heightCache.has(item.id)) {
    return VIRTUAL_SCROLL.heightCache.get(item.id);
  }
  return window.innerWidth <= 768 ? VIRTUAL_SCROLL.rowHeightMobile : VIRTUAL_SCROLL.rowHeightDesktop;
}

function calculateVirtualSlice(items) {
  const container = document.getElementById('itemsListContainer');
  if (!container || !items.length) {
    return { startIndex: 0, endIndex: 0, topPadding: 0, bottomPadding: 0 };
  }

  const isMobile = window.innerWidth <= 768;
  const defaultH = isMobile ? VIRTUAL_SCROLL.rowHeightMobile : VIRTUAL_SCROLL.rowHeightDesktop;
  const containerRect = container.getBoundingClientRect();
  const containerTopInDoc = window.scrollY + containerRect.top;

  const viewportTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportBottom = viewportTop + viewportHeight;

  // Относительный скролл внутри контейнера
  const relativeTop = Math.max(0, viewportTop - containerTopInDoc);
  const relativeBottom = Math.max(0, viewportBottom - containerTopInDoc);

  const bufferPx = VIRTUAL_SCROLL.buffer * defaultH;
  const targetStart = Math.max(0, relativeTop - bufferPx);
  const targetEnd = relativeBottom + bufferPx;

  let currentY = 0;
  let startIndex = 0;
  let endIndex = items.length;
  let topPadding = 0;
  let foundStart = false;

  for (let i = 0; i < items.length; i++) {
    const h = getEstimatedItemHeight(items[i]);
    if (!foundStart && currentY + h >= targetStart) {
      startIndex = i;
      topPadding = currentY;
      foundStart = true;
    }
    currentY += h;
    if (currentY >= targetEnd) {
      endIndex = Math.min(items.length, i + 1);
      break;
    }
  }

  if (!foundStart) {
    startIndex = 0;
    topPadding = 0;
  }

  let bottomPadding = 0;
  for (let i = endIndex; i < items.length; i++) {
    bottomPadding += getEstimatedItemHeight(items[i]);
  }

  return { startIndex, endIndex, topPadding, bottomPadding };
}

function updateVirtualListView(force = false) {
  const container = document.getElementById('itemsListContainer');
  if (!container || state.viewMode !== 'list') return;

  const items = VIRTUAL_SCROLL.items;
  if (!items || items.length === 0) {
    container.innerHTML = '';
    container.style.paddingTop = '0px';
    container.style.paddingBottom = '0px';
    VIRTUAL_SCROLL.lastStartIndex = -1;
    VIRTUAL_SCROLL.lastEndIndex = -1;
    return;
  }

  // Для небольших коллекций (< 30) рендерим целиком напрямую
  if (items.length <= VIRTUAL_SCROLL.threshold) {
    container.style.paddingTop = '0px';
    container.style.paddingBottom = '0px';
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createItemRow(item)));
    if (typeof container.replaceChildren === 'function') {
      container.replaceChildren(fragment);
    } else {
      container.innerHTML = '';
      container.appendChild(fragment);
    }
    VIRTUAL_SCROLL.lastStartIndex = 0;
    VIRTUAL_SCROLL.lastEndIndex = items.length;
    return;
  }

  // Расчет видимого среза
  const { startIndex, endIndex, topPadding, bottomPadding } = calculateVirtualSlice(items);

  // Пропускаем перерисовку DOM, если видимый срез не изменился
  if (!force && startIndex === VIRTUAL_SCROLL.lastStartIndex && endIndex === VIRTUAL_SCROLL.lastEndIndex) {
    return;
  }

  VIRTUAL_SCROLL.lastStartIndex = startIndex;
  VIRTUAL_SCROLL.lastEndIndex = endIndex;

  container.style.paddingTop = topPadding > 0 ? `${topPadding}px` : '0px';
  container.style.paddingBottom = bottomPadding > 0 ? `${bottomPadding}px` : '0px';

  const fragment = document.createDocumentFragment();
  for (let i = startIndex; i < endIndex; i++) {
    fragment.appendChild(createItemRow(items[i]));
  }

  if (typeof container.replaceChildren === 'function') {
    container.replaceChildren(fragment);
  } else {
    container.innerHTML = '';
    container.appendChild(fragment);
  }

  // Измерение высот в DOM для наполнения кэша точными значениями
  const renderedRows = container.querySelectorAll('.list-item-row');
  renderedRows.forEach(row => {
    const id = row.dataset.id;
    if (id) {
      const h = Math.round(row.getBoundingClientRect().height) + 8;
      VIRTUAL_SCROLL.heightCache.set(id, h);
    }
  });
}

// 1. Рендеринг режима СПИСКА (входная точка)
function renderListView(items) {
  VIRTUAL_SCROLL.items = items || [];
  updateVirtualListView(true);
}

function onVirtualScrollWindow() {
  if (state.viewMode !== 'list' || !VIRTUAL_SCROLL.items || VIRTUAL_SCROLL.items.length <= VIRTUAL_SCROLL.threshold) {
    return;
  }
  if (!VIRTUAL_SCROLL.isTicking) {
    window.requestAnimationFrame(() => {
      updateVirtualListView(false);
      VIRTUAL_SCROLL.isTicking = false;
    });
    VIRTUAL_SCROLL.isTicking = true;
  }
}

let resizeVirtualTimeout = null;
function onVirtualScrollResize() {
  if (state.viewMode !== 'list' || !VIRTUAL_SCROLL.items || VIRTUAL_SCROLL.items.length <= VIRTUAL_SCROLL.threshold) {
    return;
  }
  clearTimeout(resizeVirtualTimeout);
  resizeVirtualTimeout = setTimeout(() => {
    updateVirtualListView(true);
  }, 80);
}

// Утилита для стресс-тестирования виртуализации в консоли браузера: generateTestItems(1000)
window.generateTestItems = function(count = 500) {
  const types = ['read', 'watch', 'study', 'do'];
  const statuses = ['planned', 'progress', 'done'];
  const sampleTitles = [
    'System Design Interview', 'Designing Data-Intensive Applications', 'Kubernetes Up and Running',
    'Rust in Action', 'Clean Code & Refactoring', 'High Performance Browser Networking',
    'Distributed Systems with Raft', 'Understanding Deep Learning', 'TypeScript Deep Dive',
    'PostgreSQL Query Optimization', 'React Internal Architecture', 'Go Concurrency in Action'
  ];
  const items = [];
  for (let i = 1; i <= count; i++) {
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const title = `${sampleTitles[i % sampleTitles.length]} #${i}`;
    items.push({
      id: `virtual-test-${i}-${Date.now()}`,
      title,
      type,
      status,
      progress: status === 'done' ? 100 : (status === 'progress' ? ((i * 17) % 90 + 10) : 0),
      progressNote: status === 'progress' ? `Глава ${i % 12 + 1}` : '',
      priority: (i % 3 === 0) ? 'high' : (i % 2 === 0 ? 'medium' : 'low'),
      url: '',
      notes: (i % 4 === 0) ? `Автоматически сгенерированная заметка к материалу #${i}` : '',
      rating: status === 'done' ? (i % 5 + 1) : 0,
      tags: [type === 'read' ? 'Книга' : type === 'watch' ? 'YouTube' : type === 'study' ? 'Курс' : 'Пет-проект'],
      createdAt: Date.now() - i * 3600000
    });
  }
  state.items = items;
  saveData();
  renderApp();
  showToast(`Загружено ${count} тестовых записей для проверки Virtual Scrolling! 🚀`);
};

// 2. Рендеринг режима КАНБАН-ДОСКИ
function renderBoardView(items) {
  const plannedDropzone = document.getElementById('cardsPlannedDropzone');
  const progressDropzone = document.getElementById('cardsProgressDropzone');
  const doneDropzone = document.getElementById('cardsDoneDropzone');

  plannedDropzone.innerHTML = '';
  progressDropzone.innerHTML = '';
  doneDropzone.innerHTML = '';

  let countPlanned = 0;
  let countProgress = 0;
  let countDone = 0;

  items.forEach(item => {
    const card = createKanbanCard(item);

    if (item.status === 'planned') {
      plannedDropzone.appendChild(card);
      countPlanned++;
    } else if (item.status === 'progress') {
      progressDropzone.appendChild(card);
      countProgress++;
    } else if (item.status === 'done') {
      doneDropzone.appendChild(card);
      countDone++;
    }
  });

  document.getElementById('countColPlanned').textContent = countPlanned;
  document.getElementById('countColProgress').textContent = countProgress;
  document.getElementById('countColDone').textContent = countDone;
}

// Создание HTML-карточки канбана
function createKanbanCard(item) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.dataset.id = item.id;
  card.draggable = true;

  const typeInfo = getTypeMetadata(item.type);
  const priorityInfo = getPriorityMetadata(item.priority);

  // Кнопки быстрого перемещения
  let moveButtonsHtml = '';
  if (item.status === 'planned') {
    moveButtonsHtml = `<button class="btn-move-step" onclick="moveItemStatus('${item.id}', 'progress')">➔ В процесс</button>`;
  } else if (item.status === 'progress') {
    moveButtonsHtml = `
      <button class="btn-move-step" onclick="moveItemStatus('${item.id}', 'planned')">← План</button>
      <button class="btn-move-step" onclick="moveItemStatus('${item.id}', 'done')">➔ Готово</button>
    `;
  } else if (item.status === 'done') {
    moveButtonsHtml = `<button class="btn-move-step" onclick="moveItemStatus('${item.id}', 'progress')">← Возобновить</button>`;
  }

  // Рейтинг для завершенного
  let ratingHtml = '';
  if (item.status === 'done' && item.rating > 0) {
    ratingHtml = `<span class="item-rating-stars">${'★'.repeat(item.rating)}</span>`;
  }

  // Бейдж папки
  let kanbanFolderBadgeHtml = '';
  if (item.folderId) {
    const folder = getFolderById(item.folderId);
    if (folder) {
      kanbanFolderBadgeHtml = `
        <span class="item-folder-badge" onclick="event.stopPropagation(); navigateToFolder('${folder.id}')" title="Папка: ${escapeHtml(folder.name)}" style="margin-bottom: 6px; display: inline-flex;">
          <span class="item-folder-badge-icon">${folder.icon || '📁'}</span>
          <span class="item-folder-badge-name">${escapeHtml(folder.name)}</span>
        </span>
      `;
    }
  }

  card.innerHTML = `
    <div class="card-header-meta">
      <span class="type-badge ${typeInfo.className}">
        <span>${typeInfo.icon}</span> ${typeInfo.label}
      </span>
      <span class="priority-pill ${priorityInfo.className}">
        <span class="priority-dot"></span>
        ${priorityInfo.label}
      </span>
    </div>

    ${kanbanFolderBadgeHtml}

    <div class="card-title" onclick="openEditModal('${item.id}')">
      ${escapeHtml(item.title)}
      ${getSaveIndicatorHtml(item.id)}
    </div>

    ${item.tags && item.tags.length ? `<div class="card-tags-row">${item.tags.map(t => {
      const emojiHtml = getAppleEmoji(t, '', 'apple-emoji-sm');
      return `<span class="item-tag-pill">${emojiHtml ? emojiHtml : '#'}<span>${escapeHtml(t)}</span></span>`;
    }).join('')}</div>` : ''}

    ${item.notes ? `<div class="card-notes-preview" onclick="openEditModal('${item.id}')">${getAppleEmoji('notes', '📝', 'apple-emoji-sm')} ${escapeHtml(item.notes)}</div>` : ''}

    <div class="card-progress-section">
      <div class="card-progress-header">
        <span>Прогресс</span>
        <span class="card-progress-note-tag">${item.status === 'done' ? '100%' : (item.progressNote || `${item.progress}%`)}</span>
      </div>
      <div class="mini-progress-bar">
        <div class="mini-progress-fill prog-${item.status}" style="width: ${item.progress}%"></div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-quick-actions">
        ${moveButtonsHtml}
        ${ratingHtml}
      </div>
      <div class="row-actions">
        <button class="action-btn" onclick="openEditModal('${item.id}')" title="Редактировать">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')" title="Удалить">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `;

  return card;
}

// ==========================================================================
// Drag & Drop для Канбан-доски
// ==========================================================================
let draggedItemId = null;

function setupDragAndDrop() {
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.kanban-card');
    const listItem = e.target.closest('.list-item-row');
    if (card) {
      draggedItemId = card.dataset.id;
      e.dataTransfer.setData('text/plain', draggedItemId);
      card.style.opacity = '0.5';
    } else if (listItem) {
      draggedItemId = listItem.dataset.id;
      e.dataTransfer.setData('text/plain', draggedItemId);
      listItem.classList.add('is-dragging');
    }
  });

  document.addEventListener('dragend', (e) => {
    const card = e.target.closest('.kanban-card');
    if (card) {
      card.style.opacity = '1';
    }
    const listItem = e.target.closest('.list-item-row');
    if (listItem) {
      listItem.classList.remove('is-dragging');
    }
    document.querySelectorAll('.cards-dropzone').forEach(zone => zone.classList.remove('drag-over'));
    document.querySelectorAll('.folder-row').forEach(row => row.classList.remove('drag-over'));
    document.querySelectorAll('.kanban-folder-tile').forEach(tile => tile.classList.remove('drag-over'));
    const upBtn = document.getElementById('explorerUpBtn');
    if (upBtn) upBtn.classList.remove('drag-over');
    document.querySelectorAll('.breadcrumb-item').forEach(b => b.classList.remove('drag-over'));
  });

  document.querySelectorAll('.board-column').forEach(col => {
    const dropzone = col.querySelector('.cards-dropzone');
    const targetStatus = col.dataset.columnStatus;

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (!draggedItemId) return;

      moveItemStatus(draggedItemId, targetStatus);
      draggedItemId = null;
    });
  });
}

// ==========================================================================
// Обновление метрик и общего прогресс-бара
// ==========================================================================
function updateMetrics() {
  const total = state.items.length;
  const planned = state.items.filter(i => i.status === 'planned').length;
  const progress = state.items.filter(i => i.status === 'progress').length;
  const done = state.items.filter(i => i.status === 'done').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPlanned').textContent = planned;
  document.getElementById('statProgress').textContent = progress;
  document.getElementById('statDone').textContent = done;

  // Расчет суммарного % завершенности с учетом частичного изучения
  let totalPercent = 0;
  if (total > 0) {
    const sumProgress = state.items.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    totalPercent = Math.round(sumProgress / total);
  }

  document.getElementById('statPercent').textContent = `${totalPercent}%`;
  document.getElementById('statProgressBar').style.width = `${totalPercent}%`;
}

// ==========================================================================
// Модальное окно редактирования / детального просмотра
// ==========================================================================
function setupModalEvents() {
  const backdrop = document.getElementById('editModalBackdrop');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const form = document.getElementById('editItemForm');
  const rangeSlider = document.getElementById('editProgress');
  const progressLabel = document.getElementById('editProgressLabel');

  const closeModal = () => {
    backdrop.classList.remove('show');
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Ползунок прогресса
  rangeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    progressLabel.textContent = `${val}%`;
    syncStatusWithProgress(val);
  });

  // Быстрые кнопки установки прогресса
  document.getElementById('setProg0').addEventListener('click', () => setModalProgress(0));
  document.getElementById('setProg25').addEventListener('click', () => setModalProgress(25));
  document.getElementById('setProg50').addEventListener('click', () => setModalProgress(50));
  document.getElementById('setProg75').addEventListener('click', () => setModalProgress(75));
  document.getElementById('setProg100').addEventListener('click', () => setModalProgress(100));

  // Звездный рейтинг
  const starsContainer = document.getElementById('editRatingStars');
  starsContainer.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    const rating = parseInt(star.dataset.rating, 10);
    setRatingStars(rating);
  });

  // Смена формата внутри модалки обновляет пресеты тегов
  const editTypeSelect = document.getElementById('editType');
  if (editTypeSelect) {
    editTypeSelect.addEventListener('change', () => {
      renderModalTags();
    });
  }

  // Ввод своего тега в модалке
  const editCustomTagInput = document.getElementById('editCustomTagInput');
  if (editCustomTagInput) {
    editCustomTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = editCustomTagInput.value.trim().replace(/^#/, '');
        if (!val) return;
        addModalTag(val);
        editCustomTagInput.value = '';
      }
    });
  }

  // Сохранение изменений в форме
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editItemId').value;
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    item.title = document.getElementById('editTitle').value.trim();
    item.type = document.getElementById('editType').value;
    item.priority = document.getElementById('editPriority').value;
    item.status = document.getElementById('editStatus').value;
    item.progress = parseInt(document.getElementById('editProgress').value, 10);
    item.progressNote = document.getElementById('editProgressNote').value.trim();
    item.url = document.getElementById('editUrl').value.trim();
    item.notes = document.getElementById('editNotes').value.trim();
    item.rating = parseInt(document.getElementById('editRating').value, 10);
    item.tags = [...state.modalSelectedTags];

    const editFolderSelect = document.getElementById('editFolderSelect');
    if (editFolderSelect) {
      item.folderId = editFolderSelect.value || null;
    }

    saveData();
    renderApp();
    closeModal();
    showToast('Изменения сохранены');
  });
}

function openEditModal(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('modalTitle').textContent = 'Редактировать материал';
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editType').value = item.type;
  document.getElementById('editPriority').value = item.priority;
  document.getElementById('editStatus').value = item.status;
  document.getElementById('editProgress').value = item.progress;
  document.getElementById('editProgressLabel').textContent = `${item.progress}%`;
  document.getElementById('editProgressNote').value = item.progressNote || '';
  document.getElementById('editUrl').value = item.url || '';
  document.getElementById('editNotes').value = item.notes || '';

  const editFolderSelect = document.getElementById('editFolderSelect');
  if (editFolderSelect) {
    editFolderSelect.innerHTML = `<option value="">📁 Без папки (Корень)</option>` + buildFolderOptionsHtml(null, item.folderId);
    editFolderSelect.value = item.folderId || '';
  }

  setRatingStars(item.rating || 0);

  // Инициализация тегов модалки
  state.modalSelectedTags = [...(item.tags || [])];
  renderModalTags();

  document.getElementById('editModalBackdrop').classList.add('show');
}

function renderModalTags() {
  const selectedContainer = document.getElementById('editModalSelectedTags');
  const presetsContainer = document.getElementById('editModalTagPresets');
  if (!selectedContainer || !presetsContainer) return;

  selectedContainer.innerHTML = '';
  presetsContainer.innerHTML = '';

  // Выбранные теги
  if (state.modalSelectedTags.length === 0) {
    selectedContainer.innerHTML = '<span style="font-size:0.78rem; color:var(--text-muted);">Теги не выбраны</span>';
  } else {
    state.modalSelectedTags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'modal-tag-chip';
      const emojiHtml = getAppleEmoji(tag, '', 'apple-emoji-sm');
      chip.innerHTML = `
        ${emojiHtml ? emojiHtml + ' ' : ''}<span>${escapeHtml(tag)}</span>
        <button type="button" class="modal-tag-remove" onclick="removeModalTag('${escapeHtml(tag)}')" title="Удалить тег">&times;</button>
      `;
      selectedContainer.appendChild(chip);
    });
  }

  // Подсказки пресетов для текущего формата
  const currentType = document.getElementById('editType').value || 'read';
  const formatTags = state.tags[currentType] || [];
  const customTags = state.tags.custom || [];
  const allAvailable = Array.from(new Set([...formatTags, ...customTags]));

  const unselected = allAvailable.filter(t => !state.modalSelectedTags.includes(t));
  unselected.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-chip';
    const emojiHtml = getAppleEmoji(tag, '', 'apple-emoji-sm');
    btn.innerHTML = `+ ${emojiHtml ? emojiHtml + ' ' : ''}<span>${escapeHtml(tag)}</span>`;
    btn.onclick = () => addModalTag(tag);
    presetsContainer.appendChild(btn);
  });
}

function addModalTag(tag) {
  if (!state.modalSelectedTags.includes(tag)) {
    state.modalSelectedTags.push(tag);
  }
  if (!state.tags.custom.includes(tag)) {
    state.tags.custom.push(tag);
    saveData();
  }
  renderModalTags();
}

function removeModalTag(tag) {
  state.modalSelectedTags = state.modalSelectedTags.filter(t => t !== tag);
  renderModalTags();
}

function setModalProgress(val) {
  document.getElementById('editProgress').value = val;
  document.getElementById('editProgressLabel').textContent = `${val}%`;
  syncStatusWithProgress(val);
}

function syncStatusWithProgress(val) {
  const statusSelect = document.getElementById('editStatus');
  if (val === 0) {
    statusSelect.value = 'planned';
  } else if (val === 100) {
    statusSelect.value = 'done';
  } else {
    statusSelect.value = 'progress';
  }
}

function setRatingStars(rating) {
  document.getElementById('editRating').value = rating;
  const stars = document.querySelectorAll('#editRatingStars .star');
  stars.forEach(star => {
    const starVal = parseInt(star.dataset.rating, 10);
    star.classList.toggle('active', starVal <= rating);
  });
}

// ==========================================================================
// Экспорт / Импорт / Сброс данных
// ==========================================================================
function exportData() {
  const payload = {
    ...state._extraDbData,
    version: '1.0',
    updatedAt: new Date().toISOString(),
    tags: state.tags,
    folders: state.folders || [],
    items: state.items
  };
  const dataStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `cortex_db_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Резервная копия базы данных успешно скачана');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      const migrated = migrateDbSchema(imported);
      state.items = migrated.items;
      state.tags = migrated.tags;
      state.folders = migrated.folders || [];
      state.currentFolderId = null;

      saveData();
      renderCaptureTags();
      populateFolderSelects();
      renderFolderExplorer();
      renderApp();
      showToast(`Успешно импортировано: записей — ${state.items.length}, папок — ${state.folders.length}`);
    } catch (err) {
      console.error(err);
      showToast('Ошибка импорта: неверный JSON файл', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function resetToDemo() {
  if (confirm('Загрузить стартовые демонстрационные примеры?')) {
    state.items = JSON.parse(JSON.stringify(DEMO_ITEMS));
    state.folders = [];
    state.currentFolderId = null;
    saveData();
    populateFolderSelects();
    renderFolderExplorer();
    renderApp();
    showToast('Примеры материалов успешно загружены');
  }
}

function clearAllItems() {
  if (confirm('Очистить все материалы в базе данных и начать с чистого листа?')) {
    state.items = [];
    state.folders = [];
    state.currentFolderId = null;
    saveData();
    populateFolderSelects();
    renderFolderExplorer();
    renderApp();
    showToast('✨ База данных очищена! Можно собирать с нуля.');
  }
}

// ==========================================================================
// Вспомогательные функции (Уведомления, Метаданные)
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconHtml = type === 'error' ? getAppleEmoji('warning', '⚠️', 'apple-emoji-sm') : getAppleEmoji('sparkles', '✨', 'apple-emoji-sm');
  toast.innerHTML = `
    <span>${iconHtml}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function getTypeMetadata(type) {
  switch (type) {
    case 'read': return { label: 'Читать', icon: getAppleEmoji('read', '📖'), className: 'type-read' };
    case 'watch': return { label: 'Смотреть', icon: getAppleEmoji('watch', '🎬'), className: 'type-watch' };
    case 'study': return { label: 'Изучать', icon: getAppleEmoji('study', '🧠'), className: 'type-study' };
    case 'do': return { label: 'Сделать', icon: getAppleEmoji('do', '⚡'), className: 'type-do' };
    default: return { label: 'Материал', icon: getAppleEmoji('read', '📌'), className: 'type-read' };
  }
}

function getPriorityMetadata(priority) {
  switch (priority) {
    case 'high': return { label: 'Высокий', className: 'priority-high' };
    case 'medium': return { label: 'Средний', className: 'priority-medium' };
    case 'low': return { label: 'Не к спеху', className: 'priority-low' };
    default: return { label: 'Средний', className: 'priority-medium' };
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Регистрация Service Worker для PWA и оффлайн-доступа
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  });
}


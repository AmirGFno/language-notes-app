(() => {
  'use strict';

  const DEFAULT_USER_CODE = 'AMIR';
  const LEGACY_STORAGE_KEY = 'language-notes-app.data.v1';
  const ACTIVE_USER_KEY = 'language-notes-app.active-user';
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  const LEITNER_INTERVALS = [1, 2, 4, 7, 14];
  const POSITIONS = [
    { value: 'noun', label: 'اسم (Noun)' },
    { value: 'verb', label: 'فعل (Verb)' },
    { value: 'adjective', label: 'صفت (Adjective)' },
    { value: 'adverb', label: 'قید (Adverb)' },
    { value: 'pronoun', label: 'ضمیر (Pronoun)' },
    { value: 'preposition', label: 'حرف اضافه (Preposition)' },
    { value: 'conjunction', label: 'حرف ربط (Conjunction)' },
    { value: 'phrase', label: 'عبارت (Phrase)' },
    { value: 'phrasal verb', label: 'فعل عبارتی (Phrasal verb)' },
    { value: 'other', label: 'سایر (Other)' }
  ];

  const elements = {
    exportButton: document.getElementById('exportButton'),
    toast: document.getElementById('toast'),
    wordForm: document.getElementById('wordForm'),
    wordInput: document.getElementById('wordInput'),
    pronunciationInput: document.getElementById('pronunciationInput'),
    meaningFields: document.getElementById('meaningFields'),
    addMeaningButton: document.getElementById('addMeaningButton'),
    wordSearch: document.getElementById('wordSearch'),
    wordList: document.getElementById('wordList'),
    emptyWords: document.getElementById('emptyWords'),
    noSearchResults: document.getElementById('noSearchResults'),
    wordCountText: document.getElementById('wordCountText'),
    sharedNotesList: document.getElementById('sharedNotesList'),
    emptySharedNotes: document.getElementById('emptySharedNotes'),
    sharedNoteCount: document.getElementById('sharedNoteCount'),
    profileCode: document.getElementById('profileCode'),
    storageUserCode: document.getElementById('storageUserCode'),
    profileName: document.getElementById('profileName'),
    profileAvatar: document.getElementById('profileAvatar'),
    userSelect: document.getElementById('userSelect'),
    userVocabularyCount: document.getElementById('userVocabularyCount'),
    clearUserDataButton: document.getElementById('clearUserDataButton'),
    vocabularyTotal: document.getElementById('vocabularyTotal'),
    notesTotal: document.getElementById('notesTotal'),
    leitnerTotal: document.getElementById('leitnerTotal'),
    vocabularyTabCount: document.getElementById('vocabularyTabCount'),
    notesTabCount: document.getElementById('notesTabCount'),
    leitnerTabCount: document.getElementById('leitnerTabCount'),
    vocabularyPanel: document.getElementById('vocabularyPanel'),
    leitnerPanel: document.getElementById('leitnerPanel'),
    notesPanel: document.getElementById('notesPanel'),
    userDataPanel: document.getElementById('userDataPanel'),
    leitnerBoxes: document.getElementById('leitnerBoxes'),
    leitnerDueSummary: document.getElementById('leitnerDueSummary'),
    reviewCountText: document.getElementById('reviewCountText'),
    reviewBoxBadge: document.getElementById('reviewBoxBadge'),
    reviewCard: document.getElementById('reviewCard'),
    reviewWord: document.getElementById('reviewWord'),
    reviewPronunciation: document.getElementById('reviewPronunciation'),
    reviewSpeakButton: document.getElementById('reviewSpeakButton'),
    reviewAnswer: document.getElementById('reviewAnswer'),
    revealAnswerButton: document.getElementById('revealAnswerButton'),
    reviewActions: document.getElementById('reviewActions'),
    markUnknownButton: document.getElementById('markUnknownButton'),
    markKnownButton: document.getElementById('markKnownButton'),
    emptyReview: document.getElementById('emptyReview'),
    emptyReviewTitle: document.getElementById('emptyReviewTitle'),
    emptyReviewText: document.getElementById('emptyReviewText'),
    wordDetailDialog: document.getElementById('wordDetailDialog'),
    closeWordDetail: document.getElementById('closeWordDetail'),
    detailWordTitle: document.getElementById('detailWordTitle'),
    detailPronunciation: document.getElementById('detailPronunciation'),
    detailSpeakButton: document.getElementById('detailSpeakButton'),
    detailBoxBadge: document.getElementById('detailBoxBadge'),
    detailMeanings: document.getElementById('detailMeanings'),
    deleteWordButton: document.getElementById('deleteWordButton'),
    vocabularyTabButton: document.getElementById('vocabularyTab'),
    leitnerTabButton: document.getElementById('leitnerTab'),
    notesTabButton: document.getElementById('notesTab'),
    userDataTabButton: document.getElementById('userDataTab')
  };

  const USERS = loadConfiguredUsers();
  let storageReadFailed = false;
  let currentUser = getInitialUser();
  let appData = loadLocalData(currentUser.code);
  const sharedNotes = loadSharedNotes();
  let toastTimeout = null;
  let meaningRowId = 0;
  let activeReviewId = null;
  let reviewAnswerRevealed = false;
  let activeWordDetailId = null;

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function loadConfiguredUsers() {
    const configured = Array.isArray(window.APP_USERS) ? window.APP_USERS : [];
    const seen = new Set();
    const users = configured
      .filter((user) => isObject(user)
        && typeof user.code === 'string'
        && /^[A-Z0-9_-]+$/i.test(user.code.trim())
        && typeof user.nameFa === 'string'
        && user.nameFa.trim())
      .map((user) => ({ code: user.code.trim().toUpperCase(), nameFa: user.nameFa.trim() }))
      .filter((user) => {
        if (seen.has(user.code)) return false;
        seen.add(user.code);
        return true;
      });
    return users.length ? users : [{ code: DEFAULT_USER_CODE, nameFa: 'امیر' }];
  }

  function getInitialUser() {
    const defaultUser = USERS.find((user) => user.code === DEFAULT_USER_CODE) || USERS[0];
    try {
      const savedCode = window.localStorage.getItem(ACTIVE_USER_KEY);
      return USERS.find((user) => user.code === savedCode) || defaultUser;
    } catch (error) {
      storageReadFailed = true;
      return defaultUser;
    }
  }

  function storageKeyFor(userCode) {
    return `language-notes-app.user.${userCode.toLowerCase()}.v1`;
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function toFaNumber(value) {
    return Number(value).toLocaleString('fa-IR');
  }

  function validDate(value) {
    return typeof value === 'string' && value.trim() && !Number.isNaN(Date.parse(value));
  }

  function normalizeDate(value, fallback = new Date().toISOString()) {
    return validDate(value) ? value : fallback;
  }

  function normalizeWordRecord(record, index, strict = false) {
    const fail = (message) => {
      if (strict) throw new Error(`واژه‌ی شماره‌ی ${toFaNumber(index + 1)}: ${message}`);
      return null;
    };

    if (!isObject(record)) return fail('ساختار واژه درست نیست.');
    if (typeof record.word !== 'string' || !record.word.trim()) {
      return fail('فیلد «word» باید متنِ غیرخالی باشد.');
    }
    if (!Array.isArray(record.meanings) || record.meanings.length === 0) {
      return fail('فیلد «meanings» باید دست‌کم یک معنی داشته باشد.');
    }
    if (record.pronunciation != null && typeof record.pronunciation !== 'string') {
      return fail('فیلد «pronunciation» باید متن باشد.');
    }

    const meanings = [];
    for (let meaningIndex = 0; meaningIndex < record.meanings.length; meaningIndex += 1) {
      const meaning = record.meanings[meaningIndex];
      if (!isObject(meaning)
        || typeof meaning.partOfSpeech !== 'string'
        || !meaning.partOfSpeech.trim()
        || typeof meaning.definition !== 'string'
        || !meaning.definition.trim()) {
        return fail(`معنی شماره‌ی ${toFaNumber(meaningIndex + 1)} باید «partOfSpeech» و «definition» داشته باشد.`);
      }
      for (const optionalField of ['example', 'explanation']) {
        if (meaning[optionalField] != null && typeof meaning[optionalField] !== 'string') {
          return fail(`فیلد «${optionalField}» در معنی باید متن باشد.`);
        }
      }
      meanings.push({
        partOfSpeech: meaning.partOfSpeech.trim(),
        definition: meaning.definition.trim(),
        example: typeof meaning.example === 'string' ? meaning.example.trim() : '',
        explanation: typeof meaning.explanation === 'string' ? meaning.explanation.trim() : '',
        isPrimary: meaning.isPrimary === true
      });
    }

    const primaryIndex = meanings.findIndex((meaning) => meaning.isPrimary);
    meanings.forEach((meaning, meaningIndex) => {
      meaning.isPrimary = meaningIndex === (primaryIndex < 0 ? 0 : primaryIndex);
    });

    const createdAt = normalizeDate(record.createdAt);
    const box = Number(record.leitnerBox);
    const leitnerBox = Number.isInteger(box) && box >= 1 && box <= LEITNER_INTERVALS.length ? box : 1;
    const nextReviewAt = normalizeDate(record.nextReviewAt, createdAt);

    return {
      id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : makeId(),
      word: record.word.trim(),
      pronunciation: typeof record.pronunciation === 'string' ? record.pronunciation.trim() : '',
      meanings,
      createdAt,
      leitnerBox,
      nextReviewAt,
      lastReviewedAt: validDate(record.lastReviewedAt) ? record.lastReviewedAt : null
    };
  }

  function normalizeNoteRecord(record, index, strict = false) {
    const fail = (message) => {
      if (strict) throw new Error(`نکته‌ی شماره‌ی ${toFaNumber(index + 1)}: ${message}`);
      return null;
    };

    if (!isObject(record)) return fail('ساختار نکته درست نیست.');
    if (typeof record.originalNote !== 'string' || !record.originalNote.trim()) {
      return fail('فیلد «originalNote» باید متنِ غیرخالی باشد.');
    }
    if (typeof record.improvedNote !== 'string' || !record.improvedNote.trim()) {
      return fail('فیلد «improvedNote» باید متنِ غیرخالی باشد.');
    }

    return {
      id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : makeId(),
      originalNote: record.originalNote.trim(),
      improvedNote: record.improvedNote.trim(),
      createdAt: normalizeDate(record.createdAt || record.timestamp)
    };
  }

  function withUniqueIds(records) {
    const used = new Set();
    return records.map((record) => {
      let id = record.id;
      while (used.has(id)) id = makeId();
      used.add(id);
      return { ...record, id };
    });
  }

  function loadSharedNotes() {
    const records = Array.isArray(window.REPOSITORY_NOTES) ? window.REPOSITORY_NOTES : [];
    return withUniqueIds(records.map((note, index) => normalizeNoteRecord(note, index)).filter(Boolean));
  }

  function loadLocalData(userCode) {
    try {
      const profileKey = storageKeyFor(userCode);
      const profileData = window.localStorage.getItem(profileKey);
      const isLegacyData = !profileData && userCode === DEFAULT_USER_CODE;
      const raw = profileData || (isLegacyData ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null);
      if (!raw) return { version: 3, vocabulary: [] };
      const stored = JSON.parse(raw);
      if (!isObject(stored)) throw new Error('ساختار داده‌های ذخیره‌شده درست نیست.');
      const vocabulary = Array.isArray(stored.vocabulary)
        ? stored.vocabulary.map((word, index) => normalizeWordRecord(word, index)).filter(Boolean)
        : [];
      const data = { version: 3, vocabulary: withUniqueIds(vocabulary) };
      if (isLegacyData && raw) {
        try {
          window.localStorage.setItem(profileKey, JSON.stringify({ ...data, userCode }));
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch (error) {
          // Keep the legacy copy intact if the browser cannot migrate it now.
        }
      }
      return data;
    } catch (error) {
      storageReadFailed = true;
      return { version: 3, vocabulary: [] };
    }
  }

  function saveLocalData() {
    try {
      window.localStorage.setItem(storageKeyFor(currentUser.code), JSON.stringify({
        version: 3,
        userCode: currentUser.code,
        vocabulary: appData.vocabulary
      }));
      if (currentUser.code === DEFAULT_USER_CODE) window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return true;
    } catch (error) {
      showToast('ذخیره‌سازی در این مرورگر انجام نشد؛ فضای ذخیره‌سازی را بررسی کن.', 'error');
      return false;
    }
  }

  function showToast(message, kind = 'success') {
    window.clearTimeout(toastTimeout);
    elements.toast.textContent = message;
    elements.toast.dataset.kind = kind;
    elements.toast.hidden = false;
    toastTimeout = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 5000);
  }

  function persistAndRender(successMessage) {
    const saved = saveLocalData();
    renderAll();
    if (saved && successMessage) showToast(successMessage);
    return saved;
  }

  function elementWithText(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function createField(labelText, control) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';
    const label = document.createElement('label');
    label.htmlFor = control.id;
    label.textContent = labelText;
    wrapper.append(label, control);
    return wrapper;
  }

  function createMeaningRow() {
    const row = document.createElement('div');
    row.className = 'meaning-row';
    row.dataset.rowId = String(meaningRowId);

    const primaryWrap = document.createElement('div');
    primaryWrap.className = 'meaning-primary-choice';
    const primaryRadio = document.createElement('input');
    primaryRadio.type = 'radio';
    primaryRadio.name = 'primaryMeaning';
    primaryRadio.value = String(meaningRowId);
    primaryRadio.id = `primary-meaning-${meaningRowId}`;
    const primaryLabel = document.createElement('label');
    primaryLabel.htmlFor = primaryRadio.id;
    primaryLabel.textContent = 'معنی پرکاربردتر';
    primaryWrap.append(primaryRadio, primaryLabel);

    const inputs = document.createElement('div');
    inputs.className = 'meaning-inputs';

    const select = document.createElement('select');
    select.id = `part-of-speech-${meaningRowId}`;
    select.name = 'partOfSpeech';
    select.required = true;
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = 'انتخاب نوع کلمه';
    prompt.selected = true;
    select.append(prompt);
    POSITIONS.forEach((position) => {
      const option = document.createElement('option');
      option.value = position.value;
      option.textContent = position.label;
      select.append(option);
    });

    const definition = document.createElement('input');
    definition.id = `definition-${meaningRowId}`;
    definition.name = 'definition';
    definition.type = 'text';
    definition.dir = 'auto';
    definition.autocomplete = 'off';
    definition.placeholder = 'مثلاً: شادی یا a feeling of joy';
    definition.required = true;

    const example = document.createElement('input');
    example.id = `example-${meaningRowId}`;
    example.name = 'example';
    example.type = 'text';
    example.dir = 'auto';
    example.lang = 'en';
    example.autocomplete = 'off';
    example.placeholder = 'مثلاً: She was curious about the result.';

    const explanation = document.createElement('textarea');
    explanation.id = `explanation-${meaningRowId}`;
    explanation.name = 'explanation';
    explanation.dir = 'auto';
    explanation.rows = 2;
    explanation.placeholder = 'توضیح یا نکته‌ی کاربردی (اختیاری)';

    inputs.append(
      createField('نوع کلمه (Part of Speech)', select),
      createField('معنی', definition),
      createField('مثال انگلیسی (اختیاری)', example),
      createField('توضیحات (اختیاری)', explanation)
    );

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-meaning-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', 'حذف این معنی');
    removeButton.addEventListener('click', () => {
      row.remove();
      updateMeaningRows();
    });

    row.append(primaryWrap, inputs, removeButton);
    meaningRowId += 1;
    return row;
  }

  function updateMeaningRows() {
    const rows = Array.from(elements.meaningFields.querySelectorAll('.meaning-row'));
    if (!rows.some((row) => row.querySelector('input[name="primaryMeaning"]').checked) && rows[0]) {
      rows[0].querySelector('input[name="primaryMeaning"]').checked = true;
    }
    rows.forEach((row) => {
      const removeButton = row.querySelector('.remove-meaning-button');
      removeButton.disabled = rows.length <= 1;
      removeButton.title = rows.length <= 1 ? 'برای واژه دست‌کم یک معنی لازم است' : 'حذف این معنی';
    });
  }

  function meaningKey(meaning) {
    return `${meaning.partOfSpeech.trim().toLocaleLowerCase()}\u0000${meaning.definition.trim().toLocaleLowerCase()}`;
  }

  function wordKey(word) {
    return word.trim().toLocaleLowerCase();
  }

  function getPartOfSpeechLabel(value) {
    const position = POSITIONS.find((item) => item.value === value);
    return position ? position.label : value;
  }

  function getPrimaryMeaning(word) {
    return word.meanings.find((meaning) => meaning.isPrimary) || word.meanings[0];
  }

  function makeDeleteButton(label, title) {
    const button = document.createElement('button');
    button.className = 'icon-button';
    button.type = 'button';
    button.textContent = '×';
    button.setAttribute('aria-label', label);
    button.title = title;
    return button;
  }

  function getFilteredVocabulary() {
    const query = elements.wordSearch.value.trim().toLocaleLowerCase();
    if (!query) return appData.vocabulary.slice();
    return appData.vocabulary.filter((entry) => {
      const searchable = [
        entry.word,
        entry.pronunciation,
        ...entry.meanings.flatMap((meaning) => [meaning.partOfSpeech, meaning.definition, meaning.example, meaning.explanation])
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(query);
    });
  }

  function speakWord(word) {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      showToast('پخش صوت در این مرورگر پشتیبانی نمی‌شود؛ تلفظ نوشتاری را در خانه‌ی واژه ببین.', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  function renderWordTile(entry) {
    const item = document.createElement('li');
    item.className = 'word-tile';

    const openButton = document.createElement('button');
    openButton.className = 'word-tile-open';
    openButton.type = 'button';
    openButton.setAttribute('aria-label', `نمایش معنی‌ها و مثال‌های ${entry.word}`);
    openButton.addEventListener('click', () => openWordDetail(entry.id));

    const word = elementWithText('span', 'word-tile-word', entry.word);
    word.dir = 'ltr';
    word.lang = 'en';
    openButton.append(word);

    const pronunciation = elementWithText(
      'span',
      'word-tile-pronunciation',
      entry.pronunciation ? `/${entry.pronunciation.replace(/^\/+|\/+$/g, '')}/` : 'برای دیدن جزئیات بزن'
    );
    pronunciation.dir = 'ltr';
    pronunciation.lang = 'en-fonipa';
    openButton.append(pronunciation);

    const primary = getPrimaryMeaning(entry);
    const preview = document.createElement('span');
    preview.className = 'word-tile-preview';
    const position = elementWithText('span', 'pos-badge', getPartOfSpeechLabel(primary.partOfSpeech));
    const definition = elementWithText('span', 'word-tile-definition', primary.definition);
    definition.dir = 'auto';
    preview.append(position, definition);
    openButton.append(preview);
    openButton.append(elementWithText('span', 'word-tile-action', 'همه‌ی معنی‌ها'));

    const speakButton = document.createElement('button');
    speakButton.className = 'tile-speak-button';
    speakButton.type = 'button';
    speakButton.setAttribute('aria-label', `پخش تلفظ ${entry.word}`);
    speakButton.title = 'شنیدن تلفظ';
    speakButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M3.5 8v4h3l4 3V5l-4 3h-3ZM13 7a4.25 4.25 0 0 1 0 6M14.8 4.8a7.35 7.35 0 0 1 0 10.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    speakButton.addEventListener('click', () => speakWord(entry.word));

    item.append(openButton, speakButton);
    return item;
  }

  function renderWordList() {
    const words = getFilteredVocabulary();
    elements.wordList.replaceChildren(...words.slice().reverse().map(renderWordTile));

    const hasVocabulary = appData.vocabulary.length > 0;
    const hasMatches = words.length > 0;
    elements.emptyWords.hidden = hasVocabulary;
    elements.noSearchResults.hidden = !hasVocabulary || hasMatches;
    elements.wordList.hidden = !hasMatches;

    if (!hasVocabulary) {
      elements.wordCountText.textContent = 'هنوز واژه‌ای ثبت نشده است.';
    } else if (elements.wordSearch.value.trim()) {
      elements.wordCountText.textContent = `نمایش ${toFaNumber(words.length)} از ${toFaNumber(appData.vocabulary.length)} واژه`;
    } else {
      elements.wordCountText.textContent = `${toFaNumber(appData.vocabulary.length)} واژه در دفترچه‌ی تو`;
    }
  }

  function appendMeaningDetails(container, meaning, index) {
    const card = document.createElement('article');
    card.className = 'detail-meaning-card';

    const heading = document.createElement('div');
    heading.className = 'detail-meaning-heading';
    heading.append(elementWithText('span', 'pos-badge', getPartOfSpeechLabel(meaning.partOfSpeech)));
    if (meaning.isPrimary) heading.append(elementWithText('span', 'primary-badge', 'پرکاربردترین معنی'));
    heading.append(elementWithText('span', 'meaning-index', `معنی ${toFaNumber(index + 1)}`));

    const definition = elementWithText('p', 'detail-definition', meaning.definition);
    definition.dir = 'auto';
    card.append(heading, definition);

    const explanation = document.createElement('div');
    explanation.className = 'detail-extra';
    explanation.append(elementWithText('span', 'detail-extra-label', 'توضیحات'));
    const explanationText = elementWithText(
      'p',
      meaning.explanation ? 'detail-extra-text' : 'detail-extra-text is-empty',
      meaning.explanation || 'برای این معنی توضیحی ثبت نشده است.'
    );
    explanationText.dir = 'auto';
    explanation.append(explanationText);
    card.append(explanation);

    const example = document.createElement('div');
    example.className = 'detail-extra detail-example';
    example.append(elementWithText('span', 'detail-extra-label', 'مثال انگلیسی'));
    const exampleText = elementWithText(
      'p',
      meaning.example ? 'detail-extra-text' : 'detail-extra-text is-empty',
      meaning.example || 'برای این معنی مثالی ثبت نشده است.'
    );
    exampleText.dir = 'auto';
    exampleText.lang = 'en';
    example.append(exampleText);
    card.append(example);
    container.append(card);
  }

  function populateWordDetail(entry) {
    activeWordDetailId = entry.id;
    elements.detailWordTitle.textContent = entry.word;
    elements.detailPronunciation.textContent = entry.pronunciation ? `/${entry.pronunciation.replace(/^\/+|\/+$/g, '')}/` : '';
    elements.detailPronunciation.hidden = !entry.pronunciation;
    elements.detailBoxBadge.textContent = `جعبه‌ی ${toFaNumber(entry.leitnerBox)}`;
    elements.detailMeanings.replaceChildren();
    entry.meanings.forEach((meaning, index) => appendMeaningDetails(elements.detailMeanings, meaning, index));
  }

  function openWordDetail(id) {
    const entry = appData.vocabulary.find((word) => word.id === id);
    if (!entry) return;
    populateWordDetail(entry);
    elements.wordDetailDialog.showModal();
  }

  function getDueWords() {
    const now = Date.now();
    return appData.vocabulary
      .filter((entry) => Date.parse(entry.nextReviewAt) <= now)
      .sort((a, b) => Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt));
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch (error) {
      return new Date(value).toLocaleString('fa-IR');
    }
  }

  function renderLeitnerBoxes() {
    elements.leitnerBoxes.replaceChildren();
    for (let box = 1; box <= LEITNER_INTERVALS.length; box += 1) {
      const count = appData.vocabulary.filter((entry) => entry.leitnerBox === box).length;
      const item = document.createElement('li');
      item.className = `leitner-box-item box-color-${box}`;
      item.append(
        elementWithText('span', 'box-number', `جعبه ${toFaNumber(box)}`),
        elementWithText('strong', 'box-count', toFaNumber(count)),
        elementWithText('span', 'box-interval', `فاصله: ${toFaNumber(LEITNER_INTERVALS[box - 1])} روز`)
      );
      elements.leitnerBoxes.append(item);
    }
  }

  function renderLeitner() {
    renderLeitnerBoxes();
    const dueWords = getDueWords();
    elements.leitnerDueSummary.textContent = `${toFaNumber(dueWords.length)} واژه برای مرور امروز`;
    elements.leitnerTabCount.textContent = toFaNumber(dueWords.length);
    elements.leitnerTotal.textContent = toFaNumber(dueWords.length);

    if (dueWords.length === 0) {
      activeReviewId = null;
      reviewAnswerRevealed = false;
      elements.reviewCard.hidden = true;
      elements.reviewBoxBadge.hidden = true;
      elements.emptyReview.hidden = false;
      elements.reviewCountText.textContent = 'واژه‌های موعددار در این بخش نمایش داده می‌شوند.';
      if (appData.vocabulary.length === 0) {
        elements.emptyReviewTitle.textContent = 'هنوز واژه‌ای برای مرور نداری';
        elements.emptyReviewText.textContent = 'اول چند واژه به دفترچه اضافه کن تا در جعبه‌ی اول قرار بگیرند.';
      } else {
        const nextWord = appData.vocabulary
          .slice()
          .sort((a, b) => Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt))[0];
        elements.emptyReviewTitle.textContent = 'مرور امروز تمام شد!';
        elements.emptyReviewText.textContent = nextWord
          ? `مرور بعدی: ${formatDate(nextWord.nextReviewAt)}`
          : 'واژه‌ی موعدداری برای مرور باقی نمانده است.';
      }
      return;
    }

    elements.emptyReview.hidden = true;
    elements.reviewCard.hidden = false;
    const entry = dueWords.find((word) => word.id === activeReviewId) || dueWords[0];
    activeReviewId = entry.id;
    elements.reviewWord.textContent = entry.word;
    elements.reviewPronunciation.textContent = entry.pronunciation ? `/${entry.pronunciation.replace(/^\/+|\/+$/g, '')}/` : '';
    elements.reviewPronunciation.hidden = !entry.pronunciation;
    elements.reviewSpeakButton.hidden = false;
    elements.reviewSpeakButton.setAttribute('aria-label', `شنیدن تلفظ ${entry.word}`);
    elements.reviewBoxBadge.textContent = `جعبه‌ی ${toFaNumber(entry.leitnerBox)}`;
    elements.reviewBoxBadge.hidden = false;
    elements.reviewCountText.textContent = `${toFaNumber(dueWords.length)} واژه برای مرور باقی مانده است.`;
    elements.reviewAnswer.replaceChildren();
    entry.meanings.forEach((meaning, index) => appendMeaningDetails(elements.reviewAnswer, meaning, index));
    elements.reviewAnswer.hidden = !reviewAnswerRevealed;
    elements.revealAnswerButton.hidden = reviewAnswerRevealed;
    elements.reviewActions.hidden = !reviewAnswerRevealed;
  }

  function renderNoteCard(note) {
    const card = document.createElement('article');
    card.className = 'note-card';

    const header = document.createElement('div');
    header.className = 'note-card-header';
    const date = document.createElement('time');
    date.className = 'note-date';
    date.dateTime = note.createdAt;
    date.setAttribute('aria-label', `تاریخ و ساعت ثبت: ${formatDate(note.createdAt)}`);

    const calendarIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    calendarIcon.setAttribute('viewBox', '0 0 20 20');
    calendarIcon.setAttribute('fill', 'none');
    calendarIcon.setAttribute('aria-hidden', 'true');
    const calendarPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    calendarPath.setAttribute('d', 'M5 4.5h10c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1ZM7 3v3M13 3v3M4 8h12');
    calendarPath.setAttribute('stroke', 'currentColor');
    calendarPath.setAttribute('stroke-width', '1.4');
    calendarPath.setAttribute('stroke-linecap', 'round');
    calendarPath.setAttribute('stroke-linejoin', 'round');
    calendarIcon.append(calendarPath);
    date.append(calendarIcon, document.createTextNode(`ثبت در ${formatDate(note.createdAt)}`));

    header.append(date, elementWithText('span', 'shared-source-badge', 'مشترک'));

    const content = document.createElement('div');
    content.className = 'note-content-grid';
    const original = document.createElement('section');
    original.className = 'note-version';
    original.append(
      elementWithText('div', 'note-version-label', 'نکته خام'),
      elementWithText('p', 'note-text', note.originalNote)
    );
    const improved = document.createElement('section');
    improved.className = 'note-version note-version-improved';
    improved.append(
      elementWithText('div', 'note-version-label', 'نسخه‌ی اصلاح‌شده'),
      elementWithText('p', 'note-text', note.improvedNote)
    );
    original.querySelector('.note-text').dir = 'auto';
    improved.querySelector('.note-text').dir = 'auto';
    original.querySelector('.note-text').lang = 'en';
    improved.querySelector('.note-text').lang = 'en';
    original.querySelector('.note-version-label').prepend(elementWithText('span', '', ''));
    improved.querySelector('.note-version-label').prepend(elementWithText('span', '', ''));
    content.append(original, improved);
    card.append(header, content);
    return card;
  }

  function renderNotes() {
    const orderedSharedNotes = sharedNotes.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    elements.sharedNotesList.replaceChildren(...orderedSharedNotes.map((note) => renderNoteCard(note)));
    elements.sharedNotesList.hidden = orderedSharedNotes.length === 0;
    elements.emptySharedNotes.hidden = orderedSharedNotes.length > 0;
    elements.sharedNoteCount.textContent = `${toFaNumber(orderedSharedNotes.length)} نکته`;
  }

  function renderUserData() {
    if (elements.userSelect.options.length !== USERS.length) {
      elements.userSelect.replaceChildren(...USERS.map((user) => {
        const option = document.createElement('option');
        option.value = user.code;
        option.textContent = `${user.nameFa} (${user.code})`;
        return option;
      }));
    }
    elements.userSelect.value = currentUser.code;
    elements.userSelect.disabled = USERS.length <= 1;
    elements.profileName.textContent = currentUser.nameFa;
    elements.profileAvatar.textContent = currentUser.nameFa.slice(0, 1);
    elements.profileCode.textContent = currentUser.code;
    elements.storageUserCode.textContent = currentUser.code;
    elements.userVocabularyCount.textContent = toFaNumber(appData.vocabulary.length);
  }

  function renderCounts() {
    const totalNotes = sharedNotes.length;
    elements.vocabularyTotal.textContent = toFaNumber(appData.vocabulary.length);
    elements.notesTotal.textContent = toFaNumber(totalNotes);
    elements.vocabularyTabCount.textContent = toFaNumber(appData.vocabulary.length);
    elements.notesTabCount.textContent = toFaNumber(totalNotes);
  }

  function renderAll() {
    renderCounts();
    renderWordList();
    renderLeitner();
    renderNotes();
    renderUserData();
  }

  function setActiveTab(tabName, focus = false) {
    const tabs = [
      { name: 'vocabulary', button: elements.vocabularyTabButton, panel: elements.vocabularyPanel },
      { name: 'leitner', button: elements.leitnerTabButton, panel: elements.leitnerPanel },
      { name: 'notes', button: elements.notesTabButton, panel: elements.notesPanel },
      { name: 'userData', button: elements.userDataTabButton, panel: elements.userDataPanel }
    ];
    tabs.forEach(({ name, button, panel }) => {
      const active = name === tabName;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
    if (focus) tabs.find((tab) => tab.name === tabName).button.focus();
  }

  function exportData() {
    const exportObject = {
      version: 3,
      userCode: currentUser.code,
      userNameFa: currentUser.nameFa,
      exportedAt: new Date().toISOString(),
      vocabulary: appData.vocabulary
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `language-notes-${currentUser.code.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('نسخه‌ی پشتیبان داده‌های شخصی دانلود شد. این فایل در برنامه دوباره وارد نمی‌شود.');
  }

  function renderAllAfterWordChange(message) {
    activeReviewId = null;
    reviewAnswerRevealed = false;
    persistAndRender(message);
  }

  function markCurrentWord(remembered) {
    const entry = appData.vocabulary.find((word) => word.id === activeReviewId);
    if (!entry) return;
    const now = new Date();
    if (remembered) {
      entry.leitnerBox = Math.min(LEITNER_INTERVALS.length, entry.leitnerBox + 1);
    } else {
      entry.leitnerBox = 1;
    }
    entry.lastReviewedAt = now.toISOString();
    entry.nextReviewAt = new Date(now.getTime() + LEITNER_INTERVALS[entry.leitnerBox - 1] * DAY_IN_MS).toISOString();
    activeReviewId = null;
    reviewAnswerRevealed = false;
    persistAndRender(remembered
      ? `آفرین! واژه به جعبه‌ی ${toFaNumber(entry.leitnerBox)} رفت.`
      : 'واژه برای مرور دوباره به جعبه‌ی اول برگشت.');
  }

  function renderDateLabel(value) {
    return formatDate(value);
  }

  function renderMeaningRowsFromForm() {
    return Array.from(elements.meaningFields.querySelectorAll('.meaning-row')).map((row) => ({
      partOfSpeech: row.querySelector('select[name="partOfSpeech"]').value.trim(),
      definition: row.querySelector('input[name="definition"]').value.trim(),
      example: row.querySelector('input[name="example"]').value.trim(),
      explanation: row.querySelector('textarea[name="explanation"]').value.trim(),
      isPrimary: row.querySelector('input[name="primaryMeaning"]').checked
    }));
  }

  elements.meaningFields.append(createMeaningRow());
  updateMeaningRows();
  renderAll();

  elements.addMeaningButton.addEventListener('click', () => {
    const row = createMeaningRow();
    elements.meaningFields.append(row);
    updateMeaningRows();
    row.querySelector('select').focus();
  });

  elements.wordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const word = elements.wordInput.value.trim();
    const pronunciation = elements.pronunciationInput.value.trim();
    const meanings = renderMeaningRowsFromForm();
    if (!word || meanings.some((meaning) => !meaning.partOfSpeech || !meaning.definition)) {
      showToast('کلمه، نوع کلمه و معنی را کامل کن.', 'error');
      return;
    }
    if (!meanings.some((meaning) => meaning.isPrimary)) meanings[0].isPrimary = true;

    const existing = appData.vocabulary.find((entry) => wordKey(entry.word) === wordKey(word));
    if (existing) {
      if (!existing.pronunciation && pronunciation) existing.pronunciation = pronunciation;
      const selectedPrimary = meanings.find((meaning) => meaning.isPrimary);
      let selectedPrimaryTarget = null;
      meanings.forEach((meaning) => {
        const matching = existing.meanings.find((current) => meaningKey(current) === meaningKey(meaning));
        if (matching) {
          if (!matching.example && meaning.example) matching.example = meaning.example;
          if (!matching.explanation && meaning.explanation) matching.explanation = meaning.explanation;
          if (meaning === selectedPrimary) selectedPrimaryTarget = matching;
          return;
        }
        const copy = { ...meaning };
        existing.meanings.push(copy);
        if (meaning === selectedPrimary) selectedPrimaryTarget = copy;
      });
      if (selectedPrimaryTarget) {
        existing.meanings.forEach((meaning) => { meaning.isPrimary = meaning === selectedPrimaryTarget; });
      } else if (!existing.meanings.some((meaning) => meaning.isPrimary)) {
        existing.meanings[0].isPrimary = true;
      }
    } else {
      appData.vocabulary.push({
        id: makeId(),
        word,
        pronunciation,
        meanings,
        createdAt: new Date().toISOString(),
        leitnerBox: 1,
        nextReviewAt: new Date().toISOString(),
        lastReviewedAt: null
      });
    }

    elements.wordForm.reset();
    elements.meaningFields.replaceChildren(createMeaningRow());
    updateMeaningRows();
    elements.wordSearch.value = '';
    const message = existing
      ? `واژه‌ی «${existing.word}» و معنی‌هایش به‌روزرسانی شد.`
      : 'واژه‌ی تازه ذخیره شد و در جعبه‌ی اول قرار گرفت.';
    renderAllAfterWordChange(message);
  });

  elements.wordSearch.addEventListener('input', renderWordList);

  elements.revealAnswerButton.addEventListener('click', () => {
    reviewAnswerRevealed = true;
    renderLeitner();
  });
  elements.markKnownButton.addEventListener('click', () => markCurrentWord(true));
  elements.markUnknownButton.addEventListener('click', () => markCurrentWord(false));
  elements.reviewSpeakButton.addEventListener('click', () => {
    const entry = appData.vocabulary.find((word) => word.id === activeReviewId);
    if (entry) speakWord(entry.word);
  });

  elements.wordList.addEventListener('click', (event) => {
    const target = event.target.closest('.word-tile-open, .tile-speak-button');
    if (!target) return;
    const tile = target.closest('.word-tile');
    const wordIndex = Array.from(elements.wordList.children).indexOf(tile);
    const entry = getFilteredVocabulary().slice().reverse()[wordIndex];
    if (!entry) return;
    if (target.classList.contains('tile-speak-button')) {
      speakWord(entry.word);
    } else {
      openWordDetail(entry.id);
    }
  });

  elements.detailSpeakButton.addEventListener('click', () => {
    const entry = appData.vocabulary.find((word) => word.id === activeWordDetailId);
    if (entry) speakWord(entry.word);
  });
  elements.closeWordDetail.addEventListener('click', () => elements.wordDetailDialog.close());
  elements.wordDetailDialog.addEventListener('close', () => {
    activeWordDetailId = null;
  });
  elements.deleteWordButton.addEventListener('click', () => {
    const entry = appData.vocabulary.find((word) => word.id === activeWordDetailId);
    if (!entry || !window.confirm(`واژه‌ی «${entry.word}» و تمام معنی‌هایش حذف شود؟`)) return;
    appData.vocabulary = appData.vocabulary.filter((word) => word.id !== entry.id);
    elements.wordDetailDialog.close();
    activeWordDetailId = null;
    renderAllAfterWordChange('واژه از دفترچه حذف شد.');
  });

  elements.exportButton.addEventListener('click', exportData);
  elements.userSelect.addEventListener('change', () => {
    const nextUser = USERS.find((user) => user.code === elements.userSelect.value);
    if (!nextUser || nextUser.code === currentUser.code) return;
    try {
      window.localStorage.setItem(ACTIVE_USER_KEY, nextUser.code);
    } catch (error) {
      showToast('انتخاب کاربر در این مرورگر ذخیره نشد.', 'error');
      return;
    }
    currentUser = nextUser;
    appData = loadLocalData(currentUser.code);
    activeReviewId = null;
    reviewAnswerRevealed = false;
    elements.wordForm.reset();
    elements.meaningFields.replaceChildren(createMeaningRow());
    updateMeaningRows();
    elements.wordSearch.value = '';
    renderAll();
    showToast(`پروفایل ${currentUser.nameFa} فعال شد؛ داده‌ها از حافظه‌ی محلی همین مرورگر خوانده شدند.`);
  });
  elements.clearUserDataButton.addEventListener('click', () => {
    if (!window.confirm(`داده‌های شخصی پروفایل ${currentUser.nameFa} (${currentUser.code}) از این دستگاه پاک شود؟`)) return;
    appData = { version: 3, vocabulary: [] };
    activeReviewId = null;
    reviewAnswerRevealed = false;
    persistAndRender('واژه‌های این دستگاه پاک شدند؛ نکته‌های مشترک تغییری نکردند.');
  });

  const tabButtons = [
    elements.vocabularyTabButton,
    elements.leitnerTabButton,
    elements.notesTabButton,
    elements.userDataTabButton
  ];
  const tabNames = ['vocabulary', 'leitner', 'notes', 'userData'];
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(tabNames[tabButtons.indexOf(button)]));
    button.addEventListener('keydown', (event) => {
      const currentIndex = tabButtons.indexOf(button);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex + 1) % tabButtons.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + tabButtons.length - 1) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        setActiveTab(tabNames[nextIndex], true);
      }
    });
  });

  if (storageReadFailed) {
    showToast('اطلاعات ذخیره‌شده خوانده نشد؛ شاید داده‌ی مرورگر آسیب دیده باشد.', 'error');
  }
})();

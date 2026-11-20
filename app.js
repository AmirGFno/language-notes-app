(() => {
  'use strict';

  const STORAGE_KEY = 'language-notes-app.data.v1';
  const MAX_IMPORT_SIZE = 10 * 1024 * 1024;
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
    importButton: document.getElementById('importButton'),
    importFile: document.getElementById('importFile'),
    importDialog: document.getElementById('importDialog'),
    importSummary: document.getElementById('importSummary'),
    closeImportDialog: document.getElementById('closeImportDialog'),
    cancelImportButton: document.getElementById('cancelImportButton'),
    confirmImportButton: document.getElementById('confirmImportButton'),
    toast: document.getElementById('toast'),
    wordForm: document.getElementById('wordForm'),
    wordInput: document.getElementById('wordInput'),
    meaningFields: document.getElementById('meaningFields'),
    addMeaningButton: document.getElementById('addMeaningButton'),
    wordSearch: document.getElementById('wordSearch'),
    wordList: document.getElementById('wordList'),
    emptyWords: document.getElementById('emptyWords'),
    noSearchResults: document.getElementById('noSearchResults'),
    wordCountText: document.getElementById('wordCountText'),
    wordListView: document.getElementById('wordListView'),
    flashcardView: document.getElementById('flashcardView'),
    flashcard: document.getElementById('flashcard'),
    flashcardWord: document.getElementById('flashcardWord'),
    flashcardMeanings: document.getElementById('flashcardMeanings'),
    flashcardPosition: document.getElementById('flashcardPosition'),
    previousCardButton: document.getElementById('previousCardButton'),
    nextCardButton: document.getElementById('nextCardButton'),
    listModeButton: document.getElementById('listModeButton'),
    flashcardModeButton: document.getElementById('flashcardModeButton'),
    noteForm: document.getElementById('noteForm'),
    originalNote: document.getElementById('originalNote'),
    improvedNote: document.getElementById('improvedNote'),
    notesList: document.getElementById('notesList'),
    emptyNotes: document.getElementById('emptyNotes'),
    notesCountText: document.getElementById('notesCountText'),
    noteListCount: document.getElementById('noteListCount'),
    vocabularyTotal: document.getElementById('vocabularyTotal'),
    notesTotal: document.getElementById('notesTotal'),
    vocabularyTabCount: document.getElementById('vocabularyTabCount'),
    notesTabCount: document.getElementById('notesTabCount'),
    vocabularyTab: document.getElementById('vocabularyTab'),
    notesTab: document.getElementById('notesTab'),
    vocabularyPanel: document.getElementById('vocabularyPanel'),
    notesPanel: document.getElementById('notesPanel')
  };

  let storageReadFailed = false;
  let appData = loadLocalData();
  let pendingImport = null;
  let toastTimeout = null;
  let meaningRowId = 0;
  let flashcardIndex = 0;
  let displayMode = 'list';

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function normalizeDate(value) {
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Date.parse(value))) {
      return value;
    }
    return new Date().toISOString();
  }

  function normalizeWordRecord(record, index, strict = false) {
    const fail = (message) => {
      if (strict) {
        throw new Error(`واژه‌ی شماره‌ی ${toFaNumber(index + 1)}: ${message}`);
      }
      return null;
    };

    if (!isObject(record)) return fail('ساختار واژه درست نیست.');
    if (typeof record.word !== 'string' || !record.word.trim()) {
      return fail('فیلد «word» باید متنِ غیرخالی باشد.');
    }
    if (!Array.isArray(record.meanings) || record.meanings.length === 0) {
      return fail('فیلد «meanings» باید دست‌کم یک معنی داشته باشد.');
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
      meanings.push({
        partOfSpeech: meaning.partOfSpeech.trim(),
        definition: meaning.definition.trim()
      });
    }

    return {
      id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : makeId(),
      word: record.word.trim(),
      meanings,
      createdAt: normalizeDate(record.createdAt)
    };
  }

  function normalizeNoteRecord(record, index, strict = false) {
    const fail = (message) => {
      if (strict) {
        throw new Error(`نکته‌ی شماره‌ی ${toFaNumber(index + 1)}: ${message}`);
      }
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

  function loadLocalData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: 1, vocabulary: [], notes: [] };

      const stored = JSON.parse(raw);
      if (!isObject(stored)) throw new Error('ساختار داده‌های ذخیره‌شده درست نیست.');
      const vocabulary = Array.isArray(stored.vocabulary)
        ? stored.vocabulary.map((word, index) => normalizeWordRecord(word, index)).filter(Boolean)
        : [];
      const notes = Array.isArray(stored.notes)
        ? stored.notes.map((note, index) => normalizeNoteRecord(note, index)).filter(Boolean)
        : [];

      return {
        version: 1,
        vocabulary: withUniqueIds(vocabulary),
        notes: withUniqueIds(notes)
      };
    } catch (error) {
      storageReadFailed = true;
      return { version: 1, vocabulary: [], notes: [] };
    }
  }

  function saveLocalData() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        vocabulary: appData.vocabulary,
        notes: appData.notes
      }));
      return true;
    } catch (error) {
      showToast('ذخیره‌سازی در این مرورگر انجام نشد؛ فضای ذخیره‌سازی را بررسی کن.', 'error');
      return false;
    }
  }

  function toFaNumber(value) {
    return Number(value).toLocaleString('fa-IR');
  }

  function showToast(message, kind = 'success') {
    if (!elements.toast) return;
    window.clearTimeout(toastTimeout);
    elements.toast.textContent = message;
    elements.toast.dataset.kind = kind;
    elements.toast.hidden = false;
    toastTimeout = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 5000);
  }

  function setDataAndRender(successMessage) {
    const saved = saveLocalData();
    renderAll();
    if (saved && successMessage) showToast(successMessage);
    return saved;
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

    inputs.append(
      createField('نوع کلمه (Part of Speech)', select),
      createField('معنی', definition)
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

    row.append(inputs, removeButton);
    meaningRowId += 1;
    return row;
  }

  function updateMeaningRows() {
    const rows = Array.from(elements.meaningFields.querySelectorAll('.meaning-row'));
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

  function elementWithText(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
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
        ...entry.meanings.flatMap((meaning) => [meaning.partOfSpeech, meaning.definition])
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(query);
    });
  }

  function renderWordItem(entry) {
    const item = document.createElement('li');
    item.className = 'word-item';

    const heading = document.createElement('div');
    heading.className = 'word-item-heading';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'word-title-wrap';
    const title = elementWithText('h4', 'word-title', entry.word);
    title.lang = 'en';
    title.dir = 'ltr';
    const count = elementWithText('span', 'meaning-total', `${toFaNumber(entry.meanings.length)} معنی`);
    titleWrap.append(title, count);

    const deleteButton = makeDeleteButton(`حذف واژه‌ی ${entry.word}`, 'حذف واژه');
    deleteButton.addEventListener('click', () => {
      if (!window.confirm(`واژه‌ی «${entry.word}» از دفترچه حذف شود؟`)) return;
      appData.vocabulary = appData.vocabulary.filter((word) => word.id !== entry.id);
      flashcardIndex = 0;
      setDataAndRender('واژه از دفترچه حذف شد.');
    });
    heading.append(titleWrap, deleteButton);

    const meaningList = document.createElement('ul');
    meaningList.className = 'word-meaning-list';
    entry.meanings.forEach((meaning) => {
      const meaningItem = document.createElement('li');
      meaningItem.className = 'word-meaning';
      meaningItem.append(
        elementWithText('span', 'pos-badge', getPartOfSpeechLabel(meaning.partOfSpeech)),
        elementWithText('span', 'meaning-definition', meaning.definition)
      );
      meaningItem.lastElementChild.dir = 'auto';
      meaningList.append(meaningItem);
    });

    item.append(heading, meaningList);
    return item;
  }

  function renderWordList(filteredWords) {
    elements.wordList.replaceChildren();
    filteredWords.slice().reverse().forEach((entry) => {
      elements.wordList.append(renderWordItem(entry));
    });

    const hasVocabulary = appData.vocabulary.length > 0;
    const hasMatches = filteredWords.length > 0;
    elements.emptyWords.hidden = hasVocabulary;
    elements.noSearchResults.hidden = !hasVocabulary || hasMatches;

    if (!hasVocabulary) {
      elements.wordCountText.textContent = 'هنوز واژه‌ای ثبت نشده است.';
    } else if (elements.wordSearch.value.trim()) {
      elements.wordCountText.textContent = `نمایش ${toFaNumber(filteredWords.length)} از ${toFaNumber(appData.vocabulary.length)} واژه`;
    } else {
      elements.wordCountText.textContent = `${toFaNumber(appData.vocabulary.length)} واژه در دفترچه‌ی تو`;
    }
  }

  function setFlashcardFace(flipped) {
    elements.flashcard.classList.toggle('is-flipped', flipped);
    elements.flashcard.setAttribute('aria-pressed', String(flipped));
    elements.flashcard.querySelector('.flashcard-front').setAttribute('aria-hidden', String(flipped));
    elements.flashcard.querySelector('.flashcard-back').setAttribute('aria-hidden', String(!flipped));
  }

  function renderFlashcard(filteredWords) {
    const toolbar = elements.flashcardView.querySelector('.flashcard-toolbar');
    const controls = elements.flashcardView.querySelector('.flashcard-controls');
    const hasCards = filteredWords.length > 0;
    elements.flashcard.hidden = !hasCards;
    toolbar.hidden = !hasCards;
    controls.hidden = !hasCards;
    elements.emptyFlashcards.hidden = hasCards;
    if (!hasCards) {
      elements.flashcardPosition.textContent = '';
      elements.flashcardWord.textContent = '';
      elements.flashcardMeanings.replaceChildren();
      return;
    }

    flashcardIndex = ((flashcardIndex % filteredWords.length) + filteredWords.length) % filteredWords.length;
    const entry = filteredWords[flashcardIndex];
    elements.flashcardWord.textContent = entry.word;
    elements.flashcardPosition.textContent = `${toFaNumber(flashcardIndex + 1)} از ${toFaNumber(filteredWords.length)}`;
    elements.flashcard.setAttribute('aria-label', `کارت واژه‌ی ${entry.word}؛ برای دیدن معنی، دوباره بزن`);
    setFlashcardFace(false);

    const meaningRows = entry.meanings.map((meaning) => {
      const row = document.createElement('span');
      row.className = 'flashcard-meaning-row';
      const label = elementWithText('span', 'pos-badge', getPartOfSpeechLabel(meaning.partOfSpeech));
      const definition = elementWithText('span', 'meaning-definition', meaning.definition);
      definition.dir = 'auto';
      row.append(label, definition);
      return row;
    });
    elements.flashcardMeanings.replaceChildren(...meaningRows);
  }

  function renderVocabulary() {
    const filteredWords = getFilteredVocabulary();
    const listMode = displayMode === 'list';
    elements.listModeButton.classList.toggle('is-selected', listMode);
    elements.listModeButton.setAttribute('aria-pressed', String(listMode));
    elements.flashcardModeButton.classList.toggle('is-selected', !listMode);
    elements.flashcardModeButton.setAttribute('aria-pressed', String(!listMode));
    elements.wordListView.hidden = !listMode;
    elements.flashcardView.hidden = listMode;
    renderWordList(filteredWords);
    renderFlashcard(filteredWords);
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
    date.append(calendarIcon, document.createTextNode(formatDate(note.createdAt)));

    const deleteButton = makeDeleteButton('حذف این نکته', 'حذف نکته');
    deleteButton.addEventListener('click', () => {
      if (!window.confirm('این نکته از دفترچه حذف شود؟')) return;
      appData.notes = appData.notes.filter((item) => item.id !== note.id);
      setDataAndRender('نکته از دفترچه حذف شد.');
    });
    header.append(date, deleteButton);

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
    elements.notesList.replaceChildren();
    const orderedNotes = appData.notes.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    orderedNotes.forEach((note) => elements.notesList.append(renderNoteCard(note)));
    const hasNotes = appData.notes.length > 0;
    elements.emptyNotes.hidden = hasNotes;
    elements.notesList.hidden = !hasNotes;
    elements.noteListCount.textContent = `${toFaNumber(appData.notes.length)} نکته`;
    elements.notesCountText.textContent = hasNotes
      ? 'یادداشت‌ها به‌ترتیب تازه‌ترین تاریخ نمایش داده می‌شوند.'
      : 'هنوز نکته‌ای ثبت نشده است.';
  }

  function renderCounts() {
    const wordCount = appData.vocabulary.length;
    const noteCount = appData.notes.length;
    elements.vocabularyTotal.textContent = toFaNumber(wordCount);
    elements.notesTotal.textContent = toFaNumber(noteCount);
    elements.vocabularyTabCount.textContent = toFaNumber(wordCount);
    elements.notesTabCount.textContent = toFaNumber(noteCount);
  }

  function renderAll() {
    renderCounts();
    renderVocabulary();
    renderNotes();
  }

  function setDisplayMode(mode) {
    displayMode = mode;
    if (mode === 'flashcard') flashcardIndex = 0;
    renderVocabulary();
  }

  function setActiveTab(tabName, focus = false) {
    const vocabularyActive = tabName === 'vocabulary';
    elements.vocabularyTab.classList.toggle('is-active', vocabularyActive);
    elements.vocabularyTab.setAttribute('aria-selected', String(vocabularyActive));
    elements.vocabularyTab.tabIndex = vocabularyActive ? 0 : -1;
    elements.vocabularyPanel.hidden = !vocabularyActive;
    elements.notesTab.classList.toggle('is-active', !vocabularyActive);
    elements.notesTab.setAttribute('aria-selected', String(!vocabularyActive));
    elements.notesTab.tabIndex = vocabularyActive ? -1 : 0;
    elements.notesPanel.hidden = vocabularyActive;
    if (focus) (vocabularyActive ? elements.vocabularyTab : elements.notesTab).focus();
  }

  function exportData() {
    const exportObject = {
      version: 1,
      exportedAt: new Date().toISOString(),
      vocabulary: appData.vocabulary,
      notes: appData.notes
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `language-notes-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('فایل پشتیبان واژه‌ها و نکته‌ها دانلود شد.');
  }

  function parseImportData(payload) {
    let rawVocabulary = [];
    let rawNotes = [];
    if (Array.isArray(payload)) {
      rawVocabulary = payload;
    } else if (isObject(payload)) {
      const hasVocabulary = Object.prototype.hasOwnProperty.call(payload, 'vocabulary')
        || Object.prototype.hasOwnProperty.call(payload, 'words');
      const hasNotes = Object.prototype.hasOwnProperty.call(payload, 'notes');
      if (!hasVocabulary && !hasNotes) {
        throw new Error('فایل باید آرایه‌ی «vocabulary» یا «words» و/یا آرایه‌ی «notes» داشته باشد.');
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'vocabulary')) {
        rawVocabulary = payload.vocabulary;
      } else if (Object.prototype.hasOwnProperty.call(payload, 'words')) {
        rawVocabulary = payload.words;
      }
      rawNotes = hasNotes ? payload.notes : [];
      if (!Array.isArray(rawVocabulary)) {
        throw new Error('مقدار «vocabulary» یا «words» باید آرایه باشد.');
      }
      if (!Array.isArray(rawNotes)) {
        throw new Error('مقدار «notes» باید آرایه باشد.');
      }
    } else {
      throw new Error('ساختار فایل JSON شناخته نشد.');
    }

    const vocabulary = rawVocabulary.map((word, index) => normalizeWordRecord(word, index, true));
    const notes = rawNotes.map((note, index) => normalizeNoteRecord(note, index, true));
    return {
      vocabulary: withUniqueIds(vocabulary),
      notes: withUniqueIds(notes)
    };
  }

  function makeUniqueId(usedIds) {
    let id = makeId();
    while (usedIds.has(id)) id = makeId();
    return id;
  }

  function mergeImportedData(current, incoming) {
    const merged = {
      version: 1,
      vocabulary: current.vocabulary.map((entry) => ({
        ...entry,
        meanings: entry.meanings.map((meaning) => ({ ...meaning }))
      })),
      notes: current.notes.map((note) => ({ ...note }))
    };

    const usedWordIds = new Set(merged.vocabulary.map((entry) => entry.id));
    incoming.vocabulary.forEach((importedWord) => {
      const existing = merged.vocabulary.find((entry) => wordKey(entry.word) === wordKey(importedWord.word));
      if (existing) {
        const existingMeanings = new Set(existing.meanings.map(meaningKey));
        importedWord.meanings.forEach((meaning) => {
          if (!existingMeanings.has(meaningKey(meaning))) {
            existing.meanings.push({ ...meaning });
            existingMeanings.add(meaningKey(meaning));
          }
        });
        return;
      }

      const copy = {
        ...importedWord,
        id: usedWordIds.has(importedWord.id) ? makeUniqueId(usedWordIds) : importedWord.id,
        meanings: importedWord.meanings.map((meaning) => ({ ...meaning }))
      };
      usedWordIds.add(copy.id);
      merged.vocabulary.push(copy);
    });

    const usedNoteIds = new Set(merged.notes.map((note) => note.id));
    const noteSignatures = new Set(merged.notes.map(noteSignature));
    incoming.notes.forEach((importedNote) => {
      const signature = noteSignature(importedNote);
      if (noteSignatures.has(signature)) return;
      const copy = {
        ...importedNote,
        id: usedNoteIds.has(importedNote.id) ? makeUniqueId(usedNoteIds) : importedNote.id
      };
      usedNoteIds.add(copy.id);
      noteSignatures.add(signature);
      merged.notes.push(copy);
    });

    return merged;
  }

  function noteSignature(note) {
    return `${note.originalNote}\u0000${note.improvedNote}\u0000${note.createdAt}`;
  }

  async function handleImportFile(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_IMPORT_SIZE) {
      showToast('حجم فایل بیشتر از ۱۰ مگابایت است.', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      pendingImport = parseImportData(parsed);
      const wordText = `${toFaNumber(pendingImport.vocabulary.length)} واژه`;
      const noteText = `${toFaNumber(pendingImport.notes.length)} نکته`;
      elements.importSummary.textContent = `فایل «${file.name}» شامل ${wordText} و ${noteText} است. روش ورود را انتخاب کن.`;
      elements.importDialog.showModal();
    } catch (error) {
      pendingImport = null;
      const message = error instanceof SyntaxError
        ? 'محتوای فایل JSON معتبر نیست.'
        : (error.message || 'خواندن فایل انجام نشد.');
      showToast(message, 'error');
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    const selectedMode = document.querySelector('input[name="importMode"]:checked');
    const replaceExisting = selectedMode && selectedMode.value === 'replace';
    appData = replaceExisting
      ? {
          version: 1,
          vocabulary: pendingImport.vocabulary.map((entry) => ({
            ...entry,
            meanings: entry.meanings.map((meaning) => ({ ...meaning }))
          })),
          notes: pendingImport.notes.map((note) => ({ ...note }))
        }
      : mergeImportedData(appData, pendingImport);

    pendingImport = null;
    elements.importDialog.close();
    elements.wordSearch.value = '';
    flashcardIndex = 0;
    const saved = saveLocalData();
    renderAll();
    if (saved) {
      showToast(replaceExisting ? 'اطلاعات فایل جایگزین شد.' : 'اطلاعات فایل به دفترچه اضافه شد.');
    }
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
    const meaningRows = Array.from(elements.meaningFields.querySelectorAll('.meaning-row'));
    const meanings = meaningRows.map((row) => ({
      partOfSpeech: row.querySelector('select').value.trim(),
      definition: row.querySelector('input[name="definition"]').value.trim()
    }));

    if (!word || meanings.some((meaning) => !meaning.partOfSpeech || !meaning.definition)) {
      showToast('کلمه، نوع کلمه و معنی را کامل کن.', 'error');
      return;
    }

    const existing = appData.vocabulary.find((entry) => wordKey(entry.word) === wordKey(word));
    let successMessage;
    if (existing) {
      const knownMeanings = new Set(existing.meanings.map(meaningKey));
      let addedCount = 0;
      meanings.forEach((meaning) => {
        if (!knownMeanings.has(meaningKey(meaning))) {
          existing.meanings.push(meaning);
          knownMeanings.add(meaningKey(meaning));
          addedCount += 1;
        }
      });
      successMessage = addedCount > 0
        ? `معنی‌های تازه به واژه‌ی «${existing.word}» اضافه شد.`
        : 'این واژه و معنی‌هایش از قبل در دفترچه هستند.';
    } else {
      appData.vocabulary.push({
        id: makeId(),
        word,
        meanings,
        createdAt: new Date().toISOString()
      });
      successMessage = 'واژه‌ی تازه در دفترچه ذخیره شد.';
    }

    elements.wordForm.reset();
    elements.meaningFields.replaceChildren(createMeaningRow());
    updateMeaningRows();
    elements.wordSearch.value = '';
    flashcardIndex = 0;
    setDataAndRender(successMessage);
  });

  elements.wordSearch.addEventListener('input', () => {
    flashcardIndex = 0;
    renderVocabulary();
  });

  elements.listModeButton.addEventListener('click', () => setDisplayMode('list'));
  elements.flashcardModeButton.addEventListener('click', () => setDisplayMode('flashcard'));

  elements.flashcard.addEventListener('click', () => {
    const flipped = elements.flashcard.getAttribute('aria-pressed') !== 'true';
    setFlashcardFace(flipped);
    const entry = getFilteredVocabulary()[flashcardIndex];
    if (entry) {
      elements.flashcard.setAttribute('aria-label', flipped
        ? `معنی‌های واژه‌ی ${entry.word}`
        : `کارت واژه‌ی ${entry.word}؛ برای دیدن معنی، دوباره بزن`);
    }
  });

  elements.previousCardButton.addEventListener('click', () => {
    const cards = getFilteredVocabulary();
    if (!cards.length) return;
    flashcardIndex = (flashcardIndex - 1 + cards.length) % cards.length;
    renderFlashcard(cards);
  });

  elements.nextCardButton.addEventListener('click', () => {
    const cards = getFilteredVocabulary();
    if (!cards.length) return;
    flashcardIndex = (flashcardIndex + 1) % cards.length;
    renderFlashcard(cards);
  });

  elements.noteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const originalNote = elements.originalNote.value.trim();
    const improvedNote = elements.improvedNote.value.trim();
    if (!originalNote || !improvedNote) {
      showToast('هر دو نسخه‌ی نکته را وارد کن.', 'error');
      return;
    }

    appData.notes.unshift({
      id: makeId(),
      originalNote,
      improvedNote,
      createdAt: new Date().toISOString()
    });
    elements.noteForm.reset();
    setDataAndRender('نکته‌ی تازه با تاریخ و ساعت ذخیره شد.');
  });

  elements.exportButton.addEventListener('click', exportData);
  elements.importButton.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', handleImportFile);
  elements.confirmImportButton.addEventListener('click', confirmImport);
  elements.cancelImportButton.addEventListener('click', () => elements.importDialog.close());
  elements.closeImportDialog.addEventListener('click', () => elements.importDialog.close());
  elements.importDialog.addEventListener('close', () => {
    pendingImport = null;
  });

  elements.vocabularyTab.addEventListener('click', () => setActiveTab('vocabulary'));
  elements.notesTab.addEventListener('click', () => setActiveTab('notes'));
  [elements.vocabularyTab, elements.notesTab].forEach((tab) => {
    tab.addEventListener('keydown', (event) => {
      const tabs = [elements.vocabularyTab, elements.notesTab];
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        setActiveTab(nextTab === elements.vocabularyTab ? 'vocabulary' : 'notes', true);
      }
    });
  });

  if (storageReadFailed) {
    showToast('اطلاعات ذخیره‌شده خوانده نشد؛ شاید داده‌ی مرورگر آسیب دیده باشد.', 'error');
  }
})();

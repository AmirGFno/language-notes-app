(() => {
  'use strict';

  const REVIEW_STORAGE_KEY = 'language-notes-app.review.v1';
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
    toast: document.getElementById('toast'),
    wordSearch: document.getElementById('wordSearch'),
    wordList: document.getElementById('wordList'),
    emptyWords: document.getElementById('emptyWords'),
    noSearchResults: document.getElementById('noSearchResults'),
    wordCountText: document.getElementById('wordCountText'),
    sharedNotesList: document.getElementById('sharedNotesList'),
    emptySharedNotes: document.getElementById('emptySharedNotes'),
    sharedNoteCount: document.getElementById('sharedNoteCount'),
    sharedIdiomsList: document.getElementById('sharedIdiomsList'),
    emptySharedIdioms: document.getElementById('emptySharedIdioms'),
    sharedIdiomCount: document.getElementById('sharedIdiomCount'),
    vocabularyTotal: document.getElementById('vocabularyTotal'),
    notesTotal: document.getElementById('notesTotal'),
    leitnerTotal: document.getElementById('leitnerTotal'),
    vocabularyTabCount: document.getElementById('vocabularyTabCount'),
    notesTabCount: document.getElementById('notesTabCount'),
    idiomsTabCount: document.getElementById('idiomsTabCount'),
    leitnerTabCount: document.getElementById('leitnerTabCount'),
    vocabularyPanel: document.getElementById('vocabularyPanel'),
    leitnerPanel: document.getElementById('leitnerPanel'),
    notesPanel: document.getElementById('notesPanel'),
    idiomsPanel: document.getElementById('idiomsPanel'),
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
    vocabularyTabButton: document.getElementById('vocabularyTab'),
    leitnerTabButton: document.getElementById('leitnerTab'),
    notesTabButton: document.getElementById('notesTab'),
    idiomsTabButton: document.getElementById('idiomsTab')
  };

  let storageReadFailed = false;
  let toastTimeout = null;
  let activeReviewId = null;
  let reviewAnswerRevealed = false;
  let activeWordDetailId = null;
  const reviewProgress = loadReviewProgress();
  const appData = { version: 1, vocabulary: loadRepositoryVocabulary(reviewProgress) };
  const sharedNotes = loadSharedNotes();
  const sharedIdioms = loadSharedIdioms();

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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

  function loadReviewProgress() {
    try {
      const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return isObject(parsed) && isObject(parsed.progress) ? parsed.progress : {};
    } catch (error) {
      storageReadFailed = true;
      return {};
    }
  }

  function stableId(prefix, text, index) {
    const slug = String(text || '')
      .trim()
      .toLocaleLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${prefix}-${slug || index + 1}`;
  }

  function normalizeWordRecord(record, index, progress) {
    if (!isObject(record) || typeof record.word !== 'string' || !record.word.trim()) return null;
    if (!Array.isArray(record.meanings) || record.meanings.length === 0) return null;
    if (record.pronunciation != null && typeof record.pronunciation !== 'string') return null;

    const meanings = [];
    for (const meaning of record.meanings) {
      if (!isObject(meaning)
        || typeof meaning.partOfSpeech !== 'string' || !meaning.partOfSpeech.trim()
        || typeof meaning.definition !== 'string' || !meaning.definition.trim()) return null;
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

    const word = record.word.trim();
    const id = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : stableId('word', word, index);
    const savedProgress = isObject(progress[id]) ? progress[id] : {};
    const createdAt = normalizeDate(record.createdAt);
    const storedBox = Number(savedProgress.leitnerBox);
    const sourceBox = Number(record.leitnerBox);
    const leitnerBox = Number.isInteger(storedBox) && storedBox >= 1 && storedBox <= LEITNER_INTERVALS.length
      ? storedBox
      : Number.isInteger(sourceBox) && sourceBox >= 1 && sourceBox <= LEITNER_INTERVALS.length ? sourceBox : 1;

    return {
      id,
      word,
      pronunciation: typeof record.pronunciation === 'string' ? record.pronunciation.trim() : '',
      meanings,
      createdAt,
      leitnerBox,
      nextReviewAt: normalizeDate(savedProgress.nextReviewAt || record.nextReviewAt, createdAt),
      lastReviewedAt: validDate(savedProgress.lastReviewedAt)
        ? savedProgress.lastReviewedAt
        : validDate(record.lastReviewedAt) ? record.lastReviewedAt : null
    };
  }

  function normalizeNoteRecord(record, index) {
    if (!isObject(record)
      || typeof record.originalNote !== 'string' || !record.originalNote.trim()
      || typeof record.improvedNote !== 'string' || !record.improvedNote.trim()) return null;
    return {
      id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : stableId('note', record.originalNote, index),
      originalNote: record.originalNote.trim(),
      improvedNote: record.improvedNote.trim(),
      createdAt: normalizeDate(record.createdAt || record.timestamp)
    };
  }

  function normalizeIdiomRecord(record, index) {
    if (!isObject(record)
      || typeof record.phrase !== 'string' || !record.phrase.trim()
      || typeof record.meaning !== 'string' || !record.meaning.trim()) return null;
    return {
      id: typeof record.id === 'string' && record.id.trim() ? record.id.trim() : stableId('idiom', record.phrase, index),
      phrase: record.phrase.trim(),
      meaning: record.meaning.trim(),
      explanation: typeof record.explanation === 'string' ? record.explanation.trim() : '',
      example: typeof record.example === 'string' ? record.example.trim() : '',
      register: typeof record.register === 'string' ? record.register.trim() : ''
    };
  }

  function withUniqueIds(records) {
    const used = new Set();
    return records.map((record) => {
      let id = record.id;
      let suffix = 2;
      while (used.has(id)) {
        id = `${record.id}-${suffix}`;
        suffix += 1;
      }
      used.add(id);
      return { ...record, id };
    });
  }

  function loadRepositoryVocabulary(progress) {
    const records = Array.isArray(window.REPOSITORY_VOCABULARY) ? window.REPOSITORY_VOCABULARY : [];
    return withUniqueIds(records.map((word, index) => normalizeWordRecord(word, index, progress)).filter(Boolean));
  }

  function loadSharedNotes() {
    const records = Array.isArray(window.REPOSITORY_NOTES) ? window.REPOSITORY_NOTES : [];
    return withUniqueIds(records.map(normalizeNoteRecord).filter(Boolean));
  }

  function loadSharedIdioms() {
    const records = Array.isArray(window.REPOSITORY_IDIOMS) ? window.REPOSITORY_IDIOMS : [];
    return withUniqueIds(records.map(normalizeIdiomRecord).filter(Boolean));
  }

  function saveReviewProgress() {
    try {
      const progress = {};
      appData.vocabulary.forEach((word) => {
        progress[word.id] = {
          leitnerBox: word.leitnerBox,
          nextReviewAt: word.nextReviewAt,
          lastReviewedAt: word.lastReviewedAt
        };
      });
      window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify({ version: 1, progress }));
      return true;
    } catch (error) {
      showToast('ذخیره‌ی پیشرفت مرور در این مرورگر انجام نشد.', 'error');
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

  function elementWithText(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function toStableAlphabeticalOrder(records, field) {
    return records.slice().sort((first, second) => first[field].localeCompare(second[field], 'en'));
  }

  function getPartOfSpeechLabel(value) {
    const position = POSITIONS.find((item) => item.value === value);
    return position ? position.label : value;
  }

  function getPrimaryMeaning(word) {
    return word.meanings.find((meaning) => meaning.isPrimary) || word.meanings[0];
  }

  function getFilteredVocabulary() {
    const query = elements.wordSearch.value.trim().toLocaleLowerCase();
    if (!query) return toStableAlphabeticalOrder(appData.vocabulary, 'word');
    return appData.vocabulary.filter((entry) => {
      const searchable = [
        entry.word,
        entry.pronunciation,
        ...entry.meanings.flatMap((meaning) => [meaning.partOfSpeech, meaning.definition, meaning.example, meaning.explanation])
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(query);
    }).sort((first, second) => first.word.localeCompare(second.word, 'en'));
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
    preview.append(
      elementWithText('span', 'pos-badge', getPartOfSpeechLabel(primary.partOfSpeech)),
      elementWithText('span', 'word-tile-definition', primary.definition)
    );
    preview.lastElementChild.dir = 'auto';
    openButton.append(preview, elementWithText('span', 'word-tile-action', 'همه‌ی معنی‌ها'));

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
    elements.wordList.replaceChildren(...words.map(renderWordTile));

    const hasVocabulary = appData.vocabulary.length > 0;
    const hasMatches = words.length > 0;
    elements.emptyWords.hidden = hasVocabulary;
    elements.noSearchResults.hidden = !hasVocabulary || hasMatches;
    elements.wordList.hidden = !hasMatches;

    if (!hasVocabulary) {
      elements.wordCountText.textContent = 'هنوز واژه‌ی عمومی در مخزن ثبت نشده است.';
    } else if (elements.wordSearch.value.trim()) {
      elements.wordCountText.textContent = `نمایش ${toFaNumber(words.length)} از ${toFaNumber(appData.vocabulary.length)} واژه`;
    } else {
      elements.wordCountText.textContent = `${toFaNumber(appData.vocabulary.length)} واژه‌ی عمومی`;
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
      .sort((first, second) => Date.parse(first.nextReviewAt) - Date.parse(second.nextReviewAt));
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
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
        elements.emptyReviewTitle.textContent = 'واژه‌ای برای مرور وجود ندارد';
        elements.emptyReviewText.textContent = 'واژه‌های عمومی پس از ثبت در مخزن در این بخش نمایش داده می‌شوند.';
      } else {
        const nextWord = appData.vocabulary
          .slice()
          .sort((first, second) => Date.parse(first.nextReviewAt) - Date.parse(second.nextReviewAt))[0];
        elements.emptyReviewTitle.textContent = 'مرور امروز تمام شد!';
        elements.emptyReviewText.textContent = nextWord ? `مرور بعدی: ${formatDate(nextWord.nextReviewAt)}` : 'واژه‌ای برای مرور باقی نمانده است.';
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
    date.setAttribute('aria-label', `تاریخ ثبت: ${formatDate(note.createdAt)}`);
    date.textContent = `ثبت در ${formatDate(note.createdAt)}`;
    header.append(date, elementWithText('span', 'shared-source-badge', 'عمومی'));

    const content = document.createElement('div');
    content.className = 'note-content-grid';
    const original = document.createElement('section');
    original.className = 'note-version';
    const originalText = elementWithText('p', 'note-text', note.originalNote);
    originalText.dir = 'auto';
    original.append(elementWithText('div', 'note-version-label', 'نکته‌ی خام'), originalText);
    const improved = document.createElement('section');
    improved.className = 'note-version note-version-improved';
    const improvedText = elementWithText('p', 'note-text', note.improvedNote);
    improvedText.dir = 'auto';
    improved.append(elementWithText('div', 'note-version-label', 'نسخه‌ی اصلاح‌شده'), improvedText);
    content.append(original, improved);
    card.append(header, content);
    return card;
  }

  function renderIdiomCard(idiom) {
    const card = document.createElement('article');
    card.className = 'idiom-card';
    const header = document.createElement('div');
    header.className = 'idiom-card-heading';
    const phrase = elementWithText('h3', 'idiom-phrase', idiom.phrase);
    phrase.dir = 'ltr';
    phrase.lang = 'en';
    const badges = document.createElement('div');
    badges.className = 'idiom-badges';
    if (idiom.register) badges.append(elementWithText('span', 'idiom-register-badge', idiom.register));
    badges.append(elementWithText('span', 'shared-source-badge', 'عمومی'));
    header.append(phrase, badges);

    const meaning = elementWithText('p', 'idiom-meaning', idiom.meaning);
    meaning.dir = 'auto';
    card.append(header, meaning);
    if (idiom.explanation) {
      const explanation = elementWithText('p', 'idiom-explanation', idiom.explanation);
      explanation.dir = 'auto';
      card.append(explanation);
    }
    if (idiom.example) {
      const example = elementWithText('p', 'idiom-example', idiom.example);
      example.dir = 'ltr';
      example.lang = 'en';
      card.append(example);
    }
    return card;
  }

  function renderNotes() {
    const orderedNotes = sharedNotes.slice().sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
    elements.sharedNotesList.replaceChildren(...orderedNotes.map(renderNoteCard));
    elements.sharedNotesList.hidden = orderedNotes.length === 0;
    elements.emptySharedNotes.hidden = orderedNotes.length > 0;
    elements.sharedNoteCount.textContent = `${toFaNumber(orderedNotes.length)} نکته`;
  }

  function renderIdioms() {
    const orderedIdioms = toStableAlphabeticalOrder(sharedIdioms, 'phrase');
    elements.sharedIdiomsList.replaceChildren(...orderedIdioms.map(renderIdiomCard));
    elements.sharedIdiomsList.hidden = orderedIdioms.length === 0;
    elements.emptySharedIdioms.hidden = orderedIdioms.length > 0;
    elements.sharedIdiomCount.textContent = `${toFaNumber(orderedIdioms.length)} اصطلاح`;
  }

  function renderCounts() {
    elements.vocabularyTotal.textContent = toFaNumber(appData.vocabulary.length);
    elements.notesTotal.textContent = toFaNumber(sharedNotes.length + sharedIdioms.length);
    elements.vocabularyTabCount.textContent = toFaNumber(appData.vocabulary.length);
    elements.notesTabCount.textContent = toFaNumber(sharedNotes.length);
    elements.idiomsTabCount.textContent = toFaNumber(sharedIdioms.length);
  }

  function renderAll() {
    renderCounts();
    renderWordList();
    renderLeitner();
    renderNotes();
    renderIdioms();
  }

  function setActiveTab(tabName, focus = false) {
    const tabs = [
      { name: 'vocabulary', button: elements.vocabularyTabButton, panel: elements.vocabularyPanel },
      { name: 'leitner', button: elements.leitnerTabButton, panel: elements.leitnerPanel },
      { name: 'notes', button: elements.notesTabButton, panel: elements.notesPanel },
      { name: 'idioms', button: elements.idiomsTabButton, panel: elements.idiomsPanel }
    ];
    const selected = tabs.find((tab) => tab.name === tabName);
    if (!selected) return;
    tabs.forEach(({ name, button, panel }) => {
      const active = name === tabName;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
    if (focus) selected.button.focus();
  }

  function markCurrentWord(remembered) {
    const entry = appData.vocabulary.find((word) => word.id === activeReviewId);
    if (!entry) return;
    const now = new Date();
    entry.leitnerBox = remembered ? Math.min(LEITNER_INTERVALS.length, entry.leitnerBox + 1) : 1;
    entry.lastReviewedAt = now.toISOString();
    entry.nextReviewAt = new Date(now.getTime() + LEITNER_INTERVALS[entry.leitnerBox - 1] * DAY_IN_MS).toISOString();
    activeReviewId = null;
    reviewAnswerRevealed = false;
    const saved = saveReviewProgress();
    renderAll();
    if (saved) showToast(remembered
      ? `آفرین! واژه به جعبه‌ی ${toFaNumber(entry.leitnerBox)} رفت؛ پیشرفت مرور در همین مرورگر ذخیره شد.`
      : 'واژه برای مرور دوباره به جعبه‌ی اول برگشت؛ پیشرفت فقط در همین مرورگر ذخیره می‌شود.');
  }

  renderAll();

  const tabButtons = [
    elements.vocabularyTabButton,
    elements.leitnerTabButton,
    elements.notesTabButton,
    elements.idiomsTabButton
  ];
  const tabNames = ['vocabulary', 'leitner', 'notes', 'idioms'];
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => setActiveTab(tabNames[index]));
    button.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index + 1) % tabButtons.length;
      if (event.key === 'ArrowRight') nextIndex = (index + tabButtons.length - 1) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;
      if (nextIndex !== index) {
        event.preventDefault();
        setActiveTab(tabNames[nextIndex], true);
      }
    });
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
  elements.detailSpeakButton.addEventListener('click', () => {
    const entry = appData.vocabulary.find((word) => word.id === activeWordDetailId);
    if (entry) speakWord(entry.word);
  });
  elements.closeWordDetail.addEventListener('click', () => elements.wordDetailDialog.close());
  elements.wordDetailDialog.addEventListener('close', () => {
    activeWordDetailId = null;
  });

  if (storageReadFailed) {
    showToast('پیشرفت ذخیره‌شده‌ی مرور خوانده نشد؛ واژه‌های عمومی همچنان در دسترس‌اند.', 'error');
  }
})();

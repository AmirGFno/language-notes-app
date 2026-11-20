'use strict';
const $ = (id) => document.getElementById(id);
const wordKey = 'lingua-ledger.words.v1';
const noteKey = 'lingua-ledger.notes.v1';
const unavailable = new Set();
function load(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(data)) throw new Error('Invalid stored data');
    return data;
  } catch {
    unavailable.add(key);
    $('storage-status').textContent = 'Some saved data could not be read. Saving to the affected section is disabled to protect existing entries.';
    return [];
  }
}
function append(key, entries, entry) {
  if (unavailable.has(key)) throw new Error('Storage for this section could not be read.');
  try {
    localStorage.setItem(key, JSON.stringify([...entries, entry]));
  } catch {
    throw new Error('Could not save to browser storage. It may be full or disabled.');
  }
  entries.push(entry);
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
const words = load(wordKey);
const notes = load(noteKey);
const card = $('card');
let flashcards = false;
let index = 0;
function setFlipped(flipped) {
  card.classList.toggle('flipped', flipped);
  card.setAttribute('aria-pressed', String(flipped));
  $('front').setAttribute('aria-hidden', String(flipped));
  $('back').setAttribute('aria-hidden', String(!flipped));
  card.setAttribute('aria-label', flipped
    ? `Show word. Meanings: ${words[index].meanings.map(meaningText).join('; ')}`
    : `Reveal meanings for ${words[index].word}`);
}
function meaningText({ partOfSpeech, definition }) {
  return `${partOfSpeech}: ${definition}`;
}
function renderWords() {
  $('empty-words').hidden = words.length > 0;
  $('word-list').hidden = flashcards;
  $('flashcards').hidden = !flashcards || !words.length;
  $('mode').disabled = !words.length;
  $('mode').setAttribute('aria-pressed', String(flashcards));
  $('word-list').replaceChildren(...words.map(({ word, meanings }) => {
    const entry = element('li', '');
    const list = element('ul', '', 'meanings');
    list.append(...meanings.map((meaning) => element('li', meaningText(meaning))));
    entry.append(element('h4', word), list);
    return entry;
  }));
  if (!words.length) return;
  const { word, meanings } = words[index];
  $('front').replaceChildren(element('span', word), element('small', 'Tap to reveal'));
  $('back').replaceChildren(...meanings.map((meaning) => element('span', meaningText(meaning))));
  $('position').textContent = `${index + 1} / ${words.length}`;
  $('previous').disabled = $('next').disabled = words.length < 2;
  setFlipped(false);
}
$('mode').onclick = () => { flashcards = !flashcards; renderWords(); };
card.onclick = () => setFlipped(!card.classList.contains('flipped'));
function navigate(delta) {
  index = (index + delta + words.length) % words.length;
  renderWords();
}
$('previous').onclick = () => navigate(-1);
$('next').onclick = () => navigate(1);

function addMeaning(focus = false) {
  const container = $('meaning-fields');
  const group = element('fieldset', '');
  group.append(element('legend', `Meaning ${container.children.length + 1}`));
  for (const [name, title, maxLength] of [['partOfSpeech', 'Part of speech', 60], ['definition', 'Definition', 500]]) {
    const label = element('label', title);
    const input = element('input', '');
    Object.assign(input, { name, required: true, maxLength });
    label.append(input);
    group.append(label);
  }
  if (container.children.length) {
    const remove = element('button', 'Remove meaning', 'secondary');
    remove.type = 'button';
    remove.onclick = () => {
      group.remove();
      Array.from(container.children).forEach((field, i) => { field.firstChild.textContent = `Meaning ${i + 1}`; });
      $('add-meaning').focus();
    };
    group.append(remove);
  }
  container.append(group);
  if (focus) group.querySelector('input').focus();
}
$('add-meaning').onclick = () => addMeaning(true);
$('word-form').onsubmit = (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const word = data.get('word').trim();
  const definitions = data.getAll('definition');
  const meanings = data.getAll('partOfSpeech').map((partOfSpeech, i) => ({ partOfSpeech: partOfSpeech.trim(), definition: definitions[i].trim() }));
  try {
    if (!word || meanings.some((m) => !m.partOfSpeech || !m.definition)) throw new Error('Enter a word, part of speech, and definition for each meaning.');
    append(wordKey, words, { word, meanings });
    event.currentTarget.reset();
    $('meaning-fields').replaceChildren();
    addMeaning();
    renderWords();
    $('word-status').textContent = 'Word saved.';
  } catch (error) {
    $('word-status').textContent = error.message;
  }
};
function renderNotes() {
  $('empty-notes').hidden = notes.length > 0;
  $('note-list').replaceChildren(...[...notes].reverse().map(({ original, improved, timestamp }) => {
    const entry = element('li', '');
    const time = element('time', new Date(timestamp).toLocaleString());
    time.dateTime = timestamp;
    const details = element('details', '');
    details.append(element('summary', 'Original note'), element('p', original, 'note-text'));
    entry.append(time, element('p', improved, 'note-text'), details);
    return entry;
  }));
}
$('note-form').onsubmit = async (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.note;
  const original = input.value.trim();
  const status = $('note-status');
  if (!original || unavailable.has(noteKey)) {
    status.textContent = original ? 'Storage for notes could not be read.' : 'Enter a note first.';
    return;
  }
  $('improve').disabled = input.readOnly = true;
  status.textContent = 'Improving your note…';
  try {
    const response = await fetch(window.NOTE_API_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: original }), signal: AbortSignal.timeout(35000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.improved !== 'string' || !result.improved.trim()) {
      throw new Error(result.error || 'The note service is unavailable. Check the API setup and try again.');
    }
    try {
      append(noteKey, notes, { original, improved: result.improved, timestamp: new Date().toISOString() });
    } catch (error) {
      status.textContent = error.message;
      status.append(element('p', result.improved, 'note-text'));
      return;
    }
    renderNotes();
    input.value = '';
    status.textContent = 'Improved note saved.';
  } catch (error) {
    status.textContent = error.name === 'TimeoutError' ? 'The note request timed out. Try again.' : error.message;
  } finally {
    $('improve').disabled = input.readOnly = false;
  }
};
addMeaning();
renderWords();
renderNotes();

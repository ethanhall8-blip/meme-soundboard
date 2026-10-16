const sounds = [
  { name: 'Vine Boom', category: 'Classics', emoji: '💥', effect: 'boom' },
  { name: 'Bruh', category: 'Reactions', emoji: '😐', voice: 'Bruh.', effect: 'low' },
  { name: 'Airhorn', category: 'Sound FX', emoji: '📣', effect: 'horn' },
  { name: 'Windows XP', category: 'Classics', emoji: '🪟', effect: 'startup' },
  { name: 'Metal Pipe', category: 'Sound FX', emoji: '🔩', effect: 'metal' },
  { name: 'Rizz', category: 'Reactions', emoji: '😎', voice: 'Rizz.', effect: 'chime' },
  { name: 'Among Us', category: 'Gaming', emoji: 'ඞ', voice: 'Among us.', effect: 'low' },
  { name: 'Record Scratch', category: 'Sound FX', emoji: '💿', effect: 'scratch' },
  { name: 'Sad Violin', category: 'Reactions', emoji: '🎻', effect: 'sad' },
  { name: 'Mission Failed', category: 'Gaming', emoji: '🕹️', effect: 'fail' },
  { name: 'Oh No', category: 'Classics', emoji: '🫢', voice: 'Oh no.', effect: 'fall' },
  { name: 'Taco Bell', category: 'Classics', emoji: '🔔', effect: 'bell' },
  { name: 'Emotional Damage', category: 'Reactions', emoji: '🥀', voice: 'Emotional damage.', effect: 'low' },
  { name: 'Level Up', category: 'Gaming', emoji: '⬆️', effect: 'level' },
  { name: 'Discord Ping', category: 'Gaming', emoji: '💬', effect: 'ping' },
  { name: 'Suspense', category: 'Sound FX', emoji: '👀', effect: 'suspense' },
  { name: 'Bonk', category: 'Classics', emoji: '🏏', effect: 'bonk' },
  { name: 'To Be Continued', category: 'Classics', emoji: '➡️', effect: 'dramatic' },
  { name: 'Sheesh', category: 'Reactions', emoji: '🥶', voice: 'Sheesh!', effect: 'rise' },
  { name: 'Nani?!', category: 'Reactions', emoji: '😱', voice: 'Nani?!', effect: 'rise' },
  { name: 'Victory', category: 'Gaming', emoji: '🏆', effect: 'victory' },
  { name: 'Error 404', category: 'Gaming', emoji: '🖥️', effect: 'error' },
  { name: 'Crowd Gasp', category: 'Sound FX', emoji: '😮', effect: 'gasp' },
  { name: 'Tiny Violin', category: 'Reactions', emoji: '🎼', effect: 'tiny' },
  { name: 'Windows Error', category: 'Sound FX', emoji: '❌', effect: 'error' },
  { name: 'Bon Appétit', category: 'Reactions', emoji: '🍽️', voice: 'Bon appétit!', effect: 'chime' },
  { name: 'Level Failed', category: 'Gaming', emoji: '🧱', effect: 'fail' },
  { name: 'Plot Twist', category: 'Classics', emoji: '🎬', effect: 'dramatic' },
  { name: 'Nope', category: 'Reactions', emoji: '🙅', voice: 'Nope.', effect: 'low' },
  { name: 'Notification', category: 'Sound FX', emoji: '🔊', effect: 'ping' },
  { name: 'Power Up', category: 'Gaming', emoji: '✨', effect: 'level' },
  { name: 'Suspicious', category: 'Gaming', emoji: '🕵️', voice: 'Suspicious.', effect: 'suspense' },
  { name: 'Dramatic Hit', category: 'Sound FX', emoji: '🥁', effect: 'boom' },
  { name: 'Yay!', category: 'Reactions', emoji: '🎉', voice: 'Yay!', effect: 'victory' },
  { name: 'Sad Trombone', category: 'Classics', emoji: '🎺', effect: 'fail' },
  { name: 'Mic Drop', category: 'Sound FX', emoji: '🎤', effect: 'metal' },
];

const categoryInfo = [
  { name: 'Everything', icon: '▦' },
  { name: 'Favorites', icon: '♡' },
  { name: 'Classics', icon: '◉' },
  { name: 'Reactions', icon: '☻' },
  { name: 'Gaming', icon: '⌘' },
  { name: 'Sound FX', icon: '♫' },
];

const padColors = ['#e9eccd', '#f6ddce', '#dbe8e5', '#fae7b6', '#e9dff0', '#dce8c9'];
const hotkeys = [...'123456789QWERTYUIOPASDFGHJKLZXCVBNM', ','];
const categoriesElement = document.querySelector('#categories');
const grid = document.querySelector('#sound-grid');
const searchInput = document.querySelector('#search');
const countElement = document.querySelector('#sound-count');
const categoryTitle = document.querySelector('#category-title');
const nowPlaying = document.querySelector('#now-playing');
const playingIndicator = document.querySelector('.playing-indicator');
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioContext.createGain();
const compressor = audioContext.createDynamicsCompressor();
masterGain.gain.value = Number(volumeInput.value) / 100;
masterGain.connect(compressor);
compressor.connect(audioContext.destination);

let activeCategory = 'Everything';
let activeButton = null;
let favorites = new Set(JSON.parse(localStorage.getItem('meme-deck-favorites') || '[]'));
let playToken = 0;
let currentSourceNodes = [];

function renderCategories() {
  categoriesElement.innerHTML = categoryInfo.map(({ name, icon }) => {
    const total = name === 'Everything' ? sounds.length : name === 'Favorites' ? favorites.size : sounds.filter(sound => sound.category === name).length;
    return `<button class="category-button${activeCategory === name ? ' active' : ''}" type="button" data-category="${name}" aria-pressed="${activeCategory === name}"><span class="category-icon" aria-hidden="true">${icon}</span><span class="category-name">${name}</span><span class="category-total">${total}</span></button>`;
  }).join('');
}

function renderSounds() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleSounds = sounds.filter(sound => {
    const categoryMatches = activeCategory === 'Everything' || (activeCategory === 'Favorites' ? favorites.has(sound.name) : sound.category === activeCategory);
    return categoryMatches && `${sound.name} ${sound.category}`.toLowerCase().includes(query);
  });
  countElement.textContent = visibleSounds.length;
  categoryTitle.textContent = activeCategory.toUpperCase();
  document.querySelector('#empty-state').hidden = visibleSounds.length > 0;
  grid.innerHTML = visibleSounds.map(sound => {
    const index = sounds.indexOf(sound);
    const key = hotkeys[index];
    return `<article class="sound-pad" style="--pad-color:${padColors[index % padColors.length]};animation-delay:${Math.min(index % 12, 8) * 24}ms">
      <button class="pad-play" type="button" data-name="${sound.name}" data-key="${key}" aria-label="Play ${sound.name}, keyboard ${key}">
        <span class="pad-top"><span class="pad-emoji" aria-hidden="true">${sound.emoji}</span></span>
        <span class="pad-name">${sound.name}</span>
        <span class="pad-bottom"><span class="pad-type">${sound.category}</span><kbd class="pad-key">${key}</kbd></span>
      </button>
      <button class="favorite-button${favorites.has(sound.name) ? ' favorited' : ''}" type="button" aria-label="${favorites.has(sound.name) ? 'Remove from' : 'Add to'} favorites" aria-pressed="${favorites.has(sound.name)}" data-favorite="${sound.name}">${favorites.has(sound.name) ? '♥' : '♡'}</button>
    </article>`;
  }).join('');
}

function tone(frequency, duration, type = 'sine', start = 0, endFrequency = frequency, gain = 0.35) {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  const startAt = audioContext.currentTime + start;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(20, frequency), startAt);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), startAt + duration);
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(gain, startAt + Math.min(0.012, duration / 4));
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(envelope);
  envelope.connect(masterGain);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
  currentSourceNodes.push(oscillator);
}

function noise(duration, start = 0, gain = 0.4, filterType = 'lowpass', frequency = 1000) {
  const length = Math.ceil(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index++) data[index] = Math.random() * 2 - 1;
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const envelope = audioContext.createGain();
  const startAt = audioContext.currentTime + start;
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.value = frequency;
  envelope.gain.setValueAtTime(gain, startAt);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(masterGain);
  source.start(startAt);
  source.stop(startAt + duration);
  currentSourceNodes.push(source);
}

function playEffect(effect) {
  switch (effect) {
    case 'boom': case 'dramatic': tone(95, 0.8, 'sine', 0, 34, 0.8); noise(0.12, 0, 0.2, 'lowpass', 350); break;
    case 'low': tone(180, 0.4, 'triangle', 0, 75, 0.48); break;
    case 'horn': tone(440, 0.55, 'sawtooth', 0, 415, 0.2); tone(554, 0.55, 'sawtooth', 0, 523, 0.18); tone(659, 0.55, 'sawtooth', 0, 622, 0.16); break;
    case 'startup': [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.34, 'sine', i * 0.12, freq * 1.01, 0.22)); break;
    case 'metal': tone(980, 0.7, 'square', 0, 110, 0.48); tone(1470, 0.55, 'sine', 0.01, 170, 0.22); break;
    case 'scratch': noise(0.52, 0, 0.45, 'bandpass', 1500); tone(1100, 0.5, 'sawtooth', 0, 95, 0.25); break;
    case 'sad': case 'tiny': [392, 370, 349, 311].forEach((freq, i) => tone(freq, 0.33, 'triangle', i * 0.36, freq, 0.24)); break;
    case 'fail': [392, 370, 349, 262].forEach((freq, i) => tone(freq, 0.32, 'triangle', i * 0.24, freq * 0.94, 0.3)); break;
    case 'fall': tone(620, 0.6, 'sine', 0, 180, 0.3); break;
    case 'bell': [659, 784, 988].forEach((freq, i) => tone(freq, 0.7, 'sine', i * 0.08, freq * 0.98, 0.23)); break;
    case 'level': case 'rise': [392, 494, 587, 784].forEach((freq, i) => tone(freq, 0.2, 'square', i * 0.09, freq, 0.18)); break;
    case 'ping': case 'chime': tone(880, 0.28, 'sine', 0, 880, 0.22); tone(1320, 0.36, 'sine', 0.07, 1320, 0.12); break;
    case 'suspense': [220, 233, 220].forEach((freq, i) => tone(freq, 0.5, 'sawtooth', i * 0.18, freq * 1.02, 0.1)); break;
    case 'bonk': tone(320, 0.35, 'sine', 0, 68, 0.6); break;
    case 'victory': [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.24, 'triangle', i * 0.12, freq, 0.28)); break;
    case 'error': tone(220, 0.16, 'square', 0, 190, 0.22); tone(180, 0.2, 'square', 0.2, 150, 0.2); break;
    case 'gasp': noise(0.45, 0, 0.22, 'bandpass', 850); tone(370, 0.3, 'sine', 0, 560, 0.15); break;
    default: tone(440, 0.22, 'sine');
  }
}

function stopSounds() {
  playToken++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  currentSourceNodes.forEach(source => { try { source.stop(); } catch {} });
  currentSourceNodes = [];
  if (activeButton) activeButton.classList.remove('playing');
  activeButton = null;
  playingIndicator.classList.remove('active');
  nowPlaying.textContent = 'Nothing yet. The silence is suspicious.';
}

async function playSound(sound, button) {
  stopSounds();
  const token = playToken;
  if (audioContext.state === 'suspended') await audioContext.resume();
  activeButton = button;
  if (button) button.classList.add('playing');
  nowPlaying.textContent = sound.name;
  playingIndicator.classList.add('active');
  playEffect(sound.effect);
  if (sound.voice && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(sound.voice);
    utterance.rate = 0.92;
    utterance.pitch = sound.name === 'Bruh' || sound.name === 'Among Us' ? 0.72 : 1.05;
    utterance.volume = Number(volumeInput.value) / 100;
    utterance.onend = () => finishSound(token);
    speechSynthesis.speak(utterance);
  } else {
    window.setTimeout(() => finishSound(token), 900);
  }
}

function finishSound(token) {
  if (token !== playToken) return;
  if (activeButton) activeButton.classList.remove('playing');
  activeButton = null;
  playingIndicator.classList.remove('active');
}

categoriesElement.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderSounds();
});

grid.addEventListener('click', event => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) {
    event.stopPropagation();
    const name = favorite.dataset.favorite;
    favorites.has(name) ? favorites.delete(name) : favorites.add(name);
    localStorage.setItem('meme-deck-favorites', JSON.stringify([...favorites]));
    renderCategories();
    renderSounds();
    return;
  }
  const button = event.target.closest('.pad-play');
  if (button) playSound(sounds.find(sound => sound.name === button.dataset.name), button);
});

grid.addEventListener('keydown', event => {
});

searchInput.addEventListener('input', renderSounds);
volumeInput.addEventListener('input', () => {
  const volume = Number(volumeInput.value);
  masterGain.gain.setTargetAtTime(volume / 100, audioContext.currentTime, 0.02);
  volumeValue.textContent = `${volume}%`;
});
document.querySelector('#stop-button').addEventListener('click', stopSounds);

document.addEventListener('keydown', event => {
  if (event.target.matches('input')) {
    if (event.key === 'Escape') event.target.blur();
    return;
  }
  if (event.key === '/') {
    event.preventDefault();
    searchInput.focus();
    return;
  }
  if (event.key === 'Escape') {
    stopSounds();
    return;
  }
  if (event.code === 'Space') {
    event.preventDefault();
    if (activeButton) stopSounds();
    else playSound(sounds[0], null);
    return;
  }
  const soundIndex = hotkeys.indexOf(event.key.toUpperCase());
  if (soundIndex !== -1 && sounds[soundIndex]) {
    const button = grid.querySelector(`.pad-play[data-name="${sounds[soundIndex].name}"]`);
    playSound(sounds[soundIndex], button);
  }
});

renderCategories();
renderSounds();
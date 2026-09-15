const audio = document.querySelector('#audio-player');
const playButton = document.querySelector('#play-button');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const progress = document.querySelector('#progress');
const volume = document.querySelector('#volume');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const trackTitle = document.querySelector('#track-title');
const trackArtist = document.querySelector('#track-artist');
const sourceMessage = document.querySelector('#source-message');
const playlistElement = document.querySelector('#playlist');
const playlistCount = document.querySelector('#playlist-count');
const sourceOptions = document.querySelectorAll('.source-option');

let playlist = [];
let currentIndex = 0;
let selectedSource = 'audius';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

function updatePlayerInfo() {
  const track = playlist[currentIndex];
  if (!track) {
    trackTitle.textContent = 'Aguardando música';
    trackArtist.textContent = 'Escolha uma fonte para começar';
    return;
  }
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist || 'Moda de Viola';
}

function renderPlaylist() {
  playlistCount.textContent = `${playlist.length} ${playlist.length === 1 ? 'faixa' : 'faixas'}`;
  if (!playlist.length) {
    playlistElement.className = 'playlist-empty';
    playlistElement.textContent = 'Nenhuma faixa carregada ainda.';
    return;
  }

  playlistElement.className = 'playlist-list';
  playlistElement.innerHTML = playlist.map((track, index) => `
    <button class="playlist-item ${index === currentIndex ? 'selected' : ''}" data-index="${index}" type="button">
      <span>${index + 1}</span>
      <span><strong>${track.title}</strong><small>${track.artist || 'Moda de Viola'}</small></span>
    </button>
  `).join('');

  playlistElement.querySelectorAll('.playlist-item').forEach((item) => {
    item.addEventListener('click', () => {
      currentIndex = Number(item.dataset.index);
      loadTrack(true);
    });
  });
}

function loadTrack(autoplay = false) {
  const track = playlist[currentIndex];
  if (!track) return;
  audio.src = track.url;
  updatePlayerInfo();
  renderPlaylist();
  if (autoplay) {
    audio.play().catch(() => {
      sourceMessage.textContent = 'Toque novamente no botão reproduzir para iniciar o áudio.';
    });
  }
}

function togglePlay() {
  if (!audio.src) {
    sourceMessage.textContent = 'A fonte de áudio ainda será conectada nesta etapa.';
    return;
  }
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function nextTrack() {
  if (!playlist.length) return;
  currentIndex = (currentIndex + 1) % playlist.length;
  loadTrack(true);
}

function previousTrack() {
  if (!playlist.length) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(true);
}

playButton.addEventListener('click', togglePlay);
nextButton.addEventListener('click', nextTrack);
previousButton.addEventListener('click', previousTrack);
volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
progress.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
});
audio.volume = Number(volume.value);
audio.addEventListener('play', () => { playButton.textContent = '❚❚'; });
audio.addEventListener('pause', () => { playButton.textContent = '▶'; });
audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime);
  progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
audio.addEventListener('loadedmetadata', () => { duration.textContent = formatTime(audio.duration); });
audio.addEventListener('ended', nextTrack);

sourceOptions.forEach((option) => {
  option.addEventListener('click', () => {
    sourceOptions.forEach((item) => item.classList.remove('active'));
    option.classList.add('active');
    selectedSource = option.dataset.source;
    sourceMessage.textContent = `${option.querySelector('strong').textContent} selecionado. A conexão com a API será implementada na próxima etapa.`;
  });
});

updatePlayerInfo();
renderPlaylist();

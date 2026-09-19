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
const radioList = document.querySelector('#radio-list');

const radioStations = [
  { id: 'cafe-viola', name: 'Rádio Café Viola', description: 'Sertanejo, sertanejo raiz e música caipira', stream: 'https://stm6.xcast.com.br:9328/' },
  { id: 'viola-viva', name: 'Viola Viva Caipira', description: 'Música caipira 24 horas', stream: 'https://centova.euroti.com.br:20055/stream' },
  { id: 'buteco-sertanejo', name: 'Rádio Buteco Sertanejo', description: 'Sertanejo, moda de viola e modão', stream: 'https://stream.zeno.fm/6kumndewqbruv' }
];

let playlist = [];
let currentIndex = 0;
let selectedSource = 'audius';

function renderRadios() {
  if (!radioList) return;
  radioList.innerHTML = radioStations.map((station, index) => `
    <article class="radio-item">
      <div class="radio-copy">
        <span class="radio-live">● AO VIVO</span>
        <strong>${station.name}</strong>
        <small>${station.description}</small>
      </div>
      <button class="radio-play" type="button" data-radio-index="${index}" aria-label="Ouvir ${station.name}">▶</button>
    </article>
  `).join('');

  radioList.querySelectorAll('[data-radio-index]').forEach((button) => {
    button.addEventListener('click', () => startRadio(radioStations[Number(button.dataset.radioIndex)]));
  });
}

function startRadio(station) {
  selectedSource = 'radio';
  sourceOptions.forEach((item) => item.classList.toggle('active', item.dataset.source === 'radio'));
  playlist = [];
  currentIndex = 0;
  audio.loop = true;
  audio.src = station.stream;
  trackTitle.textContent = station.name;
  trackArtist.textContent = station.description;
  playlistCount.textContent = 'Rádio ao vivo';
  playlistElement.className = 'playlist-empty';
  playlistElement.textContent = 'Transmissão contínua — sem playlist local.';
  sourceMessage.textContent = 'Conectando à ' + station.name + '...';
  audio.play().then(() => {
    sourceMessage.textContent = 'Ao vivo: ' + station.name;
  }).catch(() => {
    sourceMessage.textContent = 'Toque em ▶ para iniciar a transmissão.';
  });
}

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
audio.addEventListener('error', () => {
  sourceMessage.textContent = 'Não foi possível abrir este stream. Escolha outra rádio.';
});
renderRadios();

sourceOptions.forEach((option) => {
  option.addEventListener('click', () => {
    sourceOptions.forEach((item) => item.classList.remove('active'));
    option.classList.add('active');
    selectedSource = option.dataset.source;
    if (selectedSource === 'radio') {
      sourceMessage.textContent = 'Escolha uma rádio ao vivo abaixo.';
    } else {
      sourceMessage.textContent = `${option.querySelector('strong').textContent} selecionado. O catálogo será conectado pelo roteador/cache na próxima etapa.`;
    }
  });
});

updatePlayerInfo();
renderPlaylist();

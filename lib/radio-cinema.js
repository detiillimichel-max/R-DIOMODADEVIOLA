import { get, put } from '@vercel/blob';

const CACHE_PATH = 'catalog/radios-v2.json';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const curatedStations = [
  {
    id: 'cafe-viola',
    name: 'Rádio Café Viola',
    description: 'Sertanejo, sertanejo raiz e música caipira',
    stream: 'https://stm6.xcast.com.br:9328/;'
  },
  {
    id: 'viola-viva',
    name: 'Viola Viva Caipira',
    description: 'Música caipira 24 horas',
    stream: 'https://centova.euroti.com.br:20055/stream'
  },
  {
    id: 'buteco-sertanejo',
    name: 'Rádio Buteco Sertanejo',
    description: 'Sertanejo, moda de viola e modão',
    stream: 'https://stream.zeno.fm/6kumndewqbruv'
  }
];

const TAGS = ['moda de viola', 'musica caipira', 'sertanejo', 'sertanejo raiz'];

const KNOWN_UNPLAYABLE_NAMES = new Set([
  'rádio digital bahia',
  'rádio riacho fm - o amor da cidade',
  'rádio sertaneja raiz'
]);

function normalizeStation(station) {
  const stream = station.stream || station.url_resolved || station.url;
  if (!stream || !/^https?:\/\//i.test(stream)) return null;

  return {
    id: station.stationuuid || station.id || ('radio-' + encodeURIComponent(stream)),
    name: station.name || 'Rádio sem nome',
    description: station.tags || 'Rádio ao vivo',
    stream
  };
}

async function discoverRadioBrowser() {
  const base = 'https://de1.api.radio-browser.info/json/stations/search';
  const results = [];

  for (const tag of TAGS) {
    const url = new URL(base);
    url.searchParams.set('tag', tag);
    url.searchParams.set('countrycode', 'BR');
    url.searchParams.set('hidebroken', 'true');
    url.searchParams.set('order', 'clickcount');
    url.searchParams.set('reverse', 'true');
    url.searchParams.set('limit', '12');

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'R-DIOMODADEVIOLA/1.0' }
      });
      if (!response.ok) continue;
      const data = await response.json();
      results.push(...data);
    } catch {
      // A descoberta pública é complementar; o catálogo curado continua funcionando.
    }
  }

  return results
    .map(normalizeStation)
    .filter(Boolean)
    .filter((station) => !KNOWN_UNPLAYABLE_NAMES.has(station.name.trim().toLowerCase()));
}

function buildCatalog(discovered) {
  const seen = new Set();
  const stations = [];

  for (const station of [...curatedStations, ...discovered]) {
    const key = station.stream.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    stations.push(station);
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
    source: 'Radio Browser + catálogo curado',
    stations
  };
}

async function readCache() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const result = await get(CACHE_PATH, { access: 'private' });
    if (!result || result.statusCode !== 200) return null;

    const text = await new Response(result.stream).text();
    const cache = JSON.parse(text);
    const expiresAt = Date.parse(cache.expiresAt || '');
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

    return cache;
  } catch {
    return null;
  }
}

async function writeCache(cache) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  await put(CACHE_PATH, JSON.stringify(cache), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json'
  });

  return true;
}

export async function getRadioCatalog({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = await readCache();
    if (cached) return { ...cached, cache: 'hit' };
  }

  const discovered = await discoverRadioBrowser();
  const catalog = buildCatalog(discovered);

  try {
    await writeCache(catalog);
  } catch {
    // Se o Blob ainda não estiver configurado, devolvemos o catálogo atual.
  }

  return {
    ...catalog,
    cache: process.env.BLOB_READ_WRITE_TOKEN ? 'refreshed' : 'fallback-no-blob'
  };
}

export { CACHE_TTL_MS, curatedStations };

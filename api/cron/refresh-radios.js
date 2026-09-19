import { getRadioCatalog } from '../../lib/radio-cinema.js';

export default async function handler(request, response) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.authorization;

  if (!cronSecret || authorization !== 'Bearer ' + cronSecret) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const catalog = await getRadioCatalog({ forceRefresh: true });
    return response.status(200).json({
      ok: true,
      generatedAt: catalog.generatedAt,
      stations: catalog.stations.length,
      cache: catalog.cache
    });
  } catch (error) {
    console.error('refresh-radios', error);
    return response.status(500).json({ error: 'Refresh failed' });
  }
}

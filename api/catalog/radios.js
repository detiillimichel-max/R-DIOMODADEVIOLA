import { getRadioCatalog } from '../../lib/radio-cinema.js';

export default async function handler(request, response) {
  try {
    const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';
    const catalog = await getRadioCatalog({ forceRefresh });

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(catalog);
  } catch (error) {
    console.error('radio-catalog', error);
    return response.status(500).json({
      error: 'Não foi possível carregar o catálogo de rádios.'
    });
  }
}

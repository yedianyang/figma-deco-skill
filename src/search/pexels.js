const axios = require('axios');

const PEXELS_API = 'https://api.pexels.com/v1/search';

async function searchPexels(query, count = 15) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.error('[pexels] PEXELS_API_KEY not set');
    return [];
  }

  try {
    const { data } = await axios.get(PEXELS_API, {
      params: { query, per_page: count },
      headers: { Authorization: key },
    });

    return (data.photos || []).map((photo) => ({
      id: String(photo.id),
      url: photo.src.large,
      thumbUrl: photo.src.tiny,
      width: photo.width,
      height: photo.height,
      source: 'pexels',
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));
  } catch (err) {
    console.error('[pexels] search failed:', err.message);
    return [];
  }
}

module.exports = { searchPexels };

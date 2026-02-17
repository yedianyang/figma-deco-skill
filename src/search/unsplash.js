const axios = require('axios');

const UNSPLASH_API = 'https://api.unsplash.com/search/photos';

async function searchUnsplash(query, count = 15) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.error('[unsplash] UNSPLASH_ACCESS_KEY not set');
    return [];
  }

  try {
    const { data } = await axios.get(UNSPLASH_API, {
      params: { query, per_page: count },
      headers: { Authorization: `Client-ID ${key}` },
    });

    return (data.results || []).map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      width: photo.width,
      height: photo.height,
      source: 'unsplash',
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    }));
  } catch (err) {
    console.error('[unsplash] search failed:', err.message);
    return [];
  }
}

module.exports = { searchUnsplash };

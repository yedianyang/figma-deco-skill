require('dotenv').config();

const { searchUnsplash } = require('./unsplash');
const { searchPexels } = require('./pexels');

async function searchImages(query, count = 30) {
  const half = Math.ceil(count / 2);

  const results = await Promise.allSettled([
    searchUnsplash(query, half),
    searchPexels(query, half),
  ]);

  const images = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      images.push(...result.value);
    }
  }

  return images;
}

module.exports = { searchImages, searchUnsplash, searchPexels };

require('dotenv').config();

const { getEmbeddings } = require('./clip');
const { deduplicate } = require('./deduplicate');
const { clusterImages } = require('./cluster');

async function analyzeImages(images) {
  console.log(`[analyze] Embedding ${images.length} images…`);
  const embedded = await getEmbeddings(images);
  console.log(`[analyze] Got embeddings for ${embedded.length}/${images.length} images`);

  const unique = deduplicate(embedded);
  console.log(`[analyze] ${unique.length} unique images after dedup`);

  const result = clusterImages(unique);
  console.log(`[analyze] Clustered into ${result.groups.length} groups`);

  return result;
}

module.exports = { analyzeImages, getEmbeddings, deduplicate, clusterImages };

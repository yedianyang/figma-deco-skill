const axios = require('axios');

const HF_MODEL_URL =
  'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32';

const CONCURRENCY = 5;

async function fetchEmbedding(imageUrl, token) {
  const { data } = await axios.post(
    HF_MODEL_URL,
    { inputs: { image: imageUrl } },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30_000,
    },
  );
  // HF returns the feature vector directly as an array of floats
  return Array.isArray(data) ? data : data[0];
}

async function getEmbeddings(images) {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    console.error('[clip] HF_API_TOKEN not set');
    return [];
  }

  const results = [];
  // Process in batches of CONCURRENCY
  for (let i = 0; i < images.length; i += CONCURRENCY) {
    const batch = images.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (img) => {
        const embedding = await fetchEmbedding(img.url, token);
        return { ...img, embedding };
      }),
    );

    for (let j = 0; j < settled.length; j++) {
      if (settled[j].status === 'fulfilled') {
        results.push(settled[j].value);
      } else {
        console.warn(
          `[clip] Failed to embed image ${batch[j].id}:`,
          settled[j].reason?.message,
        );
      }
    }
  }

  return results;
}

module.exports = { getEmbeddings };

/**
 * Cosine similarity deduplication on CLIP embeddings.
 */

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function deduplicate(imagesWithEmbeddings, threshold = 0.95) {
  const kept = [];

  for (const img of imagesWithEmbeddings) {
    let isDuplicate = false;
    for (const ref of kept) {
      if (cosineSimilarity(img.embedding, ref.embedding) >= threshold) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      kept.push(img);
    }
  }

  return kept;
}

module.exports = { deduplicate };

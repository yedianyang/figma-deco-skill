/**
 * Pure JS k-means clustering with k-means++ initialization.
 */

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function nearestCentroid(point, centroids) {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < centroids.length; i++) {
    const dist = euclideanDistance(point, centroids[i]);
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return { idx: minIdx, dist: minDist };
}

/** k-means++ centroid initialization */
function initCentroids(vectors, k) {
  const centroids = [];
  // Pick first centroid uniformly at random
  centroids.push(vectors[Math.floor(Math.random() * vectors.length)]);

  for (let c = 1; c < k; c++) {
    const dists = vectors.map((v) => {
      let minD = Infinity;
      for (const cent of centroids) {
        minD = Math.min(minD, euclideanDistance(v, cent));
      }
      return minD * minD; // squared distance as weight
    });

    const totalWeight = dists.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) {
        centroids.push(vectors[i]);
        break;
      }
    }
    // Edge case: if rounding errors prevented selection, pick last
    if (centroids.length <= c) {
      centroids.push(vectors[vectors.length - 1]);
    }
  }

  return centroids;
}

function runKMeans(vectors, k, maxIter = 50) {
  const dim = vectors[0].length;
  let centroids = initCentroids(vectors, k);
  let assignments = new Array(vectors.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign step
    const newAssignments = vectors.map((v) => nearestCentroid(v, centroids).idx);

    // Check convergence
    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;
    if (!changed) break;

    // Update centroids
    const sums = Array.from({ length: k }, () => new Float64Array(dim));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < vectors.length; i++) {
      const ci = assignments[i];
      counts[ci]++;
      for (let d = 0; d < dim; d++) {
        sums[ci][d] += vectors[i][d];
      }
    }

    centroids = sums.map((s, ci) => {
      if (counts[ci] === 0) return centroids[ci]; // keep old if empty
      return Array.from(s, (v) => v / counts[ci]);
    });
  }

  return { assignments, centroids };
}

/** Silhouette score for a clustering result */
function silhouetteScore(vectors, assignments, k) {
  if (k <= 1 || vectors.length <= k) return -1;

  let totalScore = 0;
  for (let i = 0; i < vectors.length; i++) {
    const ci = assignments[i];

    // a(i): mean distance to same-cluster points
    let aSum = 0;
    let aCount = 0;
    // b(i): mean distance to nearest other cluster
    const bSums = new Array(k).fill(0);
    const bCounts = new Array(k).fill(0);

    for (let j = 0; j < vectors.length; j++) {
      if (i === j) continue;
      const dist = euclideanDistance(vectors[i], vectors[j]);
      if (assignments[j] === ci) {
        aSum += dist;
        aCount++;
      } else {
        bSums[assignments[j]] += dist;
        bCounts[assignments[j]]++;
      }
    }

    const a = aCount > 0 ? aSum / aCount : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === ci || bCounts[c] === 0) continue;
      b = Math.min(b, bSums[c] / bCounts[c]);
    }
    if (b === Infinity) b = 0;

    const s = Math.max(a, b) === 0 ? 0 : (b - a) / Math.max(a, b);
    totalScore += s;
  }

  return totalScore / vectors.length;
}

function clusterImages(imagesWithEmbeddings, k = 'auto') {
  if (imagesWithEmbeddings.length === 0) {
    return { groups: [] };
  }

  const vectors = imagesWithEmbeddings.map((img) => img.embedding);

  let bestK = typeof k === 'number' ? k : 3;

  if (k === 'auto') {
    const maxK = Math.min(5, Math.max(2, Math.floor(vectors.length / 2)));
    const minK = Math.min(3, maxK);
    let bestScore = -Infinity;

    for (let tryK = minK; tryK <= maxK; tryK++) {
      const { assignments } = runKMeans(vectors, tryK);
      const score = silhouetteScore(vectors, assignments, tryK);
      if (score > bestScore) {
        bestScore = score;
        bestK = tryK;
      }
    }
  }

  // Ensure k doesn't exceed number of images
  bestK = Math.min(bestK, imagesWithEmbeddings.length);

  const { assignments } = runKMeans(vectors, bestK);

  const groupMap = {};
  for (let i = 0; i < assignments.length; i++) {
    const gi = assignments[i];
    if (!groupMap[gi]) groupMap[gi] = [];
    groupMap[gi].push(imagesWithEmbeddings[i]);
  }

  const groups = Object.keys(groupMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((gi, idx) => ({
      name: `Group ${idx + 1}`,
      images: groupMap[gi],
    }));

  return { groups };
}

module.exports = { clusterImages };

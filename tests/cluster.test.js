const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { clusterImages } = require('../src/analyze/cluster');
const { deduplicate } = require('../src/analyze/deduplicate');

// Helper: create a fake image with a given embedding
function makeImage(id, embedding) {
  return { id, url: `http://example.com/${id}`, embedding };
}

// Helper: build 3 well-separated clusters of 5 vectors each (8-dim)
function makeSyntheticClusters() {
  const images = [];
  for (let g = 0; g < 3; g++) {
    for (let i = 0; i < 5; i++) {
      // Each cluster is centered far apart on a different axis
      const emb = new Array(8).fill(0).map((_, d) =>
        d === g ? 100 + Math.random() * 0.1 : Math.random() * 0.1,
      );
      images.push(makeImage(`cluster${g}_${i}`, emb));
    }
  }
  return images;
}

describe('clusterImages', () => {
  it('clusters 3 well-separated groups with explicit k=3', () => {
    const images = makeSyntheticClusters();
    const result = clusterImages(images, 3);

    assert.equal(result.groups.length, 3);

    // Every group should have exactly 5 images
    const sizes = result.groups.map((g) => g.images.length).sort();
    assert.deepEqual(sizes, [5, 5, 5]);

    // Images from the same synthetic cluster should land in the same group
    for (const group of result.groups) {
      const clusterIds = group.images.map((img) => img.id.split('_')[0]);
      const unique = [...new Set(clusterIds)];
      assert.equal(unique.length, 1, `Group should contain one cluster, got: ${unique}`);
    }
  });

  it('names groups sequentially', () => {
    const images = makeSyntheticClusters();
    const result = clusterImages(images, 3);
    const names = result.groups.map((g) => g.name);
    for (let i = 0; i < names.length; i++) {
      assert.equal(names[i], `Group ${i + 1}`);
    }
  });

  it('returns empty groups for empty input', () => {
    const result = clusterImages([]);
    assert.deepEqual(result, { groups: [] });
  });

  it('handles single image', () => {
    const images = [makeImage('solo', [1, 2, 3])];
    const result = clusterImages(images, 1);
    assert.equal(result.groups.length, 1);
    assert.equal(result.groups[0].images.length, 1);
  });
});

describe('clusterImages auto-k', () => {
  it('picks k between 2 and 5 for well-separated data', () => {
    const images = makeSyntheticClusters(); // 15 images, 3 natural clusters
    const result = clusterImages(images, 'auto');

    assert.ok(result.groups.length >= 2, `k should be >= 2, got ${result.groups.length}`);
    assert.ok(result.groups.length <= 5, `k should be <= 5, got ${result.groups.length}`);
  });

  it('all images are assigned to exactly one group', () => {
    const images = makeSyntheticClusters();
    const result = clusterImages(images, 'auto');

    const allImages = result.groups.flatMap((g) => g.images);
    assert.equal(allImages.length, images.length);

    const ids = new Set(allImages.map((img) => img.id));
    assert.equal(ids.size, images.length, 'No duplicates across groups');
  });
});

describe('deduplicate', () => {
  it('removes near-identical embeddings', () => {
    const base = [1, 0, 0, 0, 0, 0, 0, 0];
    const nearDup = base.map((v) => v + 0.001); // cosine sim ~1.0
    const images = [makeImage('a', base), makeImage('b', nearDup)];

    const result = deduplicate(images, 0.95);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'a'); // keeps first occurrence
  });

  it('keeps dissimilar embeddings', () => {
    const images = [
      makeImage('x', [1, 0, 0, 0]),
      makeImage('y', [0, 1, 0, 0]),
      makeImage('z', [0, 0, 1, 0]),
    ];

    const result = deduplicate(images, 0.95);
    assert.equal(result.length, 3);
  });

  it('removes multiple duplicates of the same vector', () => {
    const emb = [1, 2, 3, 4];
    const images = [
      makeImage('orig', emb),
      makeImage('dup1', [...emb]),
      makeImage('dup2', emb.map((v) => v + 0.0001)),
    ];

    const result = deduplicate(images, 0.95);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'orig');
  });

  it('returns empty array for empty input', () => {
    const result = deduplicate([]);
    assert.deepEqual(result, []);
  });

  it('respects custom threshold', () => {
    // Two vectors at ~0.707 cosine similarity
    const images = [
      makeImage('a', [1, 1, 0, 0]),
      makeImage('b', [1, 0, 0, 0]),
    ];

    // With low threshold, they're "duplicates"
    const strict = deduplicate(images, 0.5);
    assert.equal(strict.length, 1);

    // With high threshold, they're kept
    const loose = deduplicate(images, 0.99);
    assert.equal(loose.length, 2);
  });
});

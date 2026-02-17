const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Module loading', () => {
  it('loads src/search/unsplash without errors', () => {
    const mod = require('../src/search/unsplash');
    assert.equal(typeof mod.searchUnsplash, 'function');
  });

  it('loads src/search/pexels without errors', () => {
    const mod = require('../src/search/pexels');
    assert.equal(typeof mod.searchPexels, 'function');
  });

  it('loads src/search/index without errors', () => {
    const mod = require('../src/search/index');
    assert.equal(typeof mod.searchImages, 'function');
    assert.equal(typeof mod.searchUnsplash, 'function');
    assert.equal(typeof mod.searchPexels, 'function');
  });

  it('loads src/analyze/clip without errors', () => {
    const mod = require('../src/analyze/clip');
    assert.equal(typeof mod.getEmbeddings, 'function');
  });

  it('loads src/analyze/deduplicate without errors', () => {
    const mod = require('../src/analyze/deduplicate');
    assert.equal(typeof mod.deduplicate, 'function');
  });

  it('loads src/analyze/cluster without errors', () => {
    const mod = require('../src/analyze/cluster');
    assert.equal(typeof mod.clusterImages, 'function');
  });

  it('loads src/analyze/index without errors', () => {
    const mod = require('../src/analyze/index');
    assert.equal(typeof mod.analyzeImages, 'function');
  });

  it('loads src/server/routes without errors', () => {
    const mod = require('../src/server/routes');
    assert.equal(typeof mod.createRouter, 'function');
    assert.equal(typeof mod.DATA_FILE, 'string');
  });

  it('loads src/server/server without errors', () => {
    const mod = require('../src/server/server');
    assert.equal(typeof mod.startServer, 'function');
  });
});

describe('Data structure shapes', () => {
  it('clusterImages returns { groups } with correct shape', () => {
    const { clusterImages } = require('../src/analyze/cluster');
    // 4 images with 3D embeddings
    const images = [
      { id: '1', embedding: [1, 0, 0] },
      { id: '2', embedding: [0.9, 0.1, 0] },
      { id: '3', embedding: [0, 1, 0] },
      { id: '4', embedding: [0, 0.9, 0.1] },
    ];
    const result = clusterImages(images, 2);

    assert.ok(result.groups);
    assert.ok(Array.isArray(result.groups));
    assert.equal(result.groups.length, 2);
    for (const group of result.groups) {
      assert.ok(group.name);
      assert.ok(Array.isArray(group.images));
      assert.ok(group.images.length > 0);
    }
  });

  it('deduplicate removes near-identical embeddings', () => {
    const { deduplicate } = require('../src/analyze/deduplicate');
    const images = [
      { id: '1', embedding: [1, 0, 0] },
      { id: '2', embedding: [1, 0, 0] }, // exact duplicate
      { id: '3', embedding: [0, 1, 0] }, // different
    ];
    const result = deduplicate(images, 0.95);
    assert.equal(result.length, 2);
    assert.equal(result[0].id, '1');
    assert.equal(result[1].id, '3');
  });

  it('clusterImages handles empty input', () => {
    const { clusterImages } = require('../src/analyze/cluster');
    const result = clusterImages([]);
    assert.deepStrictEqual(result, { groups: [] });
  });
});

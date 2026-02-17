const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// Save original env so we can restore it
const originalEnv = { ...process.env };

function makePhoto(id) {
  return {
    id: `u-${id}`,
    urls: { regular: `https://img/${id}.jpg`, thumb: `https://img/${id}_t.jpg` },
    width: 800,
    height: 600,
    user: { name: 'Alice', links: { html: 'https://unsplash.com/@alice' } },
  };
}

function makePexelsPhoto(id) {
  return {
    id,
    src: { large: `https://pexels/${id}.jpg`, tiny: `https://pexels/${id}_t.jpg` },
    width: 1024,
    height: 768,
    photographer: 'Bob',
    photographer_url: 'https://pexels.com/@bob',
  };
}

describe('searchUnsplash', () => {
  let searchUnsplash;

  beforeEach(() => {
    // Clear module cache so each test gets a fresh require
    delete require.cache[require.resolve('../src/search/unsplash')];
    delete require.cache[require.resolve('../src/search/index')];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    mock.restoreAll();
  });

  it('returns empty array when UNSPLASH_ACCESS_KEY is missing', async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    ({ searchUnsplash } = require('../src/search/unsplash'));
    const results = await searchUnsplash('test');
    assert.deepStrictEqual(results, []);
  });

  it('returns correctly shaped results on success', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'fake-key';
    const axios = require('axios');
    mock.method(axios, 'get', async () => ({
      data: { results: [makePhoto(1), makePhoto(2)] },
    }));

    ({ searchUnsplash } = require('../src/search/unsplash'));
    const results = await searchUnsplash('nature', 2);

    assert.equal(results.length, 2);
    for (const img of results) {
      assert.ok(img.id);
      assert.ok(img.url);
      assert.ok(img.thumbUrl);
      assert.equal(typeof img.width, 'number');
      assert.equal(typeof img.height, 'number');
      assert.equal(img.source, 'unsplash');
      assert.ok(img.photographer);
      assert.ok(img.photographerUrl);
    }
  });

  it('returns empty array on network error', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'fake-key';
    const axios = require('axios');
    mock.method(axios, 'get', async () => {
      throw new Error('Network error');
    });

    ({ searchUnsplash } = require('../src/search/unsplash'));
    const results = await searchUnsplash('test');
    assert.deepStrictEqual(results, []);
  });
});

describe('searchPexels', () => {
  let searchPexels;

  beforeEach(() => {
    delete require.cache[require.resolve('../src/search/pexels')];
    delete require.cache[require.resolve('../src/search/index')];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    mock.restoreAll();
  });

  it('returns empty array when PEXELS_API_KEY is missing', async () => {
    delete process.env.PEXELS_API_KEY;
    ({ searchPexels } = require('../src/search/pexels'));
    const results = await searchPexels('test');
    assert.deepStrictEqual(results, []);
  });

  it('returns correctly shaped results on success', async () => {
    process.env.PEXELS_API_KEY = 'fake-key';
    const axios = require('axios');
    mock.method(axios, 'get', async () => ({
      data: { photos: [makePexelsPhoto(10), makePexelsPhoto(20)] },
    }));

    ({ searchPexels } = require('../src/search/pexels'));
    const results = await searchPexels('ocean', 2);

    assert.equal(results.length, 2);
    for (const img of results) {
      assert.ok(img.id);
      assert.ok(img.url);
      assert.ok(img.thumbUrl);
      assert.equal(typeof img.width, 'number');
      assert.equal(typeof img.height, 'number');
      assert.equal(img.source, 'pexels');
      assert.ok(img.photographer);
      assert.ok(img.photographerUrl);
    }
  });

  it('returns empty array on network error', async () => {
    process.env.PEXELS_API_KEY = 'fake-key';
    const axios = require('axios');
    mock.method(axios, 'get', async () => {
      throw new Error('Network error');
    });

    ({ searchPexels } = require('../src/search/pexels'));
    const results = await searchPexels('test');
    assert.deepStrictEqual(results, []);
  });
});

describe('searchImages (merged)', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    mock.restoreAll();
  });

  it('merges results from both sources', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'fake';
    process.env.PEXELS_API_KEY = 'fake';

    // Clear caches so fresh requires pick up the mocked axios
    for (const key of Object.keys(require.cache)) {
      if (key.includes('src/search')) delete require.cache[key];
    }

    const axios = require('axios');
    let callCount = 0;
    mock.method(axios, 'get', async (url) => {
      callCount++;
      if (url.includes('unsplash')) {
        return { data: { results: [makePhoto(1)] } };
      }
      return { data: { photos: [makePexelsPhoto(2)] } };
    });

    const { searchImages } = require('../src/search/index');
    const results = await searchImages('test', 10);

    assert.equal(results.length, 2);
    const sources = results.map((r) => r.source);
    assert.ok(sources.includes('unsplash'));
    assert.ok(sources.includes('pexels'));
  });
});

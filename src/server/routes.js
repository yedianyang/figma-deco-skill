const fs = require('fs');
const path = require('path');
const express = require('express');

const DATA_FILE = path.join(__dirname, '../../data/pending-import.json');

function createRouter(orchestrate) {
  const router = express.Router();

  // GET /data — serve the latest analysis result
  router.get('/data', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ groups: [], status: 'empty' });
    }

    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      res.json(data);
    } catch (err) {
      console.error('[routes] Failed to read data file:', err.message);
      res.status(500).json({ error: 'Failed to read data' });
    }
  });

  // GET /health — simple health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // POST /search — trigger a new search + analysis pipeline
  router.post('/search', async (req, res) => {
    const { query, count } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: 'Missing "query" field' });
    }

    try {
      const result = await orchestrate(query, count);
      res.json(result);
    } catch (err) {
      console.error('[routes] Search pipeline failed:', err.message);
      res.status(500).json({ error: 'Search pipeline failed' });
    }
  });

  return router;
}

module.exports = { createRouter, DATA_FILE };

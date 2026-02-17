const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const { createRouter, DATA_FILE } = require('../src/server/routes');

const TEST_PORT = 0; // let OS pick a free port

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

describe('Server endpoints', () => {
  let server;
  let baseUrl;
  const dataFileExisted = fs.existsSync(DATA_FILE);
  let dataFileBackup;

  before(async () => {
    // Back up existing data file if present
    if (dataFileExisted) {
      dataFileBackup = fs.readFileSync(DATA_FILE, 'utf-8');
    }
    // Remove data file so we test the "empty" case first
    if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);

    const app = express();
    app.use(express.json());
    const orchestrate = async (query) => ({ query, groups: [] });
    app.use(createRouter(orchestrate));

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));

    // Restore original data file state
    if (dataFileExisted && dataFileBackup) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, dataFileBackup);
    } else if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  it('GET /health returns { status: "ok" }', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepStrictEqual(res.body, { status: 'ok' });
  });

  it('GET /data returns empty result when no data file exists', async () => {
    const res = await fetch(`${baseUrl}/data`);
    assert.equal(res.status, 200);
    assert.deepStrictEqual(res.body, { groups: [], status: 'empty' });
  });

  it('GET /data returns file contents when data file exists', async () => {
    const sample = {
      query: 'test',
      groups: [{ name: 'Group 1', images: [{ id: '1', url: 'https://example.com/1.jpg' }] }],
    };
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(sample));

    const res = await fetch(`${baseUrl}/data`);
    assert.equal(res.status, 200);
    assert.deepStrictEqual(res.body, sample);
  });
});

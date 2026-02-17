require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { searchImages } = require('./search');
const { analyzeImages } = require('./analyze');
const { startServer } = require('./server/server');
const { DATA_FILE } = require('./server/routes');

async function orchestrate(query, count = 30) {
  console.log(`\n[main] Searching for "${query}" (count=${count})…`);
  const images = await searchImages(query, count);
  console.log(`[main] Found ${images.length} images`);

  if (images.length === 0) {
    return { groups: [], status: 'no_results' };
  }

  const result = await analyzeImages(images);

  // Strip embeddings before saving — they're large and not needed by the plugin
  const clean = {
    query,
    timestamp: new Date().toISOString(),
    groups: result.groups.map((g) => ({
      name: g.name,
      images: g.images.map(({ embedding, ...img }) => img),
    })),
  };

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2));
  console.log(`[main] Saved ${DATA_FILE}`);

  return clean;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--query' && argv[i + 1]) args.query = argv[++i];
    else if (argv[i] === '--count' && argv[i + 1]) args.count = parseInt(argv[++i], 10);
  }
  return args;
}

async function main() {
  const { query, count } = parseArgs(process.argv);

  // If a query is provided as CLI arg, run the pipeline first
  if (query) {
    await orchestrate(query, count || 30);
  }

  // Start the server (handles POST /search for subsequent queries)
  await startServer(orchestrate);
}

main().catch((err) => {
  console.error('[main] Fatal error:', err);
  process.exit(1);
});

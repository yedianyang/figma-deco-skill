# Figma Moodboard Skill

Auto-search reference images from Unsplash & Pexels, analyze and group them with CLIP + k-means, then insert into FigJam with one click.

## Quick Start

### 1. Install

```bash
git clone git@github.com:yedianyang/figma-deco-skill.git
cd figma-deco-skill
npm install
```

### 2. Configure API Keys

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```
UNSPLASH_ACCESS_KEY=...   # https://unsplash.com/developers
PEXELS_API_KEY=...        # https://www.pexels.com/api/
HF_API_TOKEN=...          # https://huggingface.co/settings/tokens
```

### 3. Run

```bash
# Search + analyze + start server
node src/main.js --query "art deco posters" --count 30

# Or start server only (use POST /search later)
npm start
```

### 4. Import into FigJam

1. Open a FigJam file in Figma
2. Go to **Plugins > Development > Import from manifest**
3. Select `figma-plugin/manifest.json`
4. Run the plugin and click **Import Moodboard**

## How It Works

```
User query: "art deco posters"
    |
    v
Search (Unsplash + Pexels, concurrent)
    |
    v
CLIP Embedding (Hugging Face Inference API)
    |
    v
Deduplicate (cosine similarity > 0.95)
    |
    v
k-means Clustering (auto k=3-5)
    |
    v
HTTP Server (localhost:3000/data)
    |
    v
FigJam Plugin (auto-insert grouped images)
```

## Project Structure

```
src/
  search/         Unsplash + Pexels API wrappers
  analyze/        CLIP embedding, k-means, dedup
  server/         Express HTTP server
  main.js         CLI + orchestration
figma-plugin/     FigJam plugin (manifest + code + UI)
tests/            33 tests (node --test)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/data` | Latest analysis result (JSON) |
| GET | `/health` | Health check |
| POST | `/search` | Trigger search pipeline (`{ "query": "...", "count": 30 }`) |

## Tests

```bash
npm test
```

## Requirements

- Node.js >= 18
- Unsplash API key (free, 5000 req/hour)
- Pexels API key (free)
- Hugging Face API token (free tier)

## License

MIT

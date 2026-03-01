# Moodboard Skill

> Automatically search, analyze, and organize reference images into FigJam.

## What It Does

Given a search query (e.g., "art deco posters"), this skill:

1. **Searches** Unsplash and Pexels concurrently for matching images
2. **Analyzes** images using CLIP embeddings (Hugging Face API)
3. **Deduplicates** visually similar results (cosine similarity)
4. **Groups** images into 3-5 clusters using k-means
5. **Serves** the grouped data via a local HTTP server
6. **Inserts** images into FigJam via a Figma Plugin, automatically arranged by group

## Usage

### Command Line

```bash
# Full pipeline: search + analyze + serve
node src/main.js --query "art deco posters" --count 30
```

**Parameters:**
- `--query` (required) — Search keywords
- `--count` (optional, default: 30) — Number of images to fetch

### HTTP API

Once the server is running on `localhost:3000`:

**Get latest results:**
```bash
curl http://localhost:3000/data
```

**Trigger a new search:**
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "minimalist architecture", "count": 25}'
```

### FigJam Plugin

1. Open FigJam in Figma Desktop
2. Plugins > Development > Import from manifest
3. Select `figma-plugin/manifest.json`
4. Click **Import Moodboard**

The plugin fetches data from the local server and inserts images onto the canvas, organized by group in a grid layout (4 columns, 300px width).

## Configuration

Create a `.env` file (see `.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `UNSPLASH_ACCESS_KEY` | Yes | [Unsplash Developers](https://unsplash.com/developers) |
| `PEXELS_API_KEY` | Yes | [Pexels API](https://www.pexels.com/api/) |
| `HF_API_TOKEN` | Yes | [Hugging Face Tokens](https://huggingface.co/settings/tokens) |
| `PORT` | No | Server port (default: 3000) |

## Output Format

```json
{
  "query": "art deco posters",
  "timestamp": "2026-02-27T12:00:00.000Z",
  "groups": [
    {
      "name": "Group 1",
      "images": [
        {
          "id": "abc123",
          "url": "https://images.unsplash.com/photo-...",
          "thumbUrl": "https://images.unsplash.com/photo-...&w=400",
          "width": 1200,
          "height": 800,
          "source": "unsplash",
          "photographer": "John Doe",
          "photographerUrl": "https://unsplash.com/@johndoe"
        }
      ]
    }
  ]
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No images returned | Check API keys in `.env` |
| CLIP embedding fails | Verify `HF_API_TOKEN` is valid; HF free tier has rate limits |
| Plugin can't connect | Ensure server is running (`localhost:3000`), check CORS |
| FigJam import slow | Use `--count` to reduce image count; thumbUrl is used for faster loading |
| Clustering returns 1 group | Too few images or images too similar; try a broader query |

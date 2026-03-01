# API Documentation

HTTP Server running on `localhost:3000` (configurable via `PORT` env var).

---

## Endpoints

### GET /health

Health check.

**Response:**
```json
{ "status": "ok" }
```

---

### GET /data

Returns the latest search + analysis result from `data/pending-import.json`.

**Response (with data):**
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

**Response (no data yet):**
```json
{ "groups": [], "status": "empty" }
```

**Error (500):**
```json
{ "error": "Failed to read data" }
```

---

### POST /search

Triggers the full pipeline: search images → CLIP embedding → dedup → k-means clustering → save result.

**Request:**
```json
{
  "query": "minimalist architecture",
  "count": 25
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | — | Search keywords |
| `count` | number | No | 30 | Number of images to fetch |

**Response:** Same format as `GET /data`.

**Error (400):**
```json
{ "error": "Missing \"query\" field" }
```

**Error (500):**
```json
{ "error": "Search pipeline failed" }
```

---

## Image Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Image ID from source |
| `url` | string | Full-size image URL |
| `thumbUrl` | string | Thumbnail URL (~400px) |
| `width` | number | Original width in pixels |
| `height` | number | Original height in pixels |
| `source` | string | `"unsplash"` or `"pexels"` |
| `photographer` | string | Photographer name |
| `photographerUrl` | string | Photographer profile URL |

---

## CORS

All origins are allowed. The Figma Plugin (running in Figma's sandbox) fetches from `http://localhost:3000/data`.

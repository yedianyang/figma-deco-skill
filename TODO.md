# TODO

## MVP (Week 1)

### M0: 框架搭建 ✅

**Backend:**
- [x] 项目初始化 (`package.json`, `src/` 结构)
- [x] Unsplash API 封装 (`src/search/unsplash.js`)
- [x] Pexels API 封装 (`src/search/pexels.js`)
- [x] 统一搜索接口 (`src/search/index.js`)
- [x] 输出 JSON 数据到 `data/pending-import.json`

**验收:** `node src/main.js --query "art deco posters" --count 30`

---

### M1: AI 分析分组 ✅

**AI:**
- [x] CLIP embedding 集成（Hugging Face Inference API）
- [x] k-means++ 聚类实现 (`src/analyze/cluster.js`)，auto-k (3-5)
- [x] 余弦相似度去重 (`src/analyze/deduplicate.js`)
- [x] 分析管线编排 (`src/analyze/index.js`)

---

### M2: Figma Plugin + Server ✅

**Backend:**
- [x] Express HTTP Server (`src/server/server.js`)
- [x] API 路由 (`GET /data`, `GET /health`, `POST /search`)
- [x] CORS 配置（允许 Figma 访问）
- [x] main.js 编排（CLI 参数 + 管线 + 服务器启动）

**Plugin:**
- [x] Figma Plugin 初始化 (`figma-plugin/manifest.json`)
- [x] 从 Server 获取数据 (`fetch('http://localhost:3000/data')`)
- [x] 插入图片到 FigJam (`figma.createImageAsync()`)
- [x] 网格排版算法（按组摆放，4列，自动分组偏移）

---

### M3: 测试 ✅

**测试覆盖 (33/33 pass):**
- [x] `tests/search.test.js` — 搜索模块单元测试 (8 tests)
- [x] `tests/cluster.test.js` — 聚类+去重单元测试 (11 tests)
- [x] `tests/server.test.js` — 服务器端点测试 (3 tests)
- [x] `tests/integration.test.js` — 模块加载+数据结构测试 (12 tests)

---

### M4: 文档 ⬜ 待开始

**Docs:**
- [ ] `SKILL.md` — Skill 说明文档
- [ ] `README.md` — 项目介绍 + 快速开始
- [ ] API 文档 — HTTP Server 端点说明
- [ ] 用户文档 — OpenClaw 使用指南

**内容要求:**
- 安装步骤
- 配置说明（API keys）
- 使用示例
- 故障排查

---

## Future (Week 2-3)

### 多数据源支持
- [ ] Pinterest API 集成
- [ ] Google Images 爬虫
- [ ] Behance API

### 高级功能
- [ ] 风格学习（记住用户偏好）
- [ ] 批量处理（多个关键词）
- [ ] 导出功能（保存到本地文件夹）
- [ ] 高级排版（用户自定义布局）

### 优化
- [ ] 并发下载优化
- [ ] 缓存机制
- [ ] 图片去重改进（perceptual hash）

---

## Bug Tracker

<!-- Tester 在此记录 Bug -->

### Open Bugs

(无)

### Resolved Bugs

(无)

---

**最后更新:** 2026-02-27

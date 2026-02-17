# TODO

## MVP (Week 1)

### M0: 框架搭建 (Day 1-2)

**Backend:**
- [ ] 项目初始化 (`package.json`, `src/` 结构)
- [ ] Unsplash API 封装 (`src/search/unsplash.js`)
- [ ] Pexels API 封装 (`src/search/pexels.js`)
- [ ] 统一搜索接口 (`src/search/index.js`)
- [ ] 输出 JSON 数据到 `data/pending-import.json`

**测试验收:**
```bash
node src/main.js --query "art deco posters" --count 30
# 输出: data/pending-import.json (25-30 张图片)
```

---

### M1: AI 分析分组 (Day 2-3)

**AI:**
- [ ] CLIP embedding 集成（Hugging Face API）
- [ ] k-means 聚类实现 (`src/analyze/cluster.js`)
- [ ] 去重算法 (`src/analyze/deduplicate.js`)
- [ ] 分组数据结构设计

**输出格式:**
```json
{
  "query": "art deco posters",
  "groups": [
    {
      "name": "几何图案",
      "images": [...]
    },
    {
      "name": "配色参考",
      "images": [...]
    }
  ]
}
```

---

### M2: Figma Plugin + Server (Day 3-4)

**Backend:**
- [ ] Express HTTP Server (`src/server/server.js`)
- [ ] API 路由 (`GET /data`)
- [ ] CORS 配置（允许 Figma 访问）

**Plugin:**
- [ ] Figma Plugin 初始化 (`figma-plugin/manifest.json`)
- [ ] 从 Server 获取数据 (`fetch('http://localhost:3000/data')`)
- [ ] 插入图片到 FigJam (`figma.createImageAsync()`)
- [ ] 基础排版算法（按组摆放）

**测试验收:**
1. 启动 Server → http://localhost:3000/data 返回 JSON
2. Figma Plugin → 自动插入图片到画布

---

### M3: 集成测试 (Day 5)

**Tester:**
- [ ] 端到端流程验证
- [ ] 错误处理测试（网络失败、图片加载失败）
- [ ] 性能测试（30 张图片插入时间 < 10s）

**Backend:**
- [ ] 错误处理优化
- [ ] 日志输出

**验收标准:**
```
用户: "找 art deco 海报"
→ Skill 执行（搜索 + 分析）
→ Server 启动
→ Figma Plugin 自动运行
→ 图片插入完成（30 张，3-5 组）
→ 耗时 < 60s
```

---

### M4: 文档 (Day 6-7)

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

**最后更新:** 2026-02-17

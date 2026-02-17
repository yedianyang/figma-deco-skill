# Figma Moodboard Skill - 项目文档

**项目类型：** OpenClaw Skill  
**目标：** 自动搜索参考图并插入 FigJam  
**状态：** 设计阶段 → 开发准备  
**创建日期：** 2026-02-17

---

## 📋 目录

1. [项目背景](#项目背景)
2. [核心问题](#核心问题)
3. [解决方案](#解决方案)
4. [技术架构](#技术架构)
5. [开发计划](#开发计划)
6. [市场调研](#市场调研)
7. [竞品分析](#竞品分析)
8. [决策记录](#决策记录)

---

## 项目背景

### 原始需求

**用户场景：**
设计师在做项目时（如 Art Deco 风格设计），需要：
1. 从网上搜索参考图（Pinterest、Unsplash、Behance）
2. 下载、整理、分类
3. 导入设计工具（Figma/FigJam）
4. 手动排版、分组

**痛点：**
- 搜索耗时（1-2 小时）
- 重复劳动（每个项目都要做）
- 切换工具成本高（浏览器 → 本地 → Figma）

### 理想工作流

**用户期望：**
```
对 OpenClaw 说："帮我找 art deco 风格的海报，放到 FigJam"
↓
30-60 秒后
↓
FigJam 画布上自动出现 25 张参考图，已分组排版
```

**核心价值：**
- **速度：** 从 1-2 小时 → 1 分钟
- **质量：** AI 自动筛选、去重、分组
- **无缝：** 不需要离开 OpenClaw / Figma

---

## 核心问题

### 为什么不用现有工具？

**市场已有工具：**
- **PureRef** — 免费，但只能手动排列，无组织功能
- **Eagle** — $30，功能强大，但**无视觉搜索**，无法和 OpenClaw 集成
- **Kosmik** — 云端，有 AI 特性，但**隐私问题** + 无 API
- **LoveArt** — 功能强大（可接 Tripo3D 生成 3D），但**无公开 API**

**共同问题：**
1. 都是独立应用，无法和 OpenClaw 自动化
2. 需要手动操作（搜索、下载、导入）
3. 不针对 Figma 工作流优化

### 探索过的方案

| 方案 | 结论 | 原因 |
|------|------|------|
| Deco 独立产品 | ❌ 放弃 | 市场饱和、开发量大、非真实需求 |
| LoveArt API 集成 | ❌ 不可行 | 无公开 API（官方回复：Not yet）|
| 浏览器自动化 | ⚠️ 备选 | 不稳定、可能违反 ToS |
| **Figma Plugin Skill** | ✅ **采用** | 技术可行、开发快、用户体验好 |

---

## 解决方案

### 整体架构

```
┌─────────────────────┐
│  用户 (Discord/Telegram) │
│  "找 art deco 海报"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  OpenClaw Skill             │
│  1. 搜索图片 (Unsplash API)  │
│  2. CLIP 分析分组            │
│  3. 启动本地 Server          │
│  4. 触发 Figma Plugin        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  本地 HTTP Server           │
│  localhost:3000             │
│  提供图片数据（JSON）        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Figma Plugin               │
│  1. 从 Server 获取数据       │
│  2. 插入图片到 FigJam        │
│  3. 自动排版                 │
└─────────────────────────────┘
```

### 核心功能

#### 1. 自动搜索参考图

**数据源：**
- Unsplash API（免费，5000 次/小时）
- Pexels API（免费）
- Pinterest API（需申请）

**搜索策略：**
- 关键词提取（从用户输入）
- 多源搜索（并发请求）
- 去重（perceptual hash）

#### 2. AI 分析与分组

**技术栈：**
- **CLIP embedding** — 图片语义理解（Hugging Face API 或本地模型）
- **k-means 聚类** — 自动分组（通常 3-5 组）
- **相似度计算** — 去除重复或过于相似的图片

**分组维度：**
- 视觉风格（几何图案、有机形态）
- 配色（暖色调、冷色调、黑白）
- 主题（建筑、产品、平面设计）

#### 3. 无缝插入 FigJam

**Figma Plugin API：**
- `figma.createImageAsync(url)` — 从 URL 创建图片
- `figma.createRectangle()` — 创建容器
- `figma.createText()` — 添加标题/标签

**自动排版算法：**
```
按组摆放：
Group 1: "几何图案" (8 张)
  [img] [img] [img] [img]
  [img] [img] [img] [img]

Group 2: "配色参考" (6 张)
  [img] [img] [img]
  [img] [img] [img]

Group 3: "装饰细节" (11 张)
  [img] [img] [img] [img]
  ...
```

---

## 技术架构

### 技术栈

**后端（Skill）：**
- 语言：Node.js / Python
- 框架：Express.js（HTTP Server）
- API 客户端：axios / node-fetch
- CLIP 模型：Hugging Face Transformers 或 CLIP API
- 聚类：scikit-learn (k-means)

**前端（Figma Plugin）：**
- 语言：TypeScript
- 框架：Figma Plugin API
- 通信：fetch API（从 localhost:3000）

### 数据流

```javascript
// 1. 用户输入
{ query: "art deco posters" }

// 2. 搜索结果
{
  "images": [
    { "url": "https://...", "source": "Unsplash", "id": "abc123" },
    ...
  ]
}

// 3. CLIP 分析
{
  "images": [...],
  "embeddings": [[0.1, 0.2, ...], ...]
}

// 4. 聚类结果
{
  "query": "art deco posters",
  "groups": [
    {
      "name": "几何图案",
      "images": [
        { "url": "https://...", "id": "abc123" },
        ...
      ]
    },
    ...
  ],
  "timestamp": 1708186800
}

// 5. Figma Plugin 读取
fetch('http://localhost:3000/data')
  .then(res => res.json())
  .then(data => insertToFigma(data))
```

### 文件结构

```
~/.openclaw/workspace/skills/figma-moodboard/
├── SKILL.md                    # Skill 说明文档
├── package.json
├── README.md
│
├── src/
│   ├── search/
│   │   ├── unsplash.js         # Unsplash API 封装
│   │   ├── pexels.js           # Pexels API 封装
│   │   └── index.js            # 统一搜索接口
│   │
│   ├── analyze/
│   │   ├── clip.js             # CLIP embedding
│   │   ├── cluster.js          # k-means 聚类
│   │   └── deduplicate.js      # 去重算法
│   │
│   ├── server/
│   │   ├── server.js           # HTTP Server (Express)
│   │   └── routes.js           # API 路由
│   │
│   └── main.js                 # 主流程编排
│
├── figma-plugin/               # Figma Plugin 代码
│   ├── manifest.json
│   ├── code.ts                 # Plugin 主逻辑
│   └── ui.html                 # 用户界面
│
├── data/                       # 临时数据存储
│   └── pending-import.json
│
└── tests/
    ├── search.test.js
    ├── cluster.test.js
    └── integration.test.js
```

---

## 开发计划

### MVP（1 周）

#### Day 1-2：Skill 开发（搜索 + 分组）

**任务：**
- [ ] 搭建项目框架
- [ ] 实现 Unsplash API 调用
- [ ] CLIP embedding（使用 Hugging Face API）
- [ ] k-means 聚类分组
- [ ] 输出 JSON 数据

**验收标准：**
```bash
node src/main.js --query "art deco posters" --count 30
# 输出：data/pending-import.json
# 包含 3-5 组，共 25-30 张图片
```

#### Day 3-4：本地 Server + Figma Plugin

**任务：**
- [ ] Express Server（localhost:3000）
- [ ] Figma Plugin 基础框架
- [ ] 从 Server 获取数据
- [ ] 插入图片到 FigJam
- [ ] 基础排版算法

**验收标准：**
1. 启动 Server → 访问 http://localhost:3000/data → 返回 JSON
2. 在 Figma 运行 Plugin → 自动插入图片

#### Day 5：集成测试

**任务：**
- [ ] OpenClaw Skill 调用测试
- [ ] 端到端流程验证
- [ ] 错误处理（网络失败、图片加载失败）

**验收标准：**
完整流程：
```
用户: "找 art deco 海报"
→ Skill 执行
→ Server 启动
→ Plugin 自动运行
→ 图片插入完成
→ OpenClaw 通知用户
```

#### Day 6-7：优化 + 文档

**任务：**
- [ ] 性能优化（并发下载、缓存）
- [ ] 用户文档（SKILL.md）
- [ ] 错误提示优化
- [ ] Demo 视频录制

---

### 完整版（2-3 周）

**额外功能：**
1. **多数据源支持**
   - Pinterest API
   - Google Images（爬虫）
   - Behance

2. **风格学习**
   - 记住用户偏好
   - 推荐历史相似项目

3. **批量处理**
   - 一次处理多个关键词
   - 生成多个 FigJam Page

4. **导出功能**
   - 保存到本地文件夹
   - 生成 PDF moodboard

5. **高级排版**
   - 用户自定义布局
   - 响应式排版

---

## 市场调研

### Reddit 用户调研（2026-02-17）

**关键发现：**

#### 1. 用户对 "AI 生成 Moodboard" 的态度两极分化

**反对派（设计师主流）：**
> "AI can give you images but never a fully complete moodboard. **Do the work.**"  
> "Making a mood board is fun. **Why do people constantly want to take away the fun parts of life?**"

**支持派（效率派）：**
> "You can spend **hours** searching, cropping, and organizing images when that time could be better spent elsewhere."

**洞察：**
- ❌ 直接生成完整 Moodboard = 被反感（"偷懒"）
- ✅ AI 辅助收集/组织 = 有需求（节省时间）

#### 2. 核心痛点

| 痛点 | 用户原话 | 频率 |
|------|----------|------|
| 收集慢 | "You can spend **hours** searching" | 高 |
| 找相似图难 | "Find similar visuals from any image without digging around manually" | 中 |
| 整理乱 | "I collected so many references but can't find what I need later" | 高 |
| 丢失来源 | "Eagle retains the source information" | 中 |

#### 3. 现有工具使用情况

**主流组合：**
- **PureRef + Eagle** — 专业设计师
- **Figma/Figjam** — 团队协作
- **Pinterest + 文件夹** — 轻度用户

**工具痛点：**
- PureRef：无组织功能
- Eagle：无视觉搜索（只能靠标签）
- Kosmik：云端存储（隐私问题）

**完整调研文档：** `deco-research/reddit-ai-moodboard-insights.md`

---

## 竞品分析

### 完整工具地图

**详见：** `deco-research/competitor-tools-landscape.md`

#### 桌面应用（本地优先）

| 工具 | 价格 | 核心特点 | 用户评价 |
|------|------|----------|----------|
| **PureRef** | 免费 | Canvas 排列、Always-on-top | "最流行"，但功能简单 |
| **Eagle** | $30 | 文件夹+标签、保留来源 | "最爱用"，但**无视觉搜索** |
| **Allusion** | 免费开源 | 标签系统、watched folders | "PureRef 的互补工具" |

#### Web 应用（协作/在线）

| 工具 | 价格 | 核心特点 | 用户评价 |
|------|------|----------|----------|
| **Kosmik** ⚠️ | Freemium | **AI 自动发现相似图片** | "最好用的 moodboarding 工具" |
| **Milanote** | Freemium | 拖拽式看板 | 美观、易用 |
| **Figma/Figjam** | 免费 | 设计工具内置 | 方便但功能有限 |

#### Deco Skill 的差异化

**vs Eagle：**
- ✅ 有视觉搜索（CLIP）
- ✅ OpenClaw 自动化
- ❌ 无桌面 GUI（不是独立应用）

**vs Kosmik：**
- ✅ 本地优先（隐私）
- ✅ 开放 API（可定制）
- ❌ 无协作功能（MVP）

**vs LoveArt：**
- ✅ 有 API（本地 Server）
- ❌ 不做 3D 生成（专注参考图）

---

## 决策记录

### 2026-02-17

#### 决策 1：放弃独立产品，做 Skill

**背景：**
- 最初想做 Deco 桌面应用（类似 Eagle/Kosmik）
- 调研发现市场已饱和，竞品功能完善

**原因：**
1. **市场饱和** — Eagle、Kosmik、Allusion 已覆盖主要需求
2. **非真实需求** — 调研未发现强烈的未满足需求
3. **开发成本高** — 独立产品需要 GUI、市场推广、融资

**决策：**
- ❌ 不做独立产品
- ✅ 做 OpenClaw Skill（自用 + 小众用户）

---

#### 决策 2：放弃 LoveArt 集成

**背景：**
- 发现 LoveArt 可以接 Tripo3D（参考图 → 3D 模型）
- 原计划通过 LoveArt API 实现完整工作流

**调研结果：**
> "Does Lovart offer an API?"  
> **"Not yet"**（官方回复）

**决策：**
- ❌ LoveArt API 不可行（目前无公开 API）
- ⚠️ 备选方案：浏览器自动化（Puppeteer）
- ✅ 优先做 Figma Plugin Skill（不依赖 LoveArt）

---

#### 决策 3：采用 Figma Plugin 方案

**对比方案：**
| 方案 | 可行性 | 开发时间 | 稳定性 |
|------|--------|----------|--------|
| 独立桌面应用 | 可行 | 数月 | 高 |
| LoveArt API | ❌ 不可行 | - | - |
| 浏览器自动化 | 可行 | 2-3 周 | 低 |
| **Figma Plugin** | ✅ 可行 | **1 周** | ✅ 高 |

**优势：**
1. **技术可行** — Figma Plugin API 完整、稳定
2. **开发快速** — 1 周可完成 MVP
3. **用户体验好** — 自动化程度高（0 点击）
4. **成本低** — 0 元（所有 API 免费）

**决策：**
- ✅ 采用 Figma Plugin + OpenClaw Skill 方案
- 🚀 立即开始开发（Option A）

---

## 下一步行动

### 立即执行（今天）

1. ✅ 创建 Discord 频道 `#deco-skill`
2. ✅ 整理项目文档（本文件）
3. ⏭️ 创建 Skill 框架
4. ⏭️ 搭建开发环境

### 本周目标（Day 1-7）

- [ ] 完成 Skill 开发（搜索 + 分组）
- [ ] 完成 Figma Plugin 开发（插入 + 排版）
- [ ] 端到端测试
- [ ] 用户文档

### 长期目标（2-4 周）

- [ ] 多数据源支持（Pinterest、Google Images）
- [ ] 风格学习（记住用户偏好）
- [ ] 批量处理
- [ ] 导出功能

---

## 附录

### 相关文档

- `deco-research/reddit-ai-moodboard-insights.md` — Reddit 用户调研
- `deco-research/competitor-tools-landscape.md` — 竞品分析
- `jimjguo-website/` — Jingxi 作品集下载（2026-02-17）

### API 文档

- **Unsplash API：** https://unsplash.com/documentation
- **Pexels API：** https://www.pexels.com/api/
- **Hugging Face CLIP：** https://huggingface.co/openai/clip-vit-base-patch32
- **Figma Plugin API：** https://www.figma.com/plugin-docs/

### 技术参考

- **CLIP 论文：** Radford et al., "Learning Transferable Visual Models From Natural Language Supervision" (2021)
- **k-means 聚类：** scikit-learn documentation
- **Figma Plugin 开发指南：** Figma official docs

---

**最后更新：** 2026-02-17  
**项目负责人：** Jingxi + Metro  
**开发状态：** 🟢 准备开始

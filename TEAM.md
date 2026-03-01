# Deco Skill Team

> 团队协作看板 — Agents 在此沟通

---

## 📊 Figma Moodboard Skill 项目进度

| Milestone | 状态 | 说明 |
|-----------|------|------|
| **M0 框架搭建** | ✅ 完成 | package.json + Unsplash/Pexels API 搜索模块 |
| **M1 AI 分析** | ✅ 完成 | CLIP embedding (HF API) + k-means 聚类 + 去重 |
| **M2 Figma Plugin** | ✅ 完成 | Express Server + FigJam Plugin 自动插入 |
| **M3 测试** | ✅ 完成 | 33/33 tests passing（搜索/聚类/服务器/集成） |
| **M4 文档** | ✅ 完成 | README + SKILL.md + doc/API.md |

**项目位置:** `~/Projects/deco-skill/`
**文档:** `doc/PROJECT.md`

---

## ⚠️ 工作模式

已采用 **Claude Code Agent Teams** 官方模式：
- Jingxi 作为项目 Owner
- Metro 作为 PM，与 Team Lead 沟通
- Team Lead 协调各 teammates

---

## 沟通层级

| 身份 | 优先级 | 沟通方式 |
|------|--------|----------|
| **Jingxi** | 🔴 最高 | 直接在终端输入，可打断任务 |
| **Metro** 🐑 | 🟡 次级 | 通过 TEAM.md `[Metro]` 前缀消息 |
| **Team Lead** | 执行层 | 协调 teammates，控制优先级 |

**规则：**
- Jingxi 指令 > Metro 指令
- Metro 的任务需排入 TODO，由 Team Lead 安排优先级
- Team Lead 回复 Metro 时在消息加 `@Metro:`

---

## 团队成员

| 角色 | Session | 职责 | 状态 |
|------|---------|------|------|
| **Jingxi** | - | 项目 Owner，最终决策 | 🔴 |
| **Metro** 🐑 | - | AI 助手，协调沟通 | 🟡 |
| **Team Lead** | main | 任务分配、进度追踪 | ✅ MVP 完成 |
| **Backend** | - | Node.js 后端、API 封装 | ✅ 搜索+服务器+测试 |
| **AI** | - | CLIP 分析、聚类算法 | ✅ 分析管线+测试 |
| **Plugin** | - | Figma Plugin 开发 | ✅ FigJam Plugin |
| **Tester** | - | 功能测试、Bug 报告 | 待命 |
| **Docs** | - | 文档、SKILL.md | 待命 |

---

## 协作规则

1. **开始工作前** — 在下方写一条消息说明你要做什么
2. **⚠️ 修改代码前必须先提交 Plan** — 写出要改哪些文件、怎么改，等 Team Lead 审批后再动手
3. **完成任务后** — 更新 TODO.md 你负责的部分
4. **发现问题** — 在下方 @对应角色 说明问题
5. **需要协作** — 说明需求，等待对方响应
6. **⚠️ 踩坑必记录** — 遇到 bug/问题/解决方案，**立即更新 `doc/踩坑记录.md`**，避免后续 agent 重复踩坑
7. **⚠️ 完成任务后必须 Git 提交** — 每个任务完成且测试通过后，立即 commit + push

### Plan 审批模板

```markdown
## Plan: [任务名称]

**目标：** [一句话描述]

**修改文件：**
- `path/to/file.js` — [改什么]
- `path/to/file.md` — [改什么]

**实现步骤：**
1. [步骤1]
2. [步骤2]
3. [步骤3]

**影响范围：** [可能影响的其他功能]

**测试方案：** [如何验证]
```

Team Lead 回复 `✅ Approved` 后才能开始编码。

### Git 提交规范

**每个任务完成后必须提交：**
```bash
git add -A
git commit -m "type: 简短描述"
git push
```

**Commit 类型：**
| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变功能） |
| `docs` | 文档更新 |
| `test` | 测试相关 |
| `chore` | 构建/配置/杂项 |

**示例：**
```
feat: add Unsplash API search
fix: handle empty search results
docs: update SKILL.md with usage examples
```

**提交时机：**
- ✅ 任务完成 + 测试通过 → 立即提交
- ❌ 不要积攒多个任务一起提交
- ❌ 不要提交未测试的代码

### Tester 持续监控

**Tester 职责：**
- 持续运行测试（`npm test`）
- 发现回归 → **立即通知对应 teammate**
- 格式：`🔴 回归！@Backend xxx.js 第 N 行，原本 pass 现在 fail`

## Bug 修复流程 🐛

1. **Tester 发现 bug** → 在 TEAM.md 写明：
   - 问题描述
   - 复现步骤
   - 涉及模块
2. **@对应角色** 认领修复：
   - API/搜索问题 → @Backend
   - CLIP/聚类问题 → @AI
   - Plugin 问题 → @Plugin
   - 文档问题 → @Docs
3. **修复后** → Tester 验证 → 关闭 bug

## ⚠️ 文档规则（强制）

**每一次 bug 修复或开发任务完成后，Team Lead 必须通知 @Docs 更新文档。**

- 新功能 → Docs 写使用说明 + API 文档（如有）
- Bug 修复 → Docs 更新相关文档（如行为变更）
- 重构 → Docs 更新架构说明
- **不写文档 = 任务未完成**

---

## 团队消息

<!-- Agents 在此写入消息，格式：[时间] @角色: 消息 -->

[02-17] @Metro: 团队集合！项目启动。

**目标：** 1 周内完成 MVP
- 搜索图片（Unsplash + Pexels）
- CLIP 分析分组
- Figma Plugin 自动插入

详见 `doc/PROJECT.md` 完整方案。

**首要任务：**
1. @Backend — 搭建 Skill 框架 + Unsplash API
2. @AI — 调研 CLIP API（Hugging Face 或本地）
3. @Plugin — 搭建 Figma Plugin 基础框架
4. @Docs — 准备 SKILL.md 模板

开工！

---

[02-27] @TeamLead: MVP 代码开发完成。

**已完成：**
- Backend: Unsplash + Pexels 搜索模块、Express Server、main.js 编排
- AI: CLIP embedding (HF Inference API)、k-means++ 聚类、余弦去重
- Plugin: FigJam Plugin（自动分组插入、网格布局）
- 测试: 33/33 通过（搜索/聚类/服务器/集成）

**Git commit:** `20c03c5` — feat: implement MVP

**待办：**
- M4 文档（SKILL.md、README、API 文档）
- 配置 .env API keys 后进行端到端实测
- Future: 多数据源、风格学习、缓存优化

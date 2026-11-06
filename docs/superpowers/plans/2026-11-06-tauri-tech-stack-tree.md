# Tauri 技术栈树网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户提供的技术栈制作成浅色、响应式网页，并在每日版本巡检发现更新时提醒访客。

**Architecture:** 根目录包含单页 HTML/CSS 和无依赖浏览器脚本。Node.js 内置 fetch 每日读取 Rust 官方稳定发布、crates.io 与 npm 当前稳定版本，输出 JSON 供网页对比已标版本。GitHub Actions 在推送和每日巡检时发布 Pages artifact。

**Tech Stack:** HTML5、CSS、原生 JavaScript、Node.js built-in fetch、GitHub Actions、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-11-06-tech-stack-tree-design.md`

## Global Constraints

- 保留用户原文标注的 Tauri 2.12.3、Rust 1.99.0、Vue 3.5.43 及其余名称、职责和层级。
- 未标版本的具体软件包展示当前稳定版本，并说明版本来源与检查日期。
- 对操作系统 API、传输协议、未选型组件库等非具体发布包，不编造版本号。
- 页面使用浅色文档风格；宽屏并排展示分支，窄屏纵向排列。
- 页面资源使用相对路径，兼容 `https://phoenixlucky.github.io/tech-stack-tree/`。
- 不加构建步骤、运行时依赖、邮件或站外消息推送。

## Review Focus

- 子路径资源：HTML/CSS/JS/JSON 均以相对路径加载。
- 内容完整性：原始技术条目和职责没有遗漏或错置。
- 可访问性：说明在 hover 与键盘 focus 时均可见，更新提示通过 `aria-live` 宣读。
- 版本比较：只对可识别的稳定 SemVer 作数值比较，版本源错误时不发布旧快照。
- 版本数据源：Rust 使用官方稳定频道；Rust 库用 crates.io `max_stable_version`；JS 包用 npm `latest` dist-tag。

---

### Task 1: 实现技术栈页面与说明交互

**Files:**
- Create: `index.html` — 语义结构、技术内容、版本标记和工具提示。
- Create: `styles.css` — 浅色视觉、树形层级、hover/focus 提示和响应式布局。
- Create: `version-alerts.js` — 显示每日版本检查结果与更新提示。

**Interfaces:**
- `index.html` 相对引用 `styles.css`、`version-alerts.js`、`latest-versions.json`。
- 每个可跟踪版本节点含 `data-package` 与 `data-version`，JSON 的 `versions` 以对应键返回最新稳定版。

- [ ] **Step 1:** 在所有技术名称与 API 分类上加中文职责说明；对具体包显示版本标签；未选型/非包条目标注版本随系统或选型决定。
- [ ] **Step 2:** 添加可键盘聚焦的说明卡，hover/focus 时展示条目的具体用途、当前版本和可用的最新版本。
- [ ] **Step 3:** 创建 `version-alerts.js`，读取 JSON、比较版本、逐项显示更新，并在页面顶部通过 `aria-live="polite"` 提示更新数量和检查时间。
- [ ] **Step 4:** 核对全部原文条目、版本标记、相对资源路径、提示可访问性和 320px/桌面布局规则。

### Task 2: 每日巡检与 GitHub Pages 发布

**Files:**
- Create: `scripts/fetch-latest-versions.mjs` — 从官方稳定版本源读取版本并生成 JSON。
- Create: `.github/workflows/pages.yml` — `main` 推送和每日巡检后发布。
- Generate: `latest-versions.json` — 每次 workflow 运行生成，不提交旧数据快照。

**Interfaces:**
- `fetch-latest-versions.mjs` 输出 `{ checkedAt, versions }`。
- Workflow 执行版本查询后上传根目录静态文件与 JSON，不安装依赖或执行构建。
- 版本查询失败则 job 失败，已发布的 Pages 版本保持不变。

- [ ] **Step 1:** 查询 Tauri/Tokio/serde/tracing/thiserror/anyhow、Rust stable、MCP server/client、Zod/Standard Schema、Vue/TypeScript/Vite/Pinia/Vue Router/Tailwind CSS。
- [ ] **Step 2:** 配置 `push`、每日 schedule 和手动触发；确保 job 有 `contents: read`、`pages: write`、`id-token: write` 权限并限制部署到 `main`。
- [ ] **Step 3:** 核对脚本生成的 JSON、数据源、workflow 权限、分支和子路径部署设置。
- [ ] **Step 4:** 推送更新并确认 GitHub Actions 部署成功，检查 HTML、CSS、JS 与版本 JSON 均可从 Pages URL 读取。


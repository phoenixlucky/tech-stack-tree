# Tauri 技术栈树网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户给出的完整技术栈树制作为浅色、响应式中文静态网页，并部署到 GitHub Pages 项目站点。

**Architecture:** 仓库根目录提供单页 `index.html`，页面样式放在 `styles.css`，不使用运行时依赖、JavaScript 或构建步骤。GitHub Actions 使用官方 Pages artifact 部署流程；站点发布到 `phoenixlucky/tech-stack-tree`。

**Tech Stack:** HTML5、CSS、GitHub Actions、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-11-06-tech-stack-tree-design.md`

## Global Constraints

- 保留 Tauri 2.12.3 Stable、Rust 1.99.0 stable、Vue 3.5.43 stable 和用户提供的所有原始名称与职责。
- 使用浅色文档风格：米白或柔和浅灰底色、深色正文、低饱和蓝绿强调色。
- 宽屏并排展示主要分支，窄屏纵向排列，避免横向溢出。
- 使用无构建步骤的静态 HTML 与 CSS，不增加依赖。
- Pages 站点地址为 `https://phoenixlucky.github.io/tech-stack-tree/`，资源路径必须支持仓库子路径。
- 不添加搜索、筛选、折叠树、深色模式、复杂动画、后端服务或额外技术栈推荐。

## Review Focus

- Pages 子路径：CSS 等静态资源使用相对路径，避免以 `/` 开头的站点根路径引用。
- 内容完整性：所有给定技术名称、版本、职责和可选标记均出现在页面且归属正确。
- 窄屏阅读：主要分支在手机宽度下纵向排列且无固定宽度溢出。
- 可访问性：标题层级语义正确，正文对比清晰，链接与键盘焦点可见。
- 发布权限：GitHub Actions 获得 Pages 部署所需权限并绑定 `main` 分支。

---

### Task 1: 制作单页技术栈网页

**Files:**
- Create: `index.html` — 页面语义结构与完整技术栈内容。
- Create: `styles.css` — 色彩、树形层级、卡片排版和响应式规则。

**Interfaces:**
- `index.html` 通过相对路径加载 `styles.css`。
- 页面内容按照设计规格中的 Tauri 根节点、Rust 分支、TypeScript MCP Adapter 分支、Vue 分支组织。

- [ ] **Step 1: 创建 `index.html`**，包含中文页面标题、描述元信息、Tauri 根节点，以及规格列出的全部版本、分支、组件与职责；使用 `main`、`header`、`section`、标题和列表等语义元素。
- [ ] **Step 2: 创建 `styles.css`**，实现浅色配色、清晰的层级连接与卡片分组；宽屏下并排展示主要分支，窄屏下改为单列；样式文件使用相对路径加载。
- [ ] **Step 3: 检查页面文件**，逐项对照设计规格核实技术栈内容、版本、层级和职责，并检查窄屏规则、可访问性和子路径资源引用。

### Task 2: 配置并发布 GitHub Pages

**Files:**
- Create: `.github/workflows/pages.yml` — `main` 分支提交时构建 Pages artifact 并部署。

**Interfaces:**
- Workflow 发布仓库根目录静态文件，不执行依赖安装或前端构建。
- 仓库：`phoenixlucky/tech-stack-tree`；站点：`https://phoenixlucky.github.io/tech-stack-tree/`。

- [ ] **Step 1: 创建 Pages workflow**，设置 `pages: write` 与 `id-token: write` 权限，配置官方 Pages artifact 上传与部署 action，并将部署限制在 `main` 分支。
- [ ] **Step 2: 检查本地发布配置**，核对 YAML 结构、权限、分支条件、artifact 路径与 workflow 文件位置。
- [ ] **Step 3: 创建远程 GitHub 仓库并推送 `main`**，将仓库设为公开以提供公开 Pages 站点，并按 GitHub Pages 的 Actions 来源启用部署。
- [ ] **Step 4: 等待 GitHub Actions 部署完成**，检查运行结果并访问项目站点 URL，确认页面已公开可读。


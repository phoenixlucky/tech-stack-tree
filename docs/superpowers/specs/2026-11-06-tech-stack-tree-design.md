# 技术栈树网页设计规格

日期：2026-11-06
目标仓库：`phoenixlucky/tech-stack-tree`

## 目标

把用户提供的 Tauri 桌面应用技术栈整理为一张简洁、易读、适配手机的中文单页，并部署到 GitHub Pages 项目站点。页面准确保留用户列出的技术名称、版本与分支关系。

## 受众与使用场景

面向需要快速理解或展示该项目技术选型的开发者。页面首先帮助访客看清整体结构，再可顺着各层级读取组件职责。

## 视觉与信息结构

采用浅色文档风格：米白或柔和浅灰底色、深色正文、低饱和蓝绿强调色、清晰的边框和留白。页面标题区展示“Tauri 技术栈”与 Tauri 2.12.3 Stable。主体按技术栈的真实关系分层呈现：

1. Tauri 作为桌面应用根节点。
2. Rust 1.99.0 stable 分支包含 Domain / Service Layer、System APIs、Async / Background Work、Infrastructure、IPC Bridge。
3. 独立 TypeScript MCP Adapter 分支包含 Official MCP TypeScript SDK v2.x 的 Server / Client、Zod / Standard Schema、stdio / Streamable HTTP Transport、IPC Client。
4. Vue 3.5.43 stable 分支包含 TypeScript、Vite、Pinia，以及按需采用的 Vue Router、Tailwind CSS 与 UI 组件库说明。

通过卡片层级、分组标签和连接关系体现结构，保持原始组件名与职责内容。宽屏下并排展示主要分支，窄屏下改为纵向阅读。每个技术项可鼠标悬停或键盘聚焦查看简短介绍；明确版本的条目展示版本号，未在原始清单标注版本的包补充为官方源当前最新稳定版，并标出检查日期。操作系统能力、传输协议和未选型的组件库等非具体发布包需说明“版本随系统/选型确定”，不伪造包版本。

## 实现与发布

使用静态 HTML、CSS 与少量原生 JavaScript，不增加运行时或构建依赖。网页作为仓库根路径入口，页面资源采用相对路径，使其能运行于 `https://phoenixlucky.github.io/tech-stack-tree/` 子路径。GitHub Actions 每日从 Rust 官方发布源、crates.io 与 npm 获取最新稳定版本，与页面标注版本比较，在页面显示更新提醒；同一 workflow 通过官方 Pages artifact 部署 `main` 分支上的站点。若版本源读取失败则部署失败并保留上一版站点。

## 验收标准

- 页面包含用户提交的全部技术栈条目、版本和职责，层级关系无误。
- 桌面和手机视口均可读，不出现横向溢出。
- 不需要安装运行时依赖或构建工具即可本地预览。
- GitHub Pages workflow 能将仓库静态文件部署到项目子路径。
- 页面使用语义化 HTML，并保证文字与背景有足够对比度、链接和焦点可见。`title`/说明卡同时支持鼠标悬停和键盘焦点。
- 每日版本巡检写入 JSON 状态，网页显示检查时间、版本更新数量及逐项当前/最新版本。

## 不在范围内

不添加搜索、筛选、折叠树、深色模式、复杂动画、后端服务、邮件或消息推送。


---
title: "Hello, World：让技术笔记有一个自己的家"
description: "从一个 GitHub 仓库开始，用 Astro 和 AstroPaper 搭建个人主页与技术博客，建立简单、可持续的写作流程。"
pubDatetime: 2026-11-11T08:00:00Z
tags:
  - Astro
  - 博客搭建
  - GitHub Pages
draft: false
---

一个个人站点，可以很简单：有一页介绍自己，有一个地方写下思考，再让这些内容通过一个固定的网址被找到。

这是这个小站的第一篇文章，记录它的技术选择，以及今后如何维护和写作。

## 为什么选择 Astro

本站的需求是「个人主页 + 技术博客」。文章适合使用 Markdown 管理，而主页需要保留独立设计的空间。

[Astro](https://astro.build/) 可以把页面和文章构建成静态文件。配合 [GitHub Pages](https://docs.github.com/en/pages)，不需要单独维护应用服务器和数据库，就能完成这个站点的发布。

主题采用 [AstroPaper](https://github.com/satnaing/astro-paper)。它提供了博客常用的标签、归档、RSS、搜索、代码高亮和明暗主题，可以在这些基础上逐步调整。

## 从文字到网页

站点里的文章保存在 `src/content/posts/`。每篇 Markdown 文件的开头是一段元信息：

```yaml
---
title: "我的第一篇技术笔记"
description: "用一两句话说明这篇文章解决的问题。"
pubDatetime: 2026-11-11T08:00:00Z
tags:
  - 开发笔记
draft: false
---
```

`title` 是标题，`description` 会显示在文章列表中，`tags` 用来归类文章。正文可以直接使用 Markdown 的标题、链接、列表、引用和代码块。

时间建议填写带时区的 ISO 格式。站点按上海时区显示日期，`2026-11-11T08:00:00Z` 对应北京时间 16:00。

## 本地预览与发布

在安装 Node.js 和 pnpm 后，可以在项目目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

开发服务器适合边写边看。发布前，再构建一次完整站点：

```sh
pnpm build
pnpm verify
pnpm preview
```

搜索索引在构建时生成，因此检查搜索功能时要先执行 `pnpm build`。文章更新推送到 `main` 分支后，由 GitHub Actions 构建并部署。

## 先写草稿，再发布

尚未完成的文章可以设置 `draft: true`，它不会生成公开文章页面，也不会进入 RSS 和搜索索引。需要查看渲染效果时，可以在本地暂时改成 `false`，预览后再恢复。

未来日期的文章会在生产构建时按上海时区的日期过滤；到了发布日期，还需要一次新的构建才会出现在网站上。静态站点不会在没有部署的情况下自行更新。

需要注意：**公开仓库中的草稿源文件仍然公开可见**。不想公开的文字应保存在仓库之外。

## 从这一篇开始

先把一个具体问题写清楚：问题是什么，试过什么，为什么选了现在的方案，又有哪些尚未验证的地方。

不必一次写完所有内容。让每一篇文章留下一个可以再次找到的答案，就已经值得。

欢迎通过 [RSS](/rss.xml) 订阅后续更新，或到 [GitHub](https://github.com/HeliumBoom) 找到我。

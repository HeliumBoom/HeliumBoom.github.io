# HeliumBoom 的个人主页与技术博客

在线访问：<https://heliumboom.github.io/>

使用 Astro + Svelte，基于 [Pudding](https://github.com/huamurui/pudding) 主题。包含中文界面、时间线、标签、全文搜索、明暗主题、目录、代码高亮、数学公式、RSS 和站点地图。

## 本地运行

使用 Node.js 24 与 pnpm 11.25.0（与 GitHub Actions 一致）：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

发布前检查：

```sh
pnpm test
pnpm check
pnpm build
pnpm verify
pnpm preview
```

`pnpm dev/check/build` 会先生成反向链接缓存。`.cache/` 和 `dist/` 是生成文件，不提交到仓库。

## 写文章

在 `src/posts/` 新建 Markdown 文件，例如 `src/posts/my-note.md`：

```yaml
---
title: "我的技术笔记"
description: "用一两句话说明文章解决的问题。"
date: "2026-11-11T08:00:00Z"
tags: [开发笔记]
draft: false
pinned: false
---
```

下面直接写正文。默认路径是 `/posts/my-note/`，也可用 `slug` 自定义路径。标题和 `date` 必填；可用 `updated` 记录修改时间。当前主题使用 `.md`，没有配置 MDX。

首页默认摘取第一段正文，也可以用 `<!-- more -->` 指定摘要结束位置。`description` 用于搜索摘要及页面描述。全文搜索索引在构建时生成。

`draft: true` 不会出现在公开页面、搜索、订阅、目录或反向链接中。未来日期文章按上海时区的日期过滤，到了日期后仍需重新构建才能上线。**公开仓库中的草稿源文件依然可见**，私人内容应保存在仓库之外。

## 修改个人信息

- `src/config/site.config.ts`：名称、介绍、站点地址、导航、GitHub、强调色、语言、可选 giscus。
- `src/pages/about.astro`：关于页内容。
- `public/favicon.svg`、`public/og.png`：站点图标和分享图片。
- `src/styles/`：主题样式。

评论默认关闭。启用 giscus 时需填写自己仓库的实际参数；没有启用统计或广告脚本。字体随站点提供，无需连接 Google Fonts。

## GitHub Pages

仓库 Settings → Pages 的 Source 使用 **GitHub Actions**。推送到 `main` 后自动安装依赖、运行测试与类型检查、构建并部署；Pull Request 仅构建验证。

用户主页部署在根路径，`site` 为 `https://heliumboom.github.io`，`base` 为空，`url` 为 `https://heliumboom.github.io/`。发布配置在 `.github/workflows/deploy.yml`。

## 主题来源

- 当前主题：[Pudding](https://astro.build/themes/details/pudding/)，固定于 [`1e8da72`](https://github.com/huamurui/pudding/commit/1e8da7288b99aa2ccd908b8b9e3b7a71f64cb9d5)，MIT 许可，见 `LICENSE`。
- 2026-11-11 从 AstroPaper 迁移，保留文章 `/posts/hello-world/`、个人介绍和原有发布流程。
- `/posts/` 跳转首页，`/archives/` 跳转时间线；保留标签索引、搜索入口及旧标签路径。
- 旧主题许可在 `docs/LICENSE-AstroPaper`，历史设计和验证记录在 `docs/`。
- 字体附带各自的许可文件。

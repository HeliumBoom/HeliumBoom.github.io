# HeliumBoom 的个人主页与技术博客

在线访问：<https://heliumboom.github.io/>

基于 [Kanade](https://astro.build/themes/details/kanade/)（Astro + Vue + Tailwind CSS）。采用插画首屏、波浪与三栏卡片布局，保留中文全文搜索、RSS、旧文章网址，以及旧主题的圆形明暗切换动画。

## 本地开发与验证

使用 Node.js 24 和 pnpm 11.25.0，与 GitHub Actions 保持一致：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

发布前执行：

```sh
pnpm test
pnpm check
pnpm build
pnpm verify
pnpm preview
```

`pnpm test` 检查日期过滤与实际主题脚本的动画生命周期；`pnpm check` 检查 Astro/Vue 类型；`pnpm verify` 检查构建结果、站内链接、旧路径跳转、RSS、站点地图和全文搜索索引。浏览器检查还应覆盖桌面/手机、搜索、主题切换和导航。

## 写文章

在 `src/content/posts/` 新建 Markdown 文件，例如 `my-note.md`：

```yaml
---
title: "我的技术笔记"
description: "用一两句话说明文章解决的问题。"
date: "2026-11-11T08:00:00Z"
category: "开发笔记"
tags: [Astro, 博客]
cover: notes
featured: false
draft: false
---
```

文章默认网址为 `/posts/my-note/`。标题、描述、日期、分类、标签和封面样式必填；默认分类为 `前端开发`、`开发笔记`、`生活随笔`。封面可选 `astro`、`vue`、`css`、`notes`、`life`、`typescript`、`git`、`design`。

`draft: true` 或未来日期的文章不会进入公开页面、列表、搜索、RSS 和站点地图。日期按上海时区显示与过滤，到了发布日期仍需重新构建。**公开仓库中的草稿源文件依然可见**，私人内容应保存在仓库之外。

首页和文章页支持分类、标签、月份归档；搜索弹窗支持正文，快捷键为 `Ctrl/⌘ K`。全文索引在打开搜索时加载，离线时仍可搜索标题、摘要和标签。

## 个性化配置

- `src/config.ts`：站点名称、介绍、GitHub、导航、欢迎语和头像。
- `src/pages/about.astro`：关于页。
- `src/data/friends.ts`：友链与开源项目链接。
- `src/scripts/theme.ts`：500ms 圆形主题动画、偏好保存与动画清理。
- `src/styles/global.css`：Kanade 样式与圆形过渡的快照层级。
- `public/images/`：首屏插画、头像；`public/favicon.svg`、`public/og.png` 为站点图标和分享图片。

亮色显示月亮，暗色显示太阳，图标表示点击后的目标模式。浏览器不支持 View Transition 或用户选择减少动态效果时立即切换。连续点击、系统主题和其他标签页的偏好变化也会清理上一轮动画。

主题附带的留言墙是**浏览器本地便签墙**，不会发给站长或跨设备同步。页面已说明这一点；联系我请使用 GitHub。

## 发布与来源

仓库 Settings → Pages 使用 **GitHub Actions**。推送到 `main` 后运行测试、类型检查、构建和产物验证，成功后发布；Pull Request 仅构建验证。

默认地址为 `https://heliumboom.github.io/`，部署在根路径。若以后更换域名，可设置 `SITE_URL`；不要给当前用户主页添加仓库名路径。

Kanade 模板固定于 [`d5ea456`](https://github.com/sudoriaa/Kanade-Astro/commit/d5ea45630603305e48682943ee7e8a0569400386)。素材与许可来源见 [第三方来源记录](docs/third-party-sources.md)。`/posts/hello-world/` 保持不变；旧 `/timeline/`、`/archives/` 和标签网址兼容新归档，`/search/?q=...` 可恢复关键词。

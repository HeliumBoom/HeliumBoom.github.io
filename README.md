# HeliumBoom · 个人主页与技术博客

中文、简洁阅读风格的个人站点，基于 **Astro + AstroPaper**，部署到 [heliumboom.github.io](https://heliumboom.github.io/)。

包含个人首页、文章、标签、归档、全文搜索、关于页面、RSS、代码高亮、文章目录与明暗主题。

## 为什么选这个基础

对比了 Astro、Hugo、Hexo 和 Jekyll。本站既需要可以单独设计的个人主页，也需要方便维护的 Markdown 博客，所以采用 Astro，并复用 AstroPaper 已有的博客能力。具体权衡及官方来源见 [框架选择与设计](docs/superpowers/specs/2026-11-11-personal-blog-design.md)。

上游：[satnaing/astro-paper](https://github.com/satnaing/astro-paper)，版本 7.1.0，快照 `6f61e2dc0e45bbcefc05f4055f293cd7f81bcb03`。保留 [MIT 许可证](LICENSE)。本仓库替换了示例文章和作者资料，增加中文界面、本站主页和 Pages 部署。

## 本地开发

使用 Node.js 24 LTS 和 pnpm 11.25.0。尚未安装 pnpm 时执行 `npm install -g pnpm@11.25.0`。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址，默认是 `http://localhost:4321`。

发布前验证：

```sh
pnpm build
pnpm verify
pnpm preview
```

`build` 包含 Astro 类型检查、静态构建和 Pagefind 索引生成；`verify` 检查主要页面、站内链接与资源、中文索引、RSS、sitemap 和站点身份。`preview` 用于检查真实构建产物。只需类型检查时运行 `pnpm check`。

**搜索需要先构建。** `pnpm dev` 使用最近一次构建的索引，修改文章后需重新 `pnpm build` 才能看到最新搜索结果。

## 写文章

在 `src/content/posts/` 新建 Markdown 文件，例如 `my-first-note.md`：

```md
---
title: "我的第一篇技术笔记"
description: "这篇文章讨论的问题和结论。"
pubDatetime: 2026-11-11T08:00:00Z
tags:
  - 开发笔记
draft: false
---

从这里开始写正文。

## 一个具体的问题

描述问题、复现步骤、方案和验证结果。
```

- 文件名决定文章地址，例如 `/posts/my-first-note/`；支持 `.md` 和 `.mdx`。
- 日期使用带时区的 ISO 格式，界面统一按 `Asia/Shanghai` 显示；`08:00:00Z` 是北京时间 16:00。
- 更新文章时可增加 `modDatetime`。
- `draft: true` 的文章始终不生成网页，也不出现在搜索、RSS 或列表中。需要本地预览草稿时临时设为 `false`，提交前恢复。
- 生产构建按上海日期过滤未来文章，日期到达后需要重新构建/部署；没有定时自动发布任务。
- 公开 GitHub 仓库中的草稿源文件仍然公开可见；私人草稿不要提交到此仓库。
- 文章图片可放到 `public/images/`，在正文用 `![描述](/images/example.png)` 引用。

## 修改个人资料与外观

| 位置                         | 用途                                              |
| ---------------------------- | ------------------------------------------------- |
| `astro-paper.config.ts`      | 站点名称、描述、GitHub 链接、语言、时区与功能配置 |
| `src/pages/index.astro`      | 个人首页                                          |
| `src/content/pages/about.md` | 关于页面                                          |
| `src/content/posts/`         | 博客文章                                          |
| `src/i18n/lang/zh-CN.ts`     | 中文界面文案                                      |
| `src/styles/theme.css`       | 明暗配色与字体                                    |
| `public/favicon.svg`         | 浏览器标签图标                                    |
| `public/og.png`              | 社交分享图                                        |

本站使用系统字体，不在构建或访问时下载 Google Fonts。分享图是提交到仓库的静态 PNG；修改 `scripts/generate-og.mjs` 后运行 `node scripts/generate-og.mjs` 可重新生成。本定制版没有导入依赖远程字体的动态 OG 页面，保持 `dynamicOgImage: false`。

## GitHub Pages 发布

1. 将代码推送到 `HeliumBoom/HeliumBoom.github.io` 的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 查看 **Actions → Build and deploy blog**，等待 build 和 deploy 成功。
4. 访问 [https://heliumboom.github.io/](https://heliumboom.github.io/)。

工作流使用官方 Astro Action 和 Pages Action，固定其 commit SHA。每次推送 main 自动部署；PR 只构建验证，不发布。使用内置 `GITHUB_TOKEN`，无需配置个人访问令牌。

这是用户主页仓库，站点发布在域名根目录，**不添加 `/HeliumBoom.github.io/` 作为 base 路径**。

如果首次部署提示找不到 Pages 站点，先完成第 2 步，再在 Actions 中重新运行工作流。未来文章到了日期还未显示时，也可通过 Actions 的 **Run workflow** 重新构建。

## 目录

```text
.github/workflows/deploy.yml  自动构建与部署
src/content/                 Markdown 内容
src/pages/                   页面和 RSS 等入口
src/components/              复用组件
src/styles/                  样式
public/                      直接复制到网站的静态资源
scripts/                     构建产物检查、分享图生成
docs/                        选择理由与实施记录
```

`dist/`、`node_modules/`、`.astro/`、`public/pagefind/` 和本地验证产物已忽略。新机器安装使用已提交的 `pnpm-lock.yaml`，不要提交构建目录。

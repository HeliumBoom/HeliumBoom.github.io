import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://heliumboom.github.io/",
    title: "HeliumBoom",
    description:
      "HeliumBoom 的个人主页与技术博客，记录技术探索、开发实践与思考。",
    author: "HeliumBoom",
    profile: "https://github.com/HeliumBoom",
    ogImage: "og.png",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 5,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
    toc: true,
  },
  socials: [{ name: "github", url: "https://github.com/HeliumBoom" }],
  shareLinks: [],
});

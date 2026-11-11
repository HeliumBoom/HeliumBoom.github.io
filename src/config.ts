import { withBase } from "./lib/urls";
export const siteInfo = {
  title: "HeliumBoom",
  description: "HeliumBoom 的个人主页与技术博客，记录技术探索、开发实践与思考。",
  keywords: ["Astro", "Kanade", "博客", "HeliumBoom", "前端开发"],
  // 发布到域名时设置 SITE_URL，例如 https://example.com。
  url: import.meta.env.SITE_URL || "https://heliumboom.github.io/",
};

export const headerConfig = {
  title: "HeliumBoom",
  navLinks: [
    { name: "首页", icon: "icon-[bx--bxs-home-circle]", url: withBase("/") },
    { name: "文章", icon: "icon-[material-symbols--article]", url: withBase("/posts/") },
    { name: "留言", icon: "icon-[basil--comment-solid]", url: withBase("/messages/") },
    { name: "友链", icon: "icon-[mingcute--link-3-line]", url: withBase("/friends/") },
    { name: "关于", icon: "icon-[mynaui--indifferent-ghost-solid]", url: withBase("/about/") },
  ],
};

export const welcomeConfig = {
  title: "欢迎来到 HeliumBoom",
  subTitle: "让每一篇文章留下一个可以再次找到的答案。",
  bgImage: withBase("/images/hero.webp"),
};

export const personalInfo = {
  name: "HeliumBoom",
  englishName: "HeliumBoom",
  avatar: withBase("/images/avatar.svg"),
  role: "技术笔记与开发实践",
  bio: "记录技术探索、开发实践与思考。",
  github: "https://github.com/HeliumBoom",
  socialLinks: [
    { name: "GitHub", icon: "icon-[jam--github]", url: "https://github.com/HeliumBoom" },
    { name: "RSS 订阅", icon: "icon-[lucide--rss]", url: withBase("/rss.xml") },
    { name: "留言板", icon: "icon-[lucide--mail]", url: withBase("/messages/") },
  ],
};
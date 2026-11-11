

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  base: string;
  site: string;
  keywords: Array<string>;
  author: {
    name: string;
    email?: string;
    github?: string;
    avatar?: string;
  };
  navItems: Array<{
    href: string;
    labelKey: string;
    label:string;
  }>;
  socialLinks: Array<{
    nameKey: string;
    href: string;
    icon?: string;
  }>;
  theme: {
    light: {
      primary: string;
      secondary?: string;
    };
    dark: {
      primary: string;
      secondary?: string;
    };
  };
  locale: string;
  giscus?: {
    enabled: boolean;
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    strict: string;
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: string;
    lang: string;
    loading: 'lazy' | 'eager';
  };
}

export const siteConfig: SiteConfig = {
  name: "HeliumBoom",
  description: "记录技术探索、开发实践与思考。",
  url: "https://heliumboom.github.io/",
  site: "https://heliumboom.github.io",
  base: "",
  keywords: ["HeliumBoom", "技术博客", "开发笔记", "Astro"],
  author: {
    name: "HeliumBoom",
    github: "https://github.com/HeliumBoom",
  },
  navItems: [
    { href: "./", labelKey: "home", label:"home" },
    { href: "./timeline/", labelKey: "timeline", label:"timeline"  },
    { href: "./about/", labelKey: "about", label:"about"  },
  ],
  socialLinks: [
    { nameKey: "social.github", href: "https://github.com/HeliumBoom" },
    { nameKey: "social.rss", href: "./rss.xml" },
    { nameKey: "social.sitemap", href: "./sitemap.xml" },
  ],
  theme: {
    light: {
      primary: "#5e7eff",
    },
    dark: {
      primary: "#ff9eb6",
    },
  },
  locale: "zh-CN",
};

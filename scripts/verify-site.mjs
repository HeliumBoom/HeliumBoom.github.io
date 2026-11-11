import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const origin = "https://heliumboom.github.io";
const required = [
  "index.html",
  "about/index.html",
  "posts/index.html",
  "posts/hello-world/index.html",
  "tags/index.html",
  "archives/index.html",
  "search/index.html",
  "404.html",
  "rss.xml",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "robots.txt",
  "favicon.svg",
  "og.png",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
];
for (const file of required)
  assert.ok(existsSync(path.join(root, file)), `Missing build output: ${file}`);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(dir, entry.name);
    return entry.isDirectory()
      ? htmlFiles(filename)
      : entry.name.endsWith(".html")
        ? [filename]
        : [];
  });
}
const pages = htmlFiles(root);
let checkedLinks = 0;
for (const filename of pages) {
  const html = readFileSync(filename, "utf8");
  const relative = path.relative(root, filename).split(path.sep).join("/");
  const pageUrl = new URL(relative.replace(/index\.html$/, ""), `${origin}/`);
  assert.match(html, /lang="zh-CN"/i, `${relative}: incorrect language`);
  assert.match(
    html,
    /<title>[^<]*HeliumBoom[^<]*<\/title>/,
    `${relative}: missing site identity`
  );
  assert.doesNotMatch(
    html,
    /satna\.ing|yourmail@gmail\.com|x\.com\/username|Mingalaba/,
    `${relative}: template identity remains`
  );
  assert.doesNotMatch(
    html,
    /fonts\.(googleapis|gstatic)\.com/,
    `${relative}: external font dependency`
  );
  const canonical = html.match(
    /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/
  );
  assert.ok(canonical, `${relative}: missing canonical URL`);
  assert.equal(
    new URL(canonical[1]).origin,
    origin,
    `${relative}: wrong canonical origin`
  );

  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(raw.replaceAll("&amp;", "&"), pageUrl);
    if (url.origin !== origin) continue;
    assert.ok(
      !url.pathname.toLowerCase().startsWith("/heliumboom.github.io/"),
      `${relative}: incorrect project base`
    );
    const target = path.join(root, decodeURIComponent(url.pathname));
    const candidates = [
      target,
      path.join(target, "index.html"),
      `${target}.html`,
    ];
    assert.ok(
      candidates.some(
        candidate => existsSync(candidate) && statSync(candidate).isFile()
      ),
      `${relative}: broken local resource ${raw}`
    );
    checkedLinks++;
  }
}

const feed = readFileSync(path.join(root, "rss.xml"), "utf8");
const sitemap = readFileSync(path.join(root, "sitemap-0.xml"), "utf8");
assert.match(feed, /heliumboom\.github\.io\/posts\/hello-world/);
assert.match(sitemap, /heliumboom\.github\.io\/posts\/hello-world/);
const index = JSON.parse(
  readFileSync(path.join(root, "pagefind/pagefind-entry.json"), "utf8")
);
assert.ok(
  Object.keys(index.languages).some(lang =>
    lang.toLowerCase().startsWith("zh")
  ),
  "Missing Chinese search index"
);
assert.ok(
  statSync(path.join(root, "og.png")).size > 1000,
  "Share image is empty"
);
console.log(
  `Verified ${pages.length} HTML pages, ${checkedLinks} local links/resources, RSS, sitemap and Chinese search index.`
);

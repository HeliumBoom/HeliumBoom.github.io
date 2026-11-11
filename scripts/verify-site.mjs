import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve('dist')
const origin = 'https://heliumboom.github.io'
const required = ['index.html', 'about/index.html', 'posts/index.html',
  'posts/hello-world/index.html', 'timeline/index.html', 'tags/index.html',
  'archives/index.html', 'search/index.html', '404.html', 'rss.xml',
  'sitemap.xml', 'robots.txt', 'favicon.svg', 'og.png', 'search-index.json',
  'tags/astro/index.html', 'tags/github-pages/index.html']
for (const file of required) assert.ok(existsSync(path.join(root, file)), `Missing output: ${file}`)

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })
}
function checkLink(raw, pageUrl) {
  const url = new URL(raw.replaceAll('&amp;', '&'), pageUrl)
  if (url.origin !== origin) return
  assert.ok(!/^\/(pudding|HeliumBoom\.github\.io)\//i.test(url.pathname), `Incorrect project base: ${raw}`)
  const target = path.join(root, decodeURIComponent(url.pathname))
  assert.ok([target, path.join(target, 'index.html'), `${target}.html`]
    .some(file => existsSync(file) && statSync(file).isFile()), `Broken resource: ${raw} on ${pageUrl}`)
  checkedLinks++
}
const pages = files(root).filter(file => file.endsWith('.html'))
let checkedLinks = 0
let fullPages = 0
for (const filename of pages) {
  const html = readFileSync(filename, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  const relative = path.relative(root, filename).split(path.sep).join('/')
  const pageUrl = new URL(relative.replace(/index\.html$/, ''), `${origin}/`)
  const redirect = /http-equiv="refresh"/i.test(html)
  const fragment = relative.startsWith('api/post-content/')
  if (!redirect && !fragment) {
    fullPages++
    assert.match(html, /lang="zh-CN"/i, `${relative}: incorrect language`)
    assert.match(html, /<title>[^<]*HeliumBoom[^<]*<\/title>/, `${relative}: missing identity`)
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)
    assert.ok(canonical, `${relative}: missing canonical`)
    assert.equal(new URL(canonical[1]).origin, origin, `${relative}: incorrect canonical origin`)
    assert.match(html, /property="og:image" content="https:\/\/heliumboom.github.io\/og.png"/, `${relative}: missing share image`)
  }
  assert.doesNotMatch(html, /Your Name|Your Site Name|your@email\.com|github\.com\/your["/]|Site Description|AstroPaper/, `${relative}: template remains`)
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, `${relative}: remote font`)
  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) checkLink(raw, pageUrl)
}
const feed = readFileSync(path.join(root, 'rss.xml'), 'utf8')
const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8')
assert.match(feed, /heliumboom\.github\.io\/posts\/hello-world/)
assert.match(sitemap, /heliumboom\.github\.io\/posts\/hello-world/)
for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) checkLink(url, `${origin}/`)
const search = JSON.parse(readFileSync(path.join(root, 'search-index.json'), 'utf8'))
const firstPost = search.find(post => post.id === 'hello-world')
assert.ok(firstPost?.content.includes('技术笔记'), 'Chinese full-text search content missing')
assert.equal(firstPost.url, '/posts/hello-world/')
assert.ok(statSync(path.join(root, 'og.png')).size > 1000, 'Empty share image')
console.log(`Verified ${fullPages} pages, redirects/previews, ${checkedLinks} local links, RSS, sitemap and Chinese search index.`)

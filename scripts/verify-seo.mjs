// Prüft SEO-Tags pro Route und die Hash-URL-Weiterleitung.
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || 'http://localhost:4173'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()

let fail = 0
for (const path of ['/', '/leistungen', '/cafm', '/loesungen/sterilgutaufbereitung', '/impressum']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    lang: document.documentElement.lang,
    jsonld: !!document.querySelector('script[type="application/ld+json"]'),
  }))
  const ok =
    r.title.length > 0 &&
    r.desc.length > 50 &&
    r.canonical === `https://leantris.ch${path === '/' ? '/' : path}` &&
    r.ogTitle === r.title &&
    r.lang === 'de-CH' &&
    r.jsonld &&
    (path === '/impressum' ? r.robots.includes('noindex') : r.robots.includes('index'))
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${path}`)
  console.log(`     title=${r.title.slice(0, 70)}`)
  console.log(`     desc(${r.desc.length})  canonical=${r.canonical}  robots=${r.robots}`)
}

// Alte Hash-URL → echter Pfad
await page.goto(`${BASE}/#/cafm`, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(800)
const redirected = await page.evaluate(() => location.pathname + ' slug=' + document.body.dataset.slug)
const hashOk = redirected.startsWith('/cafm')
if (!hashOk) fail++
console.log(`${hashOk ? 'OK  ' : 'FAIL'} #/cafm → ${redirected}`)

await browser.close()
console.log(fail === 0 ? '\nSEO-CHECKS OK' : `\n${fail} FEHLER`)
process.exit(fail === 0 ? 0 : 1)

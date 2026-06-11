// Screenshottet alle Routen (Dev-Server oder Live-Site) Desktop + Mobile.
// Nutzung: node scripts/screenshot.mjs [base-url] [prefix] [hash|path]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:5173'
const PREFIX = process.argv[3] || 'app'
const MODE = process.argv[4] || 'hash' // hash → /#/route, path → /route/
const OUT = 'analysis/shots'
mkdirSync(OUT, { recursive: true })

const routes = [
  ['home', '/'],
  ['leistungen', '/leistungen'],
  ['cafm', '/cafm'],
  ['loesungen', '/loesungen'],
  ['referenzen', '/referenzen'],
  ['ueber-leantris', '/ueber-leantris'],
  ['kontakt', '/kontakt'],
  ['impressum', '/impressum'],
]

function url(path) {
  if (MODE === 'hash') return `${BASE}/#${path}`
  return path === '/' ? `${BASE}/` : `${BASE}${path}/`
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })

for (const [vpName, vp] of [
  ['desktop', { width: 1680, height: 1050 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport: vp })
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  for (const [name, path] of routes) {
    try {
      await page.goto(url(path), { waitUntil: 'networkidle', timeout: 45000 })
    } catch {
      await page.waitForTimeout(2000)
    }
    await page.waitForTimeout(name === 'home' ? 2200 : 900)
    // Durchscrollen, damit Scroll-Einblendungen auslösen
    await page.evaluate(async () => {
      const h = document.body.scrollHeight
      for (let y = 0; y < h; y += 700) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, 0)
      // .below per CSS neutralisieren – Klassen-Änderungen würden vom
      // IntersectionObserver nach dem Evaluate wieder überschrieben
      const s = document.createElement('style')
      s.textContent =
        '.below{opacity:1!important;transform:none!important}' +
        '.col,.col .text{transition:none!important}'
      document.head.appendChild(s)
    })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${PREFIX}-${name}-${vpName}.png`, fullPage: true })
    console.log(`${PREFIX}-${name}-${vpName}.png`)
  }
  if (errors.length) {
    console.log(`--- console errors (${vpName}) ---`)
    for (const e of [...new Set(errors)].slice(0, 12)) console.log(e)
  }
  await page.close()
}
await browser.close()

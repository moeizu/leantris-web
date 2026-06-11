import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await p.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(500)
await p.screenshot({ path: 'analysis/shots/intro-state2.png' })
const r = await p.evaluate(() => {
  const img = document.querySelector('#intro-region img.intro-landscape-media')
  const rect = img.getBoundingClientRect()
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), display: getComputedStyle(img).display }
})
console.log(JSON.stringify(r))
await b.close()
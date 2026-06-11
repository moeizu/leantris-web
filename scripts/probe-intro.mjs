import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await p.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(400)
await p.screenshot({ path: 'analysis/shots/intro-state.png' })
const r = await p.evaluate(() => {
  const img = document.querySelector('#intro-region img')
  if (!img) return 'kein intro img'
  const cs = getComputedStyle(img)
  const rect = img.getBoundingClientRect()
  const wrap = img.closest('.mediawrap')
  const wcs = wrap ? getComputedStyle(wrap) : null
  return {
    imgRect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
    imgPos: cs.position, objectFit: cs.objectFit,
    wrapRect: wrap ? (() => { const b2 = wrap.getBoundingClientRect(); return { w: Math.round(b2.width), h: Math.round(b2.height) } })() : null,
    wrapPos: wcs ? wcs.position : null,
    introRect: (() => { const i = document.querySelector('#intro-region .intro'); const b3 = i.getBoundingClientRect(); return { w: Math.round(b3.width), h: Math.round(b3.height) } })(),
  }
})
console.log(JSON.stringify(r, null, 2))
await b.close()
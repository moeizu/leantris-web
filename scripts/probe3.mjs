import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
for (const [label, url] of [
  ['APP', 'http://localhost:5173/#/'],
  ['REF', 'https://leantris.ch/staging/'],
]) {
  const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
  await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await p.waitForTimeout(2500)
  const r = await p.evaluate(() => {
    const col = document.querySelector('#footer .partner-logo')
    if (!col) return null
    const cs = getComputedStyle(col)
    const img = col.querySelector('img')
    const b1 = col.getBoundingClientRect()
    const row = col.closest('.row')
    return {
      colRect: { w: Math.round(b1.width), h: Math.round(b1.height), left: Math.round(b1.left) },
      pos: cs.position, left: cs.left, top: cs.top, width: cs.width, opacity: cs.opacity,
      imgSrc: img ? img.currentSrc || img.src : null,
      imgRect: img ? { w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height) } : null,
      rowH: Math.round(row.getBoundingClientRect().height),
      colClasses: col.className.slice(0, 160),
    }
  })
  console.log(`--- ${label} ---`)
  console.log(JSON.stringify(r, null, 2))
  await p.close()
}
await b.close()

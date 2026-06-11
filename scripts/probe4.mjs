import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
for (const [label, url] of [
  ['APP', 'http://localhost:5173/#/'],
  ['REF', 'https://leantris.ch/staging/'],
]) {
  const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
  await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await p.waitForTimeout(2000)
  // langsam bis ganz unten scrollen
  await p.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 80))
    }
    window.scrollTo(0, h)
  })
  await p.waitForTimeout(1000)
  const r = await p.evaluate(() => {
    const col = document.querySelector('#footer .partner-logo')
    const cs = getComputedStyle(col)
    return {
      opacity: cs.opacity,
      classes: col.className.replace(/\s+/g, ' '),
      scrollY: window.scrollY,
      rect: (() => { const b = col.getBoundingClientRect(); return { top: Math.round(b.top), left: Math.round(b.left) } })(),
    }
  })
  console.log(label, JSON.stringify(r))
  await p.screenshot({ path: `analysis/shots/probe4-${label}.png` })
  await p.close()
}
await b.close()

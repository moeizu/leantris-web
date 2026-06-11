import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: 1680, height: 600 } })
await p.goto('https://leantris.ch/staging/', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
await p.waitForTimeout(3500)
const r = await p.evaluate(() => {
  const lines = [...document.querySelectorAll('[class*=vertical-lines]')]
  return lines.map((l) => ({
    cls: l.className,
    left: Math.round(l.getBoundingClientRect().left),
    h: Math.round(l.getBoundingClientRect().height),
    display: getComputedStyle(l).display,
    opacity: getComputedStyle(l).opacity,
  }))
})
console.log(JSON.stringify(r, null, 1))
await b.close()
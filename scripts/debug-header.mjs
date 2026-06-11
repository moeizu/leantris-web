import { chromium } from 'playwright-core'
const url = process.argv[2] || 'http://localhost:5173/#/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
await page.waitForTimeout(2500)
const info = await page.evaluate(() => {
  const out = {}
  // Was liegt an der Nav-Position?
  const el = document.elementFromPoint(880, 40)
  out.atNavPoint = el ? el.tagName + '.' + el.className.toString().slice(0, 70) : null
  const navs = [...document.querySelectorAll('nav.laynav')].map((n) => ({
    cls: n.className.replace(/\s+/g, ' ').slice(0, 90),
    display: getComputedStyle(n).display,
    pos: (() => { const b = n.getBoundingClientRect(); return `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)}` })(),
  }))
  out.navs = navs
  const st = document.querySelector('a.sitetitle')
  if (st) {
    const cs = getComputedStyle(st)
    out.sitetitleA = { textDecoration: cs.textDecorationLine, color: cs.color }
  }
  const navA = document.querySelector('nav.laynav.primary a')
  if (navA) out.primaryA = { textDecoration: getComputedStyle(navA).textDecorationLine }
  const mobA = document.querySelector('nav.mobile-nav a')
  if (mobA) out.mobileA = { textDecoration: getComputedStyle(mobA).textDecorationLine, visible: mobA.offsetParent !== null }
  const secondA = document.querySelector('nav.second_menu a')
  if (secondA) out.secondA = { textDecoration: getComputedStyle(secondA).textDecorationLine }
  // row-2 empty Höhe
  const r2 = document.querySelector('#grid .row.empty')
  if (r2) {
    const cs = getComputedStyle(r2)
    const cw = r2.querySelector('.column-wrap')
    out.emptyRow = {
      h: r2.getBoundingClientRect().height,
      minH: cs.minHeight,
      cwDisplay: cw ? getComputedStyle(cw).display : null,
      cwH: cw ? cw.getBoundingClientRect().height : null,
      cwMinH: cw ? getComputedStyle(cw).minHeight : null,
    }
  }
  // Text-Spalten padding (row-7 Differenz)
  const c7 = document.querySelector('#grid .row-7 .col')
  if (c7) {
    const cs = getComputedStyle(c7)
    out.row7col = { pt: cs.paddingTop, pb: cs.paddingBottom, h: Math.round(c7.getBoundingClientRect().height) }
    const txt = c7.querySelector('.text')
    if (txt) out.row7text = { h: Math.round(txt.getBoundingClientRect().height), w: Math.round(txt.getBoundingClientRect().width) }
  }
  return out
})
console.log(JSON.stringify(info, null, 2))
await browser.close()

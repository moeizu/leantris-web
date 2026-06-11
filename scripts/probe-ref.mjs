import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await p.goto('https://leantris.ch/staging/', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
await p.waitForTimeout(2000)
const r = await p.evaluate(() => {
  const out = {}
  const r2 = document.querySelector('#grid .row.empty')
  const ri = r2.querySelector('.row-inner')
  const cs = getComputedStyle(ri)
  out.emptyRowInner = { h: ri.getBoundingClientRect().height, pt: cs.paddingTop, pb: cs.paddingBottom, minH: cs.minHeight, display: cs.display }
  const csr = getComputedStyle(r2)
  out.emptyRow = { pt: csr.paddingTop, pb: csr.paddingBottom, mb: csr.marginBottom, h: r2.getBoundingClientRect().height }
  const ta = document.querySelector('#footer .text_4 a')
  if (ta) { const c = getComputedStyle(ta); out.footerNavA = { td: c.textDecorationLine, color: c.color, bb: c.borderBottom } }
  const sa = document.querySelector('a.sitetitle')
  const sc = getComputedStyle(sa)
  out.sitetitle = { td: sc.textDecorationLine, color: sc.color }
  const pa = document.querySelector('#grid .text a:not(.laybutton)')
  if (pa) { const c = getComputedStyle(pa); out.textA = { td: c.textDecorationLine, color: c.color, cls: pa.className, bb: c.borderBottomWidth + ' ' + c.borderBottomColor } }
  out.sheets = [...document.styleSheets].map((s) => s.href || 'inline').filter((h) => h !== 'inline')
  return out
})
console.log(JSON.stringify(r, null, 2))
await b.close()

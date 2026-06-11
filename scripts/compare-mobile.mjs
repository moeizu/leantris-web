import { chromium } from 'playwright-core'
const route = process.argv[2] || '/'
const appUrl = `http://localhost:5173/#${route}`
const refUrl = route === '/' ? 'https://leantris.ch/staging/' : `https://leantris.ch/staging${route}/`
const b = await chromium.launch({ channel: 'chrome', headless: true })
async function measure(url) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } })
  await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await p.waitForTimeout(2500)
  const d = await p.evaluate(() => {
    const grid = document.querySelector('#custom-phone-grid')
    const rows = grid ? [...grid.querySelectorAll(':scope .row, :scope > .row')] : []
    return {
      gridDisplay: grid ? getComputedStyle(grid).display : 'n/a',
      desktopGridDisplay: (() => { const g = document.querySelector('#grid'); return g ? getComputedStyle(g).display : 'n/a' })(),
      gridH: grid ? Math.round(grid.getBoundingClientRect().height) : 0,
      rows: rows.slice(0, 14).map((r) => ({
        cls: (r.className.match(/row-\d+|empty/g) || []).join(' '),
        top: Math.round(r.getBoundingClientRect().top + window.scrollY),
        h: Math.round(r.getBoundingClientRect().height),
        pos: getComputedStyle(r).position,
      })),
      firstColPos: (() => { const c = grid?.querySelector('.col'); return c ? getComputedStyle(c).position : 'n/a' })(),
    }
  })
  await p.close()
  return d
}
const app = await measure(appUrl)
const ref = await measure(refUrl)
console.log('APP grid display', app.gridDisplay, 'desktopGrid', app.desktopGridDisplay, 'H', app.gridH, 'colPos', app.firstColPos)
console.log('REF grid display', ref.gridDisplay, 'desktopGrid', ref.desktopGridDisplay, 'H', ref.gridH, 'colPos', ref.firstColPos)
const n = Math.max(app.rows.length, ref.rows.length)
for (let i = 0; i < n; i++) {
  const a = app.rows[i] || {}
  const r = ref.rows[i] || {}
  const flag = Math.abs((a.h || 0) - (r.h || 0)) > 8 ? '  <<<' : ''
  console.log(`row${i}  app[${a.cls}|${a.pos}] top=${a.top} h=${a.h}   ref[${r.cls}|${r.pos}] top=${r.top} h=${r.h}${flag}`)
}
await b.close()

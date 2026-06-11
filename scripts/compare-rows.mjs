// Vergleicht #grid-Zeilengeometrie zwischen App und Live-Referenz
import { chromium } from 'playwright-core'

const route = process.argv[2] || '/'
const appUrl = `http://localhost:5173/#${route}`
const refUrl = route === '/' ? 'https://leantris.ch/staging/' : `https://leantris.ch/staging${route}/`

const browser = await chromium.launch({ channel: 'chrome', headless: true })

async function measure(url) {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(2500)
  const data = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#grid > .row, #grid .grid-inner > .row')]
    return {
      rows: rows.map((r) => {
        const b = r.getBoundingClientRect()
        return {
          cls: (r.className.match(/row-\d+|empty|first-row/g) || []).join(' '),
          top: Math.round(b.top + window.scrollY),
          h: Math.round(b.height),
        }
      }),
      gridH: Math.round(document.querySelector('#grid')?.getBoundingClientRect().height || 0),
      navUnderline: (() => {
        const a = document.querySelector('nav.laynav.primary a span')
        return a ? getComputedStyle(a).textDecorationLine + '/' + getComputedStyle(a.closest('a')).textDecorationLine : 'n/a'
      })(),
      logoUnderline: (() => {
        const s = document.querySelector('.sitetitle-txt-inner span')
        return s ? getComputedStyle(s).textDecorationLine : 'n/a'
      })(),
      h1Font: (() => {
        const h = document.querySelector('#grid h1')
        if (!h) return 'n/a'
        const cs = getComputedStyle(h)
        return `${cs.fontFamily.split(',')[0]} ${cs.fontSize} indent:${cs.textIndent}`
      })(),
      logoFont: (() => {
        const s = document.querySelector('.sitetitle-txt-inner')
        if (!s) return 'n/a'
        const cs = getComputedStyle(s)
        return `${cs.fontFamily.split(',')[0]} ${cs.fontSize} tt:${cs.textTransform}`
      })(),
    }
  })
  await page.close()
  return data
}

const [app, ref] = [await measure(appUrl), await measure(refUrl)]
console.log('APP  gridH', app.gridH, '| nav-underline', app.navUnderline, '| logo-underline', app.logoUnderline)
console.log('REF  gridH', ref.gridH, '| nav-underline', ref.navUnderline, '| logo-underline', ref.logoUnderline)
console.log('APP  h1:', app.h1Font, '| logo:', app.logoFont)
console.log('REF  h1:', ref.h1Font, '| logo:', ref.logoFont)
const n = Math.max(app.rows.length, ref.rows.length)
for (let i = 0; i < n; i++) {
  const a = app.rows[i] || {}
  const r = ref.rows[i] || {}
  const flag = Math.abs((a.h || 0) - (r.h || 0)) > 8 ? '  <<<' : ''
  console.log(
    `row${i}  app[${a.cls}] top=${a.top} h=${a.h}   ref[${r.cls}] top=${r.top} h=${r.h}${flag}`
  )
}
await browser.close()

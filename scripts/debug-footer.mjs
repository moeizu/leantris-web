import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 300)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)))
await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const info = await page.evaluate(() => {
  const out = {}
  const footer = document.querySelector('#footer')
  out.footerExists = !!footer
  if (footer) {
    const rect = footer.getBoundingClientRect()
    out.footerRect = { top: rect.top + window.scrollY, h: rect.height }
    out.rows = [...footer.querySelectorAll(':scope > .row')].map((r) => {
      const rr = r.getBoundingClientRect()
      const cs = getComputedStyle(r)
      return {
        cls: r.className.replace(/\s+/g, ' ').slice(0, 60),
        h: Math.round(rr.height),
        display: cs.display,
      }
    })
    const form = footer.querySelector('.nf-form-cont')
    out.formExists = !!form
    if (form) {
      const fr = form.getBoundingClientRect()
      out.formRect = { h: Math.round(fr.height), w: Math.round(fr.width) }
      const input = form.querySelector('input[type=email]')
      if (input) {
        const ics = getComputedStyle(input)
        out.input = { h: ics.height, w: ics.width, bg: ics.backgroundColor, border: ics.border, opacity: ics.opacity, display: ics.display }
      }
    }
    const colWrap = footer.querySelector('.row-2 .column-wrap')
    if (colWrap) {
      const cs2 = getComputedStyle(colWrap)
      out.row2wrap = { display: cs2.display, gridTemplate: cs2.gridTemplateColumns.slice(0, 80) }
    }
  }
  const phoneFooter = document.querySelector('#footer-custom-phone-grid')
  if (phoneFooter) out.phoneFooterDisplay = getComputedStyle(phoneFooter).display
  out.bodyClasses = document.body.className
  return out
})
console.log(JSON.stringify(info, null, 2))
await browser.close()

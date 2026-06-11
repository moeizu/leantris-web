import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })

// CAFM row-5 auf beiden
for (const [label, url] of [
  ['APP', 'http://localhost:5173/#/cafm'],
  ['REF', 'https://leantris.ch/staging/cafm/'],
]) {
  const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
  await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await p.waitForTimeout(2000)
  const r = await p.evaluate(() => {
    const row = document.querySelector('#grid .row-5')
    if (!row) return null
    return {
      html: row.outerHTML.slice(0, 1500),
      h: Math.round(row.getBoundingClientRect().height),
    }
  })
  console.log(`--- ${label} cafm row-5 (h=${r?.h}) ---`)
  console.log(r?.html?.replace(/\s+/g, ' ').slice(0, 1200))
  await p.close()
}

// Kontakt-Formularfelder auf REF
const p2 = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await p2.goto('https://leantris.ch/staging/kontakt/', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
await p2.waitForTimeout(3000)
const form = await p2.evaluate(() => {
  const cont = document.querySelector('#grid .nf-form-cont')
  if (!cont) return null
  return [...cont.querySelectorAll('input, textarea')].map((el) => ({
    tag: el.tagName,
    type: el.type,
    placeholder: el.placeholder || null,
    value: el.type === 'submit' || el.type === 'button' ? el.value : null,
    required: el.required || el.classList.contains('nf-error') || null,
    h: Math.round(el.getBoundingClientRect().height),
  }))
})
console.log('--- REF kontakt form fields ---')
console.log(JSON.stringify(form, null, 2))
await p2.close()
await b.close()

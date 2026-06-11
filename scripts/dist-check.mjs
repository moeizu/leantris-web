import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
const errors = []
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
p.on('pageerror', (e) => errors.push(String(e)))
await p.goto('http://localhost:4173/#/', { waitUntil: 'networkidle', timeout: 30000 })
await p.waitForTimeout(3000)
await p.screenshot({ path: 'analysis/shots/dist-home.png' })
await p.goto('http://localhost:4173/#/kontakt', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.screenshot({ path: 'analysis/shots/dist-kontakt.png' })
console.log('errors:', errors.length ? errors.join(' | ').slice(0, 400) : 'keine')
await b.close()
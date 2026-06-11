// Debug: Direktaufruf einer verschachtelten Route mit Konsolen-Ausgabe
import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:4173/leistungen/individualentwicklung'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 200)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)))
page.on('requestfailed', (r) => console.log('[reqfail]', r.url().slice(0, 120), r.failure()?.errorText))
await page.goto(url, { waitUntil: 'load', timeout: 30000 })
await page.waitForTimeout(2500)
console.log('slug =', await page.evaluate(() => document.body.dataset.slug))
console.log('app html len =', await page.evaluate(() => document.getElementById('app')?.innerHTML.length))
await browser.close()

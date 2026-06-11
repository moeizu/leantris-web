// Verifiziert die Unterseiten-Routen und CTA-Navigation.
// Nutzung: node scripts/verify-subpages.mjs [base-url]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || 'http://localhost:4173'

const ROUTES = [
  '/leistungen/prozessanalyse-digitalisierung',
  '/leistungen/schnittstellen-systemintegration',
  '/leistungen/individualentwicklung',
  '/leistungen/daten-reporting-automatisierung',
  '/leistungen/betrieb-support-monitoring',
  '/leistungen/cafm-beratung-einfuehrung',
  '/loesungen/sterilgutaufbereitung',
  '/loesungen/individuelle-loesungen',
  '/loesungen/dashboard-huddleboard',
  '/referenzen/klinik-schloss-mammern',
  '/referenzen/spital-thurgau',
  '/nova-fm-module',
  '/hsd-nova-fm-medizintechnik',
]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

let fail = 0

// 1) Direktaufruf aller Unterseiten-Routen
for (const r of ROUTES) {
  await page.goto(`${BASE}/#${r}`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(400)
  const slug = await page.evaluate(() => document.body.dataset.slug)
  const h1 = (await page.locator('h1').first().textContent().catch(() => ''))?.trim() ?? ''
  const ok = r.endsWith(slug)
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${r}  slug=${slug}  h1="${h1.slice(0, 60)}"`)
}

// 2) CTA-Klicks auf den Übersichtsseiten
const CLICKS = [
  ['/leistungen', 'a[href="/leistungen/prozessanalyse-digitalisierung"]', 'prozessanalyse-digitalisierung'],
  ['/leistungen', 'a[href="/leistungen/cafm-beratung-einfuehrung"]', 'cafm-beratung-einfuehrung'],
  ['/loesungen', 'a[href="/loesungen/sterilgutaufbereitung"]', 'sterilgutaufbereitung'],
  ['/loesungen', '.lay-content a.laybutton[href="/cafm"]', 'cafm'],
  ['/referenzen', '.lay-content a[href="/referenzen/klinik-schloss-mammern"]', 'klinik-schloss-mammern'],
  ['/cafm', '.lay-content a[href="/nova-fm-module"]', 'nova-fm-module'],
  ['/cafm', '.lay-content a[href="/hsd-nova-fm-medizintechnik"]', 'hsd-nova-fm-medizintechnik'],
]
for (const [from, sel, expected] of CLICKS) {
  await page.goto(`${BASE}/#${from}`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(400)
  const link = page.locator(sel).first()
  if ((await link.count()) === 0) {
    fail++
    console.log(`FAIL ${from} → ${sel} (Link nicht gefunden)`)
    continue
  }
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await page.waitForTimeout(600)
  const slug = await page.evaluate(() => document.body.dataset.slug)
  const ok = slug === expected
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} klick ${from} → ${expected} (slug=${slug})`)
}

if (errors.length) {
  console.log('--- pageerrors ---')
  for (const e of [...new Set(errors)].slice(0, 10)) console.log(e)
}
await browser.close()
console.log(fail === 0 ? '\nALLE TESTS OK' : `\n${fail} FEHLER`)
process.exit(fail === 0 ? 0 : 1)

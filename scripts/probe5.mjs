import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })
for (const [label, url] of [
  ['APP', 'http://localhost:5173/#/'],
  ['REF', 'https://leantris.ch/staging/'],
]) {
  const p = await b.newPage({ viewport: { width: 1680, height: 600 } })
  await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await p.waitForTimeout(2500)
  // runterscrollen (echte Wheel-Events)
  await p.mouse.wheel(0, 1200)
  await p.waitForTimeout(800)
  await p.screenshot({ path: `analysis/shots/nav-down-${label}.png`, clip: { x: 0, y: 0, width: 1680, height: 200 } })
  // hochscrollen
  await p.mouse.wheel(0, -300)
  await p.waitForTimeout(800)
  await p.screenshot({ path: `analysis/shots/nav-up-${label}.png`, clip: { x: 0, y: 0, width: 1680, height: 200 } })
  const t = await p.evaluate(() => ({
    navbarTransform: document.querySelector('.navbar').style.transform || '(leer)',
    navbarH: Math.round(document.querySelector('.navbar').getBoundingClientRect().height),
    navbarBg: getComputedStyle(document.querySelector('.navbar')).backgroundColor,
    navbarBackdrop: getComputedStyle(document.querySelector('.navbar')).backdropFilter,
  }))
  console.log(label, JSON.stringify(t))
  await p.close()
}
await b.close()

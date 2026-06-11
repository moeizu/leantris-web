import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true })

// 1) Intro-Animation auf Home
const p = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await p.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(300)
await p.screenshot({ path: 'analysis/shots/bx-intro.png' })
const introState = await p.evaluate(() => ({
  intro: !!document.querySelector('#intro-region .intro'),
  bodyIntroLoading: document.body.classList.contains('intro-loading'),
}))
await p.waitForTimeout(1600)
const introAfter = await p.evaluate(() => ({ intro: !!document.querySelector('#intro-region') }))
console.log('intro@300ms', JSON.stringify(introState), '→ after', JSON.stringify(introAfter))

// 2) Vertikale Linien nach Animation
await p.waitForTimeout(1800)
const lines = await p.evaluate(() => {
  const l = document.querySelector('.vertical-lines4')
  const cs = getComputedStyle(l)
  return { h: cs.height, left: l.getBoundingClientRect().left }
})
console.log('lines', JSON.stringify(lines))

// 3) Navbar hide/show
await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
await p.mouse.wheel(0, 400)
await p.waitForTimeout(700)
const hiddenState = await p.evaluate(() => ({
  navbar: document.querySelector('.navbar').className.includes('hidden'),
  second: document.querySelector('nav.second_menu').className.includes('hidden'),
  transform: getComputedStyle(document.querySelector('.navbar')).transform,
}))
await p.mouse.wheel(0, -400)
await p.waitForTimeout(700)
const shownState = await p.evaluate(() => ({
  navbar: document.querySelector('.navbar').className.includes('hidden'),
  transform: getComputedStyle(document.querySelector('.navbar')).transform,
}))
console.log('scroll-down hidden:', JSON.stringify(hiddenState), '| scroll-up shown:', JSON.stringify(shownState))

// 4) Seitenwechsel über Nav-Link
await p.evaluate(() => window.scrollTo(0, 0))
await p.click('nav.laynav.primary a[href="/leistungen"]')
await p.waitForTimeout(800)
console.log('nav click →', await p.evaluate(() => location.hash + ' | title: ' + document.title.slice(0, 40)))
await p.close()

// 5) Mobile: Burger-Menü
const m = await b.newPage({ viewport: { width: 390, height: 844 } })
await m.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' })
await m.waitForTimeout(2000)
await m.screenshot({ path: 'analysis/shots/bx-mobile-closed.png' })
await m.click('.burger-wrap')
await m.waitForTimeout(700)
await m.screenshot({ path: 'analysis/shots/bx-mobile-open.png' })
const menuState = await m.evaluate(() => ({
  open: document.body.classList.contains('mobile-menu-open'),
  navVisible: (() => { const n = document.querySelector('nav.mobile-nav'); const r = n.getBoundingClientRect(); return getComputedStyle(n).display + ' ' + Math.round(r.height) })(),
}))
console.log('mobile menu:', JSON.stringify(menuState))
await m.click('nav.mobile-nav a[href="/cafm"]')
await m.waitForTimeout(800)
console.log('mobile nav click →', await m.evaluate(() => location.hash + ' | menuOpen: ' + document.body.classList.contains('mobile-menu-open')))
await m.close()

// 6) Kontakt-Formular UI
const k = await b.newPage({ viewport: { width: 1680, height: 1050 } })
await k.goto('http://localhost:5173/#/kontakt', { waitUntil: 'networkidle' })
await k.waitForTimeout(1500)
await k.fill('#grid input[name=name]', 'Test Person')
await k.fill('#grid input[name=email]', 'test@example.com')
await k.fill('#grid textarea[name=nachricht]', 'Testnachricht')
await k.click('#grid input[type=submit]')
await k.waitForTimeout(2500)
const formResult = await k.evaluate(() => {
  const msg = document.querySelector('#grid .nf-response-msg')
  return msg ? msg.textContent.trim().slice(0, 80) : 'keine Meldung'
})
console.log('form submit (Platzhalter-Endpoint):', formResult)
await k.screenshot({ path: 'analysis/shots/bx-kontakt-form.png' })
await k.close()
await b.close()

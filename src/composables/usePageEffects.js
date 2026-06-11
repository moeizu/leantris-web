import { onMounted, onBeforeUnmount, nextTick } from 'vue'

// Repliziert die Lay-Theme-Scroll-Effekte aus dem Export:
//  - Elemente erhalten .below (opacity 0, translateY 90px/40px) und beim
//    Eintritt in den Viewport .in-view (300ms ease, Stagger-Delay beim
//    ersten Anzeigen: 0.25 * Distanz vom Ursprung in px, siehe frontend.app.min.js)
//  - Parallax: .col[data-yvel] wird mit progress * -(yvel-1) * 11.2 px verschoben

const COL_SELECTOR =
  '.col.no-parallax.no-offset.no-sticky:not(.inside-collapsed-row)'

function scrollOffset() {
  return window.matchMedia('(max-width: 600px)').matches ? 40 : 90
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 3.1 Kinetischer H1-Einstieg: Wörter mit gestaffeltem Delay einblenden
function kineticH1(scope) {
  if (reducedMotion()) return
  const h1 = scope.querySelector('.text h1._H1')
  if (!h1 || h1.dataset.leaKinetic) return
  h1.dataset.leaKinetic = '1'
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode)
  }
  let i = 0
  for (const node of textNodes) {
    const frag = document.createDocumentFragment()
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part.trim()) {
        frag.appendChild(document.createTextNode(part))
        continue
      }
      const span = document.createElement('span')
      span.className = 'lea-kinetic-word'
      span.style.setProperty('--lea-word-delay', `${0.12 + i * 0.07}s`)
      span.textContent = part
      frag.appendChild(span)
      i++
    }
    node.parentNode.replaceChild(frag, node)
  }
}

// 2.7 Pause-/Play-Schalter für Autoplay-Videos (WCAG 2.2.2)
function addVideoToggles(scope) {
  for (const wrap of scope.querySelectorAll('.html5video')) {
    if (wrap.querySelector('.lea-video-toggle')) continue
    const video = wrap.querySelector('video')
    if (!video) continue
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'lea-video-toggle'
    btn.dataset.paused = 'false'
    btn.setAttribute('aria-label', 'Video pausieren')
    btn.textContent = '❚❚'
    btn.addEventListener('click', () => {
      if (video.paused) {
        video.play()
        btn.dataset.paused = 'false'
        btn.setAttribute('aria-label', 'Video pausieren')
        btn.textContent = '❚❚'
      } else {
        video.pause()
        btn.dataset.paused = 'true'
        btn.setAttribute('aria-label', 'Video abspielen')
        btn.textContent = '►'
      }
    })
    const ph = wrap.querySelector('.ph') || wrap
    ph.style.position = 'relative'
    ph.appendChild(btn)
    // Reduzierte Bewegung: Videos pausiert starten (Poster bleibt sichtbar)
    if (reducedMotion()) {
      video.removeAttribute('autoplay')
      video.pause()
      btn.dataset.paused = 'true'
      btn.setAttribute('aria-label', 'Video abspielen')
      btn.textContent = '►'
    }
  }
}

// 2.5 Minimaler Fade-Carousel-Ersatz für das Lay-Theme-Carousel
function initCarousels(scope) {
  const timers = []
  for (const wrap of scope.querySelectorAll('.lay-carousel-wrap')) {
    if (wrap.classList.contains('lea-carousel-ready')) continue
    const slides = [...wrap.querySelectorAll('.lay-carousel-slide')]
    if (slides.length < 2) continue
    // Lazy-Bilder laden
    for (const img of wrap.querySelectorAll('img[data-lay-src]')) {
      img.src = img.getAttribute('data-lay-src')
      const srcset = img.getAttribute('data-lay-srcset')
      if (srcset) {
        img.srcset = srcset
        img.sizes = '50vw'
      }
    }
    wrap.classList.add('lea-carousel-ready')
    let ix = 0
    slides[0].classList.add('lea-active')
    if (reducedMotion()) continue
    const speed = Number(wrap.querySelector('.lay-carousel')?.dataset.autoplayspeed) || 2000
    timers.push(
      setInterval(() => {
        slides[ix].classList.remove('lea-active')
        ix = (ix + 1) % slides.length
        slides[ix].classList.add('lea-active')
      }, Math.max(speed, 2500))
    )
  }
  return timers
}

export function usePageEffects() {
  let observer = null
  let parallaxEls = []
  let rafPending = false
  let initialReveal = true
  let carouselTimers = []

  function observeAll() {
    if (reducedMotion()) return
    const scope = document.querySelectorAll(
      `.lay-content ${COL_SELECTOR}`
    )
    const offset = scrollOffset()
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target
          if (e.isIntersecting) {
            if (initialReveal) {
              const r = e.boundingClientRect
              const d = Math.sqrt(r.left * r.left + r.top * r.top)
              el.style.transitionDelay = `${parseInt(0.25 * d, 10)}ms`
            } else {
              el.style.transitionDelay = ''
            }
            el.classList.remove('below')
            el.classList.add('in-view')
          } else if (
            e.boundingClientRect.top + offset > window.innerHeight
          ) {
            el.style.transitionDelay = ''
            el.classList.add('below')
            el.classList.remove('in-view')
          }
        }
        // Nach dem ersten Batch keine Stagger-Delays mehr
        requestAnimationFrame(() => {
          initialReveal = false
        })
      },
      { threshold: 0, rootMargin: `0px 0px ${offset}px 0px` }
    )
    scope.forEach((el) => {
      el.classList.add('below')
      observer.observe(el)
    })
  }

  function collectParallax() {
    parallaxEls = []
    if (reducedMotion()) return
    document.querySelectorAll('.lay-content .col[data-yvel]').forEach((el) => {
      let yvel = parseFloat(el.getAttribute('data-yvel'))
      if (!(yvel > 1)) return
      parallaxEls.push({ el, factor: -(yvel - 1) })
    })
  }

  function applyParallax() {
    rafPending = false
    const vh = window.innerHeight
    const scrollY = window.scrollY
    for (const p of parallaxEls) {
      const rect = p.el.getBoundingClientRect()
      const currentTranslate = p._y || 0
      const top = rect.top + scrollY - currentTranslate
      const start = top - vh
      const end = top + rect.height
      let progress = ((scrollY - start) / (end - start)) * 100
      progress = Math.max(0, Math.min(100, progress))
      const y = progress * p.factor * 11.2
      p._y = y
      p.el.style.transform = `translate(0px, ${y}px)`
    }
  }

  function onScroll() {
    if (!rafPending && parallaxEls.length) {
      rafPending = true
      requestAnimationFrame(applyParallax)
    }
  }

  onMounted(async () => {
    await nextTick()
    // Fonts/Layout kurz setzen lassen, dann beobachten (wie Original nach "newpageshown")
    requestAnimationFrame(() => {
      observeAll()
      collectParallax()
      applyParallax()
      const scope = document.querySelector('.lay-content') || document.body
      kineticH1(scope)
      addVideoToggles(scope)
      carouselTimers = initCarousels(scope)
      // H1 morpht beim Seitenwechsel (View Transitions API, App.vue)
      const h1 = scope.querySelector('.text h1._H1')
      if (h1) h1.style.viewTransitionName = 'lea-h1'
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    for (const t of carouselTimers) clearInterval(t)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}

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

export function usePageEffects() {
  let observer = null
  let parallaxEls = []
  let rafPending = false
  let initialReveal = true

  function observeAll() {
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
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}

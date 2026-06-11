<template>
  <a class="lea-skip-link" href="#main" @click.prevent="skipToMain">Zum Inhalt springen</a>
  <IntroOverlay v-if="showIntro" @done="showIntro = false" />
  <SiteHeader />
  <div class="container-fluid">
    <!-- Wie auf der Live-Staging-Site: Linien bei 10/30/50/70/90 % -->
    <div v-for="n in [0, 2, 4, 6, 8]" :key="n" :class="`vertical-lines${n}`" id="line-center"></div>
  </div>
  <div
    id="main"
    class="lay-content hascustomphonegrid footer-hascustomphonegrid nocover cpl-nocover cover-enabled-on-phone"
    @click="onContentClick"
  >
    <router-view v-slot="{ Component }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import IntroOverlay from './components/IntroOverlay.vue'

const router = useRouter()

// Intro nur beim ersten Laden auf der Startseite (wie im Export: intro-enabled nur Home)
const showIntro = ref(
  window.location.pathname === '/' ||
    window.location.hash === '#/' // alte Hash-URLs
)

// View Transitions API (3.6): sanfter Seitenwechsel inkl. H1-Morph, wo
// unterstützt. Fallback bleibt der bisherige Vue-Fade ("lay-page").
const supportsVT =
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
const transitionName = supportsVT ? 'lea-none' : 'lay-page'

if (supportsVT) {
  let finish = null
  router.beforeResolve((to, from) => {
    if (!from.matched.length) return // initialer Load
    const done = new Promise((resolve) => {
      finish = resolve
    })
    document.startViewTransition(() => done)
  })
  router.afterEach(async () => {
    if (!finish) return
    await nextTick()
    finish()
    finish = null
  })
}

function skipToMain() {
  const main = document.getElementById('main')
  if (!main) return
  main.setAttribute('tabindex', '-1')
  main.focus({ preventScroll: false })
}

// Interne Links aus den 1:1 übernommenen Export-Templates abfangen
function onContentClick(e) {
  const a = e.target.closest('a')
  if (!a) return
  const href = a.getAttribute('href')
  if (href === null || href === '') {
    // scrolltotop-Logo im Footer
    if (a.closest('.scrolltotop')) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }
  if (href.startsWith('#')) {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    return
  }
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('wp-content')) {
    e.preventDefault()
    router.push(href.replace(/\/$/, '') || '/')
  }
}
</script>

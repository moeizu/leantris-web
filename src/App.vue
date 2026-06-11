<template>
  <IntroOverlay v-if="showIntro" @done="showIntro = false" />
  <SiteHeader />
  <div class="container-fluid">
    <!-- Wie auf der Live-Staging-Site: Linien bei 10/30/50/70/90 % -->
    <div v-for="n in [0, 2, 4, 6, 8]" :key="n" :class="`vertical-lines${n}`" id="line-center"></div>
  </div>
  <div
    class="lay-content hascustomphonegrid footer-hascustomphonegrid nocover cpl-nocover cover-enabled-on-phone"
    @click="onContentClick"
  >
    <router-view v-slot="{ Component }">
      <transition name="lay-page" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

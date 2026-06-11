<template>
  <div @click="onHeaderClick">
    <a class="sitetitle position-top is-not-fixed txt" href="/" data-type="page">
      <div class="sitetitle-txt-inner _Logo"><span>Leantris</span></div>
    </a>

    <nav class="laynav mobile-nav mobile-menu-style-style_3" ref="mobileNav">
      <ul>
        <li v-for="item in menu" :key="item.path" class="menu-item">
          <a :href="item.path" class="_Default_no_spaces _Default"><span>{{ item.label }}</span></a>
        </li>
      </ul>
    </nav>

    <nav
      class="laynav desktop-nav nav-style-normal show-submenu-on-click submenu-type-vertical laynav-position-top-center arrangement-vertical position-top is-not-fixed primary"
    >
      <ul>
        <li v-for="item in menu" :key="item.path" class="menu-item">
          <a :href="item.path"><span>{{ item.label }}</span></a>
        </li>
      </ul>
    </nav>

    <nav
      ref="secondMenu"
      class="laynav desktop-nav nav-style-normal show-submenu-on-click submenu-type-vertical laynav-position-top-right arrangement-horizontal position-top is-fixed second_menu"
    >
      <ul>
        <li class="menu-item">
          <a href="#kontakt" class="_Default_no_spaces"><span>Kontakt ↓</span></a>
        </li>
      </ul>
    </nav>

    <div class="navbar position-top is-fixed" ref="navbar"></div>

    <a class="mobile-title image is-fixed" href="/" ref="mobileTitle">
      <span><img src="/wp-content/uploads/2021/04/Leantris-Logo.svg" alt="Leantris"></span>
    </a>

    <div class="lay-mobile-icons-wrap new-burger is-fixed" ref="burgerWrap">
      <div
        class="burger-wrap right burger-wrap-new burger-has-animation"
        role="button"
        tabindex="0"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        :aria-label="menuOpen ? 'Menü schliessen' : 'Menü öffnen'"
        @click="toggleMenu"
        @keydown.enter.prevent="toggleMenu"
        @keydown.space.prevent="toggleMenu"
      >
        <div class="burger-inner">
          <div class="burger burger-new mobile-menu-icon" :class="{ active: menuOpen }">
            <span class="bread-top"><span class="bread-crust-top"></span></span>
            <span class="bread-bottom"><span class="bread-crust-bottom"></span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const menu = [
  { path: '/leistungen', label: 'Leistungen' },
  { path: '/cafm', label: 'CAFM' },
  { path: '/loesungen', label: 'Lösungen' },
  { path: '/referenzen', label: 'Referenzen' },
  { path: '/ueber-leantris', label: 'Über Leantris' },
  { path: '/kontakt', label: 'Kontakt' },
]

const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

const navbar = ref(null)
const secondMenu = ref(null)
const mobileTitle = ref(null)
const burgerWrap = ref(null)

function onHeaderClick(e) {
  const a = e.target.closest('a')
  if (!a) return
  const href = a.getAttribute('href')
  if (!href) return
  if (href.startsWith('#')) {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    closeMenu()
    return
  }
  if (href.startsWith('/')) {
    e.preventDefault()
    router.push(href)
    closeMenu()
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.classList.toggle('mobile-menu-open', menuOpen.value)
}
function closeMenu() {
  menuOpen.value = false
  document.body.classList.remove('mobile-menu-open')
}
watch(() => route.path, closeMenu)

// Navbar versteckt sich beim Runterscrollen, erscheint beim Hochscrollen
// (Export: layData.navbar_hidewhenscrollingdown = 1, safetyOffset 20, Threshold 50)
const SAFETY = 20
const THRESHOLD = 50
let lastY = 0
let hidden = false

function hideEl(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const t = rect.bottom + SAFETY
  el.style.transform = `translateY(-${Math.max(t, 0)}px)`
  el.classList.add('hidden')
}
function showEl(el) {
  if (!el) return
  el.style.transform = ''
  el.classList.remove('hidden')
}

function onScroll() {
  const y = window.scrollY
  // Mobile-Header-Kontrast: Blur-Optik erst nach dem Hero (optimizations.css)
  document.body.classList.toggle('lea-scrolled', y > 50)
  const delta = y - lastY
  if (Math.abs(delta) < 5) return
  if (y > THRESHOLD && delta > 0 && !hidden) {
    hidden = true
    ;[navbar.value, secondMenu.value, mobileTitle.value, burgerWrap.value].forEach(hideEl)
  } else if ((delta < 0 || y <= THRESHOLD) && hidden) {
    hidden = false
    ;[navbar.value, secondMenu.value, mobileTitle.value, burgerWrap.value].forEach(showEl)
  }
  lastY = y
}

onMounted(() => {
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

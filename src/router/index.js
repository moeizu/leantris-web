import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LeistungenView from '../views/LeistungenView.vue'
import CafmView from '../views/CafmView.vue'
import LoesungenView from '../views/LoesungenView.vue'
import ReferenzenView from '../views/ReferenzenView.vue'
import UeberLeantrisView from '../views/UeberLeantrisView.vue'
import KontaktView from '../views/KontaktView.vue'
import ImpressumView from '../views/ImpressumView.vue'

// Body-Klassen und Page-IDs exakt wie im Simply-Static-Export –
// das exportierte CSS ist auf id-/slug-Klassen gescoped.
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      id: 461,
      slug: 'softwareloesungen-fuer-intelligente-prozesse-im-facility-management-und-in-der-medizintechnik',
      bodyExtra: 'home blog',
      title: 'Leantris – Software für das Facility-Management im Gesundheitswesen',
    },
  },
  {
    path: '/leistungen',
    name: 'leistungen',
    component: LeistungenView,
    meta: { id: 613, slug: 'leistungen', title: 'digitale Betriebsprozesse | Leistungen | Leantris' },
  },
  {
    path: '/cafm',
    name: 'cafm',
    component: CafmView,
    meta: { id: 485, slug: 'cafm', title: 'HSD Nova-FM: CAFM Software für Facility Management | Leantris Schweiz' },
  },
  {
    path: '/loesungen',
    name: 'loesungen',
    component: LoesungenView,
    meta: { id: 616, slug: 'loesungen', title: 'digitale Betriebsprozesse | Leistungen | Leantris' },
  },
  {
    path: '/referenzen',
    name: 'referenzen',
    component: ReferenzenView,
    meta: { id: 457, slug: 'referenzen', title: 'Leantris – Wo Medizintechnik, Haustechnik und Verwaltung bereits von unserer Software profitieren.' },
  },
  {
    path: '/ueber-leantris',
    name: 'ueber-leantris',
    component: UeberLeantrisView,
    meta: { id: 43, slug: 'ueber-leantris', title: 'Leantris – Ihr Team für zukunftsweisendes Facility-Management' },
  },
  {
    path: '/kontakt',
    name: 'kontakt',
    component: KontaktView,
    meta: { id: 432, slug: 'kontakt', title: 'Kontakt – Leantris' },
  },
  {
    path: '/impressum',
    name: 'impressum',
    component: ImpressumView,
    meta: { id: 368, slug: 'impressum', title: 'Impressum – Leantris' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      const el = document.querySelector(to.hash)
      if (el) return { el: to.hash }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

const STATIC_BODY_CLASSES = [
  'wp-theme-lay',
  'type-page',
  'mobile-menu-style_3',
  'mobile-menu-has-animation',
  'mobile-menu-animation-possible',
  'thumb-mo-image-no-transition',
  'thumb-video-and-mouseover-image-behavior-show-image',
  'mobile_menu_bar_not_hidden',
  'mobile_burger_style_new',
  'lay-transition-elements-on-scroll',
  'sticky-footer-option-enabled',
  'not-protected',
  'not-using-max-width',
]

router.afterEach((to) => {
  const touch = window.matchMedia('(pointer: coarse)').matches
  const classes = [
    ...(to.meta.bodyExtra ? String(to.meta.bodyExtra).split(' ') : []),
    ...STATIC_BODY_CLASSES,
    touch ? 'touchdevice' : 'no-touchdevice',
    `id-${to.meta.id}`,
    `slug-${to.meta.slug}`,
  ]
  // Laufende Zustände erhalten
  if (document.body.classList.contains('mobile-menu-open')) classes.push('mobile-menu-open')
  if (document.body.classList.contains('intro-loading')) classes.push('intro-loading')
  document.body.className = classes.join(' ')
  document.body.dataset.type = 'page'
  document.body.dataset.id = String(to.meta.id)
  document.body.dataset.slug = to.meta.slug
  if (to.meta.title) document.title = to.meta.title
})

export default router

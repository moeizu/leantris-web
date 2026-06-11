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
    // Staging hat hier denselben Titel wie /leistungen (WP-Bug) – korrigiert
    meta: { id: 616, slug: 'loesungen', title: 'Lösungen für spezifische Betriebsprozesse – Leantris' },
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
  // Unterseiten (generiert via scripts/build-subpages.mjs, lazy geladen)
  { path: '/leistungen/prozessanalyse-digitalisierung', name: 'prozessanalyse-digitalisierung', component: () => import('../views/LeistungenProzessanalyseView.vue'), meta: { id: 617, slug: 'prozessanalyse-digitalisierung', title: 'Prozessanalyse & Digitalisierung – Leantris' } },
  { path: '/leistungen/schnittstellen-systemintegration', name: 'schnittstellen-systemintegration', component: () => import('../views/LeistungenSchnittstellenView.vue'), meta: { id: 618, slug: 'schnittstellen-systemintegration', title: 'Schnittstellen & Systemintegration – Leantris' } },
  { path: '/leistungen/individualentwicklung', name: 'individualentwicklung', component: () => import('../views/LeistungenIndividualentwicklungView.vue'), meta: { id: 619, slug: 'individualentwicklung', title: 'Individualentwicklung – Leantris' } },
  { path: '/leistungen/daten-reporting-automatisierung', name: 'daten-reporting-automatisierung', component: () => import('../views/LeistungenReportingView.vue'), meta: { id: 620, slug: 'daten-reporting-automatisierung', title: 'Daten, Reporting & Automatisierung – Leantris' } },
  { path: '/leistungen/betrieb-support-monitoring', name: 'betrieb-support-monitoring', component: () => import('../views/LeistungenBetriebView.vue'), meta: { id: 621, slug: 'betrieb-support-monitoring', title: 'Betrieb, Support & Monitoring – Leantris' } },
  { path: '/leistungen/cafm-beratung-einfuehrung', name: 'cafm-beratung-einfuehrung', component: () => import('../views/LeistungenCafmBeratungView.vue'), meta: { id: 622, slug: 'cafm-beratung-einfuehrung', title: 'CAFM-Beratung & Einführung – Leantris' } },
  { path: '/loesungen/sterilgutaufbereitung', name: 'sterilgutaufbereitung', component: () => import('../views/LoesungenSterilgutView.vue'), meta: { id: 489, slug: 'sterilgutaufbereitung', title: 'Leantris – HSD-ChargenDoc unterstützt Ihr Qualitätsmanagement in der Sterilgutaufbereitung nach ISO 13485' } },
  { path: '/loesungen/individuelle-loesungen', name: 'individuelle-loesungen', component: () => import('../views/LoesungenIndividuellView.vue'), meta: { id: 638, slug: 'individuelle-loesungen', title: 'Individuelle Lösungen – Leantris' } },
  { path: '/loesungen/dashboard-huddleboard', name: 'dashboard-huddleboard', component: () => import('../views/LoesungenHuddleboardView.vue'), meta: { id: 639, slug: 'dashboard-huddleboard', title: 'Clarita Huddleboard – Leantris' } },
  { path: '/referenzen/klinik-schloss-mammern', name: 'klinik-schloss-mammern', component: () => import('../views/ReferenzKlinikMammernView.vue'), meta: { id: 642, slug: 'klinik-schloss-mammern', title: 'Klinik Schloss Mammern – Leantris' } },
  { path: '/referenzen/spital-thurgau', name: 'spital-thurgau', component: () => import('../views/ReferenzSpitalThurgauView.vue'), meta: { id: 643, slug: 'spital-thurgau', title: 'Spital Thurgau AG – Leantris' } },
  { path: '/nova-fm-module', name: 'nova-fm-module', component: () => import('../views/NovaFmModuleView.vue'), meta: { id: 500, slug: 'nova-fm-module', title: 'Leantris – HSD Nova besteht aus 45 Modulen – wählen Sie jene Module aus, die Sie benötigen.' } },
  { path: '/hsd-nova-fm-medizintechnik', name: 'hsd-nova-fm-medizintechnik', component: () => import('../views/NovaFmMedizintechnikView.vue'), meta: { id: 494, slug: 'hsd-nova-fm-medizintechnik', title: 'Leantris – HSD NOVA-FM bietet alle Leistungsmerkmale, damit Sie Ihre Medizintechnik jederzeit rechtskonform bewirtschaften können.' } },
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

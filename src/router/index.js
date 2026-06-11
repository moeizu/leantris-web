import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LeistungenView from '../views/LeistungenView.vue'
import CafmView from '../views/CafmView.vue'
import LoesungenView from '../views/LoesungenView.vue'
import ReferenzenView from '../views/ReferenzenView.vue'
import UeberLeantrisView from '../views/UeberLeantrisView.vue'
import KontaktView from '../views/KontaktView.vue'
import ImpressumView from '../views/ImpressumView.vue'

const SITE_URL = 'https://leantris.ch'

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
      description: 'Leantris digitalisiert Abläufe, verbindet Systeme und entwickelt individuelle Lösungen: CAFM mit HSD Nova-FM, Schnittstellen, Fachanwendungen, Betrieb und Support – aus Bern.',
    },
  },
  {
    path: '/leistungen',
    name: 'leistungen',
    component: LeistungenView,
    meta: {
      id: 613, slug: 'leistungen',
      title: 'Leistungen für digitale Betriebsprozesse – Leantris',
      description: 'Prozessanalyse, Schnittstellen, Individualentwicklung, Reporting, Betrieb und CAFM-Einführung: Leantris begleitet Organisationen von der Analyse bis zum laufenden Betrieb.',
    },
  },
  {
    path: '/cafm',
    name: 'cafm',
    component: CafmView,
    meta: {
      id: 485, slug: 'cafm',
      title: 'HSD Nova-FM: CAFM Software für Facility Management | Leantris Schweiz',
      description: 'CAFM mit HSD Nova-FM: modulare Software für technisches, kaufmännisches und infrastrukturelles Facility Management. Leantris begleitet Einführung, Schnittstellen und Betrieb.',
    },
  },
  {
    path: '/loesungen',
    name: 'loesungen',
    component: LoesungenView,
    // Staging hat hier denselben Titel wie /leistungen (WP-Bug) – korrigiert
    meta: {
      id: 616, slug: 'loesungen',
      title: 'Lösungen für spezifische Betriebsprozesse – Leantris',
      description: 'Sterilgutaufbereitung mit HSD ChargenDoc, HSD Nova-FM, individuelle Fachanwendungen und das Clarita Huddleboard – Lösungen für konkrete betriebliche Anforderungen.',
    },
  },
  {
    path: '/referenzen',
    name: 'referenzen',
    component: ReferenzenView,
    meta: {
      id: 457, slug: 'referenzen',
      title: 'Referenzen: Projekte aus der Praxis – Leantris',
      description: 'Realisierte Projekte in Facility Management und Medizintechnik: Klinik Schloss Mammern und Spital Thurgau AG setzen auf Lösungen von Leantris.',
    },
  },
  {
    path: '/ueber-leantris',
    name: 'ueber-leantris',
    component: UeberLeantrisView,
    meta: {
      id: 43, slug: 'ueber-leantris',
      title: 'Über Leantris – Ihr Team für zukunftsweisendes Facility-Management',
      description: 'Leantris ist ein Schweizer KMU aus Bern: Experten in Elektrotechnik, Gebäudetechnik, Informatik und Betriebswirtschaft mit hohen Qualitätsansprüchen.',
    },
  },
  {
    path: '/kontakt',
    name: 'kontakt',
    component: KontaktView,
    meta: {
      id: 432, slug: 'kontakt',
      title: 'Kontakt – Leantris',
      description: 'Kontaktieren Sie Leantris in Bern: Demo zu HSD Nova-FM, Beratung zu CAFM, Schnittstellen, Individualentwicklung oder Betrieb und Support. +41 31 533 70 10.',
    },
  },
  {
    path: '/impressum',
    name: 'impressum',
    component: ImpressumView,
    meta: {
      id: 368, slug: 'impressum',
      title: 'Impressum – Leantris',
      description: 'Impressum und Datenschutz der Leantris AG, Bümplizstrasse 150, 3018 Bern.',
      noindex: true,
    },
  },
  // Unterseiten (generiert via scripts/build-subpages.mjs, lazy geladen)
  {
    path: '/leistungen/prozessanalyse-digitalisierung', name: 'prozessanalyse-digitalisierung',
    component: () => import('../views/LeistungenProzessanalyseView.vue'),
    meta: {
      id: 617, slug: 'prozessanalyse-digitalisierung',
      title: 'Prozessanalyse & Digitalisierung – Leantris',
      description: 'Wir klären Abläufe, Rollen, Daten und Systeme, bevor eine Lösung umgesetzt wird – und leiten daraus konkrete Digitalisierungsschritte ab.',
    },
  },
  {
    path: '/leistungen/schnittstellen-systemintegration', name: 'schnittstellen-systemintegration',
    component: () => import('../views/LeistungenSchnittstellenView.vue'),
    meta: {
      id: 618, slug: 'schnittstellen-systemintegration',
      title: 'Schnittstellen & Systemintegration – Leantris',
      description: 'Wir verbinden bestehende Systeme und Datenquellen so, dass Informationen zuverlässig dort verfügbar sind, wo sie gebraucht werden.',
    },
  },
  {
    path: '/leistungen/individualentwicklung', name: 'individualentwicklung',
    component: () => import('../views/LeistungenIndividualentwicklungView.vue'),
    meta: {
      id: 619, slug: 'individualentwicklung',
      title: 'Individualentwicklung – Leantris',
      description: 'Schlanke Anwendungen, Portale, Backends und Erweiterungen, wenn Standardsoftware nicht passt – fachlich durchdacht und technisch sauber umgesetzt.',
    },
  },
  {
    path: '/leistungen/daten-reporting-automatisierung', name: 'daten-reporting-automatisierung',
    component: () => import('../views/LeistungenReportingView.vue'),
    meta: {
      id: 620, slug: 'daten-reporting-automatisierung',
      title: 'Daten, Reporting & Automatisierung – Leantris',
      description: 'Wir machen Daten nutzbar und automatisieren wiederkehrende Auswertungen, Prüfungen und Benachrichtigungen.',
    },
  },
  {
    path: '/leistungen/betrieb-support-monitoring', name: 'betrieb-support-monitoring',
    component: () => import('../views/LeistungenBetriebView.vue'),
    meta: {
      id: 621, slug: 'betrieb-support-monitoring',
      title: 'Betrieb, Support & Monitoring – Leantris',
      description: 'Wir begleiten Lösungen nach dem Go-live, überwachen produktive Abläufe und unterstützen bei Anpassungen und Weiterentwicklung.',
    },
  },
  {
    path: '/leistungen/cafm-beratung-einfuehrung', name: 'cafm-beratung-einfuehrung',
    component: () => import('../views/LeistungenCafmBeratungView.vue'),
    meta: {
      id: 622, slug: 'cafm-beratung-einfuehrung',
      title: 'CAFM-Beratung & Einführung – Leantris',
      description: 'Einführung, Erweiterung und Betrieb von HSD Nova-FM – fachlich und praxisnah, von der Bedarfsanalyse bis zum laufenden Support.',
    },
  },
  {
    path: '/loesungen/sterilgutaufbereitung', name: 'sterilgutaufbereitung',
    component: () => import('../views/LoesungenSterilgutView.vue'),
    meta: {
      id: 489, slug: 'sterilgutaufbereitung',
      // Original-WP-Titel war 104 Zeichen lang – gekürzt
      title: 'Sterilgutaufbereitung mit HSD ChargenDoc – Leantris',
      description: 'HSD ChargenDoc unterstützt das Qualitätsmanagement in der Sterilgutaufbereitung nach ISO 13485: Reinigung, Verpackung, Sterilisation, Lagerung und Dokumentation.',
    },
  },
  {
    path: '/loesungen/individuelle-loesungen', name: 'individuelle-loesungen',
    component: () => import('../views/LoesungenIndividuellView.vue'),
    meta: {
      id: 638, slug: 'individuelle-loesungen',
      title: 'Individuelle Lösungen – Leantris',
      description: 'Individuelle Fachanwendungen für Prozesse, die Standardsoftware nicht sauber abbildet – von der Idee bis zum laufenden Betrieb.',
    },
  },
  {
    path: '/loesungen/dashboard-huddleboard', name: 'dashboard-huddleboard',
    component: () => import('../views/LoesungenHuddleboardView.vue'),
    meta: {
      id: 639, slug: 'dashboard-huddleboard',
      title: 'Clarita Huddleboard – Leantris',
      description: 'Digitales Huddleboard für Spitäler, Rehakliniken, Psychiatrien und Heime: Stationsplanung, Teamkoordination und Patienteninformationen auf einem Display.',
    },
  },
  {
    path: '/referenzen/klinik-schloss-mammern', name: 'klinik-schloss-mammern',
    component: () => import('../views/ReferenzKlinikMammernView.vue'),
    meta: {
      id: 642, slug: 'klinik-schloss-mammern',
      title: 'Referenz Klinik Schloss Mammern – Leantris',
      description: 'HSD Nova-FM für die vollständige Abbildung des Facility Managements: Servicemanagement, Raumbuch, Flächen- und Schlüsselmanagement in der Klinik Schloss Mammern.',
    },
  },
  {
    path: '/referenzen/spital-thurgau', name: 'spital-thurgau',
    component: () => import('../views/ReferenzSpitalThurgauView.vue'),
    meta: {
      id: 643, slug: 'spital-thurgau',
      title: 'Referenz Spital Thurgau AG – Leantris',
      description: 'Die ganze Medizintechnik und alle IT-Geräte der Spital Thurgau AG sind in HSD Nova-FM integriert – inklusive Rettungsdienst-Fahrzeuge.',
    },
  },
  {
    path: '/nova-fm-module', name: 'nova-fm-module',
    component: () => import('../views/NovaFmModuleView.vue'),
    meta: {
      id: 500, slug: 'nova-fm-module',
      // Original-WP-Titel war 95 Zeichen lang – gekürzt
      title: 'HSD Nova-FM Module – Leantris',
      description: 'HSD Nova besteht aus 45 Modulen für technisches, kaufmännisches und infrastrukturelles Facility Management – wählen Sie jene Module aus, die Sie benötigen.',
    },
  },
  {
    path: '/hsd-nova-fm-medizintechnik', name: 'hsd-nova-fm-medizintechnik',
    component: () => import('../views/NovaFmMedizintechnikView.vue'),
    meta: {
      id: 494, slug: 'hsd-nova-fm-medizintechnik',
      title: 'HSD Nova-FM für die Medizintechnik – Leantris',
      description: 'HSD Nova-FM bietet alle Leistungsmerkmale, um Medizintechnik jederzeit rechtskonform zu bewirtschaften – inklusive Prüf- und Wartungsmanagement.',
    },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
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

// Alte Hash-URLs (#/leistungen) auf echte Pfade umleiten
router.isReady().then(() => {
  const { hash } = window.location
  if (hash.startsWith('#/')) router.replace(hash.slice(1))
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

// <meta>/<link>-Tag setzen oder aktualisieren
function setHeadTag(selector, create, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  value(el)
}

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

  // SEO: Titel, Description, Canonical und Open Graph pro Route
  const title = to.meta.title || 'Leantris'
  const description = to.meta.description || ''
  const canonical = SITE_URL + (to.path === '/' ? '/' : to.path)

  document.title = title
  setHeadTag('meta[name="description"]',
    () => Object.assign(document.createElement('meta'), { name: 'description' }),
    (el) => el.setAttribute('content', description))
  setHeadTag('link[rel="canonical"]',
    () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
    (el) => el.setAttribute('href', canonical))
  setHeadTag('meta[property="og:title"]',
    () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m },
    (el) => el.setAttribute('content', title))
  setHeadTag('meta[property="og:description"]',
    () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m },
    (el) => el.setAttribute('content', description))
  setHeadTag('meta[property="og:url"]',
    () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m },
    (el) => el.setAttribute('content', canonical))
  setHeadTag('meta[name="robots"]',
    () => Object.assign(document.createElement('meta'), { name: 'robots' }),
    (el) => el.setAttribute('content', to.meta.noindex ? 'noindex, follow' : 'index, follow'))
})

export default router

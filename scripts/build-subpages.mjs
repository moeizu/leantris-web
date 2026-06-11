// Generiert die Unterseiten-Views direkt aus dem Simply-Static-Export.
// Quelle: reference/<pfad>/index.html
// Ziel:   src/views/<Name>View.vue + src/styles/grids-subpages.css
//
// Gleiches Vorgehen wie build-views.mjs, aber Extraktion direkt aus dem
// Export-HTML (Grid-Markup per Tiefenzählung, Seiten-CSS über die
// id-<pageid>-gescopten <style>-Blöcke).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PAGES = [
  { ref: 'leistungen/prozessanalyse-digitalisierung', name: 'LeistungenProzessanalyseView' },
  { ref: 'leistungen/schnittstellen-systemintegration', name: 'LeistungenSchnittstellenView' },
  { ref: 'leistungen/individualentwicklung', name: 'LeistungenIndividualentwicklungView' },
  { ref: 'leistungen/daten-reporting-automatisierung', name: 'LeistungenReportingView' },
  { ref: 'leistungen/betrieb-support-monitoring', name: 'LeistungenBetriebView' },
  { ref: 'leistungen/cafm-beratung-einfuehrung', name: 'LeistungenCafmBeratungView' },
  { ref: 'loesungen/sterilgutaufbereitung', name: 'LoesungenSterilgutView' },
  { ref: 'loesungen/individuelle-loesungen', name: 'LoesungenIndividuellView' },
  { ref: 'loesungen/dashboard-huddleboard', name: 'LoesungenHuddleboardView' },
  { ref: 'referenzen/klinik-schloss-mammern', name: 'ReferenzKlinikMammernView' },
  { ref: 'referenzen/spital-thurgau', name: 'ReferenzSpitalThurgauView' },
  { ref: 'nova-fm-module', name: 'NovaFmModuleView' },
  { ref: 'hsd-nova-fm-medizintechnik', name: 'NovaFmMedizintechnikView' },
]

// WordPress-Page-IDs → Routen (aus data-id der Export-Links)
const ID_TO_PATH = {
  341: '/', 461: '/', 43: '/ueber-leantris', 86: '/referenzen',
  368: '/impressum', 432: '/kontakt', 457: '/referenzen',
  469: '/cafm', 485: '/cafm', 613: '/leistungen', 616: '/loesungen',
  617: '/leistungen/prozessanalyse-digitalisierung',
  618: '/leistungen/schnittstellen-systemintegration',
  619: '/leistungen/individualentwicklung',
  620: '/leistungen/daten-reporting-automatisierung',
  621: '/leistungen/betrieb-support-monitoring',
  622: '/leistungen/cafm-beratung-einfuehrung',
  489: '/loesungen/sterilgutaufbereitung',
  638: '/loesungen/individuelle-loesungen',
  639: '/loesungen/dashboard-huddleboard',
  642: '/referenzen/klinik-schloss-mammern',
  643: '/referenzen/spital-thurgau',
  500: '/nova-fm-module',
  494: '/hsd-nova-fm-medizintechnik',
}

// Extrahiert <div id="..."> samt Inhalt per Tag-Tiefenzählung
function extractDiv(html, id) {
  const start = html.indexOf(`<div id="${id}"`)
  if (start === -1) return null
  const re = /<div\b|<\/div>/g
  re.lastIndex = start
  let depth = 0
  let m
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1
    if (depth === 0) return html.slice(start, m.index + 6)
  }
  return null
}

function transform(html) {
  html = html.replace(/<script[\s\S]*?<\/script>/g, '')
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/g, '')

  // Ninja-Forms-Spinner → eigene Formular-Komponente
  html = html.replace(
    /<div class="nf-loading-spinner"><\/div>/g,
    '<ContactForm variant="kontakt" />'
  )

  // Lazyload-Bilder → direkte src/srcset
  html = html.replace(/<img\b[^>]*>/g, (tag) => {
    const dataSrc = tag.match(/data-src="([^"]*)"/)?.[1]
    if (!dataSrc) return tag
    const dataSrcset = tag.match(/data-srcset="([^"]*)"/)?.[1]
    let t = tag
      .replace(/\s*src="data:[^"]*"/, '')
      .replace(/\s*data-src="[^"]*"/, '')
      .replace(/\s*data-srcset="[^"]*"/, '')
      .replace(/\s*sizes="[^"]*"/, '')
      .replace(/(class="[^"]*?)\s*lazyload\s*([^"]*")/, '$1 $2')
    const urls = dataSrcset
      ? [...new Set(dataSrcset.split(',').map((s) => s.trim().split(/\s+/)[0]))]
      : []
    let attrs = ` src="${dataSrc}"`
    if (urls.length > 1) attrs += ` srcset="${dataSrcset}" sizes="100vw"`
    t = t.replace(/^<img/, `<img${attrs}`)
    return t
  })

  // Bilder lokal aus dem Export laden (liegen unter public/wp-content)
  // Videos von 2021 liegen auf Prod-Novatrend → remote referenzieren (CLAUDE.md).
  // Die 2026er-Videos existieren auf Prod nicht (404) → lokal aus public/ ausliefern.
  html = html.replace(
    /src="\/wp-content\/uploads\/(2021\/[^"]+\.mp4)"/g,
    'src="https://leantris.ch/wp-content/uploads/$1"'
  )
  html = html.replace(
    /src="https:\/\/leantris\.ch\/wp-content\/uploads\/(2026\/[^"]+\.mp4)"/g,
    'src="/wp-content/uploads/$1"'
  )

  // Kaputte/absolute interne Links reparieren
  html = html.replace(/href="https:\/\/\/([a-z0-9-/]+)\/?"/g, 'href="/$1"')
  html = html.replace(/href="https:\/\/leantris\.ch\/staging\/([a-z0-9-/]+)\/?"/g, 'href="/$1"')
  html = html.replace(/href="https:\/\/leantris\.ch\/([a-z0-9-/]+)\/?"/g, 'href="/$1"')
  html = html.replace(/href="https:\/\/"/g, '')

  // Staging-Bug: Kachel "HSD Nova-FM" zeigt auf nicht existierende Seite
  html = html.replace(/href="\/loesungen\/cafm\/?"/g, 'href="/cafm"')

  // Tote Alt-Links der WP-Seiten auf existierende Routen umbiegen
  html = html.replace(/href="\/profil(#[a-z-]*)?"/g, 'href="/ueber-leantris"')
  html = html.replace(
    /href="\/hsd-nova-fm-macht-ihr-facility-management-leistungsfaehiger\/?"/g,
    'href="/cafm"'
  )

  // Leere hrefs mit data-id → Route
  html = html.replace(/<a\b[^>]*>/g, (tag) => {
    const href = tag.match(/href="([^"]*)"/)?.[1]
    const dataId = tag.match(/data-id="(\d+)"/)?.[1]
    if ((href === '' || href === undefined) && dataId && ID_TO_PATH[dataId]) {
      if (href === '') return tag.replace(/href=""/, `href="${ID_TO_PATH[dataId]}"`)
      return tag.replace(/^<a/, `<a href="${ID_TO_PATH[dataId]}"`)
    }
    return tag
  })

  // WP-Datenattribute der Links entfernen (Routing übernimmt Vue)
  html = html.replace(/\s*data-title="[^"]*"/g, '')
  html = html.replace(/\s*data-catid="[^"]*"/g, '')

  // Leere style-Attribute aufräumen
  html = html.replace(/\s*style="\s*"/g, '')

  return html.trim()
}

let allCss = '/* Automatisch generiert von scripts/build-subpages.mjs — Seiten-CSS der Unterseiten aus dem Simply-Static-Export */\n'
const routeInfo = []

for (const page of PAGES) {
  const file = join(root, 'reference', page.ref, 'index.html')
  const html = readFileSync(file, 'utf8')

  const pageId = html.match(/<body[^>]*data-id="(\d+)"/)?.[1]
  const slug = html.match(/<body[^>]*data-slug="([^"]+)"/)?.[1]
  const title = html
    .match(/<title>([\s\S]*?)<\/title>/)?.[1]
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|–/g, '–')
    .trim()

  // Grid-Markup (ältere Seiten haben kein separates Phone-Grid)
  const gridRaw = extractDiv(html, 'grid')
  if (!gridRaw) throw new Error(`Grid fehlt: ${page.ref}`)
  const grid = transform(gridRaw)
  const phoneRaw = extractDiv(html, 'custom-phone-grid')
  const phone = phoneRaw ? transform(phoneRaw) : ''

  // Seiten-CSS: alle <style>-Blöcke, die auf id-<pageId> gescoped sind.
  // Die grid-css-Blöcke im Export schliessen ihr öffnendes @media nicht —
  // fehlende schliessende Klammern ergänzen.
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .filter((css) => css.includes(`id-${pageId}`))
    .map((css) => {
      const open = (css.match(/\{/g) || []).length
      const close = (css.match(/\}/g) || []).length
      return open > close ? css + '}'.repeat(open - close) : css
    })
  allCss += `\n/* === ${page.ref} (id-${pageId}) === */\n${styles.join('\n')}\n`

  const needsForm = grid.includes('<ContactForm') || phone.includes('<ContactForm')
  const imports = ["import { usePageEffects } from '../composables/usePageEffects'"]
  if (needsForm) imports.push("import ContactForm from '../components/ContactForm.vue'")

  const vue = `<template>
  <div class="page-grids">
${grid.split('\n').map((l) => '    ' + l).join('\n')}
${phone.split('\n').map((l) => '    ' + l).join('\n')}
  </div>
</template>

<script setup>
${imports.join('\n')}

usePageEffects()
</script>
`
  const out = join(root, 'src', 'views', `${page.name}.vue`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, vue, 'utf8')
  routeInfo.push({ path: ID_TO_PATH[Number(pageId)], name: page.name, id: pageId, slug, title })
  console.log(`${page.name}.vue  (id=${pageId}, ${vue.length} bytes, form: ${needsForm})`)
}

writeFileSync(join(root, 'src', 'styles', 'grids-subpages.css'), allCss, 'utf8')
console.log(`grids-subpages.css (${allCss.length} bytes)`)
console.log('\nRouten-Snippet:')
for (const r of routeInfo) {
  console.log(
    `  { path: '${r.path}', name: '${r.slug}', component: () => import('../views/${r.name}.vue'), meta: { id: ${r.id}, slug: '${r.slug}', title: ${JSON.stringify(r.title)} } },`
  )
}

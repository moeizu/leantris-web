// Generiert die Vue-Views aus den extrahierten Simply-Static-HTML-Stücken.
// Quelle: analysis/pages/<slug>/{grid-clean.html, phone-grid-clean.html}
// Ziel:   src/views/<Name>View.vue
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PAGES = [
  { slug: 'home', name: 'HomeView' },
  { slug: 'leistungen', name: 'LeistungenView' },
  { slug: 'cafm', name: 'CafmView' },
  { slug: 'loesungen', name: 'LoesungenView' },
  { slug: 'referenzen', name: 'ReferenzenView' },
  { slug: 'ueber-leantris', name: 'UeberLeantrisView' },
  { slug: 'kontakt', name: 'KontaktView' },
  { slug: 'impressum', name: 'ImpressumView' },
]

// WordPress-Page-IDs → Routen (aus data-id der Export-Links)
const ID_TO_PATH = {
  341: '/', 461: '/', 43: '/ueber-leantris', 86: '/referenzen',
  368: '/impressum', 432: '/kontakt', 457: '/referenzen',
  469: '/cafm', 485: '/cafm', 613: '/leistungen', 616: '/loesungen',
}

function transform(html) {
  // Scripts/Noscripts entfernen (Ninja-Forms-Definitionen)
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

  // Videos: direkt von Novatrend referenzieren (CLAUDE.md)
  html = html.replace(
    /src="\/wp-content\/uploads\/([^"]+\.mp4)"/g,
    'src="https://leantris.ch/wp-content/uploads/$1"'
  )

  // Kaputte/absolute interne Links reparieren
  html = html.replace(/href="https:\/\/\/([a-z-]+)\/?"/g, 'href="/$1"')
  html = html.replace(/href="https:\/\/leantris\.ch\/([a-z-]+)\/?"/g, 'href="/$1"')
  html = html.replace(/href="https:\/\/"/g, '')

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

  // Buttons ohne href (z. B. „zu unseren Lösungen")
  html = html.replace(
    /<a class="laybutton1 laybutton">(\s*zu unseren Lösungen)/g,
    '<a class="laybutton1 laybutton" href="/loesungen">$1'
  )

  // WP-Datenattribute der Links entfernen (Routing übernimmt Vue)
  html = html.replace(/\s*data-title="[^"]*"/g, '')
  html = html.replace(/\s*data-catid="[^"]*"/g, '')

  // Leere style-Attribute aufräumen
  html = html.replace(/\s*style="\s*"/g, '')

  return html.trim()
}

for (const page of PAGES) {
  const dir = join(root, 'analysis', 'pages', page.slug)
  const grid = transform(readFileSync(join(dir, 'grid-clean.html'), 'utf8'))
  const phone = transform(readFileSync(join(dir, 'phone-grid-clean.html'), 'utf8'))
  const needsForm = grid.includes('<ContactForm') || phone.includes('<ContactForm')

  const imports = [
    "import { usePageEffects } from '../composables/usePageEffects'",
  ]
  if (needsForm) imports.push("import ContactForm from '../components/ContactForm.vue'")

  const vue = `<template>
  <div class="page-grids">
${grid
  .split('\n')
  .map((l) => '    ' + l)
  .join('\n')}
${phone
  .split('\n')
  .map((l) => '    ' + l)
  .join('\n')}
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
  console.log(`${page.name}.vue  (${vue.length} bytes, form: ${needsForm})`)
}

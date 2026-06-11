// Generiert public/sitemap.xml aus den Routen in src/router/index.js.
// Nutzung: node scripts/build-sitemap.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = 'https://leantris.ch'

const src = readFileSync(join(root, 'src', 'router', 'index.js'), 'utf8')

// Routen-Pfade extrahieren; Catch-All und noindex-Seiten (Impressum) auslassen
const paths = [...src.matchAll(/path: '(\/[^':]*)'/g)]
  .map((m) => m[1])
  .filter((p) => !p.includes(':') && p !== '/impressum')

const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p === '/' ? '/' : p}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p === '/' ? '1.0' : p.split('/').length > 2 ? '0.6' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf8')
console.log(`sitemap.xml: ${paths.length} URLs`)

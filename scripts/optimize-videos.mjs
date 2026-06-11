// Optimiert die <video>-Tags in allen Views: preload="metadata" statt "auto"
// und Poster-Standbild (public/wp-content/uploads/posters/<name>.jpg).
// Idempotent — nach jedem Lauf von build-subpages.mjs erneut ausführen.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const viewsDir = join(root, 'src', 'views')
const postersDir = join(root, 'public', 'wp-content', 'uploads', 'posters')

let changed = 0
for (const file of readdirSync(viewsDir).filter((f) => f.endsWith('.vue'))) {
  const path = join(viewsDir, file)
  let html = readFileSync(path, 'utf8')
  const before = html

  // Pro <video>…<source>: poster aus dem Quell-Dateinamen ableiten
  html = html.replace(
    /<video\b([^>]*)>(\s*<source src="([^"]+\.mp4)")/g,
    (m, attrs, sourcePart, src) => {
      let a = attrs.replace(/preload="auto"/, 'preload="metadata"')
      const poster = `/wp-content/uploads/posters/${basename(src, '.mp4')}.jpg`
      if (!/poster=/.test(a) && existsSync(join(postersDir, basename(src, '.mp4') + '.jpg'))) {
        a = ` poster="${poster}"` + a
      }
      return `<video${a}>${sourcePart}`
    }
  )

  if (html !== before) {
    writeFileSync(path, html, 'utf8')
    changed++
    console.log(`optimiert: ${file}`)
  }
}
console.log(`${changed} Dateien angepasst`)

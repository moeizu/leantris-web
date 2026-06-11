/*
Extract user-visible strings from gridder TSX components and (optionally)
auto-wrap them in `layT('text', 'key')` calls so they participate in the
translation system.

Two modes:
  - dry-run (default): writes a report of all candidate strings to
    /tmp/translation_candidates.json. Nothing in the codebase changes.
    Review the report, optionally edit / mark entries to skip, then re-run
    with --apply.
  - --apply: rewrites the TSX files in place, wrapping each candidate with
    `layT(...)`. Uses a snapshot of the current dry-run report so you can
    suppress entries by setting `"skip": true` on them in the JSON. After
    rewriting, run `node lay/translations/sync_translations.js` (or save
    any file under gulp watch) — sync routes the new gridder/tsx keys into
    `lay/translations/gridder/<locale>.json` automatically.

What counts as a candidate:
  - JSX text nodes — text that lives directly between JSX tags
    (e.g. `<button>Save</button>` → "Save").
  - String-literal values of these JSX attributes:
      placeholder, title, alt, aria-label, aria-description, label
    Anything else (className, id, type, name, key, ref, style, data-*,
    htmlFor, value, defaultValue, …) is left alone — those are usually
    structural / not user-visible.

What gets skipped:
  - Pure whitespace / pure punctuation / digits-only strings.
  - Strings shorter than 2 chars (single glyphs like `×`, `>`).
  - Strings starting with `#`, `.`, `<`, `{` — probably code / CSS / JSX.
  - JSX text that's already wrapped with `layT(`.
  - Attributes whose value is a JSX expression (anything in `{…}`) — only
    plain string literals are touched.

Key generation:
  - Slug from text: lowercased, non-alphanumeric → `_`, collapsed repeats,
    truncated to ~60 chars.
  - Filename namespace: `<component_basename>_<slug>`
    e.g. `LinkModal.tsx` + "Save Changes" → `linkmodal_save_changes`.
  - Collisions get `_2`, `_3` suffixed.

Run:
  node lay/translations/extract_gridder_translations.js          # dry-run
  node lay/translations/extract_gridder_translations.js --apply  # write
*/

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const REPO_ROOT = path.join(__dirname, '..', '..')
const GRIDDER_TSX_DIR = path.join(REPO_ROOT, 'gridder', 'tsx')
// In-repo report so it's easy to open in any editor / browse next to the
// source. Add to .gitignore if you don't want to commit it.
const REPORT_PATH = path.join(__dirname, 'translation_candidates.json')

const TRANSLATABLE_ATTRS = new Set(['placeholder', 'title', 'alt', 'aria-label', 'aria-description', 'label'])
const MAX_KEY_SLUG_LEN = 60

const isApply = process.argv.includes('--apply')

// --- file walk ----------------------------------------------------------

function walk(dir, files = []) {
	if (!fs.existsSync(dir)) return files
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			walk(fp, files)
		} else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
			files.push(fp)
		}
	}
	return files
}

// --- candidate filters --------------------------------------------------

// Strings that are units/symbols/labels which read the same in every
// language ("px" stays "px", "rgb" stays "rgb"). Skip them so they don't
// pollute the key set with hundreds of `*_px` entries.
const SKIP_EXACT = new Set([
	'px', 'em', 'rem', 'vh', 'vw', 'svh', 'lvh', 'dvh', 'svw', 'lvw', 'dvw',
	'deg', 'ms', 'fr', 'ch',
	'rgb', 'rgba', 'hex', 'hsl', 'hsla', 'url',
	'css', 'js', 'json', 'html', 'svg', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm',
	'id', 'href', 'src',
	'on', 'off', // very ambiguous — skip; can be added back manually if needed
	'x', 'y', 'z', 'w', 'h',
	'%', '...', '…', '–', '—',
])

function shouldSkipText(raw) {
	if (typeof raw !== 'string') return true
	const text = raw.trim()
	if (text.length < 2) return true
	// pure whitespace / digits / punctuation
	if (!/[A-Za-z]/.test(text)) return true
	// starts with code-ish leader
	const head = text.charAt(0)
	if (head === '#' || head === '.' || head === '<' || head === '{') return true
	// esbuild-ifdef compiler directives — they live as JSX text inside
	// conditionally-rendered blocks. Never translate.
	if (text.indexOf('///') === 0 || text.indexOf('// #') === 0) return true
	if (/^\/\*\*?/.test(text) || text.indexOf('*/') !== -1) return true
	// already wrapped (defensive — shouldn't reach here, but)
	if (text.indexOf('layT(') !== -1) return true
	// known untranslatable units/symbols
	if (SKIP_EXACT.has(text.toLowerCase())) return true
	// number + unit ("12px", "0.5em") — never translated
	if (/^-?\d+(\.\d+)?(px|em|rem|vh|vw|deg|ms|fr|s)$/i.test(text)) return true
	return false
}

function slugFor(text) {
	let slug = text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.replace(/_+/g, '_')
	if (slug.length > MAX_KEY_SLUG_LEN) slug = slug.slice(0, MAX_KEY_SLUG_LEN).replace(/_+$/, '')
	return slug || 'text'
}

function fileNamespace(filePath) {
	const base = path.basename(filePath, path.extname(filePath))
	return base
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/[^A-Za-z0-9]+/g, '_')
		.toLowerCase()
}

// --- AST walk -----------------------------------------------------------

function findCandidatesInFile(filePath, source) {
	const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
	const candidates = []

	function visit(node) {
		// JSX text node — `<tag>some text</tag>`
		if (node.kind === ts.SyntaxKind.JsxText) {
			// Use the source span — `node.text` includes leading/trailing whitespace
				// that lives OUTSIDE [getStart, getEnd) on JsxText nodes, so
				// `start + node.text.length` overshoots and corrupts the closing tag's `<`.
				const __end = node.getEnd()
				const __start_for_span = node.getStart(sf)
				const raw = sf.text.slice(__start_for_span, __end)
			const trimmed = raw.trim()
			if (!shouldSkipText(trimmed)) {
				const start = node.getStart(sf)
				const lineCol = sf.getLineAndCharacterOfPosition(start)
				// Compute the offset of the trimmed text inside the raw chunk
				// so we replace exactly that span and keep surrounding whitespace.
				const leadingWs = raw.length - raw.trimStart().length
				const trailingWs = raw.length - raw.trimEnd().length
				candidates.push({
					kind: 'jsxText',
					text: trimmed,
					rawStart: start + leadingWs,
					rawEnd: __end - trailingWs,
					line: lineCol.line + 1,
					col: lineCol.character + 1,
				})
			}
		}

		// JSX attribute — `placeholder="Search..."`
		if (node.kind === ts.SyntaxKind.JsxAttribute) {
			const attr = node
			const name = attr.name && attr.name.getText(sf)
			if (TRANSLATABLE_ATTRS.has(name) && attr.initializer) {
				if (attr.initializer.kind === ts.SyntaxKind.StringLiteral) {
					const lit = attr.initializer
					const text = lit.text
					if (!shouldSkipText(text)) {
						const start = lit.getStart(sf)
						const end = lit.getEnd()
						const lineCol = sf.getLineAndCharacterOfPosition(start)
						candidates.push({
							kind: 'jsxAttr',
							attrName: name,
							text: text,
							rawStart: start, // includes opening quote
							rawEnd: end,     // includes closing quote
							line: lineCol.line + 1,
							col: lineCol.character + 1,
						})
					}
				}
			}
		}

		ts.forEachChild(node, visit)
	}

	visit(sf)
	return candidates
}

// --- report (dry-run) ---------------------------------------------------

function buildReport(allCandidates) {
	// Assign keys with collision avoidance, scoped per-file namespace.
	const usedKeys = new Set()
	for (const file of Object.keys(allCandidates)) {
		const ns = fileNamespace(file)
		const seenInFile = {}
		for (const c of allCandidates[file]) {
			const baseSlug = slugFor(c.text)
			let key = ns + '_' + baseSlug
			if (seenInFile[c.text]) {
				// Same text repeated in the file → reuse the same key.
				c.key = seenInFile[c.text]
				continue
			}
			let n = 2
			while (usedKeys.has(key)) {
				key = ns + '_' + baseSlug + '_' + n
				n++
			}
			usedKeys.add(key)
			seenInFile[c.text] = key
			c.key = key
		}
	}
	return allCandidates
}

function writeReport(report) {
	const summary = {
		generatedAt: new Date().toISOString(),
		mode: 'dry-run',
		fileCount: Object.keys(report).length,
		candidateCount: Object.values(report).reduce((a, arr) => a + arr.length, 0),
		notes: [
			"Review entries; set { skip: true } on any candidate that should NOT be wrapped.",
			"Edit `key` if you want a different key name.",
			"Re-run with --apply to write the layT() wrappers into the source files.",
		],
		files: report,
	}
	fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2))
	return summary
}

// --- apply (rewrite files) ----------------------------------------------

function escapeJsString(s) {
	return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

function applyToFile(filePath, candidates, source) {
	// Sort by rawStart descending so each splice doesn't shift the offsets
	// of the next.
	const sorted = candidates.slice().sort((a, b) => b.rawStart - a.rawStart)
	let updated = source
	let changes = 0
	for (const c of sorted) {
		if (c.skip) continue
		const replacement = c.kind === 'jsxText'
			? "{layT('" + escapeJsString(c.text) + "', '" + c.key + "')}"
			: "{layT('" + escapeJsString(c.text) + "', '" + c.key + "')}"
		updated = updated.slice(0, c.rawStart) + replacement + updated.slice(c.rawEnd)
		changes++
	}
	if (changes > 0) {
		fs.writeFileSync(filePath, updated)
	}
	return changes
}

// --- main ---------------------------------------------------------------

function run() {
	const files = walk(GRIDDER_TSX_DIR)
	const allCandidates = {}

	for (const f of files) {
		const src = fs.readFileSync(f, 'utf8')
		const cands = findCandidatesInFile(f, src)
		if (cands.length > 0) {
			allCandidates[path.relative(REPO_ROOT, f)] = cands
		}
	}

	const report = buildReport(allCandidates)

	if (!isApply) {
		const summary = writeReport(report)
		console.log('[extract_gridder_translations] dry-run')
		console.log(`  files with candidates: ${summary.fileCount}`)
		console.log(`  total candidates:      ${summary.candidateCount}`)
		console.log(`  report written to:     ${REPORT_PATH}`)
		console.log('  next: review the report, then re-run with --apply')
		return
	}

	// --apply mode — re-read the report from disk so manual edits / skips
	// are honored.
	let reviewed
	try {
		reviewed = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
	} catch (e) {
		console.error('[extract_gridder_translations] --apply needs a report at ' + REPORT_PATH + '. Run without --apply first.')
		process.exit(1)
	}

	let totalChanges = 0
	for (const relPath of Object.keys(reviewed.files)) {
		const filePath = path.join(REPO_ROOT, relPath)
		if (!fs.existsSync(filePath)) {
			console.warn('  missing file (skipped):', relPath)
			continue
		}
		const src = fs.readFileSync(filePath, 'utf8')
		const changes = applyToFile(filePath, reviewed.files[relPath], src)
		if (changes > 0) {
			console.log(`  rewrote ${relPath}: +${changes}`)
			totalChanges += changes
		}
	}
	console.log(`[extract_gridder_translations] apply done — ${totalChanges} layT() wrappers inserted across ${Object.keys(reviewed.files).length} files`)
	console.log('  next: run gulp watch (or `node lay/translations/sync_translations.js`) to sync new keys into en.json + locale JSONs')
}

if (require.main === module) {
	run()
}

module.exports = { run }

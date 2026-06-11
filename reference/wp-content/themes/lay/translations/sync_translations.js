/*
Translation sync script.

Walks the codebase for `lay_t('text', 'key')` (PHP) and `layT('text', 'key')`
(JS/TS) calls, then routes each (text, key) pair into the right translation
JSON file:

  - Keys found in `gridder/tsx/**` (the gridder React app — admin client-side
    UI strings) → lay/translations/gridder/<locale>.json
  - Everything else (PHP `lay_t()` from admin pages, customizer, fontmanager,
    etc.) → lay/translations/<locale>.json

Why split: gridder/* JSONs are only fetched on admin pages where the gridder
runs, while the main JSONs cover the broader admin UI. The frontend (public
website) never loads either file. Splitting keeps each payload focused.

Non-destructive guarantees:
  - Existing translations in locale JSONs are NEVER overwritten.
  - New keys arrive as empty strings in locale JSONs (so `layT()` /
    `lay_t()` fall back to the inline English text until someone fills
    them in).
  - Keys that exist in JSON but are no longer found in code are KEPT
    (orphans) — protects strings used in less obvious code paths.
  - en.json's text for a key gets refreshed from code IF the developer
    edited the inline string in source — code is the source of truth.

Run via `node lay/translations/sync_translations.js` or via the gulp watcher
hooked up in gulpfile.js/laytheme.js.
*/

const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const translationsDir = path.join(rootDir, 'translations')
const gridderTranslationsDir = path.join(translationsDir, 'gridder')
const keysPath = path.join(translationsDir, 'keys.json')
const enPath = path.join(translationsDir, 'en.json')
const gridderKeysPath = path.join(gridderTranslationsDir, 'keys.json')
const gridderEnPath = path.join(gridderTranslationsDir, 'en.json')

// Repo root (one level up from `lay/`) so we can scan the gridder TSX tree
// which lives outside of `lay/`.
const repoRoot = path.join(rootDir, '..')

// Skip directories that don't contain lay_t / layT calls (or contain
// vendor copies that shouldn't be scanned for our keys).
const skipDirs = new Set([
	'assets/plugins',
	'kernl-update-checker',
	'frontend',
	'woocommerce',
	'woocommerce_integration',
	'languages',
	'translations',
])

const fileExtensions = new Set(['.php', '.js', '.ts', '.tsx'])

// Match `lay_t('text', 'key')` and `lay_t("text", "key")`. Tolerates escaped
// quotes inside the strings via the `(?:\\.|...)` pattern.
const layTRegex = /\blay_t\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*\)/g
const jsLayTRegex = /\blayT\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*\)/g

function shouldSkipDir(relPath) {
	return Array.from(skipDirs).some((dir) => relPath.startsWith(dir))
}

function walk(dir, files = [], scopeRoot) {
	if (!fs.existsSync(dir)) return files
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name)
		const relPath = path.relative(scopeRoot || rootDir, fullPath).replace(/\\/g, '/')
		if (entry.isDirectory()) {
			if (shouldSkipDir(relPath)) continue
			walk(fullPath, files, scopeRoot)
		} else if (entry.isFile() && fileExtensions.has(path.extname(entry.name))) {
			files.push(fullPath)
		}
	}
	return files
}

// A file path counts as "gridder" if it lives anywhere inside `gridder/tsx`
// (the gridder React app). Those keys are routed to the gridder/<locale>.json
// bundle which is loaded only on admin pages where the gridder is mounted.
function isGridderPath(filePath) {
	const norm = filePath.replace(/\\/g, '/')
	return norm.includes('/gridder/tsx/')
}

function readJson(filePath, fallback) {
	if (!fs.existsSync(filePath)) return fallback
	const raw = fs.readFileSync(filePath, 'utf8')
	try {
		return JSON.parse(raw)
	} catch (e) {
		console.warn(`[sync_translations] failed to parse ${filePath} — leaving untouched`)
		return fallback
	}
}

function writeJsonIfChanged(filePath, data) {
	const next = JSON.stringify(data, null, '\t') + '\n'
	if (fs.existsSync(filePath)) {
		const prev = fs.readFileSync(filePath, 'utf8')
		if (prev === next) return false
	}
	fs.writeFileSync(filePath, next)
	return true
}

function unescapeSourceString(s) {
	// Mirror the small subset of escapes typical PHP/JS string literals use.
	return s.replace(/\\(.)/g, '$1')
}

function collectKeysFromCode() {
	// Walk both the lay/* tree (PHP + frontend JS) and the gridder/tsx tree
	// (admin React app). Each (text, key) pair is tagged with whether it's a
	// gridder-scoped key based on its source path.
	const files = walk(rootDir, [])
	const gridderFiles = walk(path.join(repoRoot, 'gridder', 'tsx'), [], repoRoot)

	const main = {}
	const gridder = {}
	const consume = (file) => {
		const src = fs.readFileSync(file, 'utf8')
		const target = isGridderPath(file) ? gridder : main
		let m
		layTRegex.lastIndex = 0
		while ((m = layTRegex.exec(src)) !== null) {
			const text = unescapeSourceString(m[2])
			const key = unescapeSourceString(m[4])
			if (key) target[key] = text
		}
		jsLayTRegex.lastIndex = 0
		while ((m = jsLayTRegex.exec(src)) !== null) {
			const text = unescapeSourceString(m[2])
			const key = unescapeSourceString(m[4])
			if (key) target[key] = text
		}
	}
	for (const f of files) consume(f)
	for (const f of gridderFiles) consume(f)
	return { main, gridder }
}

// Detect WordPress-style locale filenames: `en`, `de_DE`, `fr_FR`, `zh_CN`,
// `pt_BR`, etc. Anything else (e.g. `translation_candidates.json`) is left
// alone so we don't accidentally treat helper / report files as a locale.
const LOCALE_FILENAME_REGEX = /^[a-z]{2}(_[A-Z]{2})?$/

function listLocaleJsonFiles(dir) {
	if (!fs.existsSync(dir)) return []
	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => path.basename(f, '.json'))
		.filter((name) => name !== 'en' && name !== 'keys' && LOCALE_FILENAME_REGEX.test(name))
}

// Apply one collected key set to its target {en, keys, locales} JSON files.
// Used twice — once for the main set, once for the gridder set.
function syncOne(label, collected, dirPath, enFilePath, keysFilePath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true })
	}

	const existingEn = readJson(enFilePath, {})
	const mergedEn = Object.assign({}, existingEn, collected)
	const enChanged = writeJsonIfChanged(enFilePath, sortObject(mergedEn))

	const allKeys = Object.keys(mergedEn).sort()
	const keysChanged = writeJsonIfChanged(keysFilePath, allKeys)

	const localeChanges = []
	for (const loc of listLocaleJsonFiles(dirPath)) {
		const lp = path.join(dirPath, `${loc}.json`)
		const existing = readJson(lp, {})
		let added = 0
		for (const key of allKeys) {
			if (!(key in existing)) {
				existing[key] = ''
				added++
			}
		}
		if (writeJsonIfChanged(lp, sortObject(existing))) {
			localeChanges.push(`${loc}: +${added}`)
		}
	}

	const parts = []
	if (enChanged) parts.push(`en.json (${Object.keys(collected).length} keys from code)`)
	if (keysChanged) parts.push(`keys.json (${allKeys.length} total)`)
	if (localeChanges.length) parts.push(`locales: ${localeChanges.join(', ')}`)
	if (parts.length) {
		console.log(`[sync_translations][${label}] ` + parts.join('  |  '))
	}
}

function syncTranslations() {
	const { main, gridder } = collectKeysFromCode()
	syncOne('main',    main,    translationsDir,        enPath,        keysPath)
	syncOne('gridder', gridder, gridderTranslationsDir, gridderEnPath, gridderKeysPath)
}

function sortObject(obj) {
	const out = {}
	for (const k of Object.keys(obj).sort()) out[k] = obj[k]
	return out
}

if (require.main === module) {
	syncTranslations()
}

module.exports = { syncTranslations }

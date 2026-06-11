/*
Lay translations runtime.

Loads up to two locale JSON files in parallel from static URLs (one for
the main PHP-side keys shared across all admin pages, one for the gridder
React app's client-side keys). Both bootstraps come from translator.php as
inline globals — translator.js fetches the JSON, merges into
`window.layTranslations`, and caches each file separately in localStorage
keyed by theme version. Subsequent admin pages read from cache, no fetch.

No frontend enqueue: translator.php only hooks `admin_enqueue_scripts`, so
public website visitors never load this script or the JSONs.

Globals:
  - window.layT(text, key)      — sync lookup, returns `text` until loaded
                                  or when key is absent (English fallback).
  - window.layTranslations      — { key: translation, … }
  - window.layTranslationsReady — Promise that resolves once both files
                                  are loaded (or have failed). Consumers
                                  that need translated strings during their
                                  first render should `await` this before
                                  mounting (e.g. gridderIndex.tsx does).
*/

;(function () {
	'use strict'

	if (!window.layTranslations) {
		window.layTranslations = {}
	}

	window.layT = function (text, key) {
		if (!key) return text
		var t = window.layTranslations
		if (t && Object.prototype.hasOwnProperty.call(t, key) && t[key] !== '') {
			return t[key]
		}
		return text
	}

	var bootstraps = []
	if (window.layTranslationsBootstrap && window.layTranslationsBootstrap.url) {
		bootstraps.push({ name: 'main', boot: window.layTranslationsBootstrap })
	}
	if (window.layGridderTranslationsBootstrap && window.layGridderTranslationsBootstrap.url) {
		bootstraps.push({ name: 'gridder', boot: window.layGridderTranslationsBootstrap })
	}

	if (bootstraps.length === 0) {
		// No bootstrap present (e.g. on a non-admin page). Resolve so
		// awaiters don't hang.
		window.layTranslationsReady = Promise.resolve(window.layTranslations)
		return
	}

	var cacheStorageOk = (function () {
		try {
			var probe = '__lay_ls_probe__'
			localStorage.setItem(probe, '1')
			localStorage.removeItem(probe)
			return true
		} catch (_) {
			return false
		}
	})()

	function cacheKey(name, boot) {
		return 'lay_translations_' + name + '_' + boot.locale + '_' + boot.version
	}

	function pruneOldVersions(name, boot) {
		// Drop stale `lay_translations_<name>_<locale>_*` entries from
		// previous theme versions. Each bootstrap is pruned independently.
		if (!cacheStorageOk) return
		try {
			var prefix = 'lay_translations_' + name + '_' + boot.locale + '_'
			var keep = cacheKey(name, boot)
			for (var i = localStorage.length - 1; i >= 0; i--) {
				var k = localStorage.key(i)
				if (k && k.indexOf(prefix) === 0 && k !== keep) {
					localStorage.removeItem(k)
				}
			}
		} catch (_) {}
	}

	function mergeIn(data) {
		if (!data || typeof data !== 'object') return
		for (var k in data) {
			if (Object.prototype.hasOwnProperty.call(data, k) && data[k] !== '') {
				window.layTranslations[k] = data[k]
			}
		}
	}

	function loadOne(name, boot) {
		var key = cacheKey(name, boot)
		// Dev mode (WP_DEBUG / SCRIPT_DEBUG, or `lay_translations_no_cache` filter):
		// always fetch, never read or write localStorage. Lets theme-side string
		// edits appear immediately without waiting for a theme version bump.
		// Also evicts any stale entry from a prior non-dev session.
		var useCache = cacheStorageOk && !boot.noCache
		if (boot.noCache && cacheStorageOk) {
			try { localStorage.removeItem(key) } catch (_) {}
		}

		// 1. localStorage hit → instant, no network.
		if (useCache) {
			try {
				var cached = localStorage.getItem(key)
				if (cached) {
					mergeIn(JSON.parse(cached))
					return Promise.resolve()
				}
			} catch (_) {
				try { localStorage.removeItem(key) } catch (__) {}
			}
		}

		// 2. Fetch the JSON.
		return fetch(boot.url, { credentials: 'same-origin' })
			.then(function (res) {
				if (!res.ok) throw new Error(name + ' translations fetch ' + res.status)
				return res.json()
			})
			.then(function (data) {
				mergeIn(data)
				if (useCache) {
					try {
						localStorage.setItem(key, JSON.stringify(data))
						pruneOldVersions(name, boot)
					} catch (_) {
						// quota etc — non-fatal
					}
				}
			})
			.catch(function (err) {
				if (typeof console !== 'undefined' && console.warn) {
					console.warn('[lay-translations] could not load ' + name + ':', err)
				}
				// Swallow — let the other bootstrap (if any) still resolve.
			})
	}

	window.layTranslationsReady = Promise.all(
		bootstraps.map(function (b) { return loadOne(b.name, b.boot) })
	).then(function () { return window.layTranslations })
})()

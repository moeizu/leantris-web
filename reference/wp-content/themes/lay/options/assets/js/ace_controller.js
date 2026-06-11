var ace_controller = (function () {
	var jqueryMap = {
		$customHeadTextarea: null,
		$customCSSTextarea: null,
		$customDesktopCSSTextarea: null,
		$customMobileCSSTextarea: null,
		$customHTMLTopTextarea: null,
		$customHTMLBottomTextarea: null,
	}

	var editorInstances = {}
	var globalFontSize = 16

	/**
	 * Ensure Cmd/Ctrl+F opens Ace search (browser search won't find inside Ace)
	 */
	var bindFindShortcut = function (editor) {
		if (!editor || !editor.commands) return
		editor.commands.addCommand({
			name: 'aceFind',
			bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
			exec: function (ed) {
				ed.execCommand('find')
			},
			readOnly: true,
		})
	}

	/**
	 * Get global font size from localStorage or return default
	 */
	var getGlobalFontSize = function () {
		var stored = localStorage.getItem('ace-fontsize-global')
		return stored ? parseInt(stored, 10) : 16
	}

	/**
	 * Save global font size to localStorage
	 */
	var setGlobalFontSize = function (size) {
		globalFontSize = size
		localStorage.setItem('ace-fontsize-global', size.toString())
	}

	/**
	 * Update all editors font size and displays
	 */
	var updateAllEditorsFontSize = function (newSize) {
		setGlobalFontSize(newSize)

		for (var editorId in editorInstances) {
			if (!editorInstances.hasOwnProperty(editorId)) continue
			var editor = editorInstances[editorId]
			if (!editor) continue

			var editorElement = document.getElementById(editorId)
			if (editorElement) {
				editorElement.style.fontSize = newSize + 'px'
				editor.setFontSize(newSize)
			}
		}

		// Update displays in all headers (normal and fullscreen)
		jQuery('.lay-ace-fontsize-display').text(newSize + 'px')
	}

	/**
	 * Initialize font size controls for an editor header
	 */
	var initFontSizeControls = function (editorId) {
		var $header = jQuery('#' + editorId)
			.closest('.lay-ace-editor-wrap')
			.find('.lay-ace-editor-header')
		var $actions = $header.find('.lay-ace-header-actions')
		if ($actions.length === 0) {
			return // Actions container missing
		}
		if ($actions.find('.lay-ace-fontsize-controls').length > 0) {
			return // Already initialized
		}

		var currentSize = globalFontSize
		var minusSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/></svg>'
		var plusSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>'

		var $controls = jQuery('<div class="lay-ace-fontsize-controls">' + '<button type="button" class="lay-ace-fontsize-button" data-action="decrease" title="Decrease font size">' + minusSvg + '</button>' + '<span class="lay-ace-fontsize-display">' + currentSize + 'px</span>' + '<button type="button" class="lay-ace-fontsize-button" data-action="increase" title="Increase font size">' + plusSvg + '</button>' + '</div>')

		// Place font size controls before fullscreen toggle inside actions
		$actions.prepend($controls)

		var $decreaseBtn = $controls.find('[data-action="decrease"]')
		var $increaseBtn = $controls.find('[data-action="increase"]')

		$decreaseBtn.on('click', function (e) {
			e.preventDefault()
			var newSize = Math.max(10, globalFontSize - 2) // Min 10px
			updateAllEditorsFontSize(newSize)
		})

		$increaseBtn.on('click', function (e) {
			e.preventDefault()
			var newSize = Math.min(24, globalFontSize + 2) // Max 24px
			updateAllEditorsFontSize(newSize)
		})
	}

	/**
	 * Initialize resize handler for an editor
	 */
	var initResizeHandler = function (editorId) {
		var editorElement = document.getElementById(editorId)
		if (!editorElement) return

		var editor = editorInstances[editorId]
		if (!editor) return

		// Use ResizeObserver for better performance
		if (window.ResizeObserver) {
			var resizeObserver = new ResizeObserver(function (entries) {
				for (var i = 0; i < entries.length; i++) {
					editor.resize()
				}
			})
			resizeObserver.observe(editorElement)
		} else {
			// Fallback for older browsers
			jQuery(editorElement).on('resize', function () {
				editor.resize()
			})
		}
	}

	var initCustomHTMLTopEditor = function () {
		var editorId = 'lay-custom-htmltop-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/html')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customHTMLTopTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customHTMLTopTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var initCustomHTMLBottomEditor = function () {
		var editorId = 'lay-custom-htmlbottom-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/html')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customHTMLBottomTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customHTMLBottomTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var initCustomHeadEditor = function () {
		var editorId = 'lay-custom-head-content-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/html')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customHeadTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customHeadTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var initCustomCSSEditor = function () {
		var editorId = 'lay-custom-css-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/css')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customCSSTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customCSSTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var initCustomDesktopCSSEditor = function () {
		var editorId = 'lay-custom-css-desktop-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/css')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customDesktopCSSTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customDesktopCSSTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var initCustomMobileCSSEditor = function () {
		var editorId = 'lay-custom-css-mobile-editor'
		var editor = ace.edit(editorId)
		editorInstances[editorId] = editor
		editor.setTheme('ace/theme/one_dark')
		editor.getSession().setMode('ace/mode/css')
		editor.setShowPrintMargin(false)

		document.getElementById(editorId).style.fontSize = globalFontSize + 'px'
		editor.setFontSize(globalFontSize)

		var val = jqueryMap.$customMobileCSSTextarea.val()
		editor.setValue(val)
		editor.clearSelection()

		editor.getSession().on('change', function () {
			val = editor.getValue()
			jqueryMap.$customMobileCSSTextarea.val(val)
		})

		bindFindShortcut(editor)
		initFontSizeControls(editorId)
		initResizeHandler(editorId)
	}

	var setJqueryMap = function () {
		jqueryMap.$customHeadTextarea = jQuery('#misc_options_analytics_code')
		jqueryMap.$customCSSTextarea = jQuery('#custom_css')
		jqueryMap.$customDesktopCSSTextarea = jQuery('#misc_options_desktop_css')
		jqueryMap.$customMobileCSSTextarea = jQuery('#misc_options_mobile_css')
		jqueryMap.$customHTMLTopTextarea = jQuery('#misc_options_custom_htmltop')
		jqueryMap.$customHTMLBottomTextarea = jQuery('#misc_options_custom_htmlbottom')
	}

	var initFullscreenToggles = function () {
		jQuery('.lay-ace-fullscreen-toggle').on('click', function (e) {
			e.preventDefault()
			var editorId = jQuery(this).data('editor')
			var $wrap = jQuery(this).closest('.lay-ace-editor-wrap')

			// Toggle fullscreen class
			$wrap.toggleClass('fullscreen')
			jQuery('body').toggleClass('lay-fullscreen')

			// Resize the Ace editor to fit new container size
			var editor = editorInstances[editorId] || ace.edit(editorId)
			setTimeout(function () {
				editor.resize()
			}, 10)

			// Handle ESC key to exit fullscreen
			if ($wrap.hasClass('fullscreen')) {
				jQuery(document).on('keydown.fullscreen', function (e) {
					if (e.key === 'Escape') {
						$wrap.removeClass('fullscreen')
						jQuery('body').removeClass('lay-fullscreen')
						editor.resize()
						jQuery(document).off('keydown.fullscreen')
					}
				})
			} else {
				jQuery(document).off('keydown.fullscreen')
			}
		})
	}

	var initModule = function () {
		globalFontSize = getGlobalFontSize()
		setJqueryMap()
		initCustomHeadEditor()
		initCustomCSSEditor()
		initCustomDesktopCSSEditor()
		initCustomMobileCSSEditor()
		initCustomHTMLTopEditor()
		initCustomHTMLBottomEditor()
		initFullscreenToggles()
	}

	return {
		initModule: initModule,
	}
})()

jQuery(document).ready(function () {
	ace_controller.initModule()
})

/* global tinymce */
tinymce.PluginManager.add('layscrolltotop', function (editor) {
	editor.addCommand('layscrolltotop', function () {
		layscrolltotop_controller.doClick(editor.id)
	})

	editor.onNodeChange.add(function (ed, cm, node) {
		var disabled = true
		var selection = this.selection.getContent()
		if (selection.trim() !== '') {
			disabled = false
		}
		cm.setDisabled('layscrolltotop', disabled)
	})

	editor.addButton('layscrolltotop', {
		icon: 'layscrolltotop',
		tooltip: 'Make selection a "Scroll to Top" link',
		cmd: 'layscrolltotop',
		stateSelector: 'a.scrolltotop',
	})
})

var layscrolltotop_controller = (function () {
	var editor

	var doClick = function (editorId) {
		var ed

		if (editorId) {
			window.wpActiveEditor = editorId
		}

		if (!window.wpActiveEditor) {
			return
		}

		if (typeof tinymce !== 'undefined') {
			ed = tinymce.get(window.wpActiveEditor)
			if (ed && !ed.isHidden()) {
				editor = ed
			} else {
				editor = null
			}
		}

		if (editor) {
			editor.focus()
			mceUpdate()
		}
	}

	var getLink = function () {
		return editor.dom.getParent(editor.selection.getNode(), 'a')
	}

	var mceUpdate = function () {
		editor.focus()

		if (tinymce.isIE) {
			editor.selection.moveToBookmark(editor.windowManager.bookmark)
		}

		var attrs = {
			href: '#',
			class: 'scrolltotop',
		}

		var link = getLink()

		if (link && editor.dom.hasClass(link, 'scrolltotop')) {
			// already a scroll-to-top link: ensure attributes
			editor.dom.setAttribs(link, attrs)
		} else {
			// wrap selection in scroll-to-top link
			editor.execCommand('mceInsertLink', false, attrs)
		}
	}

	return {
		doClick: doClick,
	}
})()

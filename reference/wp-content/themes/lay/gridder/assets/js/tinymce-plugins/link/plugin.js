/* global tinymce */

tinymce.PluginManager.add('laylink', function (editor) {
	editor.addCommand('WP_LayLink', function () {
		laylink_tinymce_button_controller.doClick(editor.id)
	})

	// http://stackoverflow.com/questions/11631272/how-to-enable-disable-custom-button-on-selection-change-with-tinymce
	editor.onNodeChange.add(function (ed, cm, node) {
		var disabled = true
		var selection_content = this.selection.getContent()
		var node = this.selection.getNode()

		if (node.nodeName.toLowerCase() == 'a') {
			disabled = false
		}
		if (selection_content.trim() != '') {
			disabled = false
		}
		cm.setDisabled('laylink', disabled)
	})

	editor.addButton('laylink', {
		icon: 'link',
		tooltip: 'Insert/edit link',
		cmd: 'WP_LayLink',
		stateSelector: 'a',
	})

	editor.addButton('layunlink', {
		icon: 'unlink',
		tooltip: 'Remove link',
		cmd: 'unlink',
	})

	editor.addMenuItem('laylink', {
		icon: 'link',
		text: 'Insert/edit link',
		cmd: 'WP_LayLink',
		stateSelector: 'a',
		context: 'insert',
		prependToContext: true,
	})
})

var laylink_tinymce_button_controller = (function () {
	var doClick = function (editorId) {
		var ed
		// console.log(editorId)

		if (editorId) {
			window.wpActiveEditor = editorId
		}

		if (!window.wpActiveEditor) {
			return
		}

		textarea = jQuery('#' + window.wpActiveEditor).get(0)

		if (typeof tinymce !== 'undefined') {
			ed = tinymce.get(wpActiveEditor)

			if (ed && !ed.isHidden()) {
				editor = ed
			} else {
				editor = null
			}
		}

		textarea.focus()

		jQuery('.mce-toolbar-grp.mce-inline-toolbar-grp.mce-container.mce-panel').css('display', 'none')
		// editor with id content is standard editor
		// console.log("editorId === 'content' && window.laylink_tinymce !== undefined");
		// console.log(editorId);
		// console.log(window.laylink_tinymce);
		// console.log('window.laylink_project_descripton_tinymce');
		// console.log(window.laylink_project_descripton_tinymce);

		console.log('editorId', editorId)

		if (editorId === 'gridder_text_editor' && window.laylink_tinymce !== undefined) {
			window.laylink_tinymce(editorId)
		} else if (editorId === 'lay_project_description' && window.laylink_project_descripton_tinymce !== undefined) {
			window.laylink_project_descripton_tinymce(editorId)
		} else if (editorId === 'content' && window.laylink_standard_tinymce !== undefined) {
			window.laylink_standard_tinymce(editorId)
		} else if (editorId === 'excerpt' && window.laylink_excerpt_tinymce !== undefined) {
			window.laylink_excerpt_tinymce(editorId)
		} else if(editorId.indexOf('acf-editor') !== -1 && window.laylink_acf_tinymce !== undefined) {
			window.laylink_acf_tinymce(editorId)
		} else if (window.laylink_cmb2_tinymce !== undefined){
			window.laylink_cmb2_tinymce(editorId)
		}
	}

	var getLink = function () {
		return editor.dom.getParent(editor.selection.getNode(), 'a')
	}

	var removeLink = function () {}

	var mceUpdate = function (obj) {
		var link, text

		editor.focus()

		if (tinymce.isIE) {
			editor.selection.moveToBookmark(editor.windowManager.bookmark)
		}

		var newtab = obj.newtab == true ? '_blank' : ''
		// var title = qTranslateX.getTextOfActiveDefaultOrOtherLangFromEncodedString(obj.title)
		// console.log(obj)
		var attrs = {
			href: obj.url,
			'data-type': obj.type,
			'data-id': obj.id,
			'data-title': obj.title,
			target: newtab,
		}

		link = getLink()

		if (link) {
			// edit an existing link
			if (text) {
				if ('innerText' in link) {
					link.innerText = text
				} else {
					link.textContent = text
				}
			}
			editor.dom.setAttribs(link, attrs)
		} else {
			editor.execCommand('mceInsertLink', false, attrs)
		}
	}

	return {
		doClick: doClick,
		mceUpdate: mceUpdate,
		removeLink: removeLink,
	}
})()

/* global tinymce */

tinymce.PluginManager.add('laynightmode', function (editor) {
	editor.addCommand('LayNightMode', function () {
		// console.log(editor.id);
		// console.log(editor.getBody())
		lay_nightmode = !lay_nightmode
		var color = '#fff'
		if (lay_nightmode == true) {
			color = 'rgb(90,90,90)'
		}
		editor.getBody().style.backgroundColor = color
		// console.log(ajaxurl)
		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: 'lay_set_texteditor_nightmode',
				nightmode: lay_nightmode,
			},
			type: 'POST',
			success: (markup) => {},
			error: (e) => {
				console.log(e)
			},
		})
	})

	editor.on('init', function (e) {
		if (lay_nightmode) {
			editor.getBody().style.backgroundColor = 'rgb(90,90,90)'
		} else {
			editor.getBody().style.backgroundColor = '#fff'
		}
	})

	editor.addButton('laynightmode', {
		icon: 'myicons dashicons-lightbulb',
		tooltip: 'Toggle Night Mode',
		cmd: 'LayNightMode',
	})
})

// https://stackoverflow.com/questions/19761857/how-to-take-heading-h1-h2-h3-directly-on-toolbar-in-tinymce-4

tinyMCE.PluginManager.add('h1_h2_p_buttons', function (editor, url) {
	;['p', 'h1', 'h2', 'h3', 'h4', 'h5'].forEach(function (name) {
		editor.addButton('style-' + name, {
			tooltip: 'Toggle ' + name,
			text: name.toUpperCase(),
			onClick: function () {
				editor.execCommand('mceToggleFormat', false, name)
			},
			onPostRender: function () {
				var self = this,
					setup = function () {
						editor.formatter.formatChanged(name, function (state) {
							self.active(state)
						})
					}
				editor.formatter ? setup() : editor.on('init', setup)
			},
		})
	})
})

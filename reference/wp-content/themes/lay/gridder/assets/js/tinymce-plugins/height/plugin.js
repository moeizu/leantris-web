tinymce.PluginManager.add('height', function (editor) {
	// for project description and excerpt, we don't want to change the height. cause it should be smaller
	if (editor.id == 'lay_project_description' || editor.id == 'excerpt') {
		return
	}
	// heights of top and bottom panels
	var diff = 215

	var height = ((window.innerHeight - diff) / 100) * 70

	jQuery(window).on('resize', function () {
		height = ((window.innerHeight - diff) / 100) * 70
		editor.theme.resizeTo('100%', height)
	})

	editor.on('init', function (e) {
		editor.theme.resizeTo('100%', height)
	})
})

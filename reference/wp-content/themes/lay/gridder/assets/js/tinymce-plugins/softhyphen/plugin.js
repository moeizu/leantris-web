// author: Armin Unruh

tinymce.PluginManager.add('softhyphen', function(editor) {

	editor.addCommand('mceSoftHyphen', function() {
		editor.insertContent(
			'&shy;'
		);
	});

	editor.addButton('softhyphen', {
		title: 'Soft Hyphen',
		cmd: 'mceSoftHyphen',
		icon: 'hr'
	});

	editor.addMenuItem('softhyphen',{
		text: 'Soft Hyphen',
		cmd: 'mceSoftHyphen',
		context: 'insert',
	});

});

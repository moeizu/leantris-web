tinymce.PluginManager.add('setcustomizercss', function( editor ) {
	if(typeof customizerPassedData !== 'undefined') {
		var css = customizerPassedData.link_css

		editor.on('PreInit', function(e){
			editor.contentStyles.push(css);
		});
	}
} );
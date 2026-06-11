/* global tinymce */

tinymce.PluginManager.add( 'layexpandrow', function( editor ) {

	editor.addCommand( 'WP_ExpandRow', function() {
		// console.log(editor.id);
		layexpandrow_expand_row.doClick( editor.id );
	});

	// http://stackoverflow.com/questions/11631272/how-to-enable-disable-custom-button-on-selection-change-with-tinymce
	editor.onNodeChange.add(function(ed, cm, node) {
		var disabled = true;
		var selection_content = this.selection.getContent();
		var node = this.selection.getNode();

		if(node.nodeName.toLowerCase() == "a"){
			disabled = false;
		}
		if(selection_content.trim() != ""){
			disabled = false;
		}
        cm.setDisabled('layexpandrow', disabled);
    });

	editor.addButton( 'layexpandrow', {
		icon: 'myicons dashicons-sort',
		tooltip: 'Expand/Collapse Row Link',
		cmd: 'WP_ExpandRow',
		stateSelector: 'a[data-expand]'
	});

	// editor.addButton( 'laycollapserow', {
	// 	icon: 'unlink',
	// 	tooltip: 'Remove link',
	// 	cmd: 'unlink'
	// });

	// editor.addMenuItem( 'layexpandrow', {
	// 	icon: 'myicons dashicons-sort',
	// 	text: 'Expand Row Link',
	// 	cmd: 'WP_ExpandRow',
	// 	stateSelector: 'a[href]',
	// 	context: 'insert',
	// 	prependToContext: true
	// });

});

var layexpandrow_expand_row = (function(){

	var doClick = function( editorId ) {
		var ed;

		if ( editorId ) {
			window.wpActiveEditor = editorId;
		}

		if ( ! window.wpActiveEditor ) {
			return;
		}

		textarea = jQuery( '#' + window.wpActiveEditor ).get( 0 );

		if ( typeof tinymce !== 'undefined' ) {
			ed = tinymce.get( wpActiveEditor );

			if ( ed && ! ed.isHidden() ) {
				editor = ed;
			} else {
				editor = null;
			}
		}

		textarea.focus();
		
        // todo: remove the button for all other texteditors.
        // i only want it in the gridder texteditor

		if ( editorId === 'gridder_text_editor' && window.layexpandrow_tinymce !== undefined ) {
			window.layexpandrow_tinymce( editorId );
		}
        // else if (editorId === 'lay_project_description' && window.layexpandrow_project_descripton_tinymce !== undefined ) {
		// 	window.layexpandrow_project_descripton_tinymce( editorId );
		// } else if ( editorId === 'content' && window.layexpandrow_standard_tinymce !== undefined ) {
		// 	window.layexpandrow_standard_tinymce( editorId );
		// }
	};

	var getLink = function() {
		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	};

	var removeLink = function(){
		
	};

	var mceUpdate = function(obj) {

        // console.log('mce update expand row')
        // console.log(obj)

		var link, text;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}
		
		var attrs = {
			'href': '#expandrow',
			'data-expand': obj.expand,
		}

		link = getLink();

		if ( link ) {
			// edit an existing link
			if ( text ) {
				if ( 'innerText' in link ) {
					link.innerText = text;
				} else {
					link.textContent = text;
				}
			}
			editor.dom.setAttribs( link, attrs );
		} else {
			editor.execCommand( 'mceInsertLink', false, attrs );
		}
	};

	return {
		doClick : doClick,
		mceUpdate : mceUpdate,
		removeLink : removeLink
	};

}());

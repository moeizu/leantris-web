/* global tinymce */
tinymce.PluginManager.add( 'layprevproject', function( editor ) {

	editor.addCommand( 'layprevproject', function() {
		layprevproject_controller.doClick( editor.id );
	});

	// http://stackoverflow.com/questions/11631272/how-to-enable-disable-custom-button-on-selection-change-with-tinymce
	editor.onNodeChange.add(function(ed, cm, node) {
		var disabled = true;
		var selection = this.selection.getContent();
		if(selection.trim() != ""){
			disabled = false;
		}
        cm.setDisabled('layprevproject', disabled);
    });

	editor.addButton( 'layprevproject', {
		icon: 'layprevproject',
		tooltip: 'Insert previous project/news link',
		cmd: 'layprevproject',
		stateSelector: 'a.layprevproject'
	});

});


var layprevproject_controller = (function(){
	var editor, searchTimer, River, Query, correctedURL,
		inputs = {},
		isTouch = ( 'ontouchend' in document );

	var textarea;

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
		mceUpdate();
	};

	var getLink = function() {
		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	}

	var mceUpdate = function() {
		var link, text;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}

		var attrs = {
			class: 'layprevproject',
			href: '#layprevproject'
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
	}

	return {
		doClick : doClick
	}

}());
/* global tinymce */
tinymce.PluginManager.add( 'laybuttons', function( editor ) {

    editor.on('PreInit', function(e){
        var css = lay_buttonstyles_for_tinymce;
        editor.contentStyles.push(css);
    });

	editor.addCommand( 'toggle_button_class_1', function() {
		laybuttons_controller.doClick( editor.id, 'laybutton1' );
	});
    editor.addCommand( 'toggle_button_class_2', function() {
		laybuttons_controller.doClick( editor.id, 'laybutton2' );
	});
    editor.addCommand( 'toggle_button_class_3', function() {
		laybuttons_controller.doClick( editor.id, 'laybutton3' );
	});

	// http://stackoverflow.com/questions/11631272/how-to-enable-disable-custom-button-on-selection-change-with-tinymce
	editor.onNodeChange.add(function(ed, cm, node) {
		var disabled = true;
		var selection = this.selection.getContent();
		// if(selection.trim() != ""){
            // console.log('this.selection.getNode()')
            // console.log(this.selection.getNode())
        if(this.selection.getNode().nodeName == 'A'){
			disabled = false;
		}
        // if for example there is a span inside an anchor element
        if(this.selection.getNode().parentNode.nodeName == 'A'){
			disabled = false;
		}
        cm.setDisabled('laybutton1', disabled);
        cm.setDisabled('laybutton2', disabled);
        cm.setDisabled('laybutton3', disabled);
    });

	editor.addButton( 'laybutton1', {
		icon: 'laybuttonicon1',
		tooltip: 'Button Style 1',
		cmd: 'toggle_button_class_1',
		stateSelector: 'a.laybutton1'
	});
    editor.addButton( 'laybutton2', {
		icon: 'laybuttonicon2',
		tooltip: 'Button Style 2',
		cmd: 'toggle_button_class_2',
		stateSelector: 'a.laybutton2'
	});
    editor.addButton( 'laybutton3', {
		icon: 'laybuttonicon3',
		tooltip: 'Button Style 3',
		cmd: 'toggle_button_class_3',
		stateSelector: 'a.laybutton3'
	});

});


var laybuttons_controller = (function(){
	var editor, searchTimer, River, Query, correctedURL,
		inputs = {},
		isTouch = ( 'ontouchend' in document );

	var textarea;

	var doClick = function( editorId, classToAdd ) {
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
		mceUpdate(classToAdd);
	};

	var getLink = function() {
        // console.log(editor.dom.getParent( editor.selection.getNode(), 'a' ))
		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	}

	var mceUpdate = function(classToAdd) {
		var link, text;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}

		var attrs = {
			class: classToAdd + ' laybutton',
		}

		link = getLink();
		// console.log(editor.selection);

		if ( link ) {
			// edit an existing link
            if( link.classList.contains(classToAdd) ) {
                // just remove class, for toggling
                link.classList.remove(classToAdd, 'laybutton')
            } else {
                link.classList.remove('laybutton1', 'laybutton2', 'laybutton3', 'laybutton')
                editor.dom.setAttribs( link, attrs );
            }
		} else {
			editor.execCommand( 'mceInsertLink', false, attrs );
		}
	}

	return {
		doClick : doClick
	}

}());
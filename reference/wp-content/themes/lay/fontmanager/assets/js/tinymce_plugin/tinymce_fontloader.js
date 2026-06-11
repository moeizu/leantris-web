tinymce.PluginManager.add('fontloader', function( editor ) {

	var jsonString = jQuery.trim( jQuery( '#fontmanager_json' ).val() );
	if ( typeof jsonString == 'undefined' || jsonString == '' ) {
		return;
	}

	var jsonObject = JSON.parse( jsonString );
	var googlePreconnects = {};
	var googleLinks = {};

	function appendGoogleEmbed( $head, embed ) {
		if ( typeof embed != 'string' ) {
			return;
		}
		var trimmed = jQuery.trim( embed );
		if ( trimmed === '' ) {
			return;
		}

		var container = document.createElement( 'div' );
		container.innerHTML = trimmed;
		var linkNodes = container.getElementsByTagName( 'link' );

		if ( linkNodes.length === 0 ) {
			$head.append( trimmed );
			return;
		}

		for ( var j = 0; j < linkNodes.length; j++ ) {
			var linkNode = linkNodes[ j ];
			var rel = ( linkNode.getAttribute( 'rel' ) || '' ).toLowerCase();
			var href = linkNode.getAttribute( 'href' ) || '';

			if ( rel === 'preconnect' ) {
				if ( href === '' || googlePreconnects[ href ] ) {
					continue;
				}
				googlePreconnects[ href ] = true;
			} else {
				var key = rel + '|' + href;
				if ( href !== '' && googleLinks[ key ] ) {
					continue;
				}
				if ( href !== '' ) {
					googleLinks[ key ] = true;
				}
			}

			var clone = linkNode.cloneNode( true );
			var serialized = '';
			if ( typeof clone.outerHTML == 'string' ) {
				serialized = clone.outerHTML;
			} else {
				var wrapper = document.createElement( 'div' );
				wrapper.appendChild( clone );
				serialized = wrapper.innerHTML;
			}

			if ( serialized ) {
				$head.append( serialized );
			}
		}
	}

	// create font-face CSS for tinymce iframe
	var i;
	var css = '';
	for ( i = 0; i < jsonObject.length; i++ ) {
		if ( typeof jsonObject[ i ].type == 'undefined' || jsonObject[ i ].type == 'attachment' ) {
			var format = typeof jsonObject[ i ].fileformat != 'undefined' ? jsonObject[ i ].fileformat : 'woff';
			css += '@font-face{ font-family: "' + jsonObject[ i ].fontname + '"; src: url("' + jsonObject[ i ].url + '") format("' + format + '"); } ';
		}
	}

	// add "attachment" type font-face CSS
	editor.on( 'PreInit', function() {
		if ( css !== '' ) {
			editor.contentStyles.push( css );
		}
	} );

	// add "link", "script" and "google" type tags
	editor.on( 'PreInit', function() {
		// http://www.tinymce.com/wiki.php/api4:property.tinymce.Editor.$
		var $head = editor.$( 'head' );

		for ( i = 0; i < jsonObject.length; i++ ) {
			if ( typeof jsonObject[ i ].type != 'undefined' && jsonObject[ i ].type == 'link' ) {
				$head.append( jsonObject[ i ].link );
			} else if ( typeof jsonObject[ i ].type != 'undefined' && jsonObject[ i ].type == 'script' ) {
				$head.append( jsonObject[ i ].script );
			} else if ( typeof jsonObject[ i ].type != 'undefined' && jsonObject[ i ].type == 'google' ) {
				appendGoogleEmbed( $head, jsonObject[ i ].embed );
			}
		}
	} );

} );
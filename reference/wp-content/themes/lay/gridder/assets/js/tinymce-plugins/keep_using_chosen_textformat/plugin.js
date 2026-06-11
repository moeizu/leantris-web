/* global tinymce */

tinymce.PluginManager.add('keep_using_chosen_textformat', function (editor) {
	// you write a paragraph, you select it, you apply a format to it
	// then you press enter, a new paragraph is created, but it does not have the same format as the previous one
	// this code fixes that

	// note to myself: seems that when i now click "clear format", the textformat doesnt get removed anymore from the paragraph
	// but maybe thats ok. all other formats, like color, font size, etc. get removed, but the textformat stays

	var enterWasPressed = false
	var timeout

	editor.on('nodeChange', function (ed, cm, node) {
		// console.log('node change')
		// console.log('enterWasPressed in node change:')
		// console.log(enterWasPressed)
		if (enterWasPressed) {
			enterWasPressed = false
			var node = this.selection.getNode()
			// if node is paragraph:
			if (node.nodeName == 'P') {
				// get paragraph before:
				var prev_node = node.previousSibling

				// previous node should have be a paragraph, current node should not have any classes
				if (prev_node && prev_node.nodeName == 'P' && node.classList.length == 0) {
					// get the class name that starts with an underscore of previous paragraph
					var class_name = prev_node.classList[0]
					if (class_name && class_name.indexOf('_') == 0 && !node.classList.contains(class_name)) {
						// apply the class to the current paragraph
						node.classList.add(class_name)
					}
				}
			}
		}
	})

	// need to check if enter was pressed, prior to applying the format in function above
	// because nodeChange event is triggered for lots of other things just selecting a text or clicking clear format, etc
	editor.on('keyUp', function (e) {
		if (tinymce.activeEditor.isDirty()) {
			if (e.key == 'Enter') {
				clearTimeout(timeout)
				enterWasPressed = true
			} else {
				// only change enter was pressed to false, 1 second after pressing any other key than enter
				// this gives nodeChange event enough time to still have enterWasPressed be true to run its code
				clearTimeout(timeout)
				timeout = setTimeout(function () {
					enterWasPressed = false
				}, 1000)
			}
		}
	})
})

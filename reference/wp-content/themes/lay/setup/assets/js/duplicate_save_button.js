jQuery(document).ready(function () {
	var $edit = jQuery('.edit-tag-actions')
	if ($edit.length > 0) {
		$edit.clone().insertBefore('#gridder')
	}

	if (jQuery('body').hasClass('post-php')) {
		var scrolledDown = false
		jQuery(document).on('scroll', function () {
			var $submitdiv = jQuery('#submitdiv')
			if ($submitdiv.length > 0 && jQuery('#post-body').hasClass('columns-2')) {
				// Get bottom position of submitdiv
				var submitdivBottom = $submitdiv.offset().top + $submitdiv.outerHeight()
				// Check if bottom has scrolled past window top + admin bar (32px)
				var threshold = jQuery(window).scrollTop() + 32

				if (submitdivBottom < threshold && scrolledDown == false) {
					scrolledDown = true
					showFloatingButtons()
				} else if (submitdivBottom >= threshold && scrolledDown == true) {
					scrolledDown = false
					hideFloatingButtons()
				}
			}
		})
	}

	var showFloatingButtons = function () {
		// Create minimal floating button bar
		var $floatingBar = jQuery('<div class="lay-floating-buttons"></div>')

		// Add preview button (if it exists)
		if (jQuery('#custom-post-preview').length > 0) {
			var $previewBtn = jQuery('<a class="button preview-button" href="#">Preview Changes</a>')
			$previewBtn.on('click', function (e) {
				e.preventDefault()
				jQuery('#custom-post-preview').click()
			})
			$floatingBar.append($previewBtn)
		}

		// Add update button
		var updateText = jQuery('#publish').val() || 'Update'
		var $updateBtn = jQuery('<button class="button button-primary button-large update-button">' + updateText + '</button>')
		$updateBtn.on('click', function (e) {
			e.preventDefault()
			jQuery('#publish').click()
		})
		$floatingBar.append($updateBtn)

		// Insert after the sidebar
		$floatingBar.insertAfter('#postbox-container-1')
	}

	var hideFloatingButtons = function () {
		jQuery('.lay-floating-buttons').remove()
	}
})

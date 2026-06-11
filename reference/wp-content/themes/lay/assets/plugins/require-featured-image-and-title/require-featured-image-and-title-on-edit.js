jQuery(document).ready(function ($) {
	setInterval(detectWarn, 1000)
	detectWarn()

	// Initialize tooltip for publish button with a small delay to ensure DOM is ready
	setTimeout(function () {
		if (jQuery('#publish').length > 0) {
			initPublishButtonTooltip()
		}
	}, 100)

	function initPublishButtonTooltip() {
		// Show tooltip on mouseenter when button is disabled
		jQuery('#publish').on('mouseenter', function () {
			if (jQuery(this).attr('disabled')) {
				showPublishTooltip()
			}
		})

		// Hide tooltip on mouseleave
		jQuery('#publish').on('mouseleave', function () {
			hidePublishTooltip()
		})
	}

	function showPublishTooltip() {
		// Remove existing tooltip if any
		hidePublishTooltip()

		// Create tooltip content based on what's missing
		var tooltipContent = getTooltipContent()

		// Add tooltip to #major-publishing-actions
		jQuery('#major-publishing-actions').append('<div class="publish-tooltip lay-tooltip-text">' + tooltipContent + '</div>')
	}

	function hidePublishTooltip() {
		jQuery('#major-publishing-actions .publish-tooltip').remove()
	}

	function getTooltipContent() {
		var noFeaturedImg = jQuery('#postimagediv').find('img').length === 0
		var noTitle = jQuery('#title').val().trim() === ''

		if (noFeaturedImg && noTitle) {
			return 'Please set a Project Thumbnail and Title first'
		} else if (noFeaturedImg) {
			return 'Please set a Project Thumbnail first'
		} else if (noTitle) {
			return 'Please set a Title first'
		}
		return 'Please set a Project Thumbnail and Title first'
	}

	function detectWarn() {
		if (jQuery.find('#postimagediv').length !== 0) {
			var noFeaturedImg = false
			var noTitle = false

			if (jQuery('#postimagediv').find('img').length === 0) {
				noFeaturedImg = true
			}
			if (jQuery('#title').val().trim() === '') {
				noTitle = true
			}

			if (noTitle || noFeaturedImg) {
				if (noFeaturedImg && noTitle) {
					jQuery('#postimagediv').addClass('highlight')
					jQuery('#titlewrap input').addClass('highlight')
					// Add placeholder text
					if (jQuery('#postimagediv .set-post-thumbnail').length === 0) {
						jQuery('#postimagediv').append('<div class="set-post-thumbnail lay-tooltip-text">Please set Image</div>')
					}
					if (jQuery('#titlewrap .title-placeholder').length === 0) {
						jQuery('#titlewrap').append('<div class="title-placeholder lay-tooltip-text">Please set Title</div>')
					}
				} else if (noFeaturedImg) {
					jQuery('#postimagediv').addClass('highlight')
					jQuery('#titlewrap input').removeClass('highlight')
					// Add placeholder text for image
					if (jQuery('#postimagediv .set-post-thumbnail').length === 0) {
						jQuery('#postimagediv').append('<div class="set-post-thumbnail lay-tooltip-text">Please set Image</div>')
					}
					// Remove title placeholder if it exists
					jQuery('#titlewrap .title-placeholder').remove()
				} else if (noTitle) {
					jQuery('#postimagediv').removeClass('highlight')
					jQuery('#titlewrap input').addClass('highlight')
					// Add placeholder text for title
					if (jQuery('#titlewrap .title-placeholder').length === 0) {
						jQuery('#titlewrap').append('<div class="title-placeholder lay-tooltip-text">Please set Title</div>')
					}
					// Remove image placeholder if it exists
					jQuery('#postimagediv .set-post-thumbnail').remove()
				}

				jQuery('#publish').attr('disabled', 'disabled')
			} else {
				jQuery('#publish').removeAttr('disabled')
				jQuery('#postimagediv').removeClass('highlight')
				jQuery('#titlewrap input').removeClass('highlight')
				// Remove placeholder texts
				jQuery('#titlewrap .title-placeholder').remove()
				jQuery('#postimagediv .set-post-thumbnail').remove()
			}
		}
	}
})

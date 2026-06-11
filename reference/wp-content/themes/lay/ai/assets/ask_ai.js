jQuery(document).ready(function ($) {
	var $panel = $('#lay-ask-ai-panel')
	var $button = $('#lay-ask-ai-button')
	var $iframe = $('#lay-ask-ai-iframe')
	var iframeLoaded = false
	var floatingPill = window.LayAdminFloatingPill
		? window.LayAdminFloatingPill.init({
				element: $button[0],
				handle: $button.find('.lay-admin-floating-pill-drag-handle')[0],
				ajaxUrl: window.layAskAI ? window.layAskAI.ajaxUrl : ajaxurl,
				saveAction: 'save_ask_ai_position',
				nonce: window.layAskAI ? window.layAskAI.nonce : '',
				defaultBottom: 20,
				defaultRight: 20,
			})
		: null

	// Open panel
	$button.on('click', function (e) {
		if (floatingPill && floatingPill.wasDragging()) return
		e.preventDefault()
		$panel.addClass('active')

		// Load iframe only once when first opened
		if (!iframeLoaded) {
			// Move data-src to src to trigger iframe load
			var iframeSrc = $iframe.attr('data-src')
			if (iframeSrc) {
				$iframe.attr('src', iframeSrc)
				iframeLoaded = true
			}
		}
	})

	if (window.LayAdminFloatingPill) {
		window.LayAdminFloatingPill.initDismissConfirmation({
			element: $button[0],
			button: $button.find('.lay-ask-ai-disable-button')[0],
			message: 'Hide this',
			confirmLabel: 'Yes',
			onConfirm: function () {
				$button.remove()
				$panel.removeClass('active')

				$.ajax({
					url: window.layAskAI ? window.layAskAI.ajaxUrl : ajaxurl,
					type: 'POST',
					data: {
						action: 'disable_ask_ai',
						nonce: window.layAskAI ? window.layAskAI.nonce : '',
					},
				})
			},
		})
	}

	// Close panel when clicking close button
	$('.lay-ask-ai-close').on('click', function () {
		$panel.removeClass('active')
	})

	// Note: No overlay click handler since overlay is hidden

	// Close panel on ESC key
	$(document).on('keydown', function (e) {
		if (e.key === 'Escape' && $panel.hasClass('active')) {
			$panel.removeClass('active')
		}
	})

	// Handle disable link click - scroll to checkbox after page loads with offset
	$('.lay-ask-ai-disable-link').on('click', function (e) {
		// Let the link navigate normally, but add scroll behavior
		setTimeout(function () {
			var checkboxElement = document.getElementById('misc_options_activate_ask_ai')
			if (checkboxElement) {
				var elementPosition = checkboxElement.getBoundingClientRect().top + window.pageYOffset
				var offsetPosition = elementPosition - 100
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth',
				})
			}
		}, 100)
	})

	// Also handle hash fragment on page load (in case user navigates directly with hash)
	if (window.location.hash === '#misc_options_activate_ask_ai') {
		setTimeout(function () {
			var checkboxElement = document.getElementById('misc_options_activate_ask_ai')
			if (checkboxElement) {
				var elementPosition = checkboxElement.getBoundingClientRect().top + window.pageYOffset
				var offsetPosition = elementPosition - 100
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth',
				})
			}
		}, 300)
	}
})

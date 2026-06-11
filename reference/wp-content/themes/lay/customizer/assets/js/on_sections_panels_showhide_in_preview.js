// https://github.com/WordPress/WordPress/blob/ab3bca05c8103a8a73ae482d149d7821d44e4b30/wp-content/themes/twentyseventeen/assets/js/customize-preview.js
// https://richtabor.com/wordpress-customizer-context-aware-previews/
// https://wordpress.stackexchange.com/questions/300963/passing-data-from-customize-controls-js-to-the-customize-preview-js

// when I bind preview ready here, it is also called when a control causes a refresh of the website
// that is not the case if i bind to preview-ready in "on_sections_panels_showhide_in_controls.js"
wp.customize.bind('preview-ready', function () {
	// making clicking on cart menu point not following the link
	if (window.parent.layShowhideInControlsPassedData.wooCommerceActive && window.parent.layShowhideInControlsPassedData.sideCartPluginActive) {
		// taken from wordpress' "customize-preview.js"
		var $body = jQuery('body')
		$body.off('click.preview')
		$body.on('click.preview', 'a[href]', function (event) {
			var preview = wp.customize.preview
			var api = wp.customize
			var link
			var isInternalJumpLink
			link = jQuery(this)

			// dont do anything if link is laycart
			if (jQuery(this.parentNode).hasClass('laycart')) {
				return
			}

			// No-op if the anchor is not a link.
			if (_.isUndefined(link.attr('href'))) {
				return
			}

			// Allow internal jump links and JS links to behave normally without preventing default.
			isInternalJumpLink = '#' === link.attr('href').substr(0, 1)
			if (isInternalJumpLink || !/^https?:$/.test(link.prop('protocol'))) {
				return
			}

			// If the link is not previewable, prevent the browser from navigating to it.
			if (!api.isLinkPreviewable(link[0])) {
				wp.a11y.speak(api.settings.l10n.linkUnpreviewable)
				event.preventDefault()
				return
			}

			// Prevent initiating navigating from click and instead rely on sending url message to pane.
			event.preventDefault()

			/*
			 * Note the shift key is checked so shift+click on widgets or
			 * nav menu items can just result on focusing on the corresponding
			 * control instead of also navigating to the URL linked to.
			 */
			if (event.shiftKey) {
				return
			}

			// Note: It's not relevant to send scroll because sending url message will have the same effect.
			preview.send('url', link.prop('href'))
		})
	}

	// if intro section is already expanded, when an intro control was used, causing the website to refresh
	var intro_section = parent.wp.customize.section('intro_section')
	if (typeof intro_section != 'undefined') {
		if (intro_section.expanded()) {
			window.laytheme.emit('customizer_showintro')
		}
	}

	wp.customize.preview.bind('customizer_showintro', function () {
		window.laytheme.emit('customizer_showintro')
	})
	wp.customize.preview.bind('customizer_hideintro', function () {
		window.laytheme.emit('customizer_hideintro')
	})

	wp.customize.preview.bind('customizer_showsearch', function () {
		window.laytheme.emit('customizer_showsearch')
	})
	wp.customize.preview.bind('customizer_hidesearch', function () {
		window.laytheme.emit('customizer_hidesearch')
	})

	// if search section is already expanded, when a search control was used, causing the website to refresh
	var search_section = parent.wp.customize.section('search_section')
	if (typeof search_section != 'undefined') {
		if (search_section.expanded()) {
			setTimeout(function () {
				window.laytheme.emit('customizer_showsearch')
			}, 200)
		}
	}

	// if sidecart section is already expanded, when a control was used, causing the website to refresh
	var sidecart_section = parent.wp.customize.section('lay_woocommerce_sidecart')
	if (typeof sidecart_section != 'undefined') {
		if (sidecart_section.expanded()) {
			setTimeout(function () {
				window.laytheme.emit('customizer_show_sidecart')
			}, 200)
		}
	}

	var sidecart_buttons_section = parent.wp.customize.section('lay_woocommerce_sidecart_buttons')
	if (typeof sidecart_buttons_section != 'undefined') {
		if (sidecart_buttons_section.expanded()) {
			setTimeout(function () {
				window.laytheme.emit('customizer_show_sidecart')
			}, 200)
		}
	}

	wp.customize.preview.bind('customizer_showsidecart', function () {
		window.laytheme.emit('customizer_show_sidecart')
	})
	wp.customize.preview.bind('customizer_hidesidecart', function () {
		window.laytheme.emit('customizer_hide_sidecart')
	})
})

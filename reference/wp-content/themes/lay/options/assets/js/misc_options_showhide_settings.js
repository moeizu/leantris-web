var misc_options_showhide_settings = (function () {
	var initModule = function () {
		// Only initialize textformats show/hide if the elements exist (they were moved to Text Formats page)
		if (jQuery('#misc_options_textformats_for_tablet').length > 0) {
			showhide_for_textformats_for_tablet()
			jQuery('#misc_options_textformats_for_tablet').on('change', showhide_for_textformats_for_tablet)
		}

		showhide_for_news()
		jQuery('#misc_options_activate_news_feature').on('change', showhide_for_news)

		showhide_for_deck()
		jQuery('#misc_options_activate_deck_feature').on('change', showhide_for_deck)

		showhide_for_transitions()
		jQuery('#misc_options_navigation_transition_out').on('change', showhide_for_transitions)
		jQuery('#misc_options_navigation_transition_in').on('change', showhide_for_transitions)

		showhide_for_thumbnail_video()
		jQuery('#misc_options_thumbnail_video').on('change', showhide_for_thumbnail_video)
		jQuery('#misc_options_thumbnail_mouseover_image').on('change', showhide_for_thumbnail_video)

		showhide_for_element_transition_on_scroll()
		jQuery('#misc_options_element_transition_on_scroll').on('change', showhide_for_element_transition_on_scroll)
		jQuery('#misc_options_scroll_transition_animate_scale').on('change', showhide_for_scale_animation)
		jQuery('#misc_options_scroll_transition_animate_blur').on('change', showhide_for_blur_animation)

		showhide_for_image_loading()
		jQuery('#misc_options_image_loading').on('change', showhide_for_image_loading)

		showhide_for_custom_video_mute_icons()
		jQuery('#misc_options_use_custom_mute_unmute_icons').on('change', showhide_for_custom_video_mute_icons)

		showhide_for_automatic_updates()
		jQuery('#misc_options_disable_lay_updates').on('change', showhide_for_automatic_updates)
	}

	var showhide_for_transitions = function () {
		var val1 = jQuery('#misc_options_navigation_transition_out').val()
		var val2 = jQuery('#misc_options_navigation_transition_in').val()
		var show1 = false
		if (val1 != 'none') {
			show1 = true
		}
		if (show1) {
			jQuery(document.getElementById('misc_options_navigation_transition_out_duration').parentNode.parentNode).show()
			jQuery(document.getElementById('misc_options_navigation_transition_out_easing').parentNode.parentNode).show()
		} else {
			jQuery(document.getElementById('misc_options_navigation_transition_out_duration').parentNode.parentNode).hide()
			jQuery(document.getElementById('misc_options_navigation_transition_out_easing').parentNode.parentNode).hide()
		}

		var show2 = false
		if (val2 != 'none') {
			show2 = true
		}
		if (show2) {
			jQuery(document.getElementById('misc_options_use_revealing_transition_on_first_visit').parentNode.parentNode).show()
			jQuery(document.getElementById('misc_options_navigation_transition_in_duration').parentNode.parentNode).show()
			jQuery(document.getElementById('misc_options_navigation_transition_in_easing').parentNode.parentNode).show()
		} else {
			jQuery(document.getElementById('misc_options_use_revealing_transition_on_first_visit').parentNode.parentNode).hide()
			jQuery(document.getElementById('misc_options_navigation_transition_in_duration').parentNode.parentNode).hide()
			jQuery(document.getElementById('misc_options_navigation_transition_in_easing').parentNode.parentNode).hide()
		}

		var show3 = false
		if (val1.indexOf('up') != -1 || val1.indexOf('down') != -1 || val2.indexOf('up') != -1 || val2.indexOf('down') != -1) {
			show3 = true
		}
		if (show3 == true) {
			jQuery(document.getElementById('misc_options_navigation_transition_y_translate_desktop').parentNode.parentNode).show()
			jQuery(document.getElementById('misc_options_navigation_transition_y_translate_phone').parentNode.parentNode).show()
		} else {
			jQuery(document.getElementById('misc_options_navigation_transition_y_translate_desktop').parentNode.parentNode).hide()
			jQuery(document.getElementById('misc_options_navigation_transition_y_translate_phone').parentNode.parentNode).hide()
		}
	}

	var showhide_for_textformats_for_tablet = function () {
		var checkbox = jQuery('#misc_options_textformats_for_tablet')
		var breakpointElement = document.getElementById('misc_options_textformats_tablet_breakpoint')

		// Only proceed if both elements exist (they were moved to Text Formats page)
		if (checkbox.length === 0 || !breakpointElement) {
			return
		}

		var val = checkbox.is(':checked')
		if (val) {
			jQuery(breakpointElement.parentNode.parentNode).show()
		} else {
			jQuery(breakpointElement.parentNode.parentNode).hide()
		}
	}

	var showhide_for_news = function () {
		var val = jQuery('#misc_options_activate_news_feature').is(':checked')
		if (val) {
			jQuery(document.getElementById('misc_options_news_feature_name').parentNode.parentNode).show()
			jQuery(document.getElementById('misc_options_news_feature_slug').parentNode.parentNode).show()
		} else {
			jQuery(document.getElementById('misc_options_news_feature_name').parentNode.parentNode).hide()
			jQuery(document.getElementById('misc_options_news_feature_slug').parentNode.parentNode).hide()
		}
	}

	var showhide_for_deck = function () {
		var $cb = jQuery('#misc_options_activate_deck_feature')
		if (!$cb.length) return
		var slugEl = document.getElementById('misc_options_deck_feature_slug')
		var hideChromeEl = document.getElementById('misc_options_deck_hide_chrome')
		var visible = $cb.is(':checked')
		if (slugEl) {
			jQuery(slugEl.parentNode.parentNode)[visible ? 'show' : 'hide']()
		}
		if (hideChromeEl) {
			jQuery(hideChromeEl.parentNode.parentNode)[visible ? 'show' : 'hide']()
		}
	}

	var showhide_for_thumbnail_video = function () {
		var videoEnabled = jQuery('#misc_options_thumbnail_video').is(':checked')
		var mouseoverImageEnabled = jQuery('#misc_options_thumbnail_mouseover_image').is(':checked')

		// Show/hide "Disable Video for Thumbnails on Touch Devices" based on video checkbox
		if (videoEnabled) {
			jQuery('tr:has(input[name="misc_options_thumbnail_video_disabled_for_touch_devices"])').show()
		} else {
			jQuery('tr:has(input[name="misc_options_thumbnail_video_disabled_for_touch_devices"])').hide()
		}

		// Show/hide "Behavior when both Mouseover Image and Video are used for Thumbnails"
		// only when BOTH checkboxes are checked
		if (videoEnabled && mouseoverImageEnabled) {
			jQuery('tr:has(input[name="misc_options_thumbnail_video_and_mouseover_image_behavior"])').show()
		} else {
			jQuery('tr:has(input[name="misc_options_thumbnail_video_and_mouseover_image_behavior"])').hide()
		}
	}

	var showhide_for_element_transition_on_scroll = function () {
		var val = jQuery('#misc_options_element_transition_on_scroll').is(':checked')
		if (val) {
			jQuery('tr:has(#misc_options_element_transition_animate_opacity)').show()
			jQuery('tr:has(#misc_options_scroll_transition_duration)').show()
			jQuery('tr:has(#misc_options_scroll_transition_easing)').show()
			jQuery('tr:has(#misc_options_scroll_transition_offset_desktop)').show()
			jQuery('tr:has(#misc_options_scroll_transition_offset_mobile)').show()
			jQuery('tr:has(#misc_options_scroll_transition_animate_scale)').show()
			jQuery('tr:has(#misc_options_scroll_transition_animate_blur)').show()
			showhide_for_scale_animation()
			showhide_for_blur_animation()
		} else {
			jQuery('tr:has(#misc_options_element_transition_animate_opacity)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_duration)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_easing)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_offset_desktop)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_offset_mobile)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_animate_scale)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_scale_start)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_animate_blur)').hide()
			jQuery('tr:has(#misc_options_scroll_transition_blur_start)').hide()
		}
	}

	var showhide_for_scale_animation = function () {
		var scrollTransitionEnabled = jQuery('#misc_options_element_transition_on_scroll').is(':checked')
		var scaleEnabled = jQuery('#misc_options_scroll_transition_animate_scale').is(':checked')
		if (scrollTransitionEnabled && scaleEnabled) {
			jQuery('tr:has(#misc_options_scroll_transition_scale_start)').show()
		} else {
			jQuery('tr:has(#misc_options_scroll_transition_scale_start)').hide()
		}
	}

	var showhide_for_blur_animation = function () {
		var scrollTransitionEnabled = jQuery('#misc_options_element_transition_on_scroll').is(':checked')
		var blurEnabled = jQuery('#misc_options_scroll_transition_animate_blur').is(':checked')
		if (scrollTransitionEnabled && blurEnabled) {
			jQuery('tr:has(#misc_options_scroll_transition_blur_start)').show()
		} else {
			jQuery('tr:has(#misc_options_scroll_transition_blur_start)').hide()
		}
	}

	var showhide_for_image_loading = function () {
		var val = jQuery('#misc_options_image_loading').is(':checked')
		if (val) {
			jQuery('tr:has(#misc_options_image_loading_blur_standard)').show()
		} else {
			jQuery('tr:has(#misc_options_image_loading_blur_standard)').hide()
		}
	}

	var showhide_for_automatic_updates = function () {
		var val = jQuery('#misc_options_disable_lay_updates').is(':checked')
		if (val) {
			jQuery('tr:has(#misc_options_enable_automatic_updates)').hide()
		} else {
			jQuery('tr:has(#misc_options_enable_automatic_updates)').show()
		}
	}

	var showhide_for_custom_video_mute_icons = function () {
		var val = jQuery('#misc_options_use_custom_mute_unmute_icons').is(':checked')
		if (val) {
			jQuery('tr:has(#misc_options_muted_state_icon)').show()
			jQuery('tr:has(#misc_options_unmuted_state_icon)').show()
		} else {
			jQuery('tr:has(#misc_options_muted_state_icon)').hide()
			jQuery('tr:has(#misc_options_unmuted_state_icon)').hide()
		}
	}

	return {
		initModule: initModule,
	}
})()

jQuery(document).ready(function () {
	misc_options_showhide_settings.initModule()
})

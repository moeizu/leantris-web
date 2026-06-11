var po_options_showhide_settings = (function () {
	var initModule = function () {
		showhide_for_custom_icon()
		jQuery('#po_use_custom_close_button').on('change', showhide_for_custom_icon)
		jQuery('#po_show_close_icon').on('change', showhide_for_custom_icon)
		jQuery('#po_show_close_icon_background').on('change', showhide_for_close_icon_background)

		showhide_for_po_animation()
		jQuery('#po_animation').on('change', showhide_for_po_animation)

		showhide_for_bg_behind_overlay()
		jQuery('#po_background_behind_overlay').on('change', showhide_for_bg_behind_overlay)

		showhide_for_override_overlay_bg_opacity_blur()
		jQuery('#po_override_overlay_bg_opacity_blur').on('change', showhide_for_override_overlay_bg_opacity_blur)
	}

	var showhide_for_bg_behind_overlay = function () {
		var show = jQuery('#po_background_behind_overlay').is(':checked')
		if (show) {
			jQuery(document.getElementById('po_background_behind_overlay_opacity').closest('tr')).show()
			jQuery(document.getElementById('po_background_behind_overlay_color').closest('tr')).show()
		} else {
			jQuery(document.getElementById('po_background_behind_overlay_opacity').closest('tr')).hide()
			jQuery(document.getElementById('po_background_behind_overlay_color').closest('tr')).hide()
		}
	}

	var showhide_for_custom_icon = function () {
		var show_icon = jQuery('#po_show_close_icon').is(':checked')

		if (show_icon) {
			jQuery(document.getElementById('po_close_icon').parentNode.parentNode).show()
			jQuery(document.getElementById('po_use_custom_close_button').closest('tr')).show()
			jQuery(document.getElementById('po_show_close_icon_background').closest('tr')).show()

			var show_custom_icon = jQuery('#po_use_custom_close_button').is(':checked')
			if (show_custom_icon) {
				jQuery(document.getElementById('po_close_button_color').closest('tr')).hide()
				jQuery(document.getElementById('po_close_icon').parentNode.parentNode).show()
			} else {
				jQuery(document.getElementById('po_close_button_color').closest('tr')).show()
				jQuery(document.getElementById('po_close_icon').parentNode.parentNode).hide()
			}
			showhide_for_close_icon_background()
		} else {
			// po_use_custom_close_button
			jQuery(document.getElementById('po_use_custom_close_button').closest('tr')).hide()
			jQuery(document.getElementById('po_close_icon').parentNode.parentNode).hide()
			jQuery(document.getElementById('po_close_button_color').closest('tr')).hide()
			jQuery(document.getElementById('po_show_close_icon_background').closest('tr')).hide()
			jQuery(document.getElementById('po_close_icon_background_color').closest('tr')).hide()
			jQuery(document.getElementById('po_close_icon_background_rounded_corners').closest('tr')).hide()
		}
	}

	var showhide_for_close_icon_background = function () {
		var show_icon = jQuery('#po_show_close_icon').is(':checked')
		var show_custom_icon = jQuery('#po_use_custom_close_button').is(':checked')
		var show_background = jQuery('#po_show_close_icon_background').is(':checked')
		if (show_icon && !show_custom_icon && show_background) {
			jQuery(document.getElementById('po_close_icon_background_color').closest('tr')).show()
			jQuery(document.getElementById('po_close_icon_background_rounded_corners').closest('tr')).show()
		} else {
			jQuery(document.getElementById('po_close_icon_background_color').closest('tr')).hide()
			jQuery(document.getElementById('po_close_icon_background_rounded_corners').closest('tr')).hide()
		}
	}

	var showhide_for_po_animation = function () {
		var po_animation = jQuery('#po_animation').val()
		if (po_animation === 'none') {
			jQuery(document.getElementById('po_animation_duration').closest('tr')).hide()
			jQuery(document.getElementById('po_animation_easing_function').closest('tr')).hide()
		} else {
			jQuery(document.getElementById('po_animation_duration').closest('tr')).show()
			jQuery(document.getElementById('po_animation_easing_function').closest('tr')).show()
		}
	}

	var showhide_for_override_overlay_bg_opacity_blur = function () {
		var show = jQuery('#po_override_overlay_bg_opacity_blur').is(':checked')
		if (show) {
			jQuery(document.getElementById('po_overlay_bg_opacity').closest('tr')).show()
			jQuery(document.getElementById('po_overlay_bg_blur').closest('tr')).show()
		} else {
			jQuery(document.getElementById('po_overlay_bg_opacity').closest('tr')).hide()
			jQuery(document.getElementById('po_overlay_bg_blur').closest('tr')).hide()
		}
	}

	return {
		initModule: initModule,
	}
})()

jQuery(document).ready(function () {
	po_options_showhide_settings.initModule()
})

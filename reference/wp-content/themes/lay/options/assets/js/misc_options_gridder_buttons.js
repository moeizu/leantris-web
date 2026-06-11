jQuery(document).ready(function ($) {
	// Function to update JSON in hidden input
	function updateJsonState(container) {
		const settingsType = container.data('settings-type')
		let hiddenInput
		switch (settingsType) {
			case 'element-buttons':
				hiddenInput = jQuery('#misc_options_gridder_buttons')
				break
			case 'top-buttons':
				hiddenInput = jQuery('#misc_options_gridder_top_buttons')
				break
			case 'action-buttons':
				hiddenInput = jQuery('#misc_options_gridder_action_buttons')
				break
		}

		const settings = {}
		container.find('input[type="checkbox"]').each(function () {
			const buttonId = jQuery(this).attr('id').replace('gridder_button_', '').replace('gridder_top_button_', '').replace('gridder_action_button_', '')
			settings[buttonId] = jQuery(this).prop('checked') ? 'on' : 'off'
		})

		hiddenInput.val(JSON.stringify(settings))
	}

	// Function to initialize checkboxes from saved JSON
	function initializeCheckboxes(container) {
		const settingsType = container.data('settings-type')
		let hiddenInput
		switch (settingsType) {
			case 'element-buttons':
				hiddenInput = jQuery('#misc_options_gridder_buttons')
				break
			case 'top-buttons':
				hiddenInput = jQuery('#misc_options_gridder_top_buttons')
				break
			case 'action-buttons':
				hiddenInput = jQuery('#misc_options_gridder_action_buttons')
				break
		}

		try {
			const settings = JSON.parse(hiddenInput.val() || '{}')
			container.find('input[type="checkbox"]').each(function () {
				const buttonId = jQuery(this).attr('id').replace('gridder_button_', '').replace('gridder_top_button_', '').replace('gridder_action_button_', '')
				jQuery(this).prop('checked', !settings[buttonId] || settings[buttonId] === 'on')
			})
		} catch (e) {
			console.error('Error parsing JSON settings:', e)
		}
	}

	// Initialize all button groups
	jQuery('.gridder-buttons-grid').each(function () {
		initializeCheckboxes(jQuery(this))
	})

	// Handle checkbox changes
	jQuery('.gridder-buttons-grid input[type="checkbox"]').on('change', function () {
		updateJsonState(jQuery(this).closest('.gridder-buttons-grid'))
	})
})

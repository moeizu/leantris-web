jQuery(document).ready(function ($) {
	var initialState = {}
	var isSaving = false
	var reloadSettingKeys = [
		'misc_options_templates',
		'misc_options_cover',
		'misc_options_enable_horizontal_scroll',
		'misc_options_activate_projects_overlay_feature',
		'misc_options_activate_news_feature',
		'misc_options_activate_deck_feature',
		'misc_options_deck_feature_slug',
		'misc_options_activate_lay_cache',
		'misc_options_disable_ajax',
		'misc_options_hide_projects',
		'misc_options_header',
	]

	function shouldReloadAfterSave(changedSettings) {
		return Object.keys(changedSettings).some(function (key) {
			return reloadSettingKeys.indexOf(key) !== -1
		})
	}

	/**
	 * Get the current value of an input element
	 */
	function getInputValue($el) {
		var type = $el.attr('type')
		var tagName = $el.prop('tagName').toLowerCase()

		if (tagName === 'select') {
			return $el.val() || ''
		}

		if (type === 'checkbox') {
			return $el.is(':checked') ? 'on' : ''
		}

		if (type === 'radio') {
			return $el.filter(':checked').val() || ''
		}

		if (type === 'number') {
			return $el.val() || ''
		}

		// Handle color pickers (wp-color-picker)
		if ($el.hasClass('wp-color-picker') || $el.hasClass('gridder-ui-color-picker')) {
			return $el.val() || ''
		}

		// Default: text, textarea, hidden
		return $el.val() || ''
	}

	/**
	 * Skip transient gridder button checkboxes.
	 * Their persisted value lives in hidden JSON inputs:
	 * misc_options_gridder_buttons / _top_buttons / _action_buttons.
	 */
	function shouldSkipInput($el, name, type) {
		if (!name) {
			return true
		}

		if (type === 'submit' || type === 'button') {
			return true
		}

		var isGridderButtonCheckbox = type === 'checkbox' && /^(gridder_button_|gridder_top_button_|gridder_action_button_)/.test(name)
		if (isGridderButtonCheckbox) {
			return true
		}

		return false
	}

	/**
	 * Initialize: capture initial state of all form inputs
	 */
	function initializeState() {
		// Clear any existing state
		initialState = {}
		var processedNames = {} // Track which names we've already processed (for radio buttons)

		$('form[action="options.php"] input, form[action="options.php"] select, form[action="options.php"] textarea').each(function () {
			var $el = $(this)
			var name = $el.attr('name')
			var type = $el.attr('type')

			// Skip system fields and non-persisted/transient inputs
			if (name && name !== '_wpnonce' && name !== 'option_page' && name !== '_wp_http_referer' && !shouldSkipInput($el, name, type)) {
				// For radio buttons, only process once (get the checked one)
				if (type === 'radio') {
					if (processedNames[name]) {
						// Already processed this radio group, skip
						return
					}
					processedNames[name] = true
					// Get the checked radio button value
					var $checked = $('input[name="' + name + '"]:checked')
					var value = $checked.length > 0 ? getInputValue($checked) : ''
					initialState[name] = value
				} else {
					// For other input types, process normally
					var value = getInputValue($el)
					initialState[name] = value
				}

				// Log for debugging
				if (name === 'misc_options_extra_gridder_for_phone' || name === 'misc_options_image_loading_blur') {
					console.log('[Lay Options] Initial state for', name, ':', initialState[name])
				}
			}
		})

		console.log('[Lay Options] Initial state captured:', Object.keys(initialState).length, 'settings')
	}

	/**
	 * Compare current state with initial state and return changed settings
	 */
	function getChangedSettings() {
		var changedSettings = {}
		var processedNames = {} // Track which names we've already processed (for radio buttons)

		$('form[action="options.php"] input, form[action="options.php"] select, form[action="options.php"] textarea').each(function () {
			var $el = $(this)
			var name = $el.attr('name')
			var type = $el.attr('type')

			// Skip system fields and non-persisted/transient inputs
			if (name && name !== '_wpnonce' && name !== 'option_page' && name !== '_wp_http_referer' && !shouldSkipInput($el, name, type)) {
				// For radio buttons, only process once (get the checked one)
				if (type === 'radio') {
					if (processedNames[name]) {
						// Already processed this radio group, skip
						return
					}
					processedNames[name] = true
					// Get the checked radio button value
					var $checked = $('input[name="' + name + '"]:checked')
					var currentValue = $checked.length > 0 ? getInputValue($checked) : ''
				} else {
					// For other input types, process normally
					var currentValue = getInputValue($el)
				}

				var initialValue = initialState[name]

				// Handle undefined initial value (shouldn't happen, but be safe)
				if (initialValue === undefined) {
					initialValue = ''
				}

				// Compare values (handle type conversion for numbers)
				if (currentValue !== initialValue) {
					changedSettings[name] = currentValue
					console.log('[Lay Options] Change detected:', name, 'initial:', initialValue, 'current:', currentValue)
				}
			}
		})

		return changedSettings
	}

	/**
	 * Show toast notification
	 */
	function showToast(message, type) {
		// Remove existing toast if any
		$('.lay-options-toast').remove()

		// Create toast element (matching formatsmanager toast style - always black, no type classes)
		var $toast = $('<div class="lay-options-toast">' + message + '</div>')
		$('body').append($toast)

		// Trigger show animation
		setTimeout(function () {
			$toast.addClass('show')
		}, 10)

		// Hide after delay
		setTimeout(function () {
			$toast.removeClass('show')
			setTimeout(function () {
				$toast.remove()
			}, 350) // Wait for fade out animation
		}, 2000) // Show for 2 seconds
	}

	/**
	 * Update submit button state
	 */
	function setButtonState(state, message) {
		var $button = $('form[action="options.php"] input[type="submit"]')

		// Store original value only if it hasn't been stored yet
		// Check if data attribute exists (not just truthy, since empty string could be valid)
		var storedOriginalValue = $button.data('original-value')
		if (storedOriginalValue === undefined || storedOriginalValue === null) {
			// Store the current value as original (only on first call)
			var currentVal = $button.val()
			$button.data('original-value', currentVal)
			storedOriginalValue = currentVal
			console.log('[Lay Options] Stored original button value:', storedOriginalValue)
		}

		var originalValue = storedOriginalValue
		console.log('[Lay Options] setButtonState called:', state, 'message:', message, 'originalValue:', originalValue, 'currentValue:', $button.val())

		if (state === 'saving') {
			$button.prop('disabled', true).val(message || 'Saving...')
			console.log('[Lay Options] Button set to saving state, text:', $button.val(), 'disabled:', $button.prop('disabled'))
		} else if (state === 'idle') {
			$button.prop('disabled', false).val(originalValue)
			console.log('[Lay Options] Button set to idle state, text:', $button.val(), 'disabled:', $button.prop('disabled'))
		} else if (state === 'disabled') {
			$button.prop('disabled', true).val(originalValue)
			console.log('[Lay Options] Button set to disabled state, text:', $button.val(), 'disabled:', $button.prop('disabled'))
		} else if (state === 'enabled') {
			$button.prop('disabled', false).val(originalValue)
			console.log('[Lay Options] Button set to enabled state, text:', $button.val(), 'disabled:', $button.prop('disabled'))
		}
	}

	/**
	 * Check if there are changes and update button state accordingly
	 */
	function updateButtonState() {
		var changedSettings = getChangedSettings()
		var hasChanges = Object.keys(changedSettings).length > 0

		console.log('[Lay Options] updateButtonState called, hasChanges:', hasChanges, 'changedSettings count:', Object.keys(changedSettings).length)

		if (hasChanges) {
			setButtonState('enabled')
		} else {
			setButtonState('disabled')
		}
	}

	/**
	 * Handle form submission
	 */
	function handleFormSubmit(e) {
		e.preventDefault()

		if (isSaving) {
			return false
		}

		// Get changed settings
		var changedSettings = getChangedSettings()

		if (Object.keys(changedSettings).length === 0) {
			showToast('No changes to save.', 'info')
			return false
		}

		console.log('[Lay Options] Saving', Object.keys(changedSettings).length, 'changed settings:', Object.keys(changedSettings))

		isSaving = true
		setButtonState('saving', 'Saving...')

		// Get nonce from localized script data
		var nonce = layMiscOptionsAjax.nonce

		// Prepare form data
		var formData = new FormData()
		formData.append('action', 'lay_miscoptions_save')
		formData.append('nonce', nonce)

		// Add changed settings
		Object.keys(changedSettings).forEach(function (key) {
			formData.append('changedSettings[' + key + ']', changedSettings[key])
		})

		console.log('formData')
		console.log(formData)

		// Send AJAX request
		$.ajax({
			url: layMiscOptionsAjax.ajaxUrl,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function (response) {
				console.log('[Lay Options] AJAX success callback called, response.success:', response.success)
				console.log('[Lay Options] Raw AJAX response:', response)
				if (response && response.data) {
					console.log('[Lay Options] Response data keys:', Object.keys(response.data))
					try {
						console.log('[Lay Options] Response data JSON:', JSON.stringify(response.data))
					} catch (e) {
						console.warn('[Lay Options] Could not stringify response data:', e)
					}
				}
				if (response.success) {
					if (response.data && response.data.debug) {
						console.log('[Lay Options] Save debug info:', response.data.debug)
					}
					if (response.data && response.data.handlerVersion) {
						console.log('[Lay Options] AJAX handler version:', response.data.handlerVersion)
					}
					// Update initial state to current state (so we don't show "unsaved changes" after save)
					Object.keys(changedSettings).forEach(function (key) {
						initialState[key] = changedSettings[key]
					})

					showToast(response.data.message || 'Settings saved.', 'success')
					console.log('[Lay Options] Save successful:', response.data)

					// Reset button to idle first (restores original text), then update based on remaining changes
					console.log('[Lay Options] Before setButtonState("idle"), isSaving:', isSaving)
					setButtonState('idle')
					console.log('[Lay Options] After setButtonState("idle"), calling updateButtonState')
					updateButtonState()
					console.log('[Lay Options] After updateButtonState in success handler')

					if (shouldReloadAfterSave(changedSettings)) {
						setTimeout(function () {
							window.location.reload()
						}, 300)
					}
				} else {
					var errorMessage = response.data && response.data.message ? response.data.message : 'Failed to save settings.'

					// Add error details if available
					if (response.data && response.data.errors && response.data.errors.length > 0) {
						console.error('[Lay Options] Save errors:', response.data.errors)
						errorMessage += ' (' + response.data.errors.length + ' error' + (response.data.errors.length > 1 ? 's' : '') + ')'
					}
					if (response.data && response.data.debug) {
						console.error('[Lay Options] Save debug info:', response.data.debug)
					}
					if (response.data && response.data.handlerVersion) {
						console.error('[Lay Options] AJAX handler version:', response.data.handlerVersion)
					}

					showToast(errorMessage, 'error')
					console.error('[Lay Options] Save failed:', response.data)

					// Keep button enabled if save failed (so user can try again)
					updateButtonState()
				}
			},
			error: function (xhr, status, error) {
				showToast('Error saving settings: ' + error, 'error')
				console.error('[Lay Options] AJAX error:', error)
				console.error('[Lay Options] AJAX error status:', status)
				console.error('[Lay Options] AJAX xhr.responseText:', xhr && xhr.responseText ? xhr.responseText : '')
			},
			complete: function () {
				console.log('[Lay Options] AJAX complete callback called, setting isSaving to false')
				isSaving = false
				// First restore button to idle state (this restores the original text)
				console.log('[Lay Options] In complete callback, before setButtonState("idle")')
				setButtonState('idle')
				// Then update button state based on whether there are remaining changes
				console.log('[Lay Options] In complete callback, before updateButtonState')
				updateButtonState()
				console.log('[Lay Options] In complete callback, after updateButtonState')
			},
		})

		return false
	}

	// Initialize - wait for all scripts to load
	var initComplete = false

	function doInitialization() {
		if (initComplete) {
			console.log('[Lay Options] Initialization already completed, skipping')
			return
		}
		initComplete = true
		console.log('[Lay Options] Starting initialization')

		// Wait a bit more to ensure color pickers and other scripts have initialized
		setTimeout(function () {
			console.log('[Lay Options] Capturing initial state now')
			initializeState()

			// Disable button initially
			setButtonState('disabled')

			// Monitor form inputs for changes (but exclude submit buttons)
			$('form[action="options.php"]').on('change input', 'input:not([type="submit"]):not([type="button"]), select, textarea', function () {
				updateButtonState()
			})

			// Handle color picker changes (wp-color-picker fires custom events)
			$(document).on('wp-colorpicker-change', function (e, color) {
				updateButtonState()
			})
			// Line color pickers (lay-hr, lay-vl) trigger this when value changes
			$(document).on('lay-options-line-color-change', function () {
				updateButtonState()
			})

			// Intercept form submission
			$('form[action="options.php"]').on('submit', handleFormSubmit)
		}, 1000) // Wait 1 second for all scripts to initialize
	}

	// Initialize on window load to ensure everything is ready
	$(window).on('load', function () {
		console.log('[Lay Options] Window load event fired')
		doInitialization()
	})

	// Fallback: also try on document ready (in case window.load already fired)
	if (document.readyState === 'complete') {
		console.log('[Lay Options] Document already complete, initializing immediately')
		doInitialization()
	} else {
		$(document).ready(function () {
			console.log('[Lay Options] Document ready, will initialize after delay')
			setTimeout(doInitialization, 500)
		})
	}
})

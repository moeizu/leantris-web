jQuery(document).ready(function ($) {
	var initialState = {}
	var isSaving = false

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

		// Default: text, textarea, hidden
		return $el.val() || ''
	}

	/**
	 * Initialize: capture initial state of all form inputs
	 */
	function initializeState() {
		// Clear any existing state
		initialState = {}

		$('form[action="options.php"] input, form[action="options.php"] select, form[action="options.php"] textarea').each(function () {
			var $el = $(this)
			var name = $el.attr('name')
			var type = $el.attr('type')

			// Skip system fields and submit buttons
			if (name && name !== '_wpnonce' && name !== 'option_page' && name !== '_wp_http_referer' && type !== 'submit' && type !== 'button') {
				var value = getInputValue($el)
				initialState[name] = value
			}
		})

		console.log('[HTML/CSS Options] Initial state captured:', Object.keys(initialState).length, 'settings')
	}

	/**
	 * Compare current state with initial state and return changed settings
	 */
	function getChangedSettings() {
		var changedSettings = {}

		$('form[action="options.php"] input, form[action="options.php"] select, form[action="options.php"] textarea').each(function () {
			var $el = $(this)
			var name = $el.attr('name')
			var type = $el.attr('type')

			// Skip system fields and submit buttons
			if (name && name !== '_wpnonce' && name !== 'option_page' && name !== '_wp_http_referer' && type !== 'submit' && type !== 'button') {
				var currentValue = getInputValue($el)
				var initialValue = initialState[name]

				// Handle undefined initial value
				if (initialValue === undefined) {
					initialValue = ''
				}

				// Compare values
				if (currentValue !== initialValue) {
					changedSettings[name] = currentValue
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

		// Create toast element
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
		var $fullscreenButton = $('.lay-ace-editor-header .lay-htmlcss-save-button')

		// Store original value only if it hasn't been stored yet
		var storedOriginalValue = $button.data('original-value')
		if (storedOriginalValue === undefined || storedOriginalValue === null) {
			var currentVal = $button.val()
			$button.data('original-value', currentVal)
			storedOriginalValue = currentVal
		}

		var originalValue = storedOriginalValue

		if (state === 'saving') {
			$button.prop('disabled', true).val(message || 'Saving...')
			$fullscreenButton.prop('disabled', true).text(message || 'Saving...')
		} else if (state === 'idle') {
			$button.prop('disabled', false).val(originalValue)
			$fullscreenButton.prop('disabled', false).text(originalValue)
		} else if (state === 'disabled') {
			$button.prop('disabled', true).val(originalValue)
			$fullscreenButton.prop('disabled', true).text(originalValue)
		} else if (state === 'enabled') {
			$button.prop('disabled', false).val(originalValue)
			$fullscreenButton.prop('disabled', false).text(originalValue)
		}
	}

	/**
	 * Check if there are changes and update button state accordingly
	 */
	function updateButtonState() {
		var changedSettings = getChangedSettings()
		var hasChanges = Object.keys(changedSettings).length > 0

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
			console.log('[HTML/CSS Options] Save already in progress, ignoring')
			return
		}

		var changedSettings = getChangedSettings()
		var hasChanges = Object.keys(changedSettings).length > 0

		if (!hasChanges) {
			showToast('No changes to save.', 'info')
			return
		}

		isSaving = true
		setButtonState('saving', 'Saving...')

		// Build FormData
		var formData = new FormData()
		formData.append('action', 'lay_htmlcssoptions_save')
		formData.append('nonce', layHTMLCSSOptionsAjax.nonce)
		formData.append('changedSettings', JSON.stringify(changedSettings))

		// Send AJAX request
		$.ajax({
			url: layHTMLCSSOptionsAjax.ajaxUrl,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function (response) {
				if (response.success) {
					// Update initial state to current state
					Object.keys(changedSettings).forEach(function (key) {
						initialState[key] = changedSettings[key]
					})

					showToast(response.data.message || 'Settings saved.', 'success')

					// Reset button to idle first, then update based on remaining changes
					setButtonState('idle')
					updateButtonState()

					// After a successful save, clear the "unsaved changes" warning state
					window.removeEventListener('beforeunload', handleBeforeUnload)
				} else {
					var errorMessage = response.data && response.data.message ? response.data.message : 'Failed to save settings.'

					// Add error details if available
					if (response.data && response.data.errors && response.data.errors.length > 0) {
						errorMessage += ' (' + response.data.errors.length + ' error' + (response.data.errors.length > 1 ? 's' : '') + ')'
					}

					showToast(errorMessage, 'error')

					// Keep button enabled if save failed
					updateButtonState()
				}
			},
			error: function (xhr, status, error) {
				showToast('Error saving settings: ' + error, 'error')
				console.error('[HTML/CSS Options] AJAX error:', error)
				updateButtonState()
			},
			complete: function () {
				isSaving = false
			}
		})
	}

	/**
	 * Warn when leaving the page with unsaved changes
	 */
	function handleBeforeUnload(e) {
		var changedSettings = getChangedSettings()
		var hasChanges = Object.keys(changedSettings).length > 0
		if (!hasChanges) {
			return
		}
		// Standard beforeunload handling
		e.preventDefault()
		e.returnValue = ''
		return ''
	}

	/**
	 * Add save button to fullscreen header
	 */
	function addFullscreenSaveButton() {
		// Clone the main save button and add to each editor header
		var $mainButton = $('form[action="options.php"] input[type="submit"]')
		if ($mainButton.length === 0) {
			return
		}

		var originalValue = $mainButton.val()
		
		$('.lay-ace-editor-header').each(function () {
			var $header = $(this)
			var $actions = $header.find('.lay-ace-header-actions')
			// Only add if not already added
			if ($header.find('.lay-htmlcss-save-button').length === 0) {
				var $button = $('<button type="button" class="button button-primary lay-htmlcss-save-button">' + originalValue + '</button>')
				if ($actions.length > 0) {
					// Save button first in actions
					$actions.prepend($button)
				} else {
					$header.append($button)
				}
				
				// Handle click
				$button.on('click', function (e) {
					e.preventDefault()
					// Trigger form submit
					$('form[action="options.php"]').trigger('submit')
				})
			}
		})
	}

	/**
	 * Show/hide save button in fullscreen mode
	 */
	function toggleFullscreenSaveButton() {
		$('.lay-ace-editor-wrap').each(function () {
			var $wrap = $(this)
			var $header = $wrap.find('.lay-ace-editor-header')
			var $button = $header.find('.lay-htmlcss-save-button')
			
			if ($wrap.hasClass('fullscreen')) {
				$button.show()
			} else {
				$button.hide()
			}
		})
	}

	// Initialize - wait for all scripts to load
	var initComplete = false

	function doInitialization() {
		if (initComplete) {
			return
		}
		initComplete = true

		// Wait a bit to ensure Ace editors have initialized
		setTimeout(function () {
			initializeState()

			// Disable button initially
			setButtonState('disabled')

			// Add save button to fullscreen headers
			addFullscreenSaveButton()
			toggleFullscreenSaveButton()

			// Monitor form inputs for changes
			$('form[action="options.php"]').on('change input', 'input:not([type="submit"]):not([type="button"]), select, textarea', function () {
				updateButtonState()
				// Attach beforeunload warning when there are unsaved changes
				var changedSettings = getChangedSettings()
				if (Object.keys(changedSettings).length > 0) {
					window.removeEventListener('beforeunload', handleBeforeUnload)
					window.addEventListener('beforeunload', handleBeforeUnload)
				}
			})

			// Monitor Ace editor changes (they update textareas via change events)
			// Ace editors update textareas on change, so we can monitor textareas
			// Also set up direct Ace editor listeners for more immediate updates
			var editorIds = [
				'lay-custom-css-editor',
				'lay-custom-css-desktop-editor',
				'lay-custom-css-mobile-editor',
				'lay-custom-head-content-editor',
				'lay-custom-htmltop-editor',
				'lay-custom-htmlbottom-editor'
			]
			
			editorIds.forEach(function(editorId) {
				try {
					var editor = ace.edit(editorId)
					if (editor) {
						editor.getSession().on('change', function() {
							// Small delay to ensure textarea is updated
							setTimeout(function() {
								updateButtonState()
							}, 50)
						})
					}
				} catch(e) {
					// Editor might not be initialized yet
					console.log('[HTML/CSS Options] Editor not ready:', editorId)
				}
			})

			// Intercept form submission
			$('form[action="options.php"]').on('submit', handleFormSubmit)

			// Watch for fullscreen toggle
			$(document).on('click', '.lay-ace-fullscreen-toggle', function () {
				setTimeout(function () {
					toggleFullscreenSaveButton()
					updateButtonState()
				}, 100)
			})
		}, 1000) // Wait 1 second for all scripts to initialize
	}

	// Initialize on window load
	$(window).on('load', function () {
		doInitialization()
	})

	// Fallback: also try on document ready
	if (document.readyState === 'complete') {
		doInitialization()
	} else {
		$(document).ready(function () {
			setTimeout(doInitialization, 500)
		})
	}
})


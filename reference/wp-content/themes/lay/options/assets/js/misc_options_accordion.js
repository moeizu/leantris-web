var lay_options_accordion = (function () {
	var STORAGE_KEY = 'lay_options_sections_state'
	var sectionsState = {}
	var HIGHLIGHT_CLASS = 'layoptions-scroll-highlight'

	var initModule = function () {
		loadState()
		wrapSections()
		bindClicks()
		handleHashNavigation()
		updateChevrons()
	}

	var loadState = function () {
		try {
			var saved = localStorage.getItem(STORAGE_KEY)
			if (saved) {
				sectionsState = JSON.parse(saved)
			}
		} catch (e) {
			console.error('Failed to load sections state:', e)
		}
	}

	var saveState = function () {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sectionsState))
		} catch (e) {
			console.error('Failed to save sections state:', e)
		}
	}

	var wrapSections = function () {
		// Find all section divs (those with IDs starting with "lay-")
		// These are the before_section markers from WordPress Settings API
		jQuery('form[action="options.php"] [id^="lay-"]').each(function () {
			var $sectionDiv = jQuery(this)
			var sectionId = $sectionDiv.attr('id')

			// Skip if already wrapped
			if ($sectionDiv.closest('.layoptions-section-wrapper').length > 0) {
				return
			}

			// WordPress Settings API structure:
			// <div id="lay-section-id"></div>  (before_section marker)
			// <h2>Section Title</h2>
			// <table class="form-table">...</table>
			// <p>Help text (optional)</p>
			// <div id="lay-next-section"></div>  (next section marker)

			var $content = jQuery()
			var $current = $sectionDiv.next()

			// Collect all content until we hit the next section marker or end of form
			while ($current.length > 0) {
				// Stop if we hit another section marker
				if ($current.is('[id^="lay-"]')) {
					break
				}
				// Stop if we hit the bottom submit button
				if ($current.is('.bottom-layoptions-submit-button-wrap')) {
					break
				}
				// Stop if we're outside the form
				if (!$current.closest('form[action="options.php"]').length) {
					break
				}

				// Add this element to content
				$content = $content.add($current)

				// Move to next sibling
				$current = $current.next()
			}

			if ($content.length === 0) {
				console.warn('No content found for section:', sectionId)
				return // No content to wrap
			}

			// Create wrapper
			var $wrapper = jQuery('<div class="layoptions-section-wrapper collapsed" data-section-id="' + sectionId + '"></div>')

			// Create content container with grid transition
			var $contentContainer = jQuery('<div class="layoptions-section-content"></div>')
			var $contentInner = jQuery('<div class="layoptions-section-content-inner"></div>')

			// Move content into wrapper
			// Use detach() to preserve event handlers and data
			$content.detach().appendTo($contentInner)

			$contentContainer.append($contentInner)
			$wrapper.append($contentContainer)

			// Find the corresponding button item and insert wrapper after the button
			var $buttonItem = jQuery('.layoptions-section-item[data-section-id="' + sectionId + '"]')
			if ($buttonItem.length > 0) {
				// Insert wrapper after the button inside the item
				$buttonItem.find('.layoptions-section-button').after($wrapper)
			} else {
				// Fallback: insert after the section div if button not found
				$sectionDiv.after($wrapper)
			}

			// Remove the original section div (it's just a marker)
			$sectionDiv.remove()

			// Check if section should be expanded (only from saved state, no hash)
			var shouldExpand = sectionsState[sectionId] === true
			if (shouldExpand) {
				$wrapper.removeClass('collapsed').addClass('expanded')
				$buttonItem.addClass('expanded')
				sectionsState[sectionId] = true
			}
		})

		updateChevrons()
	}

	var bindClicks = function () {
		jQuery(document).on('click', '.layoptions-section-button', function (e) {
			e.preventDefault()
			e.stopPropagation()
			var $button = jQuery(this)
			var $item = $button.closest('.layoptions-section-item')
			var sectionId = $item.attr('data-section-id')
			toggleSection(sectionId)
		})
	}

	var openSection = function (sectionId) {
		var $wrapper = jQuery('.layoptions-section-wrapper[data-section-id="' + sectionId + '"]')
		if ($wrapper.length === 0) {
			return
		}

		var $item = jQuery('.layoptions-section-item[data-section-id="' + sectionId + '"]')

		// Close all other sections first
		jQuery('.layoptions-section-wrapper')
			.not($wrapper)
			.each(function () {
				var $otherWrapper = jQuery(this)
				var otherSectionId = $otherWrapper.attr('data-section-id')
				var $otherItem = jQuery('.layoptions-section-item[data-section-id="' + otherSectionId + '"]')
				$otherWrapper.removeClass('expanded').addClass('collapsed')
				$otherItem.removeClass('expanded')
				sectionsState[otherSectionId] = false
			})

		// Open the requested section
		$wrapper.removeClass('collapsed').addClass('expanded')
		$item.addClass('expanded')
		sectionsState[sectionId] = true

		saveState()
		updateChevrons()
	}

	var toggleSection = function (sectionId) {
		var $wrapper = jQuery('.layoptions-section-wrapper[data-section-id="' + sectionId + '"]')
		if ($wrapper.length === 0) {
			return
		}

		var isCollapsed = $wrapper.hasClass('collapsed')

		if (isCollapsed) {
			openSection(sectionId)
			return
		} else {
			// Close the section
			$wrapper.removeClass('expanded').addClass('collapsed')
			var $item = jQuery('.layoptions-section-item[data-section-id="' + sectionId + '"]')
			$item.removeClass('expanded')
			sectionsState[sectionId] = false
		}

		saveState()
		updateChevrons()
	}

	var handleHashNavigation = function () {
		var activateHash = function () {
			var rawHash = window.location.hash
			if (!rawHash || rawHash.length < 2) {
				return
			}

			// Strip leading "#" and escape for jQuery selector
			var targetId = rawHash.substring(1)
			var safeId = targetId.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
			var $target = jQuery('#' + safeId)
			if ($target.length === 0) {
				return
			}

			var $wrapper = $target.closest('.layoptions-section-wrapper')
			if ($wrapper.length === 0) {
				return
			}

			var sectionId = $wrapper.attr('data-section-id')
			openSection(sectionId)

			// Scroll to the referenced element for better visibility after expand
			setTimeout(function () {
				// Prefer the surrounding table row for visibility/highlight
				var $row = $target.closest('tr')
				var $scrollTarget = $row.length ? $row : $target.length ? $target : $wrapper
				if ($scrollTarget.length) {
					var top = $scrollTarget.offset().top - 180
					jQuery('html, body').animate({ scrollTop: top }, 200)

					// Highlight the target briefly
					addTemporaryHighlight($scrollTarget)
				}
			}, 250)
		}

		// Run once on load (after sections are wrapped)
		setTimeout(activateHash, 50)

		// React to later hash changes as well
		jQuery(window).on('hashchange', activateHash)
	}

	var ensureHighlightStyle = function () {
		if (document.getElementById('layoptions-highlight-style')) {
			return
		}
		var style = document.createElement('style')
		style.id = 'layoptions-highlight-style'
		style.textContent = '.' + HIGHLIGHT_CLASS + ' { outline: 3px solid #00ffff; outline-offset: 4px; }'
		document.head.appendChild(style)
	}

	var addTemporaryHighlight = function ($el) {
		if (!$el || !$el.length) {
			return
		}
		ensureHighlightStyle()

		// Prefer highlighting the row containing the element (better visibility)
		var $row = $el.closest('tr')
		var $target = $row.length ? $row : $el

		$target.addClass(HIGHLIGHT_CLASS)
		setTimeout(function () {
			$target.removeClass(HIGHLIGHT_CLASS)
		}, 5000)
	}

	var updateChevrons = function () {
		jQuery('.layoptions-section-item').each(function () {
			var $item = jQuery(this)
			var sectionId = $item.attr('data-section-id')
			var $wrapper = jQuery('.layoptions-section-wrapper[data-section-id="' + sectionId + '"]')
			var $chevron = $item.find('.layoptions-section-chevron svg path')

			if ($wrapper.length > 0 && $wrapper.hasClass('expanded')) {
				// Expanded - show down chevron
				$chevron.attr('d', 'm19.5 8.25-7.5 7.5-7.5-7.5')
			} else {
				// Collapsed - show right chevron
				$chevron.attr('d', 'm8.25 4.5 7.5 7.5-7.5 7.5')
			}
		})
	}

	return {
		initModule: initModule,
		sectionsState: sectionsState, // Expose for search functionality
		updateChevrons: updateChevrons, // Expose for search functionality
	}
})()

jQuery(document).ready(function () {
	// Wait a bit to ensure WordPress Settings API has rendered everything
	setTimeout(function () {
		lay_options_accordion.initModule()
	}, 100)
})

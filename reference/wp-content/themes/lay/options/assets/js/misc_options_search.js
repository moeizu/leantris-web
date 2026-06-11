jQuery(document).ready(function ($) {
	var fuse = null
	var searchableData = []
	var searchInput = $('#layoptions-search-input')
	var highlightClass = 'layoptions-search-highlight'
	var dataAttrOriginal = 'data-layoptions-original-text'

	/**
	 * Initialize Fuse.js with all searchable content
	 */
	function initializeSearch() {
		// Collect all searchable content from the page
		searchableData = []

		// Get all settings rows
		$('form[action="options.php"] .form-table tr').each(function () {
			var $row = $(this)
			var $label = $row.find('th label, th')
			var $input = $row.find('input, select, textarea')
			var $description = $row.find('td p, td .description, td label')

			// Get section ID
			var $sectionWrapper = $row.closest('.layoptions-section-wrapper')
			var sectionId = $sectionWrapper.attr('data-section-id') || ''
			var $sectionButton = $('.layoptions-section-item[data-section-id="' + sectionId + '"]')
			var $sectionTitle = $sectionButton.find('.layoptions-section-title')
			var sectionTitle = $sectionTitle.text() || ''

			// Store original HTML in data attribute if not already stored (preserve markup)
			// But only if it doesn't already contain highlights (corrupted)
			if ($sectionTitle.length > 0) {
				var titleHtml = $sectionTitle.html()
				var existingTitle = $sectionTitle.attr(dataAttrOriginal)
				if (!existingTitle || (existingTitle.indexOf(highlightClass) === -1 && titleHtml.indexOf(highlightClass) === -1)) {
					$sectionTitle.attr(dataAttrOriginal, titleHtml)
				}
			}
			if ($label.length > 0) {
				var labelHtml = $label.html()
				var existingLabel = $label.attr(dataAttrOriginal)
				if (!existingLabel || (existingLabel.indexOf(highlightClass) === -1 && labelHtml.indexOf(highlightClass) === -1)) {
					$label.attr(dataAttrOriginal, labelHtml)
				}
			}
			if ($description.length > 0) {
				var descHtml = $description.html()
				var existingDesc = $description.attr(dataAttrOriginal)
				if (!existingDesc || (existingDesc.indexOf(highlightClass) === -1 && descHtml.indexOf(highlightClass) === -1)) {
					$description.attr(dataAttrOriginal, descHtml)
				}
			}

			// Build searchable object
			var searchableItem = {
				sectionId: sectionId,
				sectionTitle: sectionTitle,
				label: $label.text().trim(),
				inputName: $input.attr('name') || '',
				inputId: $input.attr('id') || '',
				description: $description.text().trim(),
				$row: $row, // Store jQuery element for highlighting
				$label: $label,
				$description: $description,
				$sectionTitle: $sectionTitle,
				rowId: $row[0].id || 'layoptions-row-' + Date.now() + '-' + Math.random(), // Unique ID for the row
			}

			// Store row ID on the element for easy tracking
			if (!$row[0].id) {
				$row.attr('data-layoptions-row-id', searchableItem.rowId)
			}

			// Only add if it has some text content
			if (searchableItem.label || searchableItem.description || searchableItem.sectionTitle) {
				searchableData.push(searchableItem)
			}
		})

		// Also collect Gridder buttons settings (they're not in standard form-table rows)
		jQuery('form[action="options.php"] .gridder-buttons-to-show, form[action="options.php"] .gridder-ui-settings').each(function () {
			var $container = jQuery(this)
			var $sectionWrapper = $container.closest('.layoptions-section-wrapper')
			var sectionId = $sectionWrapper.attr('data-section-id') || ''
			var $sectionButton = jQuery('.layoptions-section-item[data-section-id="' + sectionId + '"]')
			var $sectionTitle = $sectionButton.find('.layoptions-section-title')
			var sectionTitle = $sectionTitle.text() || ''

			// Find the parent row (if it exists)
			var $row = $container.closest('tr')
			var rowId = $row.length > 0 ? $row.attr('data-layoptions-row-id') || 'layoptions-row-' + Date.now() + '-' + Math.random() : 'layoptions-row-' + Date.now() + '-' + Math.random()
			if ($row.length > 0 && !$row.attr('data-layoptions-row-id')) {
				$row.attr('data-layoptions-row-id', rowId)
			}

			// Process section titles (like "Element Buttons", "Top Buttons / Inputs", "Action Buttons")
			$container.find('.lay-rows-title').each(function () {
				var $title = jQuery(this)
				var titleText = $title.text().trim()

				// Store original HTML
				var titleHtml = $title.html()
				var existingTitle = $title.attr(dataAttrOriginal)
				if (!existingTitle || (existingTitle.indexOf(highlightClass) === -1 && titleHtml.indexOf(highlightClass) === -1)) {
					$title.attr(dataAttrOriginal, titleHtml)
				}

				if (titleText) {
					searchableData.push({
						sectionId: sectionId,
						rowId: rowId,
						sectionTitle: sectionTitle,
						label: titleText,
						inputName: '',
						inputId: '',
						description: '',
						$row: $row.length > 0 ? $row : $container,
						$label: $title,
						$description: jQuery(),
						$sectionTitle: $sectionTitle,
					})
				}
			})

			// Process paragraph descriptions
			$container.find('p').each(function () {
				var $p = jQuery(this)
				var descText = $p.text().trim()

				// Store original HTML
				var descHtml = $p.html()
				var existingDesc = $p.attr(dataAttrOriginal)
				if (!existingDesc || (existingDesc.indexOf(highlightClass) === -1 && descHtml.indexOf(highlightClass) === -1)) {
					$p.attr(dataAttrOriginal, descHtml)
				}

				if (descText) {
					searchableData.push({
						sectionId: sectionId,
						rowId: rowId,
						sectionTitle: sectionTitle,
						label: '',
						inputName: '',
						inputId: '',
						description: descText,
						$row: $row.length > 0 ? $row : $container,
						$label: jQuery(),
						$description: $p,
						$sectionTitle: $sectionTitle,
					})
				}
			})

			// Process Gridder button labels
			$container.find('.gridder-button-item label').each(function () {
				var $label = jQuery(this)
				var labelText = $label.text().trim()
				var $input = $label.siblings('input[type="checkbox"]')
				var inputName = $input.attr('name') || ''
				var inputId = $input.attr('id') || ''

				// Store original HTML
				var labelHtml = $label.html()
				var existingLabel = $label.attr(dataAttrOriginal)
				if (!existingLabel || (existingLabel.indexOf(highlightClass) === -1 && labelHtml.indexOf(highlightClass) === -1)) {
					$label.attr(dataAttrOriginal, labelHtml)
				}

				if (labelText) {
					searchableData.push({
						sectionId: sectionId,
						rowId: rowId,
						sectionTitle: sectionTitle,
						label: labelText,
						inputName: inputName,
						inputId: inputId,
						description: '',
						$row: $row.length > 0 ? $row : $container,
						$label: $label,
						$description: jQuery(),
						$sectionTitle: $sectionTitle,
					})
				}
			})
		})

		// Initialize Fuse.js
		if (typeof Fuse !== 'undefined') {
			fuse = new Fuse(searchableData, {
				keys: ['sectionTitle', 'label', 'description', 'inputName', 'inputId'],
				threshold: 0.3,
				includeScore: true,
				includeMatches: true,
			})
		} else {
			console.error('Fuse.js is not loaded')
		}
	}

	/**
	 * Highlight text in a jQuery element
	 */
	function highlightText($element, searchTerm) {
		if (!$element || !$element.length || !searchTerm) return

		// Check if element already has highlights - if so, restore original first
		if ($element.find('.' + highlightClass).length > 0) {
			var originalHtml = $element.attr(dataAttrOriginal)
			if (originalHtml) {
				$element.html(originalHtml)
			}
		}

		// Get the CURRENT visible text (not from data attribute, as that might be different)
		var currentText = $element.text()
		var currentHtml = $element.html()

		// Only proceed if the search term actually appears in the visible text
		// Create a fresh regex for testing (don't reuse a global regex)
		var testRegex = new RegExp(escapeRegExp(searchTerm), 'gi')
		if (!testRegex.test(currentText)) {
			return // Don't highlight if search term not in visible text
		}

		// Create regex for highlighting (with capturing group)
		var regex = new RegExp('(' + escapeRegExp(searchTerm) + ')', 'gi')

		// Store original HTML if not already stored (and it doesn't contain highlights)
		var existingDataAttr = $element.attr(dataAttrOriginal)
		var originalHtml

		if (existingDataAttr) {
			// Check if the data attribute contains highlights (meaning it's corrupted)
			var tempDiv = jQuery('<div>').html(existingDataAttr)
			if (tempDiv.find('.' + highlightClass).length > 0) {
				// Data attribute contains highlights - it's corrupted, use current HTML
				originalHtml = currentHtml
				$element.attr(dataAttrOriginal, originalHtml)
			} else {
				// Check if the data attribute text matches the visible text
				var dataAttrText = tempDiv.text()
				if (dataAttrText === currentText) {
					originalHtml = existingDataAttr
				} else {
					// Data attribute contains different text - overwrite it with current HTML
					originalHtml = currentHtml
					$element.attr(dataAttrOriginal, originalHtml)
				}
			}
		} else {
			// No data attribute - store current HTML
			originalHtml = currentHtml
			$element.attr(dataAttrOriginal, originalHtml)
		}

		// Get clean text from original HTML (remove any existing highlights first)
		var cleanOriginalHtml = originalHtml
		if (cleanOriginalHtml.indexOf(highlightClass) !== -1) {
			// Original HTML contains highlights - extract clean text
			var tempDiv = jQuery('<div>').html(cleanOriginalHtml)
			tempDiv.find('.' + highlightClass).each(function () {
				jQuery(this).replaceWith(jQuery(this).text())
			})
			cleanOriginalHtml = tempDiv.html()
		}

		// Use DOM manipulation to highlight only text nodes (not HTML tags)
		var $tempContainer = jQuery('<div>').html(cleanOriginalHtml)

		// Function to recursively process nodes and highlight text
		function processNode(node) {
			if (node.nodeType === 3) {
				// Text node - highlight matching text
				var text = node.textContent
				// Create a fresh regex for this text node
				var nodeRegex = new RegExp('(' + escapeRegExp(searchTerm) + ')', 'gi')
				if (nodeRegex.test(text)) {
					// Use replace to find matches and build highlighted version
					var lastIndex = 0
					var fragment = document.createDocumentFragment()
					var match

					// Reset regex (global flag means we need to reset)
					nodeRegex.lastIndex = 0

					while ((match = nodeRegex.exec(text)) !== null) {
						// Add text before match
						if (match.index > lastIndex) {
							fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)))
						}

						// Add highlighted match
						var span = document.createElement('span')
						span.className = highlightClass
						span.textContent = match[0]
						fragment.appendChild(span)

						lastIndex = nodeRegex.lastIndex

						// Prevent infinite loop if regex doesn't advance
						if (match.index === nodeRegex.lastIndex) {
							nodeRegex.lastIndex++
						}
					}

					// Add remaining text after last match
					if (lastIndex < text.length) {
						fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
					}

					// Replace the text node with the fragment
					if (node.parentNode) {
						node.parentNode.replaceChild(fragment, node)
					}
				}
			} else if (node.nodeType === 1) {
				// Element node - process children (but skip script tags)
				if (node.tagName && node.tagName.toLowerCase() === 'script') {
					return
				}
				// Process children - create a copy of the array to avoid modification issues
				var children = Array.from(node.childNodes)
				for (var j = 0; j < children.length; j++) {
					processNode(children[j])
				}
			}
		}

		// Process all nodes in the container
		$tempContainer.contents().each(function () {
			processNode(this)
		})

		// Update element with highlighted HTML
		$element.html($tempContainer.html())
	}

	/**
	 * Remove all highlights and restore original HTML
	 */
	function removeHighlights() {
		// Restore all elements with original HTML stored
		$('[' + dataAttrOriginal + ']').each(function () {
			var $el = $(this)
			var originalHtml = $el.attr(dataAttrOriginal)
			if (originalHtml && $el.find('.' + highlightClass).length > 0) {
				$el.html(originalHtml)
			}
		})

		// Remove any remaining highlights (in case some weren't restored)
		$('.' + highlightClass).each(function () {
			var $highlight = $(this)
			var text = $highlight.text()
			$highlight.replaceWith(text)
		})
	}

	/**
	 * Escape special regex characters
	 */
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	}

	/**
	 * Expand section
	 */
	function expandSection(sectionId) {
		var $wrapper = $('.layoptions-section-wrapper[data-section-id="' + sectionId + '"]')
		var $item = $('.layoptions-section-item[data-section-id="' + sectionId + '"]')

		if ($wrapper.length > 0 && $wrapper.hasClass('collapsed')) {
			$wrapper.removeClass('collapsed').addClass('expanded')
			$item.addClass('expanded')
			// Update accordion state (but don't use hash)
			if (typeof lay_options_accordion !== 'undefined' && lay_options_accordion.sectionsState) {
				lay_options_accordion.sectionsState[sectionId] = true
			}
		}
	}

	/**
	 * Collapse all sections
	 */
	function collapseAllSections() {
		jQuery('.layoptions-section-wrapper').each(function () {
			var $wrapper = jQuery(this)
			var sectionId = $wrapper.attr('data-section-id')
			var $item = jQuery('.layoptions-section-item[data-section-id="' + sectionId + '"]')

			if ($wrapper.hasClass('expanded')) {
				$wrapper.removeClass('expanded').addClass('collapsed')
				$item.removeClass('expanded')
				// Update accordion state
				if (typeof lay_options_accordion !== 'undefined' && lay_options_accordion.sectionsState) {
					lay_options_accordion.sectionsState[sectionId] = false
				}
			}
		})

		// Update chevrons
		if (typeof lay_options_accordion !== 'undefined' && lay_options_accordion.updateChevrons) {
			lay_options_accordion.updateChevrons()
		}

		// Save state to localStorage
		if (typeof lay_options_accordion !== 'undefined' && lay_options_accordion.sectionsState) {
			try {
				localStorage.setItem('lay_options_sections_state', JSON.stringify(lay_options_accordion.sectionsState))
			} catch (e) {
				console.error('Failed to save sections state:', e)
			}
		}
	}

	/**
	 * Perform search
	 * @param {string} searchTerm - The search term
	 * @param {boolean} forceSearch - If true, search even with short search terms (Enter pressed)
	 */
	function performSearch(searchTerm, forceSearch) {
		if (!fuse || !searchTerm || searchTerm.trim() === '') {
			// Clear search - show all sections, groups, and rows, and remove highlights
			removeHighlights()
			jQuery('.layoptions-section-item').show() // Show all sections when search is cleared
			jQuery('.layoptions-section-group').show() // Show all groups when search is cleared
			jQuery('form[action="options.php"] .form-table tr').show() // Show all rows when search is cleared
			jQuery('form[action="options.php"] .gridder-buttons-to-show, form[action="options.php"] .gridder-ui-settings').show() // Show all Gridder containers
			// Update border classes after showing all items
			updateSectionItemBorders()
			// Collapse all sections when search is cleared
			collapseAllSections()
			return
		}

		// Only perform search if we have at least 3 characters OR Enter was pressed
		var shouldSearch = forceSearch || searchTerm.length >= 3
		if (!shouldSearch) {
			// Clear any existing highlights if search term is too short
			removeHighlights()
			// Show all sections, groups, and rows when search is too short
			jQuery('.layoptions-section-item').show()
			jQuery('.layoptions-section-group').show()
			jQuery('form[action="options.php"] .form-table tr').show()
			jQuery('form[action="options.php"] .gridder-buttons-to-show, form[action="options.php"] .gridder-ui-settings').show()
			// Update border classes
			updateSectionItemBorders()
			// Collapse all sections when search is too short
			collapseAllSections()
			return
		}

		var shouldHighlight = forceSearch || searchTerm.length >= 3

		// Remove previous highlights
		removeHighlights()

		// Perform search
		var results = fuse.search(searchTerm)
		var expandedSections = new Set()
		var sectionsWithMatches = new Set() // Track which sections have matches
		var rowsWithMatches = new Set() // Track which rows have matches
		var highlightedElements = new Set() // Track which elements we've already highlighted to prevent duplicates

		// Process results
		results.forEach(function (result) {
			var item = result.item
			var matches = result.matches || []

			// Track sections and rows that have matches
			if (item.sectionId) {
				sectionsWithMatches.add(item.sectionId)
				expandedSections.add(item.sectionId)
				expandSection(item.sectionId)
			}

			// Track the row that matched
			if (item.rowId) {
				rowsWithMatches.add(item.rowId)
			}

			// Highlight matches based on which field matched - only highlight the specific element that matched
			// Only highlight if we should (5+ chars or Enter pressed)
			if (shouldHighlight) {
				matches.forEach(function (match) {
					var $elementToHighlight = null

					if (match.key === 'label' && item.$label && item.$label.length) {
						// $label might be a collection - use the first element if it contains the text
						// Check each element in the collection to find the one with the matching text
						var found = false
						item.$label.each(function () {
							if (!found) {
								var $el = jQuery(this)
								var labelText = $el.text()
								if (new RegExp(escapeRegExp(searchTerm), 'gi').test(labelText)) {
									$elementToHighlight = $el
									found = true
									return false // break the each loop
								}
							}
						})
						// If no specific element found, use the first one
						if (!$elementToHighlight && item.$label.length > 0) {
							var labelText = item.$label.first().text()
							if (new RegExp(escapeRegExp(searchTerm), 'gi').test(labelText)) {
								$elementToHighlight = item.$label.first()
							}
						}
					} else if (match.key === 'description' && item.$description && item.$description.length) {
						// Only highlight if the search term is actually in the description's visible text
						var descText = item.$description.text()
						if (new RegExp(escapeRegExp(searchTerm), 'gi').test(descText)) {
							$elementToHighlight = item.$description
						}
					} else if (match.key === 'sectionTitle' && item.$sectionTitle && item.$sectionTitle.length) {
						// Only highlight if the search term is actually in the section title's visible text
						var titleText = item.$sectionTitle.text()
						if (new RegExp(escapeRegExp(searchTerm), 'gi').test(titleText)) {
							$elementToHighlight = item.$sectionTitle
						}
					}

					// Only highlight each element once, even if it matches multiple times
					if ($elementToHighlight && $elementToHighlight.length > 0) {
						// If $elementToHighlight is a collection, use the first element
						if ($elementToHighlight.length > 1) {
							$elementToHighlight = $elementToHighlight.first()
						}

						var elementId = $elementToHighlight[0].id || $elementToHighlight.attr('data-layoptions-element-id')
						if (!elementId) {
							// Create a unique ID for tracking if it doesn't have one
							elementId = 'layoptions-search-' + Date.now() + '-' + Math.random()
							$elementToHighlight.attr('data-layoptions-element-id', elementId)
						}

						if (!highlightedElements.has(elementId)) {
							highlightedElements.add(elementId)
							highlightText($elementToHighlight, searchTerm)
						}
					}
				})
			}
		})

		// Show/hide sections and rows based on matches
		// First, show all sections, groups, and rows
		jQuery('.layoptions-section-item').show()
		jQuery('.layoptions-section-group').show()
		jQuery('form[action="options.php"] .form-table tr').show()

		// Update border classes based on visibility
		updateSectionItemBorders()

		// Then hide sections that don't have matches
		if (sectionsWithMatches.size > 0) {
			jQuery('.layoptions-section-item').each(function () {
				var $item = jQuery(this)
				var sectionId = $item.attr('data-section-id')
				if (sectionId && !sectionsWithMatches.has(sectionId)) {
					$item.hide()
				}
			})

			// Hide rows that don't have matches (only in visible sections)
			if (rowsWithMatches.size > 0) {
				jQuery('form[action="options.php"] .form-table tr').each(function () {
					var $row = jQuery(this)
					var rowId = $row[0].id || $row.attr('data-layoptions-row-id')

					// Only hide rows in visible sections
					var $sectionWrapper = $row.closest('.layoptions-section-wrapper')
					if ($sectionWrapper.length > 0) {
						var sectionId = $sectionWrapper.attr('data-section-id')
						if (sectionId && sectionsWithMatches.has(sectionId)) {
							// This row is in a visible section - hide it if it doesn't have matches
							if (rowId && !rowsWithMatches.has(rowId)) {
								$row.hide()
							}
						}
					}
				})

				// Also handle Gridder buttons containers - hide them if their row didn't match
				jQuery('form[action="options.php"] .gridder-buttons-to-show, form[action="options.php"] .gridder-ui-settings').each(function () {
					var $container = jQuery(this)
					var $row = $container.closest('tr')
					if ($row.length > 0) {
						var rowId = $row[0].id || $row.attr('data-layoptions-row-id')
						var $sectionWrapper = $row.closest('.layoptions-section-wrapper')
						if ($sectionWrapper.length > 0) {
							var sectionId = $sectionWrapper.attr('data-section-id')
							if (sectionId && sectionsWithMatches.has(sectionId)) {
								// This container is in a visible section - hide it if its row didn't match
								if (rowId && !rowsWithMatches.has(rowId)) {
									$container.hide()
								} else {
									$container.show()
								}
							}
						}
					}
				})
			}

			// Hide groups where all items are hidden
			jQuery('.layoptions-section-group').each(function () {
				var $group = jQuery(this)
				var visibleItems = $group.find('.layoptions-section-item:visible').length
				if (visibleItems === 0) {
					$group.hide()
				}
			})
		}

		// Update chevrons
		if (typeof lay_options_accordion !== 'undefined' && lay_options_accordion.updateChevrons) {
			lay_options_accordion.updateChevrons()
		}

		// Update border classes after hiding/showing items
		updateSectionItemBorders()
	}

	/**
	 * Update border classes for section items based on visibility of previous items
	 */
	function updateSectionItemBorders() {
		jQuery('.layoptions-section-item').each(function () {
			var $item = jQuery(this)
			var $prevItem = $item.prev('.layoptions-section-item')

			// Remove the class first
			$item.removeClass('previous-hidden')

			// If there's a previous item and it's hidden, add the class
			if ($prevItem.length > 0 && !$prevItem.is(':visible')) {
				$item.addClass('previous-hidden')
			}
		})
	}

	// Debounce search function
	var debouncedSearch = (function () {
		var timeout
		return function (searchTerm, forceSearch) {
			clearTimeout(timeout)
			timeout = setTimeout(function () {
				performSearch(searchTerm, forceSearch)
			}, 300) // 300ms delay
		}
	})()

	// Initialize search when page is ready
	setTimeout(function () {
		initializeSearch()
		updateSectionItemBorders() // Update borders on initial load
	}, 500) // Wait for accordion to initialize

	// Handle search input
	searchInput.on('input', function () {
		var searchTerm = $(this).val().trim()
		var forceSearch = false // Don't force search on regular input
		debouncedSearch(searchTerm, forceSearch)
	})

	// Handle Enter key - force search and highlighting even with short search terms
	searchInput.on('keydown', function (e) {
		if (e.key === 'Enter') {
			e.preventDefault()
			var searchTerm = $(this).val().trim()
			if (searchTerm) {
				performSearch(searchTerm, true) // Force search on Enter
			}
		} else if (e.key === 'Escape') {
			$(this).val('')
			// Clear search and update borders
			performSearch('', false)
		}
	})
})

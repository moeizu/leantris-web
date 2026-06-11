jQuery(document).ready(function ($) {
	// if it is taxonomy page
	if (adminpage == 'edit-tags-php') {
		const getReferenceRow = function ($item) {
			const $reference = $item.siblings('tr:visible:not(.ui-sortable-placeholder):not(.ui-sortable-helper)').first()
			return $reference.length ? $reference : $item
		}

		const collectColumnWidths = function ($row) {
			return $row
				.children()
				.map(function () {
					return $(this).outerWidth()
				})
				.get()
		}

		const applyColumnWidths = function ($cells, widths) {
			$cells.each(function (index) {
				const width = widths[index]
				if (width !== undefined) {
					$(this).css('width', width)
				}
			})
		}

		const syncDragDimensions = function (ui) {
			const $item = ui.item
			const $helper = ui.helper
			const $placeholder = ui.placeholder
			if (!$helper.length || !$placeholder.length) {
				return
			}

			const $referenceRow = getReferenceRow($item)
			const columnWidths = collectColumnWidths($referenceRow)

			applyColumnWidths($helper.children(), columnWidths)
			applyColumnWidths($placeholder.children(), columnWidths)

			$placeholder.height($helper.outerHeight())
			$placeholder.toggleClass('alternate', $item.hasClass('alternate'))
		}

		const resetItem = function (ui) {
			ui.item.css({
				position: '',
				width: '',
				top: '',
				left: '',
			})
			ui.item.children().css('width', '')
		}

		const helperBuilder = function (event, row) {
			const $row = $(row)
			const $helper = $row.clone()
			const columnWidths = collectColumnWidths(getReferenceRow($row))
			applyColumnWidths($helper.children(), columnWidths)
			return $helper
		}

		// make table rows sortable
		$('.wp-list-table.tags tbody').sortable({
			items: 'tr:not(.inline-edit-row)',
			cursor: 'move',
			axis: 'y',
			containment: 'table.widefat',
			scrollSensitivity: 40,
			placeholder: 'scporder-placeholder',
			forcePlaceholderSize: true,
			helper: helperBuilder,
			start: function (event, ui) {
				syncDragDimensions(ui)
			},
			change: function (event, ui) {
				syncDragDimensions(ui)
			},
			sort: function (event, ui) {
				syncDragDimensions(ui)
			},
			stop: function (event, ui) {
				resetItem(ui)
				// array for the ids and positions
				var rows = new Array([])

				// show "activity" with spinner
				hsam_taxonomy_sort_activity_spinner(true)

				$('.wp-list-table.tags tbody tr:not(.inline-edit-row)').each(function (i, e) {
					var rowID = parseInt($(e).attr('id').substr(4))
					rows[i] = rowID
				})

				// post rows for sorting
				$.post(ajaxurl, { rows: rows, action: 'get_inline_boxes' }, function (response) {
					// stop activity spinner
					hsam_taxonomy_sort_activity_spinner(false)
				})
			},
		})
	}

	/**
	 * Adds, shows or hides the activity status spinner
 
	 */
	function hsam_taxonomy_sort_activity_spinner(status) {
		var actions_table = $('.tablenav .actions')

		if (actions_table.find('.spinner').length === 0 && status === true) {
			// add spinner
			actions_table.prepend('<div class="spinner" style="display: inline;" />')
		} else if (status === true) {
			// show spinner
			actions_table.find('.spinner').show()
		} else {
			// hide spinner
			actions_table.find('.spinner').hide()
		}
	}
})

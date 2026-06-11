;(function ($) {
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

	$('table.posts #the-list, table.pages #the-list').sortable({
		items: 'tr',
		axis: 'y',
		helper: helperBuilder,
		placeholder: 'scporder-placeholder',
		forcePlaceholderSize: true,
		tolerance: 'pointer',
		start: function (e, ui) {
			syncDragDimensions(ui)
		},
		change: function (e, ui) {
			syncDragDimensions(ui)
		},
		sort: function (e, ui) {
			syncDragDimensions(ui)
		},
		stop: function (e, ui) {
			resetItem(ui)
		},
		update: function (e, ui) {
			resetItem(ui)
			const serialized = $('#the-list').sortable('serialize')
			$.post(typeof scporder_vars !== 'undefined' ? scporder_vars.ajax_url : (typeof ajaxurl !== 'undefined' ? ajaxurl : ''), {
				action: 'update-menu-order',
				order: serialized,
				nonce: typeof scporder_vars !== 'undefined' ? scporder_vars.nonce : '',
			})
		},
	})
	$('table.tags #the-list').sortable({
		items: 'tr',
		axis: 'y',
		helper: helperBuilder,
		placeholder: 'scporder-placeholder',
		forcePlaceholderSize: true,
		tolerance: 'pointer',
		start: function (e, ui) {
			syncDragDimensions(ui)
		},
		change: function (e, ui) {
			syncDragDimensions(ui)
		},
		sort: function (e, ui) {
			syncDragDimensions(ui)
		},
		stop: function (e, ui) {
			resetItem(ui)
		},
		update: function (e, ui) {
			resetItem(ui)
			const serialized = $('#the-list').sortable('serialize')
			$.post(typeof scporder_vars !== 'undefined' ? scporder_vars.ajax_url : (typeof ajaxurl !== 'undefined' ? ajaxurl : ''), {
				action: 'update-menu-order-tags',
				order: serialized,
				nonce: typeof scporder_vars !== 'undefined' ? scporder_vars.nonce : '',
			})
		},
	})
})(jQuery)

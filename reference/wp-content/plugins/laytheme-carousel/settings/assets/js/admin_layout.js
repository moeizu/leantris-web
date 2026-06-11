;(function ($) {
	function syncCardVisibility($card) {
		var $heading = $card.find('h2').first()
		var $table = $card.find('table.form-table').first()
		var hidden = ($heading.length && $heading.css('display') === 'none') || ($table.length && $table.css('display') === 'none')
		$card.toggle(!hidden)
	}

	function watchCardVisibility($card) {
		var targets = $card.find('h2, table.form-table').toArray()
		var observer = new MutationObserver(function () {
			syncCardVisibility($card)
		})

		targets.forEach(function (target) {
			observer.observe(target, { attributes: true, attributeFilter: ['style', 'class'] })
		})
		syncCardVisibility($card)
	}

	function enhanceOptionsPage() {
		var $wrap = $('.wrap').first()
		var $form = $wrap.children('form[action="options.php"]').first()
		if (!$form.length || $form.data('layAddonEnhanced')) {
			return
		}

		$form.data('layAddonEnhanced', true)
		$wrap.addClass('lay-addon-options')
		$form.children('.top-layoptions-submit-button-wrap').addClass('lay-addon-topbar')

		$form.children('h2').each(function (index) {
			var $heading = $(this)
			var $table = $heading.next('table.form-table')
			if (!$table.length) {
				return
			}

			var title = $.trim($heading.text()) || 'Settings'
			var $card = $('<section class="lay-addon-card"></section>')
			var $header = $('<header class="lay-addon-card-header"></header>')
			var $body = $('<div class="lay-addon-card-body"></div>')
			var $anchor = $heading.prev('div[id]')

			if ($anchor.length) {
				$card.insertAfter($anchor)
			} else {
				$card.insertBefore($heading)
			}
			$heading.text(title)
			$header.append('<span class="lay-addon-step">' + (index + 1) + '</span>')
			$header.append($heading)
			$body.append($table)
			$card.append($header, $body)
			watchCardVisibility($card)
		})
	}

	$(enhanceOptionsPage)
})(jQuery)

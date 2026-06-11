var lay_explanations = {}

lay_explanations = (function () {
	var bindHandleClick = function () {
		var sendStatus = _.throttle(function (optionname, value) {
			jQuery.ajax({
				type: 'POST',
				url: setupPassedData.ajaxUrl,
				data: {
					action: 'set_explanation_expand_status_via_ajax',
					value: value,
					optionname: optionname,
				},
				success: function (result) {
					// console.log(result);
				},
			})
		}, 1000)

		jQuery(document).on('click', 'button.lay-explanation-handle', function (e) {
			console.log('click!')
			e.preventDefault()
			var $parent = jQuery(this.parentNode.parentNode)
			var optionname = $parent.attr('data-expand-status-option-name')
			var value = 'expanded'

			console.log('optionname', optionname)

			if ($parent.hasClass('collapsed')) {
				$parent.removeClass('collapsed')
			} else {
				$parent.addClass('collapsed')
				value = 'collapsed'
			}

			console.log('value', value)

			sendStatus(optionname, value)
		})
	}

	var initModule = function () {
		bindHandleClick()
	}

	return {
		initModule: initModule,
	}
})()

jQuery(document).ready(function () {
	lay_explanations.initModule()
})

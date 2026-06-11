jQuery(document).ready(function ($) {
	// Check if we're on a category edit screen
	var $form = $('form#edittag')
	if (!$form.length) {
		return
	}

	var termId = $('input[name="tag_ID"]').val()
	if (!termId) {
		return
	}

	var isFrontpage = typeof laySetFrontpageData !== 'undefined' && laySetFrontpageData.frontpage_type === 'category' && String(laySetFrontpageData.frontpage_select_category) === String(termId)
	var hideProjects = typeof laySetFrontpageData !== 'undefined' && laySetFrontpageData.hide_projects
	var templatesActive = typeof laySetFrontpageData !== 'undefined' && laySetFrontpageData.templates_active

	// Build buttons container: Set as Frontpage (if not already) + Copy to Pages + Copy to Projects (if not hidden) + Copy to Page Templates (if active) – side by side, spinners hidden until clicked
	var html = '<div class="form-field" style="margin-top: 20px;">'
	if (!isFrontpage) {
		html += '<span style="display:inline-block;margin-right:8px;"><a class="button button-small lay-set-category-frontpage-btn" href="#">Set as Frontpage</a><span class="spinner" style="display:none;float:none;margin-top:2px;margin-left:4px;"></span></span> '
	}
	html += '<span style="display:inline-block;margin-right:8px;"><a class="button button-small lay-copy-term-to-pages" href="#">Copy to Pages</a><span class="spinner lay-copy-term-spinner" style="display:none;float:none;margin-top:2px;margin-left:4px;"></span></span> '
	if (!hideProjects) {
		html += '<span style="display:inline-block;margin-right:8px;"><a class="button button-small lay-copy-term-to-projects" href="#">Copy to Projects</a><span class="spinner lay-copy-term-spinner" style="display:none;float:none;margin-top:2px;margin-left:4px;"></span></span> '
	}
	if (templatesActive) {
		html += '<span style="display:inline-block;margin-right:8px;"><a class="button button-small lay-copy-term-to-template" href="#">Copy to Page Templates</a><span class="spinner lay-copy-term-spinner" style="display:none;float:none;margin-top:2px;margin-left:4px;"></span></span>'
	}
	html += '</div>'

	$form.find('.edit-tag-actions').first().after(html)

	// Set as Frontpage
	$('.lay-set-category-frontpage-btn').on('click', function (e) {
		e.preventDefault()
		var $btn = $(this)
		var $spinner = $btn.siblings('.spinner')
		if ($btn.hasClass('disabled')) return
		$btn.addClass('disabled').text('Setting...')
		$spinner.show().addClass('is-active')
		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'set_as_frontpage',
				post_id: termId,
				post_type: 'category',
				nonce: laySetFrontpageNonce.nonce,
			},
			success: function (response) {
				if (response.success) {
					$btn.removeClass('disabled').text('✓ Set as Frontpage')
					setTimeout(function () { $btn.text('Set as Frontpage') }, 2000)
				} else {
					alert('Error: ' + (response.data || 'Unknown error'))
					$btn.removeClass('disabled').text('Set as Frontpage')
				}
				$spinner.removeClass('is-active').hide()
			},
			error: function () {
				alert('Failed to set frontpage. Please try again.')
				$btn.removeClass('disabled').text('Set as Frontpage')
				$spinner.removeClass('is-active').hide()
			},
		})
	})

	function runCopyTermTo (actionName, btnClass, label) {
		$(document).on('click', btnClass, function (e) {
			e.preventDefault()
			var $btn = $(this)
			var $spinner = $btn.next('.spinner')
			if ($btn.hasClass('disabled')) return
			$btn.addClass('disabled').text('Copying...')
			$spinner.show().addClass('is-active')
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: actionName,
					term_id: termId,
					nonce: typeof layCopyPostNonce !== 'undefined' ? layCopyPostNonce.nonce : '',
				},
				success: function (response) {
					$spinner.removeClass('is-active').hide()
					if (response.success && response.data && response.data.edit_url) {
						$btn.removeClass('disabled').text('✓ Copied')
						setTimeout(function () { window.location.href = response.data.edit_url }, 400)
					} else {
						alert('Error: ' + (response.data && response.data.message ? response.data.message : 'Unknown error'))
						$btn.removeClass('disabled').text(label)
					}
				},
				error: function () {
					alert('Failed to copy. Please try again.')
					$btn.removeClass('disabled').text(label)
					$spinner.removeClass('is-active').hide()
				},
			})
		})
	}

	runCopyTermTo('lay_copy_term_to_pages', '.lay-copy-term-to-pages', 'Copy to Pages')
	if (!hideProjects) runCopyTermTo('lay_copy_term_to_projects', '.lay-copy-term-to-projects', 'Copy to Projects')
	if (templatesActive) runCopyTermTo('lay_copy_term_to_template', '.lay-copy-term-to-template', 'Copy to Page Templates')
})

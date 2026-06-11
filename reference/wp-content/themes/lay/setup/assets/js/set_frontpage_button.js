jQuery(document).ready(function ($) {
	// Check if we're on a post/page edit screen
	var postId = $('#post_ID').val()
	var postType = $('#post_type').val() || $('input[name="post_type"]').val()

	if (!postId || !postType) {
		return
	}

	// Only show for pages, posts (projects), news (when news feature is active),
	// and deck slides (when deck feature is active).
	if (postType !== 'page' && postType !== 'post' && postType !== 'lay_news' && postType !== 'lay_deck') {
		return
	}
	if (postType === 'lay_news' && (typeof laySetFrontpageData === 'undefined' || !laySetFrontpageData.news_active)) {
		return
	}
	if (postType === 'lay_deck' && (typeof laySetFrontpageData === 'undefined' || !laySetFrontpageData.deck_active)) {
		return
	}

	var showSetFrontpage = true
	if (typeof laySetFrontpageData !== 'undefined') {
		if (postType === 'page' && laySetFrontpageData.frontpage_type === 'page' && String(laySetFrontpageData.frontpage_select_page) === String(postId)) {
			showSetFrontpage = false
		}
		if (postType === 'post' && laySetFrontpageData.frontpage_type === 'project' && String(laySetFrontpageData.frontpage_select_project) === String(postId)) {
			showSetFrontpage = false
		}
		if (postType === 'lay_deck' && laySetFrontpageData.frontpage_type === 'deck' && String(laySetFrontpageData.frontpage_select_deck) === String(postId)) {
			showSetFrontpage = false
		}
	}

	var $items = $()
	if (showSetFrontpage) {
		$items = $items.add($('<div class="misc-pub-set-frontpage" id="set-frontpage">' + '<a class="button button-small lay-set-frontpage-btn" href="#">Set as Frontpage</a>' + '<span class="spinner" style="float:none;margin-top:2px;margin-left:4px;"></span>' + '</div>'))
	}
	// Copy to Pages (when current post is a project or news)
	if (postType === 'post' || postType === 'lay_news') {
		$items = $items.add($('<div class="misc-pub-copy-to-pages" id="copy-to-pages">' + '<a class="button button-small lay-copy-to-pages-btn" href="#">Copy to Pages</a>' + '<span class="spinner" style="float:none;margin-top:2px;margin-left:4px;"></span>' + '</div>'))
	}
	// Copy to Projects (when current post is a page or news, and only if projects not hidden)
	if ((postType === 'page' || postType === 'lay_news') && typeof laySetFrontpageData !== 'undefined' && !laySetFrontpageData.hide_projects) {
		$items = $items.add($('<div class="misc-pub-copy-to-projects" id="copy-to-projects">' + '<a class="button button-small lay-copy-to-projects-btn" href="#">Copy to Projects</a>' + '<span class="spinner" style="float:none;margin-top:2px;margin-left:4px;"></span>' + '</div>'))
	}
	// Copy to Page Templates (only when template feature is enabled)
	if (typeof laySetFrontpageData !== 'undefined' && laySetFrontpageData.templates_active) {
		$items = $items.add($('<div class="misc-pub-copy-to-template" id="copy-to-template">' + '<a class="button button-small lay-copy-to-template-btn" href="#">Copy to Page Templates</a>' + '<span class="spinner" style="float:none;margin-top:2px;margin-left:4px;"></span>' + '</div>'))
	}
	// Copy to News (only when news feature is enabled; from page, post, template, or news)
	if (typeof laySetFrontpageData !== 'undefined' && laySetFrontpageData.news_active) {
		$items = $items.add($('<div class="misc-pub-copy-to-news" id="copy-to-news">' + '<a class="button button-small lay-copy-to-news-btn" href="#">Copy to News</a>' + '<span class="spinner" style="float:none;margin-top:2px;margin-left:4px;"></span>' + '</div>'))
	}

	// One misc-pub-section wrapper with flex + gap for vertical spacing
	if ($items.length) {
		var $container = $('<div class="misc-pub-section misc-pub-lay-actions" style="display:flex;flex-direction:column;gap:8px;"></div>').append($items)
		if ($('#duplicator').length) {
			$('#duplicator').after($container)
		} else {
			$('#misc-publishing-actions').append($container)
		}
	}

	// Handle button click
	$('.lay-set-frontpage-btn').on('click', function (e) {
		e.preventDefault()

		var $btn = $(this)
		var $spinner = $btn.siblings('.spinner')

		if ($btn.hasClass('disabled')) {
			return
		}

		$btn.addClass('disabled').text('Setting...')
		$spinner.addClass('is-active')

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'set_as_frontpage',
				post_id: postId,
				post_type: postType,
				nonce: laySetFrontpageNonce.nonce,
			},
			success: function (response) {
				if (response.success) {
					$btn.removeClass('disabled').text('✓ Set as Frontpage')
					setTimeout(function () {
						$btn.text(postType === 'page' ? 'Set as Frontpage' : 'Set as Frontpage')
					}, 2000)
				} else {
					alert('Error: ' + (response.data || 'Unknown error'))
					$btn.removeClass('disabled').text(postType === 'page' ? 'Set as Frontpage' : 'Set as Frontpage')
				}
				$spinner.removeClass('is-active')
			},
			error: function () {
				alert('Failed to set frontpage. Please try again.')
				$btn.removeClass('disabled').text(postType === 'page' ? 'Set as Frontpage' : 'Set as Frontpage')
				$spinner.removeClass('is-active')
			},
		})
	})

	function runCopyToAction (actionName, btnClass, label) {
		$(document).on('click', btnClass, function (e) {
			e.preventDefault()
			var $btn = $(this)
			var $spinner = $btn.siblings('.spinner')
			if ($btn.hasClass('disabled')) return
			$btn.addClass('disabled').text('Copying...')
			$spinner.addClass('is-active')
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: actionName,
					post_id: postId,
					nonce: typeof layCopyPostNonce !== 'undefined' ? layCopyPostNonce.nonce : '',
				},
				success: function (response) {
					$spinner.removeClass('is-active')
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
					$spinner.removeClass('is-active')
				},
			})
		})
	}
	runCopyToAction('lay_copy_to_pages', '.lay-copy-to-pages-btn', 'Copy to Pages')
	runCopyToAction('lay_copy_to_projects', '.lay-copy-to-projects-btn', 'Copy to Projects')
	runCopyToAction('lay_copy_to_template', '.lay-copy-to-template-btn', 'Copy to Page Templates')
	runCopyToAction('lay_copy_to_news', '.lay-copy-to-news-btn', 'Copy to News')
})

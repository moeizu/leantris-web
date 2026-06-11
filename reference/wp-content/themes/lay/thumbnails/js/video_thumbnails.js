var lay_video_fi = {
	/**
	 * Set the featured image id, save the post thumbnail data and
	 * set the HTML in the post meta box to the new featured image.
	 *
	 * @global wp.media.view.settings
	 * @global wp.media.post
	 *
	 * @param {number} id The post ID of the featured image, or -1 to unset it.
	 */
	set: function (id) {
		var settings = wp.media.view.settings

		var data = {
			action: 'get_video_post_thumb_html',
			post_id: settings.post.id,
			thumbnail_id: id,
			externalVideoOff: true,
		}

		jQuery.post(ajaxurl, data, function (html) {
			if (html == '0') {
				return
			}
			jQuery('.inside', '#lay-video-thumbnail').html(html)

			jQuery('#lay-video-thumbnail .hide-if-external-video').show()
			jQuery('#lay-video-thumbnail .show-if-external-video').hide()
			jQuery('#lay-video-thumbnail video').show()
		})
	},
	/**
	 * Remove the featured image id, save the post thumbnail data and
	 * set the HTML in the post meta box to no featured image.
	 */
	remove: function () {
		lay_video_fi.set(-1)
	},
	/**
	 * The Featured Image workflow
	 *
	 * @global wp.media.controller.FeaturedImage
	 * @global wp.media.view.l10n
	 *
	 * @this lay_video_fi
	 *
	 * @returns {wp.media.view.MediaFrame.Select} A media workflow.
	 */
	frame: function () {
		if (this._frame) {
			wp.media.frame = this._frame
			return this._frame
		}

		this._frame = wp.media.frames.image_modal = wp.media({
			title: 'Project Thumbnail Video',
			button: {
				text: 'Ok',
			},
			library: {
				type: 'video',
			},
			multiple: false,
		})

		var frame = this._frame

		this._frame.on('open', function () {
			// set to browse
			if (frame.content._mode != 'browse') {
				frame.content.mode('browse')
			}

			// select currently chosen image, taken from "input.js" of advanced-custom-fields
			var selection = frame.state().get('selection')
			var attid = jQuery('#_lay_thumbnail_video').attr('value')
			if (attid != '') {
				var attachment = wp.media.attachment(attid)
				if (jQuery.isEmptyObject(attachment.changed)) {
					attachment.fetch()
				}
				selection.add(attachment)
			}
		})

		this._frame.on('select', function () {
			var attachments = frame.state().get('selection').toJSON()
			if (attachments[0].type == 'video') {
				lay_video_fi.set(attachments[0] ? attachments[0].id : -1)
			}
		})

		return this._frame
	},
	/**
	 * Open the content media manager to the 'featured image' tab when
	 * the post thumbnail is clicked.
	 *
	 * Update the featured image id when the 'remove' link is clicked.
	 *
	 * @global wp.media.view.settings
	 */
	init: function () {
		jQuery('#lay-video-thumbnail')
			.on('click', '#set-video-post-thumbnail', function (event) {
				event.preventDefault()
				// Stop propagation to prevent thickbox from activating.
				event.stopPropagation()

				lay_video_fi.frame().open()
			})
			.on('click', '#remove-video-post-thumbnail', function () {
				lay_video_fi.remove()
				return false
			})
			.on('click', '#lay_useExternalVideo', function (e) {
				if (jQuery(this).is(':checked')) {
					jQuery('.show-if-external-video').show()
					jQuery('.hide-if-external-video').hide()
				} else {
					jQuery('.show-if-external-video').hide()
					jQuery('.hide-if-external-video').show()
				}
			})
	},
}

jQuery(document).on('ready', function () {
	lay_video_fi.init()
})

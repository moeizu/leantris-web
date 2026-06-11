jQuery(document).on('click', '.add-slot', function () {
	var $parent = jQuery(this).closest('.custom-uploads')
	var loop = jQuery(this).data('loop')

	var $buttonsBox = $parent.find('.buttons-box')
	var $lastImageBox = $parent.find('.image-box:last')
	var $hiddenInput = $parent.find('[name=slot-index-' + loop + ']')
	var index = parseInt($hiddenInput.val())
	var inputNameUpd = 'additional_img_ids-' + loop + '-' + index
	var inputPropsUpd = { name: inputNameUpd, value: null }
	var $placeholder = $parent.find('[name=ph-img-' + loop + ']').val()
	var $clonedImgBox = $lastImageBox.clone().insertBefore($buttonsBox) // Insert a clone

	$clonedImgBox.find('.upload_image_id').prop(inputPropsUpd)
	$clonedImgBox.find('img').prop('src', $placeholder)
	$clonedImgBox.find('a').removeClass('remove')
	$hiddenInput.val(index + 1)

	if (index == 1) {
		jQuery(this).parent().find('.remove-slot').show()
	}
})

jQuery(document).on('click', '.remove-slot', function () {
	var $parent = jQuery(this).closest('.custom-uploads')
	var loop = jQuery(this).data('loop')

	var $lastImageBox = $parent.find('.image-box:last')
	var $hiddenInput = $parent.find('[name=slot-index-' + loop + ']')
	var index = parseInt($hiddenInput.val())

	$lastImageBox.remove()
	$hiddenInput.val(index - 1)

	if (index == 2) {
		jQuery(this).hide()
	}
})

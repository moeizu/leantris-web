// hides tips for projects and pages
var lay_hide_admin_notice_tips = {};

lay_hide_admin_notice_tips = (function(){

	var bindClick = function(){

		jQuery('.lay-hide-admin-notice').on('click', function(e){
			e.preventDefault();
			var optionname = jQuery(this.parentNode.parentNode).attr('data-optionname');

			jQuery.ajax({
				type: 'POST',
				url: setupPassedData.ajaxUrl,
				data: {
					action: 'set_notice_hidden_via_ajax',
					optionname: optionname,
				},
				success: function(result) {
					// console.log(result);
				}
			});

			jQuery(this.parentNode.parentNode).remove();
		});

	};

	var initModule = function(){
		bindClick();
	};

	return {
		initModule : initModule
	}
}());

jQuery(document).ready(function(){
	lay_hide_admin_notice_tips.initModule();
});
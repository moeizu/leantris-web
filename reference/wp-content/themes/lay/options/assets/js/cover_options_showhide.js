var cover_options_showhide_settings = (function(){

	var initModule = function(){
		showhide_for_arrowtype();
		jQuery('#cover_down_arrow_type').on('change', showhide_for_arrowtype);
		showhide_for_scrolldown_click();
		jQuery('#cover_scrolldown_on_click').on('change', showhide_for_scrolldown_click);
	};

    var showhide_for_arrowtype = function() {
		var val = jQuery('#cover_down_arrow_type').val();
        switch( val ) {
            case 'custom':
                jQuery(document.getElementById("cover_down_arrow").parentNode.parentNode).show();
                jQuery(document.getElementById("cover_down_arrow_phone").parentNode.parentNode).show();
                jQuery(document.getElementById("cover_down_arrow_animate").parentNode.parentNode).show();
            break;
            case 'none':
                jQuery(document.getElementById("cover_down_arrow").parentNode.parentNode).hide();
                jQuery(document.getElementById("cover_down_arrow_phone").parentNode.parentNode).hide();
                jQuery(document.getElementById("cover_down_arrow_animate").parentNode.parentNode).hide();
            break;
            case 'black':
            case 'white':
                jQuery(document.getElementById("cover_down_arrow").parentNode.parentNode).hide();
                jQuery(document.getElementById("cover_down_arrow_phone").parentNode.parentNode).hide();
                jQuery(document.getElementById("cover_down_arrow_animate").parentNode.parentNode).show();
            break;
        }
    }

    var showhide_for_scrolldown_click = function() {
        var isChecked = jQuery('#cover_scrolldown_on_click').is(':checked');
        if (isChecked) {
            jQuery(document.getElementById("cover_animation_duration").parentNode.parentNode).show();
            jQuery(document.getElementById("cover_animation_easing").parentNode.parentNode).show();
        } else {
            jQuery(document.getElementById("cover_animation_duration").parentNode.parentNode).hide();
            jQuery(document.getElementById("cover_animation_easing").parentNode.parentNode).hide();
        }
    }

	return {
		initModule : initModule
	}
}());

jQuery(document).ready(function(){
	cover_options_showhide_settings.initModule();
});
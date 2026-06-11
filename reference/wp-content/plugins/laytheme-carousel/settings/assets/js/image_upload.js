// https://gist.github.com/hlashbrooke/9267467#file-settings-js
jQuery(document).ready(function() {

  /***** Uploading images *****/

  var file_frame;

  var triggerFieldChange = function($field) {
      if( !$field.length ) {
        return;
      }
      $field[0].dispatchEvent(new Event('input', { bubbles: true }));
      $field[0].dispatchEvent(new Event('change', { bubbles: true }));
  }

  jQuery.fn.uploadMediaFile = function( button, preview_media ) {
      var button_id = button.attr('id');
      var field_id = button_id.replace( '_button', '' );
      var preview_id = button_id.replace( '_button', '_preview' );

      // Create the media frame.
      file_frame = wp.media.frames.file_frame = wp.media({
        title: 'Select an image',
        multiple: false
      });

      // When an image is selected, run a callback.
      file_frame.on( 'select', function() {
        attachment = file_frame.state().get('selection').first().toJSON();
        var $field = jQuery("#"+field_id);
        $field.val(attachment.id);
        triggerFieldChange($field);
        if( preview_media ) {
          jQuery("#"+preview_id).attr('src', attachment.url);
        }
        jQuery('#'+field_id+'_delete').css('display', 'block');
      });

      // Finally, open the modal
      file_frame.open();
  }

  jQuery('.image_upload_button').click(function() {
      jQuery.fn.uploadMediaFile( jQuery(this), true );
  });

  jQuery('.image_delete_button').click(function() {
      var field_id = jQuery(this).attr('id').replace( '_delete', '' );

      var $field = jQuery('#'+field_id+'.image_data_field' );
      $field.val( '' );
      triggerFieldChange($field);
      jQuery('#'+field_id+'_preview' ).attr( 'src', '' );

      jQuery(this).css('display', 'none');
      return false;
  });

});

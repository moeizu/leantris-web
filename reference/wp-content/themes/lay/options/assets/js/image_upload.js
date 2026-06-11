// https://gist.github.com/hlashbrooke/9267467#file-settings-js
jQuery(document).ready(function() {

  /***** Uploading images *****/

  var file_frame;

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
        // Trigger lay options dirty-state detection for ajax save button
        $field.trigger('input').trigger('change');
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
      var id = jQuery(this).attr('id').replace( '_delete', '' );
      var $field = jQuery(this).closest('td').find( '.image_data_field#'+id );
      $field.val( '' );
      // Trigger lay options dirty-state detection for ajax save button
      $field.trigger('input').trigger('change');
      var noimagesrc = jQuery( '#'+id+'_preview' ).attr('data-noimagesrc');
      jQuery( '#'+id+'_preview' ).attr('src', noimagesrc);
      jQuery(this).css('display', 'none');
      return false;
  });

});
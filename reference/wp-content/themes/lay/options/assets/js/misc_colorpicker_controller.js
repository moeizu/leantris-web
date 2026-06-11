(function( $ ) {

    $(function() {
        var notifyLayOptionsSaveState = function () {
            $(document).trigger('lay-options-line-color-change');
        };
        // Same as line color pickers: Iris often does not bubble change/input to the form, so AJAX save must be notified explicitly.
        $('.image-placeholder-color-picker').wpColorPicker({
            change: notifyLayOptionsSaveState,
        });
        $('.lay-hr-color-picker, .lay-vl-color-picker, .lay-selection-color-picker').wpColorPicker({
            change: notifyLayOptionsSaveState,
        });
    });

})( jQuery );
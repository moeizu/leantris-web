// author: Armin Unruh

tinymce.PluginManager.add('letterspacingselect', function(editor, url) {

    editor.on('PreInit', function(e){
        editor.formatter.register('letterspacing', {
            inline: 'span',
            toggle: true,
            styles: {letterSpacing: '%value'}
        });
    });

    var items = [
        {text: '-0.1em', value: '-0.1em'},
        {text: '-0.09em', value: '-0.09em'},
        {text: '-0.08em', value: '-0.08em'},
        {text: '-0.07em', value: '-0.07em'},
        {text: '-0.06em', value: '-0.06em'},
        {text: '-0.05em', value: '-0.05em'},
        {text: '-0.04em', value: '-0.04em'},
        {text: '-0.03em', value: '-0.03em'},
        {text: '-0.02em', value: '-0.02em'},
        {text: '-0.01em', value: '-0.01em'},
        {text: '0em', value: '0em'},
        {text: '0.01em', value: '0.01em'},
        {text: '0.02em', value: '0.02em'},
        {text: '0.03em', value: '0.03em'},
        {text: '0.04em', value: '0.04em'},
        {text: '0.05em', value: '0.05em'},
        {text: '0.06em', value: '0.06em'},
        {text: '0.07em', value: '0.07em'},
        {text: '0.08em', value: '0.08em'},
        {text: '0.09em', value: '0.09em'},
        {text: '0.1em', value: '0.1em'},
        {text: '0.11em', value: '0.11em'},
        {text: '0.12em', value: '0.12em'},
        {text: '0.13em', value: '0.13em'},
        {text: '0.14em', value: '0.14em'},
        {text: '0.15em', value: '0.15em'},
        {text: '0.16em', value: '0.16em'},
        {text: '0.17em', value: '0.17em'},
        {text: '0.18em', value: '0.18em'},
        {text: '0.19em', value: '0.19em'},
        {text: '0.2em', value: '0.2em'},
    ];
    
    editor.addButton('letterspacingselect', function() {
        return {
            type: 'listbox',
            text: 'Letter Spacing',
            tooltip: 'Letter Spacing',
            values: items,
            fixedWidth: true,
            onPostRender: createListBoxChangeHandler(items, 'letterspacing'),
            onclick: function(e) {
                if (e.control.settings.value) {
                    var value = e.control.settings.value;

                    editor.formatter.toggle('letterspacing', value ? {value: value} : undefined);
                    editor.nodeChanged();
                }
            }
        };
    });

    function createListBoxChangeHandler(items, formatName) {
        return function() {
            var self = this;

            editor.on('nodeChange', function(e) {
                var formatter = editor.formatter;
                var value = null;

                tinymce.each(e.parents, function(node) {
                    tinymce.each(items, function(item) {
                        if (formatName) {
                            if (formatter.matchNode(node, formatName, {value: item.value})) {
                                value = item.value;
                            }
                        } else {
                            if (formatter.matchNode(node, item.value)) {
                                value = item.value;
                            }
                        }

                        if (value) {
                            return false;
                        }
                    });

                    if (value) {
                        return false;
                    }
                });

                self.value(value);
            });
        };
    }

});
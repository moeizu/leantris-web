// author: Armin Unruh

tinymce.PluginManager.add('lineheightselect', function(editor, url) {

    function applyFormat(format, value) {
        editor.focus();
        editor.formatter.apply(format, {value: value});
        editor.nodeChanged();
    }

    editor.on('PreInit', function(e){
        editor.formatter.register(
            'lineheight',
            {selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li', styles: {lineHeight: '%value'}, links: true, remove_similar: true}
        );
    });

    var items = [{text: '0.6', value: '0.6'},{text: '0.7', value: '0.7'},{text: '0.8', value: '0.8'},{text: '0.9', value: '0.9'},{text: '1', value: '1'},{text: '1.1', value: '1.1'},{text: '1.2', value: '1.2'},{text: '1.3', value: '1.3'},{text: '1.4', value: '1.4'},{text: '1.5', value: '1.5'},{text: '1.6', value: '1.6'},{text: '1.7', value: '1.7'},{text: '1.8', value: '1.8'},{text: '1.9', value: '1.9'},{text: '2', value: '2'},{text: '2.1', value: '2.1'},{text: '2.2', value: '2.2'},{text: '2.3', value: '2.3'},{text: '2.4', value: '2.4'},{text: '2.5', value: '2.5'}];
    
    editor.addButton('lineheightselect', {
        type: 'listbox',
        text: 'Line Height',
        tooltip: 'Line Height',
        icon: false,
        format: 'lineheight',
        fixedWidth: true,
        onPostRender: createListBoxChangeHandler(items, 'lineheight'),
        onselect: function(e) {
            applyFormat('lineheight', e.control.settings.value);
        }, 
        values: items
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
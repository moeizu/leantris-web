tinymce.PluginManager.add('textformatsloader', function( editor ) {
	
	var jsonString = jQuery.trim(jQuery("#formatsmanager_json").val());
	if(typeof jsonString != "undefined" && jsonString != ""){
		var jsonObject = JSON.parse(jsonString);
		var getVariableSettingsString = function(formatObj, key){
			if(typeof formatObj == "undefined" || typeof formatObj[key] == "undefined"){
				return '';
			}
			var values = [];
			for(var prop in formatObj[key]){
				var obj = formatObj[key][prop];
				if(!obj || typeof obj['tag'] == "undefined"){
					continue;
				}
				var axisValue = typeof obj['value'] != "undefined" ? obj['value'] : (typeof obj['defaultValue'] != "undefined" ? obj['defaultValue'] : 0);
				values.push('"'+obj['tag']+'" '+axisValue);
			}
			if(values.length === 0){
				return '';
			}
			return 'font-variation-settings: '+values.join(', ')+';';
		};
		var isVariableStyleEnabled = function(formatObj, enabledKey){
			if(typeof formatObj == "undefined" || typeof formatObj[enabledKey] == "undefined"){
				return false;
			}
			var value = formatObj[enabledKey];
			return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
		};
		var getNestedFontFamily = function(formatObj, key){
			if(typeof formatObj == "undefined"){
				return '';
			}
			if(typeof formatObj[key] == "string" && jQuery.trim(formatObj[key]) !== ''){
				return formatObj[key];
			}
			if(typeof formatObj.fontfamily == "string"){
				return formatObj.fontfamily;
			}
			return '';
		};
		var getStrongStyleSettingsString = function(formatObj){
			if(!isVariableStyleEnabled(formatObj, 'strong-variable-enabled')){
				return '';
			}
			var variableSettings = getVariableSettingsString(formatObj, 'strong-variablesettings');
			if(variableSettings !== ''){
				return variableSettings;
			}
			var css = '';
			var family = getNestedFontFamily(formatObj, 'strong-fontfamily');
			if(family !== ''){
				css += 'font-family:'+family+';';
			}
			css += 'font-weight:400;';
			return css;
		};
		var getItalicStyleSettingsString = function(formatObj){
			if(!isVariableStyleEnabled(formatObj, 'italic-variable-enabled')){
				return '';
			}
			var variableSettings = getVariableSettingsString(formatObj, 'italic-variablesettings');
			if(variableSettings !== ''){
				return variableSettings;
			}
			var css = '';
			var family = getNestedFontFamily(formatObj, 'italic-fontfamily');
			if(family !== ''){
				css += 'font-family:'+family+';';
			}
			css += 'font-style:normal;';
			return css;
		};

		// Match PHP FormatsManager::getTextWrapAndLigatureCSS (formatsmanager.php)
		var getTextWrapAndLigatureString = function(formatObj){
			if(typeof formatObj == "undefined"){
				return '';
			}
			var css = '';
			var cl = formatObj.commonligatures;
			if(cl === true || cl === 1 || cl === '1' || cl === 'true' || cl === 'on'){
				css += 'font-variant-ligatures: common-ligatures;';
			}
			if(formatObj.type === 'Paragraph'){
				var tw = (typeof formatObj.textwrap != "undefined" && formatObj.textwrap !== '') ? String(formatObj.textwrap) : 'wrap';
				if(tw === 'balance' || tw === 'pretty'){
					css += 'text-wrap: '+tw+';';
				}else{
					css += 'text-wrap: wrap;';
				}
			}
			return css;
		};

		// create text formats css for tinymce iframe
		var i, defaultFormatIx;

		// first add "Default" Text Format
		for(var i in jsonObject){
			if(jsonObject[i].formatname == "Default"){
				defaultFormatIx = i;
				break;
			}
		}
		var fontsizemu = jsonObject[defaultFormatIx].fontsizemu;
		if(typeof fontsizemu == "undefined"){
			fontsizemu = 'px';
		}
		// Check for both 'text-indent' (with hyphen) and 'textindent' (without hyphen)
		// Prefer 'text-indent' as that's what the React component uses
		var textindent = '0';
		if(typeof jsonObject[defaultFormatIx]['text-indent'] != "undefined"){
			textindent = String(jsonObject[defaultFormatIx]['text-indent']);
		} else if(typeof jsonObject[defaultFormatIx].textindent != "undefined"){
			textindent = String(jsonObject[defaultFormatIx].textindent);
		}

		var phone_fontsize = jsonObject[defaultFormatIx]['phone-fontsize'];
		if(typeof phone_fontsize == "undefined"){
			phone_fontsize = 16;
		}
		var phone_fontsizemu = jsonObject[defaultFormatIx]['phone-fontsizemu'];
		if(typeof phone_fontsizemu == "undefined"){
			phone_fontsizemu = 'px';
		}
		var phone_spacetop = jsonObject[defaultFormatIx]['phone-spacetop'];
		if(typeof phone_spacetop == "undefined"){
			phone_spacetop = 0;
		}
		var phone_spacebottom = jsonObject[defaultFormatIx]['phone-spacebottom'];
		if(typeof phone_spacebottom == "undefined"){
			phone_spacebottom = 20;
		}

		var phone_spacetopmu = jsonObject[defaultFormatIx]['phone-spacetopmu'];
		if(typeof phone_spacetopmu == "undefined"){
			phone_spacetopmu = 'px';
		}
		var phone_spacebottommu = jsonObject[defaultFormatIx]['phone-spacebottommu'];
		if(typeof phone_spacebottommu == "undefined"){
			phone_spacebottommu = 'px';
		}
		var spacetopmu = jsonObject[defaultFormatIx]['spacetopmu'];
		if(typeof spacetopmu == "undefined"){
			spacetopmu = 'px';
		}
		var spacebottommu = jsonObject[defaultFormatIx]['spacebottommu'];
		if(typeof spacebottommu == "undefined"){
			spacebottommu = 'px';
		}

		var caps = '';
		if( typeof jsonObject[defaultFormatIx]['caps'] != "undefined" && jsonObject[defaultFormatIx]['caps'] == true ){
			caps = 'text-transform:uppercase;';
		}else{
			caps = 'text-transform:none;';
		}
		var italic = '';
		if( typeof jsonObject[defaultFormatIx]['italic'] != "undefined" && jsonObject[defaultFormatIx]['italic'] == true ){
			italic = 'font-style:italic;';
		}else{
			italic = 'font-style:normal;';
		}
		var underline = '';
		if( typeof jsonObject[defaultFormatIx]['underline'] != "undefined" && jsonObject[defaultFormatIx]['underline'] == true ){
			underline = 'text-decoration:underline;';
		}else{
			underline = 'text-decoration:none;';
		}
		var borderbottom = '';
		if( typeof jsonObject[defaultFormatIx]['borderbottom'] != "undefined" && jsonObject[defaultFormatIx]['borderbottom'] == true ){
			borderbottom = 'border-bottom:1px solid;';
		}else{
			borderbottom = 'border-bottom:none;';
		}

		var variablesettings = getVariableSettingsString(jsonObject[defaultFormatIx], 'variablesettings');
		var strongVariableSettings = getStrongStyleSettingsString(jsonObject[defaultFormatIx]);
		var italicVariableSettings = getItalicStyleSettingsString(jsonObject[defaultFormatIx]);
		var textWrapLigaturesDefault = getTextWrapAndLigatureString(jsonObject[defaultFormatIx]);

		var lineheightmu = "";
		if(window.lg_advanced_lineheights == true){
			if( typeof jsonObject[defaultFormatIx]['lineheightmu'] != "undefined"){
				lineheightmu = jsonObject[defaultFormatIx]['lineheightmu'];
			}
		}

		var css = String()
			+'body#tinymce>*{'
				+'font-family:'+jsonObject[defaultFormatIx].fontfamily+';'
				+'font-size:'+jsonObject[defaultFormatIx].fontsize+fontsizemu+';'
				+'color:'+jsonObject[defaultFormatIx].color+';'
				+'letter-spacing:'+jsonObject[defaultFormatIx].letterspacing+'em;'
				+'text-align:'+jsonObject[defaultFormatIx].textalign+';'
				+'font-weight:'+jsonObject[defaultFormatIx].fontweight+';'
				+caps+italic+borderbottom+variablesettings+textWrapLigaturesDefault
			+'}'
			+'p{'
				+'margin:'+jsonObject[defaultFormatIx].spacetop+spacetopmu+' 0 '+jsonObject[defaultFormatIx].spacebottom+spacebottommu+' 0;'
				+'line-height:'+jsonObject[defaultFormatIx].lineheight+lineheightmu+';'
				+'text-indent:'+textindent+'em;'
				+underline
			+'}';
		if(strongVariableSettings !== ''){
			css += 'body#tinymce strong, body#tinymce > * strong{'+strongVariableSettings+'}';
		}
		if(italicVariableSettings !== ''){
			css += 'body#tinymce em, body#tinymce i, body#tinymce > * em, body#tinymce > * i{'+italicVariableSettings+'}';
		}

		var phonelineheight_and_mu = jsonObject[defaultFormatIx].lineheight+lineheightmu;
		if(window.lg_advanced_lineheights == true){
			var phonelineheight = "1.2";
			if( typeof jsonObject[defaultFormatIx]['phone-lineheight'] != "undefined"){
				phonelineheight = jsonObject[defaultFormatIx]['phone-lineheight'];
			}
			var phonelineheightmu = "";
			if( typeof jsonObject[defaultFormatIx]['phone-lineheightmu'] != "undefined"){
				phonelineheightmu = jsonObject[defaultFormatIx]['phone-lineheightmu'];
			}
			phonelineheight_and_mu = phonelineheight+phonelineheightmu;
		}

		// phone default textformat
		css += String()
		+'body#tinymce.phone-textformats{'
			+'font-size:'+phone_fontsize+phone_fontsizemu+';'
		+'}'
		+'body#tinymce.phone-textformats p{'
			+'margin:'+phone_spacetop+phone_spacetopmu+' 0 '+phone_spacebottom+phone_spacebottommu+' 0;'
			+'line-height:'+phonelineheight_and_mu+';'
		+'}';

		// add all custom textformats
		for(i=0; i<jsonObject.length; i++){
			var fontsizemu = jsonObject[i].fontsizemu;
			if(typeof fontsizemu == "undefined"){
				fontsizemu = 'px';
			}
			// Check for both 'text-indent' (with hyphen) and 'textindent' (without hyphen)
			// Prefer 'text-indent' as that's what the React component uses
			var textindent = '0';
			if(typeof jsonObject[i]['text-indent'] != "undefined"){
				textindent = String(jsonObject[i]['text-indent']);
			} else if(typeof jsonObject[i].textindent != "undefined"){
				textindent = String(jsonObject[i].textindent);
			}

			var phone_fontsize = jsonObject[i]['phone-fontsize'];
			if(typeof phone_fontsize == "undefined"){
				phone_fontsize = 16;
			}
			var phone_fontsizemu = jsonObject[i]['phone-fontsizemu'];
			if(typeof phone_fontsizemu == "undefined"){
				phone_fontsizemu = 'px';
			}
			var phone_spacetop = jsonObject[i]['phone-spacetop'];
			if(typeof phone_spacetop == "undefined"){
				phone_spacetop = 0;
			}
			var phone_spacebottom = jsonObject[i]['phone-spacebottom'];
			if(typeof phone_spacebottom == "undefined"){
				phone_spacebottom = 20;
			}

			var phone_spacetopmu = jsonObject[i]['phone-spacetopmu'];
			if(typeof phone_spacetopmu == "undefined"){
				phone_spacetopmu = 'px';
			}
			var phone_spacebottommu = jsonObject[i]['phone-spacebottommu'];
			if(typeof phone_spacebottommu == "undefined"){
				phone_spacebottommu = 'px';
			}
			var spacetopmu = jsonObject[i]['spacetopmu'];
			if(typeof spacetopmu == "undefined"){
				spacetopmu = 'px';
			}
			var spacebottommu = jsonObject[i]['spacebottommu'];
			if(typeof spacebottommu == "undefined"){
				spacebottommu = 'px';
			}

			var caps = '';
			if( typeof jsonObject[i]['caps'] != "undefined" && jsonObject[i]['caps'] == true ){
				caps = 'text-transform:uppercase;';
			}else{
				caps = 'text-transform:none;';
			}
			var italic = '';
			if( typeof jsonObject[i]['italic'] != "undefined" && jsonObject[i]['italic'] == true ){
				italic = 'font-style:italic;';
			}else{
				italic = 'font-style:normal;';
			}
			var underline = '';
			if( typeof jsonObject[i]['underline'] != "undefined" && jsonObject[i]['underline'] == true ){
				underline = 'text-decoration:underline;';
			}else{
				underline = 'text-decoration:none;';
			}
			var borderbottom = '';
			if( typeof jsonObject[i]['borderbottom'] != "undefined" && jsonObject[i]['borderbottom'] == true ){
				borderbottom = 'border-bottom:1px solid;';
			}else{
				borderbottom = 'border-bottom:none;';
			}

			var variablesettings = getVariableSettingsString(jsonObject[i], 'variablesettings');
			var strongVariableSettings = getStrongStyleSettingsString(jsonObject[i]);
			var italicVariableSettings = getItalicStyleSettingsString(jsonObject[i]);
			var textWrapLigaturesFmt = getTextWrapAndLigatureString(jsonObject[i]);

			var lineheightmu = "";
			if(window.lg_advanced_lineheights == true){
				if( typeof jsonObject[i]['lineheightmu'] != "undefined"){
					lineheightmu = jsonObject[i]['lineheightmu'];
				}
			}

			var phonelineheight_and_mu = jsonObject[i].lineheight+lineheightmu;
			if(window.lg_advanced_lineheights == true){
				var phonelineheight = "1.2";
				if( typeof jsonObject[i]['phone-lineheight'] != "undefined"){
					phonelineheight = jsonObject[i]['phone-lineheight'];
				}
				var phonelineheightmu = "";
				if( typeof jsonObject[i]['phone-lineheightmu'] != "undefined"){
					phonelineheightmu = jsonObject[i]['phone-lineheightmu'];
				}
				phonelineheight_and_mu = phonelineheight+phonelineheightmu;
			}

			css += String()
			+'body#tinymce ._'+jsonObject[i].formatname+'{'
				+'font-family:'+jsonObject[i].fontfamily+';'
				+'font-size:'+jsonObject[i].fontsize+fontsizemu+';'
				+'color:'+jsonObject[i].color+';'
				+'letter-spacing:'+jsonObject[i].letterspacing+'em;'
				+'margin-bottom:'+jsonObject[i].spacebottom+spacebottommu+';'
				+'margin-top:'+jsonObject[i].spacetop+spacetopmu+';'
				+'line-height:'+jsonObject[i].lineheight+lineheightmu+';'
				+'text-align:'+jsonObject[i].textalign+';'
				+'font-weight:'+jsonObject[i].fontweight+';'
				+'text-indent:'+textindent+'em;'
				+caps+italic+borderbottom+underline+variablesettings+textWrapLigaturesFmt
			+'}';
			if(strongVariableSettings !== ''){
				css += 'body#tinymce ._'+jsonObject[i].formatname+' strong{'+strongVariableSettings+'}';
			}
			if(italicVariableSettings !== ''){
				css += 'body#tinymce ._'+jsonObject[i].formatname+' em, body#tinymce ._'+jsonObject[i].formatname+' i{'+italicVariableSettings+'}';
			}

			// phone 
			css += String()
			+'body#tinymce.phone-textformats ._'+jsonObject[i].formatname+'{'
				+'font-size:'+phone_fontsize+phone_fontsizemu+';'
				+'margin-bottom:'+phone_spacebottom+phone_spacebottommu+';'
				+'margin-top:'+phone_spacetop+phone_spacetopmu+';'
				+'line-height:'+phonelineheight_and_mu+';'
			+'}';
		}

		editor.on('PreInit', function(e){
            editor.contentStyles.push(css);
        });
	}

} );
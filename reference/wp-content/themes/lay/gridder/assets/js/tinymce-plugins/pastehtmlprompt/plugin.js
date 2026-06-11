/* global tinymce */

tinymce.PluginManager.add('pastehtmlprompt', function (editor) {
	// Store paste data temporarily
	var pendingPaste = null
	var sessionStorageKey = 'pastehtmlprompt_choice'

	// Function to get stored choice from sessionStorage (tab-based)
	function getStoredChoice() {
		try {
			return sessionStorage.getItem(sessionStorageKey)
		} catch (e) {
			return null
		}
	}

	// Function to store choice in sessionStorage (tab-based)
	function storeChoice(choice) {
		try {
			sessionStorage.setItem(sessionStorageKey, choice)
		} catch (e) {
			// Ignore sessionStorage errors
		}
	}

	// When pasting as text: keep <p> (and <br>), strip formatting tags (b, i, etc.) and all attributes
	function sanitizeHtmlForPasteAsText(html) {
		var div = document.createElement('div')
		div.innerHTML = html || ''
		function processNode(node) {
			if (node.nodeType === Node.TEXT_NODE) {
				return editor.dom.encode(node.textContent || '')
			}
			if (node.nodeType !== Node.ELEMENT_NODE) return ''
			var tag = node.tagName.toLowerCase()
			if (tag === 'br') return '<br>'
			if (tag === 'p') {
				return '<p>' + processChildren(node) + '</p>'
			}
			// Unwrap all other tags (b, i, strong, em, span, etc.) but keep their text content
			return processChildren(node)
		}
		function processChildren(el) {
			var out = ''
			for (var i = 0; i < el.childNodes.length; i++) {
				out += processNode(el.childNodes[i])
			}
			return out
		}
		return processChildren(div).trim()
	}

	// Function to handle paste based on choice
	function handlePaste(choice, rememberChoice) {
		if (pendingPaste) {
			if (choice === 'html') {
				// Insert HTML content
				editor.insertContent(pendingPaste.html)
			} else if (choice === 'text') {
				// Keep <p> structure, strip formatting tags and attributes (e.g. from Gemini)
				var cleaned = sanitizeHtmlForPasteAsText(pendingPaste.html)
				if (cleaned) {
					editor.insertContent(cleaned)
				} else {
					// Fallback: plain text with line breaks
					var normalizedText = (pendingPaste.text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
					var encoded = editor.dom.encode(normalizedText)
					editor.insertContent(encoded.replace(/\n/g, '<br>'))
				}
			}
			pendingPaste = null

			// Store choice if checkbox is checked
			if (rememberChoice) {
				storeChoice(choice)
			}
		}
		editor.windowManager.close()
	}

	// Intercept paste using PastePreProcess event (runs before paste is processed by TinyMCE)
	editor.on('PastePreProcess', function (e) {
		var pastedData = e.content || ''

		// Check if the pasted content contains HTML tags
		if (pastedData && pastedData.match(/<[^>]+>/)) {
			// Extract plain text from HTML for comparison
			var tempDiv = document.createElement('div')
			tempDiv.innerHTML = pastedData
			var extractedText = tempDiv.textContent || tempDiv.innerText || ''

			// Normalize whitespace for comparison
			var normalizedHtml = pastedData.replace(/\s+/g, ' ').trim()
			var normalizedText = extractedText.replace(/\s+/g, ' ').trim()

			// If HTML content is different from plain text, show prompt
			if (normalizedHtml !== normalizedText) {
				// Check if we have a stored choice
				var storedChoice = getStoredChoice()

				if (storedChoice === 'html' || storedChoice === 'text') {
					// Use stored choice automatically
					e.preventDefault()
					pendingPaste = {
						html: pastedData,
						text: extractedText,
					}
					setTimeout(function () {
						handlePaste(storedChoice, false)
					}, 0)
					e.content = ''
					return false
				}

				// Prevent default paste processing
				e.preventDefault()

				// Store the paste data
				pendingPaste = {
					html: pastedData,
					text: extractedText,
				}

				// Use setTimeout to show dialog after paste event completes
				setTimeout(function () {
					// Create checkbox element
					var rememberChecked = false

					// Show confirmation dialog
					editor.windowManager.open({
						title: 'HTML Detected',
						body: {
							type: 'container',
							html: '<p>The pasted text contains HTML formatting. How would you like to paste it?</p>' + '<p><label><input type="checkbox" id="pastehtmlprompt-remember" /> Remember my choice</label></p>',
						},
						onOpen: function () {
							// Get checkbox reference
							var checkbox = document.getElementById('pastehtmlprompt-remember')
							if (checkbox) {
								checkbox.addEventListener('change', function () {
									rememberChecked = this.checked
								})
							}
						},
						buttons: [
							{
								text: 'Paste with HTML',
								onclick: function () {
									handlePaste('html', rememberChecked)
								},
							},
							{
								text: 'Paste as Text',
								onclick: function () {
									handlePaste('text', rememberChecked)
								},
							},
							{
								text: 'Cancel',
								onclick: function () {
									pendingPaste = null
									editor.windowManager.close()
								},
							},
						],
					})
				}, 0)

				// Clear the content to prevent auto-paste
				e.content = ''
				return false
			}
		}
	})
})

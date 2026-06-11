;(function () {
	const bubble = document.getElementById('lay-setupwizard-continue-bubble')
	if (!bubble || !window.laySetupWizardContinue) return

	const dismiss = bubble.querySelector('.lay-setupwizard-continue-dismiss')
	if (!dismiss) return

	const floatingPill = window.LayAdminFloatingPill
		? window.LayAdminFloatingPill.init({
				element: bubble,
				handle: bubble.querySelector('.lay-admin-floating-pill-drag-handle'),
				ajaxUrl: window.laySetupWizardContinue.ajaxUrl,
				saveAction: 'lay_setup_wizard_save_continue_position',
				nonce: window.laySetupWizardContinue.nonce || '',
				defaultBottom: 68,
				defaultRight: 20,
			})
		: null

	const link = bubble.querySelector('.lay-setupwizard-continue-link')
	if (link) {
		link.addEventListener('click', function (event) {
			if (floatingPill && floatingPill.wasDragging()) {
				event.preventDefault()
			}
		})
	}

	if (window.LayAdminFloatingPill) {
		window.LayAdminFloatingPill.initDismissConfirmation({
			element: bubble,
			button: dismiss,
			message: 'Hide this',
			confirmLabel: 'Yes',
			onConfirm: function () {
				bubble.remove()

				const body = new URLSearchParams()
				body.append('action', 'lay_setup_wizard_dismiss_continue')
				body.append('nonce', window.laySetupWizardContinue.nonce || '')

				fetch(window.laySetupWizardContinue.ajaxUrl, {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					},
					body,
				}).catch(function () {
					// The bubble is intentionally hidden immediately. If the request fails,
					// WordPress can show it again on the next admin load.
				})
			},
		})
	}
})()

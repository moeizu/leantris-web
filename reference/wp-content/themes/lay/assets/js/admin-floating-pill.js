;(function () {
	function postPosition(config, bottom, right) {
		if (!config.ajaxUrl || !config.saveAction) return

		var body = new URLSearchParams()
		body.append('action', config.saveAction)
		body.append('bottom', String(bottom))
		body.append('right', String(right))
		if (config.nonce) {
			body.append(config.nonceField || 'nonce', config.nonce)
		}

		fetch(config.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: body,
		}).catch(function () {})
	}

	function init(config) {
		if (!config || !config.element || !config.handle) return null

		var element = config.element
		var handle = config.handle
		var dragStartX = 0
		var dragStartY = 0
		var elementStartBottom = 20
		var elementStartRight = 20
		var dragging = false
		var moved = false
		var suppressClick = false

		function getNumber(value, fallback) {
			var number = parseInt(value, 10)
			return Number.isFinite(number) ? number : fallback
		}

		function constrainPosition() {
			var rect = element.getBoundingClientRect()
			var currentBottom = getNumber(element.dataset.bottom, getNumber(element.style.bottom, config.defaultBottom || 20))
			var currentRight = getNumber(element.dataset.right, getNumber(element.style.right, config.defaultRight || 20))
			var maxBottom = window.innerHeight - rect.height - 10
			var maxRight = window.innerWidth - rect.width - 10

			currentBottom = Math.max(10, Math.min(currentBottom, maxBottom))
			currentRight = Math.max(10, Math.min(currentRight, maxRight))

			element.dataset.bottom = String(currentBottom)
			element.dataset.right = String(currentRight)
			element.style.bottom = currentBottom + 'px'
			element.style.right = currentRight + 'px'
		}

		function onMouseMove(event) {
			var deltaX = dragStartX - event.clientX
			var deltaY = dragStartY - event.clientY
			if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
				moved = true
				element.classList.add('is-dragging')
			}

			var rect = element.getBoundingClientRect()
			var nextBottom = elementStartBottom + deltaY
			var nextRight = elementStartRight + deltaX

			nextBottom = Math.max(10, Math.min(nextBottom, window.innerHeight - rect.height - 10))
			nextRight = Math.max(10, Math.min(nextRight, window.innerWidth - rect.width - 10))

			element.dataset.bottom = String(nextBottom)
			element.dataset.right = String(nextRight)
			element.style.bottom = nextBottom + 'px'
			element.style.right = nextRight + 'px'
		}

		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove)
			document.removeEventListener('mouseup', onMouseUp)
			dragging = false
			element.classList.remove('is-dragging')

			if (moved) {
				var bottom = getNumber(element.dataset.bottom, config.defaultBottom || 20)
				var right = getNumber(element.dataset.right, config.defaultRight || 20)
				postPosition(config, bottom, right)
				suppressClick = true
				window.setTimeout(function () {
					suppressClick = false
				}, 120)
			}
		}

		handle.addEventListener('mousedown', function (event) {
			event.preventDefault()
			event.stopPropagation()
			dragging = true
			moved = false
			dragStartX = event.clientX
			dragStartY = event.clientY
			elementStartBottom = getNumber(element.dataset.bottom, config.defaultBottom || 20)
			elementStartRight = getNumber(element.dataset.right, config.defaultRight || 20)
			document.addEventListener('mousemove', onMouseMove)
			document.addEventListener('mouseup', onMouseUp)
		})

		window.addEventListener('resize', constrainPosition)
		constrainPosition()

		return {
			wasDragging: function () {
				return dragging || suppressClick
			},
			destroy: function () {
				window.removeEventListener('resize', constrainPosition)
				document.removeEventListener('mousemove', onMouseMove)
				document.removeEventListener('mouseup', onMouseUp)
			},
		}
	}

	function initDismissConfirmation(config) {
		if (!config || !config.element || !config.button || typeof config.onConfirm !== 'function') return null

		var element = config.element
		var button = config.button
		var message = config.message || 'Hide this'
		var confirmLabel = config.confirmLabel || 'Yes'
		var confirmText = null
		var confirmButton = null
		var confirming = false

		function reset() {
			confirming = false
			element.classList.remove('is-confirming-dismiss')
			if (confirmText) {
				confirmText.remove()
				confirmText = null
			}
			if (confirmButton) {
				confirmButton.remove()
				confirmButton = null
			}
			document.removeEventListener('click', onDocumentClick)
			document.removeEventListener('keydown', onDocumentKeydown)
		}

		function onDocumentClick(event) {
			if (!element.contains(event.target)) {
				reset()
			}
		}

		function onDocumentKeydown(event) {
			if (event.key === 'Escape') {
				reset()
			}
		}

		function showConfirmation() {
			if (confirming) return
			confirming = true
			element.classList.add('is-confirming-dismiss')

			confirmText = document.createElement('span')
			confirmText.className = 'lay-admin-floating-pill-confirm-text'
			confirmText.textContent = message

			confirmButton = document.createElement('button')
			confirmButton.className = 'lay-admin-floating-pill-confirm-yes'
			confirmButton.type = 'button'
			confirmButton.textContent = confirmLabel
			confirmButton.addEventListener('click', function (event) {
				event.preventDefault()
				event.stopPropagation()
				config.onConfirm(event)
				reset()
			})

			element.insertBefore(confirmText, button)
			element.insertBefore(confirmButton, button)

			window.setTimeout(function () {
				document.addEventListener('click', onDocumentClick)
				document.addEventListener('keydown', onDocumentKeydown)
			}, 0)
		}

		button.addEventListener('click', function (event) {
			event.preventDefault()
			event.stopPropagation()
			showConfirmation()
		})

		return {
			reset: reset,
		}
	}

	window.LayAdminFloatingPill = {
		init: init,
		initDismissConfirmation: initDismissConfirmation,
	}
})()

/**
 * Disable WordPress Customizer's slide-up/slide-down animation on
 * control / section / panel activate/deactivate.
 *
 * Why:
 *
 * The Lay Theme customizer expresses control visibility through TWO
 * mechanisms in parallel: PHP `active_callback` parameters on each
 * control (re-evaluated by WordPress automatically when their settings
 * change) AND imperative JS handlers in app.handlers.js that call
 * .activate() / .deactivate() on dependent controls when their trigger
 * setting changes.
 *
 * Both mechanisms toggle the SAME `.active` state. When they momentarily
 * disagree (during initial customizer load, or during a setting-change
 * cascade), a control's `.active` flips true → false → true (or vice
 * versa) within a few hundred ms. WordPress core paints each flip with
 * a jQuery slideDown / slideUp animation (default 400ms), so the user
 * sees the control briefly slide open then close again — a visible
 * flicker even though the final state is correct.
 *
 * Replacing onChangeActive with an instant `.toggle()` makes the
 * underlying state changes invisible. The redundant toggle still
 * happens internally (it's effectively free) but no UX impact.
 *
 * What we DON'T touch: section/panel EXPAND/COLLAPSE animations
 * (different mechanism — `slideUp/Down` inside contentContainer when
 * a user clicks a section header). Those are intentional UX, not
 * flicker, and we leave them alone.
 *
 * This file must run in the customizer CONTROLS frame (the sidebar
 * pane), not the preview frame, because that's where wp.customize.Control
 * et al. are defined.
 */

(function () {
	if (typeof wp === 'undefined' || !wp.customize) {
		return
	}

	var instantToggle = function (active, args) {
		args = args || {}
		if (args.unchanged) {
			if (typeof args.completeCallback === 'function') {
				args.completeCallback()
			}
			return
		}
		this.container.toggle(!!active)
		if (typeof args.completeCallback === 'function') {
			args.completeCallback()
		}
	}

	// Container subclass: Section + Panel both inherit from this in WP
	// core but each defines its own onChangeActive. Override all three.
	if (wp.customize.Control && wp.customize.Control.prototype) {
		wp.customize.Control.prototype.onChangeActive = instantToggle
	}
	if (wp.customize.Section && wp.customize.Section.prototype) {
		wp.customize.Section.prototype.onChangeActive = instantToggle
	}
	if (wp.customize.Panel && wp.customize.Panel.prototype) {
		wp.customize.Panel.prototype.onChangeActive = instantToggle
	}
})()

'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

/**
 * A welcome modal. There are two modes for this modal: expand mode and collapse mode.
 * In expand mode, the whole modal will be shown; while in collapse mode, only the "post" button is shown.
 * Currently only collapse mode is implemented.
 *
 * - Events:
 *   - postButtonClicked
 *
 * - APIs:
 *   - setPostButtonEnabled
 */
class WelcomeModal {
	constructor() {
		this.postButtonClicked = new SimpleEventEmitter();
		this._postButtonEnabled = true;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this._postButton = domElement.find('.login-button a');
		this._postButtonEnabled = !this._postButton.hasClass('disabled');
		this._postButton.on('click', (evt) => this._onPostButtonClicked(evt));
	}

	_onPostButtonClicked(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		evt.stopPropagation();
		if (!this._postButtonEnabled) {
			return;
		}
		this.postButtonClicked.trigger();
	}

	/**
	 * Set enabled status of post button
	 * @param enabled
	 */
	setPostButtonEnabled(enabled) {
		enabled = !!enabled;
		if (this._postButtonEnabled === enabled) {
			return;
		}
		this._postButtonEnabled = enabled;
		if (enabled) {
			this._postButton.attr('tabindex', '0');
			this._postButton.removeClass('disabled');
		} else {
			this._postButton.attr('tabindex', '-1');
			this._postButton.addClass('disabled');
		}
	}
}

let initialize = () => {

	$(document).ready(() => {

		function getCookie(cname) {
			let name = cname + "=";
			let ca = document.cookie.split(';'); //cookie array
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}

		if (getCookie('alreadyVisited') === "") {
			document.cookie = 'alreadyVisited=true';
			$('.modal-wrapper .modal').css('display', 'block');
			$('.viewport').addClass('modal-open');
		}


		$('.modal-wrapper .modal-close-section').on('click', function() {
			$('.modal-wrapper .modal').fadeOut('slow', function() {
				$(this).removeClass('modal');
				$('.welcome-footer').css('display', 'block');
				$('.viewport').removeClass('modal-open');
			});
		});


	});
};

module.exports = {
	initialize,
	WelcomeModal
};

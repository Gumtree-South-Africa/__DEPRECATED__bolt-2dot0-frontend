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
 * - Properties:
 *   - isPostAllowed
 */
class WelcomeModal {
	constructor() {
		this.postButtonClicked = new SimpleEventEmitter();
		this._isPostAllowed = true;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded.
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		// Bind property and event
		this._postButton = domElement.find('.login-button a');
		this._handleIsPostAllowedChanged = (newValue) => {
			if (newValue) {
				this._postButton.attr('tabindex', '0');
				this._postButton.removeClass('disabled');
			} else {
				this._postButton.attr('tabindex', '-1');
				this._postButton.addClass('disabled');
			}
		};
		this._postButton.on('click', evt => this._handlePostButtonClicked(evt));
	}

	_handlePostButtonClicked(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		evt.stopPropagation();
		if (!this._isPostAllowed) {
			return;
		}
		this.postButtonClicked.trigger();
	}

	get isPostAllowed() {
		return this._isPostAllowed;
	}

	set isPostAllowed(newValue) {
		newValue = !!newValue;
		if (this._isPostAllowed === newValue) {
			return;
		}
		this._isPostAllowed = newValue;
		this._handleIsPostAllowedChanged(newValue);
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

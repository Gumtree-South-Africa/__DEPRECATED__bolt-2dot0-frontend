'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let CookieUtils = require('public/js/common/utils/CookieUtils.js');

/**
 * A welcome modal. When it's opened, the whole modal will be shown; while only the "post" button
 * is shown when it's closed.
 *
 * - Events:
 *   - postButtonClicked
 *   - propertyChanged, triggered with propertyName and newValue
 *
 * - Properties:
 *   - isPostAllowed
 *   - title
 *   - message
 *   - isOpened
 */
class WelcomeModal {
	constructor() {
		//this.postButtonClicked = new SimpleEventEmitter();
		this.propertyChanged = new SimpleEventEmitter();

		//this._isPostDirectly = false;
		//this._isPostAllowed = true;
		this._isOpened = false;
		this._title = '';
		this._message = '';
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded.
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		// Bind property and event
		//this._isPostDirectly = domElement.find('.login-button').hasClass('directly-post');
		/*
		this._$postButton = domElement.find('.login-button a');
		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'isPostAllowed') {
				return;
			}

			if (newValue) {
				this._$postButton.attr('tabindex', '0');
				this._$postButton.removeClass('disabled');
			} else {
				this._$postButton.attr('tabindex', '-1');
				this._$postButton.addClass('disabled');
			}
		});
		if (this._isPostDirectly) {
			// Use new way of post, upload image on the page
			this._$postButton.on('click', evt => this._handlePostButtonClicked(evt));
		}
		*/
		this._$modal = domElement.find('.modal-wrapper .modal');
		this._$footer = domElement.find('.welcome-footer');
		this._$title = domElement.find('.modal-container h2');
		this._$message = domElement.find('.modal-container .modal-info');
		this._title = this._$title.text();
		this._message = this._$message.text();
		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'isOpened') {
				return;
			}

			if (newValue) {
				this._$modal.addClass('modal');
				this._$modal.css('display', 'block');
				// TODO move below line out of welcome modal
				$('.viewport').addClass('modal-open');
			} else {
				this._$modal.fadeOut('slow', () => {
					this._$modal.removeClass('modal');
					this._$footer.css('display', 'block');
					// TODO move below line out of welcome modal
					$('.viewport').removeClass('modal-open');
				});
			}
		});
		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'title') {
				this._$title.text(newValue);
			} else if (propName === 'message') {
				this._$message.text(newValue);
			}
		});

		domElement.find('.modal-wrapper .modal-close-section').on('click', () => this.isOpened = false);

		if (CookieUtils.getCookie('alreadyVisited') === "") {
			document.cookie = 'alreadyVisited=true';
			this.isOpened = true;
		}
	}
	/*
	_handlePostButtonClicked(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		evt.stopPropagation();
		if (!this._isPostAllowed) {
			return;
		}
		window.BOLT.trackEvents({"event": "PostAdBegin"});
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
		this.propertyChanged.trigger('isPostAllowed', newValue);
	}
	*/

	get isOpened() {
		return this._isOpened;
	}

	set isOpened(newValue) {
		newValue = !!newValue;
		if (this._isOpened === newValue) {
			return;
		}
		this._isOpened = newValue;
		this.propertyChanged.trigger('isOpened', newValue);
	}

	get title() {
		return this._title;
	}

	set title(newValue) {
		if (this._title === newValue) {
			return;
		}
		this._title = newValue;
		this.propertyChanged.trigger('title', newValue);
	}

	get message() {
		return this._message;
	}

	set message(newValue) {
		if (this._message === newValue) {
			return;
		}
		this._message = newValue;
		this.propertyChanged.trigger('message', newValue);
	}
}

module.exports = WelcomeModal;

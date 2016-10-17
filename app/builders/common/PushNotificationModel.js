'use strict';

let pushNotificationService = require(process.cwd() + '/server/services/pushNotificationService.js');

/**
 * @description A class that Handles the Push Notification Model
 * @constructor
 */
class PushNotificationModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	/**
	 * Subscribes user's device to Push Notification Service
	 * @param {string} subscription
	 */
	subscribe(endpoint) {
		return pushNotificationService.subscribeGCM(this.bapiHeaderValues, endpoint);
	}

	/**
	 * Unsubscribes user's device from Push Notification Service
	 * @param {string} subscription
	 */
	unsubscribe(endpoint) {
		return pushNotificationService.unsubscribeGCM(this.bapiHeaderValues, endpoint);
	}

}


module.exports = PushNotificationModel;


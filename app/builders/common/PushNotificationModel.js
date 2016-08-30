'use strict';

let pushNotificationService = require(process.cwd() + '/server/services/PushNotificationService.js');

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
	subscribe(subscription) {
		return pushNotificationService.subscribeAlertsGCM(this.bapiHeaderValues, subscription);
	}

}


module.exports = PushNotificationModel;


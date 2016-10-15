'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

let notificationType = {
	alert: 'SEARCHALERTS',
	chat: 'CHATMESSAGE'
};

class PushNotificationService {
	subscribeGCM(bapiHeaderValues, endpoint) {
		let pathValue = config.get('BAPI.endpoints.pushSubscription');
		let pattern = 'https://android.googleapis.com/gcm/send/';
		let registrationId = endpoint.substr(endpoint.indexOf(pattern) + pattern.length, endpoint.length);
		let data = {
			'registrationId': registrationId,
			'provider': 'gcm',
			'appType': 'pwa',
			'notifications': [
				{'notificationFeatureType': notificationType.alert},
				{'notificationFeatureType': notificationType.chat}
			]
		};

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: pathValue
		}), bapiHeaderValues, JSON.stringify(data), 'pushSubscribeGcm');
	}

	unsubscribeGCM(bapiHeaderValues, endpoint) {
		let pathValue = config.get('BAPI.endpoints.pushSubscription');
		let pattern = 'https://android.googleapis.com/gcm/send/';
		let registrationId = endpoint.substr(endpoint.indexOf(pattern) + pattern.length, endpoint.length);
		let data = {
			'registrationId': registrationId,
			'provider': 'gcm',
			'appType': 'pwa',
			'notifications': [
				{'notificationFeatureType': notificationType.alert},
				{'notificationFeatureType': notificationType.chat}
			]
		};

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'DELETE',
			path: pathValue
		}), bapiHeaderValues, JSON.stringify(data), 'pushUnsubscribeGcm');
	}
}

module.exports = new PushNotificationService();

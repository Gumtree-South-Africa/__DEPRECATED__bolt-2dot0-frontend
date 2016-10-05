'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

let notificationType = {
	alert: 'SEARCHALERTS',
	chat: 'CHATMESSAGE'
};

class PushNotificationService {
	subscribeAlertsGCM(bapiHeaderValues, subscription) {
		let pathValue = config.get('BAPI.endpoints.pushSubscribe') + '/' + notificationType.alert;
		let data = {
			subscription: subscription
		};

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: pathValue
		}), bapiHeaderValues, JSON.stringify(data), 'pushSubscribe');
	}

	subscribeChatGCM(bapiHeaderValues, subscription) {
		let pathValue = config.get('BAPI.endpoints.pushUnsubscribe') + '/' + notificationType.chat;
		let data = {
			subscription: subscription
		};

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: pathValue
		}), bapiHeaderValues, JSON.stringify(data), 'pushUnsubscribe');
	}
}

module.exports = new PushNotificationService();

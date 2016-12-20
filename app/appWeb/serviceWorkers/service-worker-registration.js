/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-env browser */
'use strict';


let $ = require('jquery');

let CookieUtils = require("public/js/common/utils/CookieUtils.js");


function subscribeInServer(subscription) {
	let payload = {
		subscription: subscription,
		endpoint: subscription.endpoint
	};
	$.ajax({
		url: '/api/push/subscription',
		type: 'POST',
		data: JSON.stringify(payload),
		dataType: 'json',
		contentType: "application/json",
		success: function(output) {
			console.log('Success in subscribing to push notification in server');
			console.log(output);
		},
		error: function(err) {
			console.log('Failed to subscribe to push notification in server');
			console.log(err);
		}
	});
}

function unsubscribeInServer(subscription) {
	let payload = {
		subscription: subscription,
		endpoint: subscription.endpoint
	};
	$.ajax({
		url: '/api/push/subscription',
		type: 'DELETE',
		data: JSON.stringify(payload),
		dataType: 'json',
		contentType: "application/json",
		success: function(output) {
			console.log('Success in unsubscribing to push notification in server');
			console.log(output);
		},
		error: function(err) {
			console.log('Failed to unsubscribe to push notification in server');
			console.log(err);
		}
	});
}

function subscribe(subscription) {
	// subscribe anytime there is a change
	subscribeInServer(subscription);

	// save subscription in cookie for 1 week
	CookieUtils.setCookie('GCMSubscription', JSON.stringify(subscription), 7);
}

function unsubscribe(subscription) {
	// unsubscribe from server
	unsubscribeInServer(subscription);

	// delete subscription cookie
	CookieUtils.setCookie('GCMSubscription', '', -1);
}

// Once the service worker is registered set the initial state
// working for auto subscribe: https://developers.google.com/web/fundamentals/getting-started/push-notifications/step-06?hl=en
// for user subscribe/unsubscribe: https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web?hl=en
function initializePushNotification() {
	// Are Notifications supported in the service worker?
	if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
		console.warn('Notifications aren\'t supported.');
		return;
	}

	// Check the current Notification permission.
	// If its denied, it's a permanent block until the
	// user changes the permission
	if (Notification.permission === 'denied') {
		console.warn('The user has blocked notifications.');
		return;
	}

	// Check if push messaging is supported
	if (!('PushManager' in window)) {
		console.warn('Push messaging isn\'t supported.');
		return;
	}

	// If user is not logged in, no push notification
	let btAuthStr = CookieUtils.getCookie('bt_logged_in');
	if(btAuthStr === '') {
		console.warn('User not logged in, push message not enabled');
		return;
	}

	// We need the service worker registration to check for a subscription
	navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
		console.log(':^)', serviceWorkerRegistration);
		serviceWorkerRegistration.pushManager.getSubscription()
			.then(existingSubscription => {
				if (existingSubscription) {
					subscribe(existingSubscription);
				} else {
					serviceWorkerRegistration.pushManager.subscribe({"userVisibleOnly": true}).then(newSubscription => {
						console.log('######################################## --------------- ', newSubscription);
						if (!newSubscription) {
							return;
						}

						// endpoint: https://android.googleapis.com/gcm/send/
						// API Key : AIzaSyB8-dMAv3nCziuF2VpdfP_Jr4fwowiJl58
						// sender Id:  759612781184
						// Example Subscription: eM3cPdPRE2I:APA91bFs1faZVtcG3-0Y8eVUw6t6yvB87QJht7NQll_R-IjGMkKdwRtxE26zPYaOcAuHlPmqDCKF0LSajhCPij9RAYF-I-ZhdiyyCpGspC8vHe2REhitfcqy0pFxBPR_Uz6e7V0TAZ3j
						// Request: curl --header "Authorization: key=AIzaSyB8-dMAv3nCziuF2VpdfP_Jr4fwowiJl58" --header "Content-Type: application/json" https://android.googleapis.com/gcm/send -d "{\"registration_ids\":[\"eM3cPdPRE2I:APA91bFs1faZVtcG3-0Y8eVUw6t6yvB87QJht7NQll_R-IjGMkKdwRtxE26zPYaOcAuHlPmqDCKF0LSajhCPij9RAYF-I-ZhdiyyCpGspC8vHe2REhitfcqy0pFxBPR_Uz6e7V0TAZ3j\"]}"

						let subscriptionChanged = false;
						let subscriptionFromCookieStr = CookieUtils.getCookie('GCMSubscription');
						if(subscriptionFromCookieStr === '') {
							console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ --------------- ', newSubscription);
							subscribe(newSubscription);
						} else {
							console.log('***************************************** --------------- ');
							let subscriptionFromCookie = JSON.parse(subscriptionFromCookieStr);
							subscriptionChanged = (newSubscription.endpoint !== subscriptionFromCookie.endpoint);
							if (subscriptionChanged) {
								unsubscribe(subscriptionFromCookie);
								subscribe(newSubscription);
							}
						}
					}).catch(error => {
						console.log('ERROR ', error);
					});
				}
			});
	}).catch(function(err) {
		console.log(':^(', err);
	});
}

if ('serviceWorker' in navigator) {
	// Your service-worker.js *must* be located at the top-level directory relative to your site.
	// It won't be able to control pages unless it's located at the same level or higher than them.
	// *Don't* register service worker file in, e.g., a scripts/ sub-directory!
	// See https://github.com/slightlyoff/ServiceWorker/issues/468
	navigator.serviceWorker.register('/service-worker.js').then(registration => {
		// updatefound is fired if service-worker.js changes.
		registration.onupdatefound = function() {
			// The updatefound event implies that reg.installing is set; see
			// https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
			let installingWorker = reg.installing;

			installingWorker.onstatechange = function() {
				switch (installingWorker.state) {
					case 'installed':
						if (navigator.serviceWorker.controller) {
							// At this point, the old content will have been purged and the fresh content will
							// have been added to the cache.
							// It's the perfect time to display a "New content is available; please refresh."
							// message in the page's interface.
							console.log('New or updated content is available.');
						} else {
							// At this point, everything has been precached.
							// It's the perfect time to display a "Content is cached for offline use." message.
							console.log('Content is now available offline!');
						}
						break;

					case 'redundant':
						console.error('The installing service worker became redundant.');
						break;
				}
			};
		};

		initializePushNotification();
	}).catch (function(e) {
		console.error('Error during service worker registration:', e);
	});
}

//do not remove
let initialize = () => {
};

module.exports = {
	initialize
};

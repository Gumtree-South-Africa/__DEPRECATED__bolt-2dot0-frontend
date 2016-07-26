'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');

class RecentActivityModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getPrefix1(feed) {
		return feed.action;
	}

	getPrefix2(feed) {
		return feed.action;
	}

	getRecentActivities(geoLatLng) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLng).then((data) => {
			data.recent = [];

			if (data.ads instanceof Array && data.ads.length>0) {
				let feed1 = data.ads[Math.floor(Math.random() * data.ads.length)];
				feed1.prefix1 = '11';
				feed1.prefix2 = '12';
				data.recent.push(feed1);

				let feed2 = data.ads[Math.floor(Math.random() * data.ads.length)];
				feed2.prefix1 = '21';
				feed2.prefix2 = '22';
				data.recent.push(feed2);

				let feed3 = data.ads[Math.floor(Math.random() * data.ads.length)];
				feed3.prefix1 = '31';
				feed3.prefix2 = '32';
				data.recent.push(feed3);
			}

			return data;
		});
	}
}

module.exports = RecentActivityModel;

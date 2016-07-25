'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');

class RecentActivityModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getRecentActivities(geoLatLng) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLng).then((data) => {
			console.log('$$$$$$$$$$$$$$$');
			console.dir(data);

			data.recent = [];

			if (data.ads instanceof Array && data.ads.length>0) {
				data.recent.push(data.ads[Math.floor(Math.random() * data.ads.length)]);
				data.recent.push(data.ads[Math.floor(Math.random() * data.ads.length)]);
				data.recent.push(data.ads[Math.floor(Math.random() * data.ads.length)]);
			}

			return data;
		});
	}
}

module.exports = RecentActivityModel;

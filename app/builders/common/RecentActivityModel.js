'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');

class RecentActivityModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getRecentActivities() {
		// let data = require(process.cwd() + '/test/serverUnit/mockData/components/recentActivityMock');
		let data = recentActivityService.getRecentActivities();
		data.recent = [];

		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);
		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);
		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);

		return data;
	}
}

module.exports = RecentActivityModel;

'use strict';

class RecentActivityModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getRecentActivities() {
		let data = require(process.cwd() + '/test/serverUnit/mockData/components/recentActivityMock');

		data.one = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];
		data.two = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];
		data.three = data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)];

		return data;
	}
}

module.exports = RecentActivityModel;

'use strict';

class RecentActivityModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getRecentActivities() {
		let data = require(process.cwd() + '/test/serverUnit/mockData/components/recentActivityMock');
		data.recent = [];
		
		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);
		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);
		data.recent.push(data.recentActivities[Math.floor(Math.random()*data.recentActivities.length)]);

		return data;
	}
}


module.exports = RecentActivityModel;

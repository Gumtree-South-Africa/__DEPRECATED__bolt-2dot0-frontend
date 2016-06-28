'use strict';

class RecentActivityService {
	getRecentActivities() {
		return require(process.cwd() + '/server/services/mockData/recentActivityMock');
	}
}

module.exports = new RecentActivityService();

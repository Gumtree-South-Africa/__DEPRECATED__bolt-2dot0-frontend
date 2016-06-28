'use strict';

class RecentActivityService {
	getRecentActivities() {
		return require(process.cwd() + '/server/services/mockData/components/recentActivityMock');
	}
}

module.exports = new RecentActivityService();

'use strict';

class RecentActivityService {
	getRecentActivities() {
		return require(process.cwd() + '/test/serverUnit/mockData/components/recentActivityMock');
	}
}

module.exports = new RecentActivityService();

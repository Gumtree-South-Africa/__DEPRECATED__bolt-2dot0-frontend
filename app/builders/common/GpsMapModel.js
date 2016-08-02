'use strict';

let mapService = require(process.cwd() + '/server/services/gpsMapService');

class GpsMapModel {
	constructor(country) {
		this.country = country;
	}

	getMap(geo) {
		if (typeof this.country !== 'undefined') {
			return mapService.getMapData(this.country, geo).then((mapItems) => {
				return mapItems;
			});
		}
	}
}

module.exports = GpsMapModel;

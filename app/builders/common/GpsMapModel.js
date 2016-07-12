'use strict';

let mapService = require(process.cwd() + '/server/services/gpsMapService');

class GpsMapModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getMap(geoLocation) {
		return mapService.getMapData(this.bapiHeaderValues, geoLocation).then((mapItems) => {
			return mapItems;
		});
	}
}

module.exports = GpsMapModel;

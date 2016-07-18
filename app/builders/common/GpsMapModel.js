'use strict';

let mapService = require(process.cwd() + '/server/services/gpsMapService');

class GpsMapModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getMap(geo) {
		if (typeof this.bapiHeaderValues.locale !== 'undefined') {
			return mapService.getMapData(this.bapiHeaderValues, geo).then((mapItems) => {
				return mapItems;
			});
		}
	}
}

module.exports = GpsMapModel;

'use strict';

let Q = require('q');
let config = require('config');
let solr = require('solr-client');

const querystring = require('querystring');

/**
 * @description A SOLR service class
 * @constructor
 */
class SolrService {
	constructor() {
		this.adsClient = solr.createClient({
			host: config.get('solr.server.host'),
			port: config.get('solr.server.port'),
			path: config.get('solr.server.path'),
			solrVersion: config.get('solr.server.version'),
			core: 'ads'
		});
	}

	/**
 	 * Gets User Info given a token from the cookie
 	 */
	mapSearch(country, geo) {
		let deferred = Q.defer();

		let qry = 'Address.geolocation_p100_0_coordinate:[* TO *] AND ' +
			      'Address.geolocation_p100_1_coordinate:[* TO *] AND ' +
				  'country_s110:' + country + ' AND '+
				  '{!geofilt sfield=Address.geoLocation_p100 pt=' + geo.location[0] + ',' + geo.location[1] + ' d=50000}';

		let query = this.adsClient.createQuery()
			.q(qry)
			.fl(querystring.escape('id, pictures_s010'))
			.rows(10)
			.facet({
				pivot: {
					fields: ['Address.geolocation_p100_0_coordinate,Address.geolocation_p100_1_coordinate'],
					mincount: 2
				}
			});
			// .sort('geodist() asc');

		this.adsClient.search(query, function(err,obj) {
			if (err) {
				deferred.reject(err);
			} else {
				deferred.resolve(obj);
			}
		});

		return deferred.promise;
	}

}

module.exports = SolrService;

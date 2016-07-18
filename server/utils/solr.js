'use strict';

let Q = require('q');
let config = require('config');
let solr = require('solr-client');

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
	mapSearch() {
		let query = this.adsClient.createQuery()
			.q('Address.geolocation_p100_0_coordinate:[* TO *] AND Address.geolocation_p100_1_coordinate:[* TO *] AND country_s110:ZA')
			.fl('id, pictures_s010')
			.rows(0)
			.sort('geodist() asc')
			.facet({
				pivot : 'Address.geolocation_p100_0_coordinate,Address.geolocation_p100_1_coordinate'
			});

		return Q(this.adsClient.search(query, function(err,obj) {
			if (err) {
				console.log(err);
			} else {
				console.log(obj);
			}
		}));
	}

}

module.exports = new SolrService();

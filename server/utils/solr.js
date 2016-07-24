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
		this.keywordsClient = solr.createClient({
			host: config.get('solr.server.host'),
			port: config.get('solr.server.port'),
			path: config.get('solr.server.path'),
			solrVersion: config.get('solr.server.version'),
			core: 'keywordstats'
		});
	}

	/**
 	 * Search List of Ads for Map from a given lat/long
 	 */
	mapSearch(country, geo) {
		let deferred = Q.defer();

		let qry = 'Address.geolocation_p100_0_coordinate:[* TO *] AND ' +
			      'Address.geolocation_p100_1_coordinate:[* TO *] AND ' +
				  'country_s110:' + country + ' AND '+
				  '{!geofilt sfield=Address.geoLocation_p100 pt=' + geo.location[0] + ',' + geo.location[1] + ' d=15000}';

		let query = this.adsClient.createQuery()
			.q(qry)
			.fl(querystring.escape('id, pictures_s010'))
			.rows(10)
			.facet({
				pivot: {
					fields: ['Address.geolocation_p100_0_coordinate,Address.geolocation_p100_1_coordinate'],
					mincount: 2
				},
				limit: 1000
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

	/**
	 * Search List of keywords for auto complete
	 */
	autoComplete(country, locationId, categoryId, keywords) {
		let deferred = Q.defer();

		let qry = 'keywords_nge:' + keywords +
				  ' AND totalListings_l110:[3 TO *]';

		let query = this.keywordsClient.createQuery()
			.q(qry)
			.fl(querystring.escape('keywords_g110,locationId_l110,categoryId_l110,score'))
			.matchFilter('country_s110', country)
			//.matchFilter('leafLoc_b100', 'true')
			//.matchFilter('leafCat_b100', 'true')
			.rows(10);
		if (typeof categoryId !== 'undefined') {
			query = query.matchFilter('categoryPath_l101', categoryId);
		}
		if (typeof locationId !== 'undefined') {
			query = query.matchFilter('locationPath_l101', locationId);
		}

		this.keywordsClient.search(query, function(err,obj) {
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

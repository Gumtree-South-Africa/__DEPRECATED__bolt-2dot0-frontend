'use strict';
let specHelper = require('../helpers/specHelper');
let boltSupertest = specHelper.boltSupertest;
let cwd = process.cwd();
let solrService = require(`${cwd}/server/utils/solr`);

describe('Search', () => {
	beforeEach(() => {
		specHelper.spyOnService(solrService, 'autoComplete', `${cwd}/test/serverUnit/mockData/external/SolrAutoComplete`);
	});

	it('should return correct format for type ahead search endpoint', (done) => {
		boltSupertest('/api/search/autocomplete', 'vivanuncios.com.mx', 'POST').then((supertest) => {
			supertest
				.set('Cookie', 'b2dot0Version=2.0')
				.expect((res) => {
					expect(res.status).toBe(200);

					// expect a list of auto complete content
					expect(res.body.items instanceof Array).toBeTruthy();

				})
				.end(specHelper.finish(done));
		});
	});
});

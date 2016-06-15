'use strict';

//////////////////////////////////////////////////
//Protractor Test Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp) {
	return function() {
		gulp.task('protractor', function() {
			let protractor = require('gulp-protractor').protractor;
			var stream = gulp.src(['test/integration/**/*.js'])
				.pipe(protractor({
					configFile: 'protractor.conf.js',
					args: ['--param.debug=true',
						   '--params.baseUrl=http://www.vivanuncios.com.mx.localhost:8000']
				}));

			return stream;
		});
	};
};

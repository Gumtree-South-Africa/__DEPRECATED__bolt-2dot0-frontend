'use strict';

//////////////////////////////////////////////////
// javascript Aggragation and Minification Task
//// /////////////////////////////////////////////


var bundles = require(process.cwd() + '/app/config/ruby/jsmin.js');

module.exports = function watch(gulp, plugins) {
	return function(){
		var stream =
		gulp.task('bundlejs', function() {
      es.merge(bundles.map(function (obj) {
        return gulp.src(obj.src)
              .pipe(plugins.concat(obj.bundleName))
              .pipe(plugins.plumber({
								errorHandler: function (error) {
									console.log(error.message);
									this.emit('end');
							}}))
              .pipe(plugins.uglify())
              .pipe(gulp.dest(obj.dest));
      }))

			return stream;
		});
	};
};

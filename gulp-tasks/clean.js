'use strict';

//////////////////////////////////////////////////
//Clean Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
return function(){
	gulp.task('clean', function() {
		return gulp.src('.build', {read: false})
	    	.pipe(clean());
	});
};
};
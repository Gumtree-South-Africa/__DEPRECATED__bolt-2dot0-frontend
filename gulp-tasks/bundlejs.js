'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////
// module.exports = function watch(gulp, plugins) {
//
// var es = require('event-stream');
// var gulp = require('gulp');
//
// var bundles = [
//   {
//     src: 'js/my-component/*.js',
//     bundleName: 'my-component.js'
//   },
//   {
//     src: 'js/my-other-component/*.js',
//     bundleName: 'my-other-component.js'
//   }
// ];
//
// gulp.task('bundlejs', function () {
//   return function(){
//     console.log('hhhh');
//     es.merge(bundles.map(function (obj) {
//     console.log('jjjj');
//     console.log(obj);
//     // return gulp.src(obj.src)
//     //   .pipe(concat(obj.bundleName))
//     //   .pipe(gulp.dest('js/_bundles'));
//   }));
// }});
//
// }


'use strict';

//////////////////////////////////////////////////
//Clean Task
//// /////////////////////////////////////////////

var es = require('event-stream'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var bundles = [
  {
    dest: process.cwd() + '/public/testJ',
    src: [process.cwd() + '/public/js/common/*.js',
          process.cwd() + '/public/js/libraries/jquery-2.0.0.js'
         ],
    bundleName: 'my-component.min.js'
  },
  {
    dest: process.cwd() + '/public/testJ',
    src: process.cwd() + '/public/js/libraries/handlebars/*.js',
    bundleName: 'my-other-component.min.js'
  }
];


module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('bundlejs', function() {
      es.merge(bundles.map(function (obj) {
        return gulp.src(obj.src)
              .pipe(concat(obj.bundleName))
              .pipe(plumber({
								errorHandler: function (error) {
									console.log(error.message);
									this.emit('end');
							}}))
              .pipe(uglify())
              .pipe(gulp.dest(obj.dest));
      }))
			//return gulp.src(['./.build', './public/css', './target'], {read: false})
		    //	.pipe(clean());
		});
	};
};

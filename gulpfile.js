/////////////////////////////////////////////////
// Required tasks
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  del = require('del');
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  jscs = require('gulp-jscs'),
  jshint = require('gulp-jshint'),
  jsonlint = require('gulp-jsonlint'),
  livereload = require('gulp-livereload'),
  handlebars = require('gulp-handlebars'),
  notify = require('gulp-notify'),
  declare = require('gulp-declare'),
  copy = require('gulp-copy'),
  path = require('path'),
  env = require('gulp-env'),
  walkdir = require('walkdir'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync'),
  map = require('map-stream'),
  plugins = require('gulp-load-plugins')(),
  props = require('gulp-props2json'),
  compass = require('gulp-compass'),
  reload = browserSync.reload;


// ////////////////////////////////////////////////
// Get Tasks
// // /////////////////////////////////////////////
function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, concat, uglify, errorlog, rename, sourcemaps, sass, autoprefixer);
}


// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////
function errorlog(err){
  console.error(err.message);
  this.emit('end');
}

// ////////////////////////////////////////////////
// Compass Tasks
// // /////////////////////////////////////////////
gulp.task('compass', function(){
  gulp.src('./public/styles/**/**/*.scss')
      .pipe(compass({
        config_file: process.cwd() + '/config.rb',
        css: 'public/css',
        sass: './public/styles',
        require: ['susy']
      }))
      .pipe(gulp.dest('./public/css'));
})

// ////////////////////////////////////////////////
// Browser-Sync Tasks
// ////////////////////////////////////////////////
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: "./"
        },
        proxy: {
        target: "localhost:8000",
        reqHeaders: function (config) {
            return {
                "host": config.urlObj.host,
                "accept-encoding": "identity",
                "agent":           false
            }
        }
}
        
        // proxy: {
        //   target: "http://www.gumtree.co.za.localhost:8000",
        //   ws: true
        // }
    });
});


// ////////////////////////////////////////////////
// HTML Tasks
// ////////////////////////////////////////////////
gulp.task('browerSyncHbs', function() {
  return gulp.src('app/views/**/*.hbs')
    .pipe(reload({stream:true}));
});



gulp.task('precommit', ['jscs', 'jshint', 'jsonlint']);
//gulp.task('styles', getTask('styles'));
gulp.task('scripts', getTask('scripts'));
gulp.task('hbs', getTask('hbs'));
gulp.task('precompile', getTask('precompile'));
gulp.task('component', getTask('component'));
gulp.task('set-env', getTask('set-env'));
gulp.task('develop', getTask('develop'));
gulp.task('watch', getTask('Watch'));
gulp.task('jsonlint', getTask('jsonlint'));
gulp.task('jshint', getTask('jshint'));
gulp.task('prop2json', getTask('prop2json'));
gulp.task('jscs', getTask('jscs'));
gulp.task('build', ['set-env', 'jscs', 'scripts', 'styles', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json']);
gulp.task('default', ['set-env', 'jscs', 'scripts', 'compass', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json', 'develop', 'watch']);




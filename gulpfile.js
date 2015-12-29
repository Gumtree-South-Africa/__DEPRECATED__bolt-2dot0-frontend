/ ////////////////////////////////////////////////
//
// EDIT CONFIG OBJECT BELOW !!!
// 
// jsFiles => list of javascript files (in order) to concatenate
// buildFilesFoldersRemove => list of files to remove when running final build
// // //////////////////////////////////////////////

var jsFiles = require('./app/config/components_en_ZA.json'),
    jsNeededForPage = {};


//converting to actual path
for (var key in jsFiles){
  for(var i=0; i<jsFiles[key].length; i++){
    jsNeededForPage[key] = [];
    jsNeededForPage[key][i] = './views/components/' + jsFiles[key][i] + '/js/*.js';
  }
}

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
  jshint = require('gulp-jshint'),
  jsonlint = require('gulp-jsonlint'),
  livereload = require('gulp-livereload'),
  handlebars = require('gulp-handlebars'),
  declare = require('gulp-declare'),
  copy = require('gulp-copy'),
  path = require('path'),
  env = require('gulp-env'),
  walkdir = require('walkdir'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync'),
  map = require('map-stream'),
  reload = browserSync.reload;


// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////

function errorlog(err){
  console.error(err.message);
  this.emit('end');
}

//////////////////////////////////////////////////
//Set Environment Tasks
/////////////////////////////////////////////////
gulp.task('set-env', function () {
  env({
    vars: {
    	NODE_CONFIG_DIR: process.cwd() + "/server/config"
    }
  })
});

// ////////////////////////////////////////////////
// Component Tasks : to create components
// Script to create: gulp component -n [name-of-the-component]
// ///////////////////////////////////////////////
var treeDepth = 4,
    componentExist = false,
    err = {
      'message': 'There already is a component with the same name' 
    };
 
gulp.task('component', function() {
  
  var componentName = argv.n;
  
  var emitter = walkdir('./app/views/components', {no_recurse: true}, function(dir, stat, depth){
    var base = path.basename(dir);
    if(componentName.toString() == base){
      console.log(new Error(err.message));
      componentExist = true;
      this.end();
    } 
  });

  emitter.on('end', function(){
    if(!componentExist){
      return gulp.src('./app/views/components/__default/**/*',
        {
           base: './app/views/components/__default'
        })
       .pipe(gulp.dest('./app/views/components/'+ componentName))
    }
  });

});


// ////////////////////////////////////////////////
// Scripts Tasks
// ///////////////////////////////////////////////
gulp.task('scripts', function() {
  for (var key in jsFiles){
    gulp.src(jsNeededForPage[key])
    .pipe(concat('temp.js'))
        .pipe(uglify())
        .on('error', errorlog)  
        .pipe(rename(key + '.min.js'))  // <- HERE
        .pipe(gulp.dest('./.build/js/'))

        .pipe(reload({stream:true}));
  }
});


// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////

gulp.task('styles', function() {
  gulp.src('./public/styles/**/**/*.scss')
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}))
      .on('error', errorlog)
      .pipe(autoprefixer({
              browsers: ['last 3 versions'],
              cascade: false
          })) 
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});


// ////////////////////////////////////////////////
// Hbs (Handlebars) Tasks
// ///////////////////////////////////////////////
gulp.task('hbs', function() {
  gulp.src('./app/views/**/*.hbs')
    .pipe(livereload());
});



// ////////////////////////////////////////////////
// Pre-compilation of Handlebars template Tasks
// // /////////////////////////////////////////////
gulp.task('precompile', function () {
    var pagesArr, idx, pageJson, srcFiles, destFile;
    //TODO: remove this to a config file
    var precompileMap = require('./app/config/precompile');

    pagesArr = precompileMap.files;
    for (idx = 0; idx < pagesArr.length; ++idx) {
      pageJson = pagesArr[idx];
      srcFiles = pageJson.src; // Arr with all the source files
      destFile = pageJson.dest;

      // Read each key/value(array)
      gulp.src(srcFiles, {base : './app/views/templates/precompile/hbs'})
          .pipe(handlebars())
          .pipe(declare({
            namespace: 'Handlebars.templates',
            noRedeclare: true, // Avoid duplicate declarations
          }))
          .pipe(concat(destFile))
          .pipe(gulp.dest('./public/js/precompiled/'));

    }
});



// ////////////////////////////////////////////////
// JS Hint Tasks
// // /////////////////////////////////////////////
gulp.task('jshint', function() {
  var exitOnJshintError = map(function (file, cb) {
    if (!file.jshint.success) {
      console.error('jshint failed');
      process.exit(1);
    }
  });
  return gulp.src(['./app/builder/**/*.js', './app/controllers/**/*.js',
    './app/components/**/*/js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    //.pipe(jshint.reporter('fail'))
    .pipe(exitOnJshintError);
});


// ////////////////////////////////////////////////
// JSON Lint Tasks
// // /////////////////////////////////////////////
gulp.task('jsonlint', function() {
  var exitOnJsonlintError = map(function (file, cb) {
    if (!file.jsonlint.success) {
      console.error('jsonlint failed');
      process.exit(1);
    }
  });
  return gulp.src("./app/config/*.json")
      .pipe(jsonlint())
      .pipe(jsonlint.reporter('fail'))
      .pipe(exitOnJsonlintError);
});


// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', function(){
  gulp.watch('./public/styles/**/**/*.scss', ['styles']);
  gulp.watch('./public/js', ['scripts']);
  gulp.watch('./app/views/**/*.hbs', ['hbs']);
});


gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: './bin/server',
    ext: 'js coffee hbs',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('git-commit', ['jshint', 'jsonlint']);

gulp.task('build', ['set-env', 'scripts', 'styles', 'hbs', 'precompile', 'jshint', 'jsonlint']);

gulp.task('default', ['set-env', 'scripts', 'styles', 'hbs', 'precompile', 'jshint', 'jsonlint', 'develop', 'watch']);





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
  livereload = require('gulp-livereload'),
  handlebars = require('gulp-handlebars'),
  declare = require('gulp-declare'),
  copy = require('gulp-copy'),
  path = require('path'),
  walkdir = require('walkdir');
  argv = require('yargs').argv;
  browserSync = require('browser-sync'),
  reload = browserSync.reload;


// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////

function errorlog(err){
  console.error(err.message);
  this.emit('end');
}


// ////////////////////////////////////////////////
// Component Tasks : to create components
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
// Handlebars (template) Tasks
// // /////////////////////////////////////////////
gulp.task('templates', function () {
    gulp.src(['./app/views/templates/pages/homepage/views/hbs/PreCompile/a.hbs',
              './app/views/templates/pages/homepage/views/hbs/PreCompile/b.hbs'],
              {base : './app/views/templates'})
    // gulp.src('templates/*.hbs')
      .pipe(handlebars())
    //  .pipe(wrap('Handlebars.template(<%= contents %>)'))
      .pipe(declare({
          namespace: 'Handlebars.templates',
          noRedeclare: true, // Avoid duplicate declarations
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('./public/javascripts/precompiled/'));
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

gulp.task('build', ['styles']);

gulp.task('default', ['scripts', 'styles', 'hbs', 'develop', 'watch', 'templates']);





/ ////////////////////////////////////////////////
//
// EDIT CONFIG OBJECT BELOW !!!
// 
// jsFiles => list of javascript files (in order) to concatenate
// buildFilesFoldersRemove => list of files to remove when running final build
// // //////////////////////////////////////////////

var jsFiles = require('./app/config/components_en_ZA.json');
var jsNeededForPage = {};


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
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  del = require('del');
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  sassO = require('gulp-ruby-sass'),
  handlebars = require('gulp-handlebars'),
  declare = require('gulp-declare'),
  env = require('gulp-env');


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
/*
    var precompileMap = {
      'homepage' : ['./app/views/templates/precompile/hbs/common/a.hbs',
                    './app/views/templates/precompile/hbs/common/b.hbs',
                    './app/views/templates/precompile/hbs/common/DateInput.hbs'
                    ]
    };
*/

    var srcPrecompDir = './app/views/templates/precompile/hbs';
    var precompileMap = {
      files : [
        {
            dest : "alaMaula/es_AR/homepage.html.js",
            src : [
              srcPrecompDir + '/common/a.hbs',
              srcPrecompDir + '/common/b.hbs',
              srcPrecompDir + '/common/DateInput.hbs'
            ]
        },

        {
            dest : "Gumtree/en_ZA/homepage.html.js",
            src : [
              srcPrecompDir + '/common/a.hbs',
              srcPrecompDir + '/common/b.hbs',
              srcPrecompDir + '/common/DateInput.hbs'
            ]
        },

        {
            dest : "Vivanuncios/es_MX/homepage.html.js",
            src : [
              srcPrecompDir + '/common/a.hbs',
              srcPrecompDir + '/common/b.hbs',
              srcPrecompDir + '/common/DateInput.hbs'
            ]
        }     

      ]
    };

    var pagesArr, idx, pageJson, srcFiles, destFile;
    
    pagesArr = precompileMap.files;
    for (idx = 0; idx < pagesArr.length; ++idx) {
      pageJson = pagesArr[idx];
      srcFiles = pageJson.src; // Arr with all the source files
      destFile = pageJson.dest;

      // Read each key/value(array)
      gulp.src(srcFiles, {base : './app/views/templates/precompile/hbs'})
          .pipe(handlebars())
          //  .pipe(wrap('Handlebars.template(<%= contents %>)'))
          .pipe(declare({
            namespace: 'Handlebars.templates',
            noRedeclare: true, // Avoid duplicate declarations
          }))
          .pipe(concat(destFile))
          .pipe(gulp.dest('./public/js/precompiled/'));

    }

/*
    for (var pageKey in precompileMap) {
        // Read each key/value(array)
        gulp.src(precompileMap[pageKey], {base : './app/views/templates'})
          .pipe(handlebars())
          //  .pipe(wrap('Handlebars.template(<%= contents %>)'))
          .pipe(declare({
            namespace: 'Handlebars.templates',
            noRedeclare: true, // Avoid duplicate declarations
          }))
          .pipe(concat(pageKey + '.html.js'))
          .pipe(gulp.dest('./public/js/precompiled/'));
    }
*/

  /*
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
      .pipe(gulp.dest('./public/js/precompiled/'));
  */
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

gulp.task('build', ['set-env', 'styles']);

gulp.task('default', ['set-env', 'scripts', 'styles', 'hbs', 'develop', 'watch', 'precompile']);





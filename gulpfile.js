const gulp = require('gulp'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      cleanCSS = require('gulp-clean-css'),
      imagemin = require('gulp-imagemin'),
      babel = require('gulp-babel'),
      browserSync = require('browser-sync').create(),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      lec = require('gulp-line-ending-corrector'),
      php = require('gulp-connect-php');

// var pipeline = require('readable-stream').pipeline; // getting error

// Copy all image files from base dir
gulp.task('copy-favicon', function(done) {
  gulp.src(['./src/*.ico', './src/*.png'])
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
  done();
});

// Copy all the text files from base dir
gulp.task('copy-files', function(done) {
  gulp.src(['/src/*.svg', './src/*.html', './src/**/*.php', './src/site.webmanifest', './src/*.xml'])
    .pipe(lec())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
  done();
});


// Optimize images
gulp.task('imagemin', function(done) {
  gulp.src('src/img/*.*')
    .pipe(imagemin())
    .pipe(lec())
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.stream());
  done();
});

// Copy audio files
gulp.task('copy-sounds', function(done) {
  gulp.src('./src/sounds/*.*')
    .pipe(gulp.dest('./dist/sounds'))
    .pipe(browserSync.stream());
  done();
}); 

// Concat/Minify css
gulp.task('minify-css', function(done) {
  gulp.src('src/css/*.css')
    .pipe(concat('/css/style.css'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(lec())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
  done();
});

// Transpile/Concat/uglify js files
gulp.task('minify-js', function(done) {
  gulp.src('src/js/*.js')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(lec())
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream());
  done();
});



// Browsersync the 
// Watch for changes in the source folders
gulp.task('php-sync-watch', function() {
  php.server({}, function (){
    browserSync.init({
      proxy:"localhost:8010",
      baseDir: "./",
      open:true,
      notify:false
    });
  })

  // Only include the files which are likely to change 
  gulp.watch('src/**/*.html', gulp.parallel('copy-files')).on('change', browserSync.reload);
  gulp.watch('src/**/*.php', gulp.parallel('copy-files')).on('change', browserSync.reload);
  gulp.watch('src/js/*.js', gulp.parallel('minify-js')).on('change', browserSync.reload);
  gulp.watch('src/css/*.css', gulp.parallel('minify-css')).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('copy-files', 'copy-favicon', 'copy-sounds', 'imagemin', 'minify-css', 'minify-js'));
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var modernizr = require('gulp-modernizr');
var uncss = require('gulp-uncss');


gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(uncss({
            html: ['index.html', 'posts/**/*.html', 'http://example.com']
        }))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
  })
});


gulp.task('watch', ['browserSync', 'sass'], function(){
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload); 
  	gulp.watch('app/js/**/*.js', browserSync.reload);

});



gulp.task('useref', function(){
  var assets = useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpIf('*.css', autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        })))
    .pipe(gulpIf('*.css', minifyCSS()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'))
});


gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  	.pipe(cache(imagemin({
      interlaced: true
    })))
  	.pipe(gulp.dest('dist/images'))
});


gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})


gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
})


gulp.task('clean:dist', function(callback){
	del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});


gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
})


gulp.task('build', function (callback) {
  runSequence(
  	// 'clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

// build doesn't run anything else after clean:dist
// add modernizr
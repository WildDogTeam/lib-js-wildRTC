var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
// Static server
gulp.task('browserify', function() {
    gulp.src('src/WildRTC.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: false
        }))
        .pipe(rename("wildrtc.js"))
        .pipe(gulp.dest('./lib/'))
});

gulp.task('build', ['browserify'], function() {
    gulp.src('lib-WildRTC.js')
        .pipe(uglify())
        .pipe(gulp.dest('./lib/'))
})

gulp.task('test', function() {
  connect.server({
    root: './',
    livereload: true,
    https: true,
    fallback:"test.html"
  });
});

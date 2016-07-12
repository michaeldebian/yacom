var gulp = require('gulp');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');

var nib = require('nib');

gulp.task('stylus', () => {
  return gulp.src('src/stylus/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
      compress: true,
      use: nib()
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('stylus-watch', () => {
  gulp.watch('src/stylus/**/*.styl', ['stylus']);
});

gulp.task('default', ['stylus', 'stylus-watch']);

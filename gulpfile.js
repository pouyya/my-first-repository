var gulp = require('gulp');
var concat = require('gulp-concat');
 
gulp.task('scripts', function() {
  return gulp.src('src/data/views/*.txt')
    .pipe(concat('all.txt'))
    .pipe(gulp.dest('src/data/'));
});

gulp.task('default', function() {
    gulp.run('scripts');

    gulp.watch('app/src/**', function(event) {
        gulp.run('scripts');
    })

})
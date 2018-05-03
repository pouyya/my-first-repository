var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function () {
    return gulp.src('src/data/views/**/*.txt')
        .pipe(concat('all.txt'))
        .pipe(gulp.dest('src/data/views/'));
});

gulp.task('default', function () {
    gulp.run('scripts');
})
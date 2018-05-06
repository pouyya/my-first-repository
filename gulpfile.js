var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function () {
    return gulp.src(['src/data/views/**/*.txt', '!src/data/views/all.txt'])
        .pipe(concat('all.txt', {newLine: ','}))
        .pipe(gulp.dest('src/data/views/'));
});

gulp.task('default', function () {
    gulp.run('scripts');
})
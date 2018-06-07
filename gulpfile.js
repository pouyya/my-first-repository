var gulp = require('gulp');
var concat = require('gulp-concat');
var fs = require('fs');
var path = require('path');

var scriptsPath = 'src/data';

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

gulp.task('scripts', function () {
    var folders = getFolders(scriptsPath);
    if (folders.length === 0) return done(); // nothing to do!
 
    var tasks = folders.map(function(folder) {
        return gulp.src(['src/data/'+folder+'/views/**/*.txt', '!src/data/'+folder+'/views/all.txt'])
            .pipe(concat('all.txt', {newLine: ','}))
            .pipe(gulp.dest('src/data/'+folder+'/views/'));
    });
});

gulp.task('default', function () {
    gulp.run('scripts');
})
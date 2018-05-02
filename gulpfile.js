var gulp = require("gulp");  // Instruct Node.js to load gulp
var bump = require('gulp-bump');
var args = require('yargs').argv;

gulp.task('bump', function () {
    /// <summary>
    /// It bumps revisions
    /// Usage:
    /// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
    ///   i.e. from 0.1.1 to 0.1.2
    /// 2. gulp bump --version 1.1.1 : bumps/sets the package.json and bower.json to the 
    ///    specified revision.
    /// 3. gulp bump --type major       : bumps 1.0.0 
    ///    gulp bump --type minor       : bumps 0.1.0
    ///    gulp bump --type patch       : bumps 0.0.2
    ///    gulp bump --type prerelease  : bumps 0.0.1-2
    /// </summary>

    var type = args.type;
    var version = args.version;
    var options = {};
    var msg="";
    if (version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }


    return gulp
        .src(['package.json', 'bower.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('/'));
});


gulp.task('increment-version', function(){
    var fs = require('fs');
      //docString is the file from which you will get your constant string
      var docString = fs.readFileSync('version.js', 'utf8'); //type of docString i an object here.
  
      var versionParts = docString.split('.');
  
      var vArray = {
          vMajor : versionParts[0],
          vMinor : versionParts[1],
          vPatch : versionParts[2]
      };
  
    vArray.vPatch = parseFloat(vArray.vPatch) + 1;
    var periodString = ".";

    var newVersionNumber = vArray.vMajor + periodString +
                           vArray.vMinor+ periodString +
                           vArray.vPatch;

    require('fs').writeFileSync('version.js', newVersionNumber+"'");
    return gulp.src(['version.js'])
        .pipe(gulp.dest('/'));//creates version.js file in the directory
});


gulp.task('version', function(){
    var fs = require('fs');
      //docString is the file from which you will get your constant string
      var docString = fs.readFileSync('version.js', 'utf8'); //type of docString i an object here.
  
      var versionParts = docString.split('.');
  
      var vArray = {
          vMajor : versionParts[0],
          vMinor : versionParts[1],
          vPatch : versionParts[2]
      };
  
      vArray.vPatch = parseFloat(vArray.vPatch);
      var periodString = ".";
      var newVersionNumber = vArray.vMajor + periodString +
                             vArray.vMinor+ periodString +
                             (vArray.vPatch+1);
  
  
  
      require('fs').writeFileSync('version.js', newVersionNumber+"'");
          return gulp.src(['version.js'])
              .pipe(gulp.dest('/'));//creates version.js file in the directory
      });
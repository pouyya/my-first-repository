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
    if (version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }


    return gulp
        .src(['Path to your package.json', 'path to your bower.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('path to your root directory'));
});


gulp.task('increment-version', function(){
    //docString is the file from which you will get your constant string
    var docString = fs.readFileSync('./someFolder/constants.js', 'utf8');

    //The code below gets your semantic v# from docString
    var versionNumPattern=/'someTextPreceedingVNumber', '(.*)'/; //This is just a regEx with a capture group for version number
    var vNumRexEx = new RegExp(versionNumPattern);
    var oldVersionNumber = (vNumRexEx.exec(docString))[1]; //This gets the captured group

    //...Split the version number string into elements so you can bump the one you want
    var versionParts = oldVersionNumber.split('.');
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

    gulp.src(['./someFolder/constants.js'])
        .pipe(replace(/'someTextPreceedingVNumber', '(.*)'/g, newVersionNumber))
        .pipe(gulp.dest('./someFolder/'));
});


gulp.task('version', function(){
    var fs = require('fs');
      //docString is the file from which you will get your constant string
      var docString = fs.readFileSync('app/scripts/version/version.js', 'utf8'); //type of docString i an object here.
  
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
  
  
  
      require('fs').writeFileSync('app/scripts/version/version.js', newVersionNumber);
          return gulp.src(['app/scripts/version/version.js'])
              .pipe(gulp.dest('app/scripts/version/new_version'));//creates version.js file in the directory
      });
var gulp = require("gulp");
var concat = require("gulp-concat");
var fs = require("fs");
var path = require("path");
var through = require('through2');
var inject = require('gulp-inject-string');

var scriptsPath = "src/data/";

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

function clip() {
  return through.obj(function (file, enc, callback) {

    if (!file.isNull() && file.contents.toString().trim().length > 0) {
      this.push(file);
      return callback();
    }

    callback();
  });
};

var business = {
  types: ["barber", "coffee-shop", "health-and-beauty", "other"]
};

gulp.task("build-scripts", function () {

  var argv = require('yargs').argv;

  if (!argv.dest) {
    console.log('Please provide destination folder using --dest');
    return;
  }

  var folders = getFolders(scriptsPath);
  if (folders.length === 0) return;

  if (!fs.existsSync(argv.dest)) {
    fs.mkdir(argv.dest);
  }

  return folders.map(function (folder) {
    if (folder != 'views') {
      return business.types.map(function (type) {

        if (!fs.existsSync(argv.dest + type)) {
          fs.mkdirSync(argv.dest + type);
        }

        fs.writeFileSync(argv.dest + type + "/" + folder + ".json", "");
        return gulp
          .src([
            scriptsPath + folder + "/views/*.json",
            scriptsPath + folder + "/business-data/" + type + "-data.json",
            scriptsPath + folder + "/base-data.json",
          ])
          .pipe(clip())
          .pipe(concat(folder + ".json", { newLine: "," }))
          .pipe(inject.prepend('{\n  \"docs\": [\n  '))
          .pipe(inject.append('\n]\n}'))
          .pipe(gulp.dest(argv.dest + type + "/"))
      });
    }
  });
});

//gulp --dest ../simplepos-web-plugins/simplepos-couchdb-integration/json/
gulp.task("default", ["build-scripts"]);

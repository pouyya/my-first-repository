var gulp = require("gulp");
var concat = require("gulp-concat");
var fs = require("fs");
var path = require("path");
var through = require('through2');

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

    return business.types.map(function (type) {

      if (!fs.existsSync(argv.dest + type)) {
        fs.mkdirSync(argv.dest + type);
      }

      fs.writeFileSync(argv.dest + type + "/" + folder + ".json", "");
      return gulp
        .src([
          scriptsPath + folder + "/business-data/" + type + "-data.json",
          scriptsPath + folder + "/views/*.json",
          scriptsPath + folder + "/base-data.json"
        ])
        .pipe(clip())
        .pipe(concat(folder + ".json", { newLine: "," }))
        .pipe(gulp.dest(argv.dest + type + "/"))
    });
  });
});

gulp.task("default", ["build-scripts"]);

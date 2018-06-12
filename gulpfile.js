var gulp = require("gulp");
var concat = require("gulp-concat");
var fs = require("fs");
var path = require("path");

var scriptsPath = "src/data/";

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

var business = {
  types: ["barber", "coffee-shop", "health-and-beauty", "other"]
};

gulp.task("scripts", function() {
  var folders = getFolders(scriptsPath);
  if (folders.length === 0) return done();

  var tasks = folders.map(function(folder) {
    business.types.map(function(type) {
      return gulp
        .src([
          scriptsPath + folder + "/business-data/" + type + "-data.json",
          scriptsPath + folder + "/views/*.json",
          scriptsPath + folder + "/base-data.json"
        ])
        .pipe(concat(folder + ".json", { newLine: "," }))
        .pipe(gulp.dest("../spos-plugin/simple-idea-couchdb-integration/json/" + type + "/"))
        
    });
  });
});




gulp.task("default", function() {
    gulp.run("scripts");
});

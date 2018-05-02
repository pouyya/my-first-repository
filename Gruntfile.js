module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    version_bump: {
      files: ['package.json']
    }
  });
    grunt.loadNpmTasks('grunt-version-bump');
};
//grunt version_bump

  // grunt version_bump:major // 2.0.0-SNAPSHOT.1
  // grunt version_bump:build // 2.0.0-SNAPSHOT.2
  // grunt version_bump:minor // 2.1.0-SNAPSHOT.1
  // grunt version_bump:build // 2.1.0-SNAPSHOT.2
  // grunt version_bump:patch // 2.1.1-SNAPSHOT.1
  // grunt version_bump:build // 2.1.1-SNAPSHOT.2
  // grunt version_bump:stage // 2.1.0-alpha.1
  // grunt version_bump:build // 2.1.0-alpha.2
  // grunt version_bump:stage // 2.1.0-beta.1
  // grunt version_bump:stage // 2.1.0-RELEASE.1
  // grunt version_bump:major --condition=stage:alpha // 2.1.0-RELEASE.1
  // grunt version_bump:major --condition=minor:1 // 2.2.0-RELEASE.1
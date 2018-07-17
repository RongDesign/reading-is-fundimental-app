module.exports = function(grunt) {
    grunt.initConfig({
    jplapp: {
      options: {
        optimize: true,
        directories: ['src']
      }
    }
  });

  grunt.loadNpmTasks('grunt-jplapp');
};

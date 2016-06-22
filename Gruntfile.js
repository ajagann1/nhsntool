/**
 * Created by Arvind on 6/22/2016.
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compress:{
      main:{
        options:{
          archive: 'archive.zip'        },
        files:[
          {src: ['./**'], dest: './'}
        ]
      }
    }
  });

  // Load the plugin that provides the "compress" task.
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', ['compress']);

};
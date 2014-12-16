module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/app/<%= pkg.name %>.js',
        dest: '/<%= pkg.name %>.min.js'
      }
    },
    gitclone: {
      clone: {
        options: {
          repository: 'https://github.com/LucidWorks/banana',
          branch: 'develop',
          directory: 'banana'
        }
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'banana/src/',
        src: '**',
        dest: 'public/',
        options: {
          process: function(content, srcpath) {
            return content.replace(/http:\/\/localhost:8983\/solr\//g, "\/solr\/");
          },
        },
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['gitclone','copy']);


};
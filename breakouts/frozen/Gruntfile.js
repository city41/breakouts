/*jshint globalstrict:true*/
/*global module:false*/
'use strict';

var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      game: [
        'Gruntfile.js',
        'dojoConfig.js',
        'src/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    clean: {
      dist: ['dist/', 'libs/'],
      deps: ['deps/', 'node_modules/'],
      all: ['<%= clean.dist %>', '<%= clean.deps %>']
    },
    connect: {
      game: {
        options: {
          middleware: function(connect, options) {
            return [lrSnippet, folderMount(connect, options.base)];
          }
        }
      },
      options: {
        hostname: '0.0.0.0',
        port: 8000,
        keepalive: false
      }
    },
    open: {
      game: {
        path: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/'
      }
    },
    regarde: {
      game: {
        files: ['src/**/*.js', 'styles/**/*.css', 'dojoConfig.js', 'index.html'],
        tasks: ['devel']
      }
    },
    dojo: {
      game: {},
      options: {
        dojo: 'deps/dojo/dojo.js',
        profile: 'game.profile.js',
        'package': './',
        dojoConfig: 'dojoConfig.js',
        cwd: './'
      }
    }
  });

  grunt.loadNpmTasks('grunt-dojo');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-livereload');

  // Default task.
  grunt.registerTask('default', ['jshint:game', 'livereload-start', 'connect:game', 'open:game', 'regarde:game']);

  grunt.registerTask('devel', ['jshint:game', 'livereload']);
  grunt.registerTask('build', ['jshint:game', 'dojo:game']);

};

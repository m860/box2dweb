/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
	version:"0.1.0",
    banner: '/*! simulation - v<%=version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> J.MA;' +
      ' Licensed MIT */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/Box2dWeb-2.1.a.3.js','lib/Simulation/Simulation.js','lib/Simulation/effect/Effect.js','lib/Simulation/effect/FadeEffect.js','lib/Simulation/effect/ZoomEffect.js','lib/audiojs/audio.js'],
        dest: 'dist/simulation.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/simulation.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
      copy:{
          main:{
              files:[
                   //lays-photo-2
                  //{expand:false,src:["dist/*"],dest:"lays-photo-2/res/",filter:"isFile"}
              ]
          }
      },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('default', ['jshint',  'concat', 'uglify']);
  
  grunt.registerTask('d', ['concat']);
  
  grunt.registerTask('r', ['uglify']);

};

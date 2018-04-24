"use strict";
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    lesslint:{
      src: ['src/assets/less/*.less','!src/assets/less/custom-bootstrap.less', '!src/assets/less/custom-bootstrap_th.less', '!src/assets/less/custom-paymetric.less', '!src/assets/less/fonts.less', '!src/assets/less/less-space.less']
    },
    jshint: { // configure the task
      // lint your project's client code
      all: ['src/app/page/**/*.js'],
      options: {
          // This will generate the report in HTML format.
          reporter: require('jshint-html-reporter'),
          // This is the extra Object which needs to be set with 'jshint' options.
          reporterOutput: 'out/jshint-report.html',
          //force report
          force: false,
          // JS Validation rules are configured in .jshintrc file.
          jshintrc: '.jshintrc'
      }
    },
    clean: {
      build: {
        src: ['.tmp',"build/*"],
        dot: true
      },
      heroku: {
        src: ['.tmp', 'heroku/*','!heroku/.git'],
        dot: true
      }
    },
    less: {
      dev:{
        files: {
          "build/assets/css/app.css": "src/assets/less/app.less",
          "build/assets/css/app_th.css": "src/assets/less/app_th.less",
          "build/assets/css/custom-paymetric.css": "src/assets/less/custom-paymetric.less",
          // "build/assets/css/custom-bootstrap.css": "src/assets/less/custom-bootstrap.less",
          // "build/assets/css/custom-bootstrap_th.css": "src/assets/less/custom-bootstrap_th.less"
        }
      }
    },

    copy: {
      dev: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'src/assets/js/',
            dest: 'build/assets/js/',
            src: [
              '**/*.js'
            ],
            rename: function(dest, src) {
              return dest + src.replace(/[a-z\-]+\//,'');
            }
          },
          {
            expand: true,
            dot: true,
            cwd: 'src/assets/json',
            dest: 'build/assets/json',
            src: [
              '**/*'
            ]
          },
          // {
          //   expand: true,
          //   dot: true,
          //   cwd: 'src/app/page',
          //   dest: 'build/app/page',
          //   src: [
          //     '*.html'
          //   ]
          // },
          {
            expand: true,
            dot: true,
            cwd: 'src',
            dest: 'build',
            src: [
              'index.html',
              "index-style-guide.js"
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'src/assets/images',
            dest: 'build/assets/images',
            src: [
              '**/*'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'src/assets/fonts',
            dest: 'build/assets/fonts',
            src: [
              '**/*'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'src/app',
            dest: 'build/app',
            src: [
              '**/*'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: '.',
            dest: 'build',
            src: [
              'README.md', 'package.json'
            ]
          }
        ]
      },
      heroku: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'build',
            dest: 'heroku/build',
            src: [
              '**/*'
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'remote',
            dest: 'heroku',
            src: [
              '**/*'
            ]
          }
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'build/assets/css',
          src: ['*.css', '!*.min.css'],
          dest: 'build/assets/css',
          ext: '.min.css'
        }]
      }
    },
    uglify: {
       my_target: {
         files: [
         {
             expand: true,
             cwd: 'src/app/components',
             src: '**/*.js',
             dest: 'build/app/components',
              ext:'.min.js'
         },
         {
             expand: true,
             cwd: 'src/app/page',
             src: '**/*.js',
             dest: 'build/app/page',
             // cwd: 'build/assets/js',
             // src: 'vendor.js',
             // dest: 'build/assets/js/min/',
              ext:'.min.js'
         },
         {
             expand: true,
             cwd: 'src/assets/js',
             src: '**/*.js',
             dest: 'build/assets/js/min',
              ext:'.min.js'
         }
         // ,
         // {
         //     expand: true,
         //     cwd: 'src/',
         //     src: '*.js',
         //     dest: 'build/',
         //      ext:'.min.js'
         // }

        ]
       }
     },

    watch: {
      options: {
        debounceDelay: 250,
        interrupt: true,
        livereload: true
      },
      jshint: {
        files: 'src/**/*.js',
        tasks: ['jshint:all','copy', 'uglify']
      },
      css: {
          files: 'src/**/*.less',
          tasks: ['less:dev','cssmin']
      },
      html:{
        files: 'src/**/*.html',
        tasks: ['copy','livereload']
      },
      livereload: {
        files: [
          'src/**/*.less',
          'src/**/*.js',
          'src/**/*.html',
          'src/**/*.hbs',
          'src/**/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },
    open: {
      server: {
        url: 'http://localhost:9000'
      },
      heroku: {
        url: 'https://chev-order-oil-lub-dev.herokuapp.com'
      }
    },
    prettify: {
      options: {

      },
      // Prettify a directory of files
      all: {
        expand: true,
        cwd: 'build/',
        ext: '.html',
        src: ['**/*.html'],
        dest: 'build/'
      }
    }
  });

  /**
    *  Modules to be used for task
    */

  // clean the directory
  grunt.loadNpmTasks('grunt-contrib-clean');

  //Haml plugin based of coffee
  //grunt.loadNpmTasks('grunt-haml');

  //Less contrib to convert less files to css
  grunt.loadNpmTasks('grunt-contrib-less');

  //Helps in copying Vendor JS to build
  grunt.loadNpmTasks('grunt-contrib-copy');

  //For JS report quality report
  grunt.loadNpmTasks('grunt-contrib-jshint');

  //For JS Errors
  //grunt.loadNpmTasks('grunt-jslint');

  //Helps host code
  grunt.loadNpmTasks('grunt-open');

  //Watch to assist live reload
  grunt.loadNpmTasks('grunt-contrib-watch');

  //For less quality check
  grunt.loadNpmTasks('grunt-lesslint');

  //Formats the HTML output
  grunt.loadNpmTasks('grunt-prettify');

  //Minify CSS in build folder
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  //Minify JS files
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.log.writeln(["NPM Modules loaded"]);

  /**
    *  TASKS
    */

  //Custom Deploy
  grunt.registerTask('deploy-loc', function (target) {
    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);
    app.use(express.static('build'));
    grunt.task.run(['wait', 'open:server']);
    server.listen(9000, "0.0.0.0", function () {
      grunt.log.ok('Express server listening');
    });
  });

  //Wait before deploy
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');
    var done = this.async();
    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

//*Manas removed ''haml task from below
  //Default
  grunt.registerTask('default', ['lesslint', 'jshint:all', 'clean:build', 'prettify', 'less:dev', 'copy:dev','cssmin', 'uglify', 'deploy-loc' ,'watch']);

  //Build
  grunt.registerTask('build', ['default']);

  //Serve
  grunt.registerTask('serve', function (target) {
    grunt.task.run([
       'default'
    ]);
  });


  //
  grunt.registerTask('deploy-heroku', function (target) {
    require('shelljs/global');
    cd('heroku');
    exec('git add -A', {silent:false}).output;
    exec('git commit -m build', {silent:false}).output;
    exec('git push -f heroku master', {silent:false}).output;
    cd('..');
    grunt.task.run(['wait', 'open:heroku']);
  });

//*Manas removed ''haml task from below
  //Heroku
  grunt.registerTask('heroku', function (target) {
    grunt.task.run([
       'lesslint', 'jshint:all', 'clean:build', 'prettify', 'less:dev', 'copy:dev', 'clean:heroku', 'cssmin', 'uglify', 'copy:heroku', 'deploy-heroku'
    ]);
  });

  //Server
  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.log.writeln(["Task Registration completed"]);
};

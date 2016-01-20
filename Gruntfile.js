/**
 * This file is used to build Handsontable Pro from `src/*`
 *
 * Installation:
 * 1. Install Grunt CLI (`npm install -g grunt-cli`)
 * 1. Install Grunt 0.4.0 and other dependencies (`npm install`)
 *
 * Build:
 * Execute `grunt` from root directory of this directory (where Gruntfile.js is)
 * To execute automatically after each change, execute `grunt --force default watch`
 * To execute build followed by the test run, execute `grunt test`
 *
 * Result:
 * building Handsontable Pro will create files:
 *  - dist/handsontable.js
 *  - dist/handsontable.css
 *  - dist/handsontable.full.js
 *  - dist/handsontable.full.css
 *  - dist/handsontable.full.min.js
 *  - dist/handsontable.full.min.css
 */

module.exports = function(grunt) {

  require('time-grunt')(grunt);

  var nodeHandsontablePath = 'node_modules/hot-builder/node_modules/handsontable/';

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,

    meta: {
      src: [
        'src/*.js',
        'src/editors/*.js',
        'src/plugins/**/!(*.spec).js',
        'src/renderers/*.js',
        'src/validators/*.js',
        'src/3rdparty/**/*.js',
      ]
    },

    jshint: {
      options: {
        jshintrc: true
      },
      handsontablePro: '<%= meta.src %>'
    },

    jscs: {
      handsontablePro: {
        files: {
          src: ['<%= meta.src %>']
        }
      },
      options: {
        config: '.jscsrc',
        esnext: true,
        verbose: true
      }
    },

    watch: {
      options: {
        livereload: true
      },
      files: [
        'src/**/*(*.js|*.css|*.html)'
      ],
      tasks: ['build-dev']
    },

    hotBuilder: {
      handsontablePro: {
        files: {
          'dist': 'package.json'
        }
      },
      handsontableProDev: {
        files: {
          'dist': 'package.json'
        },
        options: {
          devMode: true
        }
      },
      handsontableProCustom: {
        files: {
          dist: 'package.json'
        },
        options: {
          disableUI: false
        }
      },
      options: {
        minify: true,
        hotBranch: pkg.compatibleHotVersion
      }
    },

    jasmine: {
      options: {
        page: {
          viewportSize: {
            width: 1200,
            height: 1000
          }
        },
      },
      free: {
        src: [
          'dist/handsontable.min.js',
          nodeHandsontablePath + 'demo/js/numeral.de-de.js',
          nodeHandsontablePath + 'demo/js/backbone/lodash.underscore.js',
          nodeHandsontablePath + 'demo/js/backbone/backbone.js',
          nodeHandsontablePath + 'demo/js/backbone/backbone-relational/backbone-relational.js',
          nodeHandsontablePath + 'demo/js/jquery-ui/js/jquery-ui.custom.js',
          nodeHandsontablePath + 'plugins/removeRow/handsontable.removeRow.js'
        ],
        options: {
          specs: [
            nodeHandsontablePath + 'test/jasmine/spec/*Spec.js',
            nodeHandsontablePath + 'test/jasmine/spec/!(mobile)*/*Spec.js',
            nodeHandsontablePath + 'src/plugins/*/test/*.spec.js',
            nodeHandsontablePath + 'plugins/*/test/*.spec.js',
            nodeHandsontablePath + 'test/jasmine/spec/MemoryLeakTest.js'
          ],
          styles: [
            nodeHandsontablePath + 'test/jasmine/css/SpecRunner.css',
            'dist/handsontable.min.css',
            nodeHandsontablePath + 'plugins/removeRow/handsontable.removeRow.css',
            nodeHandsontablePath + 'demo/js/jquery-ui/css/ui-bootstrap/jquery-ui.custom.css',
            nodeHandsontablePath + 'demo/js/pikaday/css/pikaday.css'
          ],
          vendor: [
            nodeHandsontablePath + 'demo/js/jquery.min.js',
            nodeHandsontablePath + 'lib/numeral/numeral.js',
            nodeHandsontablePath + 'lib/autoResize/autoResize.js',
            nodeHandsontablePath + 'lib/copyPaste/copyPaste.js',
            nodeHandsontablePath + 'lib/SheetClip/SheetClip.js',
            nodeHandsontablePath + 'lib/jsonpatch/json-patch-duplex.js',
            nodeHandsontablePath + 'demo/js/moment/moment.js',
            nodeHandsontablePath + 'demo/js/pikaday/pikaday.js',
            nodeHandsontablePath + 'demo/js/ZeroClipboard.js',
            nodeHandsontablePath + 'test/jasmine/lib/jasmine-extensions.js'
          ],
          helpers: [
            nodeHandsontablePath + 'test/jasmine/spec/SpecHelper.js',
            nodeHandsontablePath + 'test/jasmine/lib/nodeShim.js',
            nodeHandsontablePath + 'test/jasmine/spec/test-init.js'
          ],
          outfile: 'test/jasmine/SpecRunner.html',
          template: 'test/jasmine/templates/SpecRunner.tmpl',
          keepRunner: true
        }
      },
      pro: {
        src: [
          'dist/handsontable.min.js',
          nodeHandsontablePath + 'demo/js/numeral.de-de.js',
          nodeHandsontablePath + 'demo/js/backbone/lodash.underscore.js',
          nodeHandsontablePath + 'demo/js/backbone/backbone.js',
          nodeHandsontablePath + 'demo/js/backbone/backbone-relational/backbone-relational.js',
          nodeHandsontablePath + 'demo/js/jquery-ui/js/jquery-ui.custom.js',
          nodeHandsontablePath + 'plugins/removeRow/handsontable.removeRow.js'
        ],
        options: {
          specs: [
            'src/plugins/*/test/**/*.spec.js',
            'src/3rdparty/walkontable/test/jasmine/spec/**/*.spec.js',
          ],
          styles: [
            nodeHandsontablePath + 'test/jasmine/css/SpecRunner.css',
            'dist/handsontable.min.css',
            nodeHandsontablePath + 'plugins/removeRow/handsontable.removeRow.css',
            nodeHandsontablePath + 'demo/js/jquery-ui/css/ui-bootstrap/jquery-ui.custom.css',
            nodeHandsontablePath + 'demo/js/pikaday/css/pikaday.css'
          ],
          vendor: [
            nodeHandsontablePath + 'demo/js/jquery.min.js',
            nodeHandsontablePath + 'lib/numeral/numeral.js',
            nodeHandsontablePath + 'lib/autoResize/autoResize.js',
            nodeHandsontablePath + 'lib/copyPaste/copyPaste.js',
            nodeHandsontablePath + 'lib/SheetClip/SheetClip.js',
            nodeHandsontablePath + 'lib/jsonpatch/json-patch-duplex.js',
            nodeHandsontablePath + 'demo/js/moment/moment.js',
            nodeHandsontablePath + 'demo/js/pikaday/pikaday.js',
            nodeHandsontablePath + 'demo/js/ZeroClipboard.js',
            nodeHandsontablePath + 'test/jasmine/lib/jasmine-extensions.js'
          ],
          helpers: [
            nodeHandsontablePath + 'test/jasmine/spec/SpecHelper.js',
            nodeHandsontablePath + 'test/jasmine/lib/nodeShim.js',
            nodeHandsontablePath + 'test/jasmine/spec/test-init.js',
            'src/plugins/*/test/helpers/*.js'
          ],
          outfile: 'test/jasmine/SpecRunner.html',
          template: 'test/jasmine/templates/SpecRunner.tmpl',
          keepRunner: true
        }
      }
    },
  });

  // Default task.
  grunt.registerTask('default', ['jscs', 'jshint', 'build']);
  grunt.registerTask('build', ['hotBuilder:handsontablePro']);
  grunt.registerTask('build-dev', ['hotBuilder:handsontableProDev']);
  grunt.registerTask('build-custom', ['hotBuilder:handsontableProCustom']);
  grunt.registerTask('test-free', ['default', 'jasmine:free']);
  grunt.registerTask('test-pro', ['default', 'jasmine:pro']);
  grunt.registerTask('test', ['default', 'jasmine:free', 'jasmine:pro']);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('hot-builder');
  grunt.loadNpmTasks('grunt-jscs');
};

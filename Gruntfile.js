module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //清除文件
        clean: {
            options: {
                force: true
            },
            build: [
                'build/js/*.js', 'build/css/*.css'
            ],
            clearAll: [
                'build/js/*.js', 'build/css/*.css'
            ]
        },

        //拷贝文件到指定目录
        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: 'src/js/',
                    src: '**',
                    dest: 'build/js/',
                    flatten: true,
                    filter: 'isFile'
                }]
            }
        },

        uglify: {
            target: {
                files: {
                    'build/js/bootstrap-datetimepicker.min.js': 'src/js/bootstrap-datetimepicker.js'
                }
            },
            options: {
                mangle: true,
                compress: {
                    dead_code: false, // jshint ignore:line
                    warnings: false
                },
                output: {
                    ascii_only: true // jshint ignore:line
                },
                // beautify: {                    
                //      ascii_only: true 
                // },
                report: 'min',
                preserveComments: false
            }
        },
        jshint: {
            all: [
                'Gruntfile.js', 'src/js/*.js', 'test/*.js'
            ],
            options: {
                'browser': true,
                'node': true,
                'jquery': true,
                'boss': false,
                'curly': true,
                'debug': false,
                'devel': false,
                'eqeqeq': true,
                'bitwise': true,
                'eqnull': true,
                'evil': false,
                'forin': true,
                'immed': false,
                'laxbreak': false,
                'newcap': true,
                'noarg': true,
                'noempty': false,
                'nonew': false,
                'onevar': true,
                'plusplus': false,
                'regexp': false,
                'undef': true,
                'sub': true,
                'strict': true,
                'unused': true,
                'white': true,
                'es3': true,
                'camelcase': true,
                'quotmark': 'single',
                'globals': {
                    'define': false,
                    'moment': false,
                    // Jasmine
                    'jasmine': false,
                    'describe': false,
                    'xdescribe': false,
                    'expect': false,
                    'it': false,
                    'xit': false,
                    'spyOn': false,
                    'beforeEach': false,
                    'afterEach': false
                }
            }
        },
        jscs: {
            all: [
                'Gruntfile.js', 'src/js/*.js', 'test/*.js'
            ],
            options: {
                config: '.jscs.json'
            }
        },
        less: {
            production: {
                options: {
                    cleancss: true,
                    compress: true,
                    paths: 'node_modules'
                },
                files: {
                    'build/css/bootstrap-datetimepicker.min.css': 'src/less/bootstrap-datetimepicker-build.less'
                }
            },
            development: {
                options: {
                    paths: 'node_modules'
                },
                files: {
                    'build/css/bootstrap-datetimepicker.css': 'src/less/bootstrap-datetimepicker-build.less'
                }
            }
        },
        env: {
            paris: {
                TZ: 'Europe/Paris' // sets env for phantomJS https://github.com/ariya/phantomjs/issues/10379#issuecomment-36058589
            }
        },
        connect: {
            server: {
                options: {
                    port: 8099
                }
            }
        },
        jasmine: {
            customTemplate: {
                src: 'src/js/*.js',
                options: {
                    specs: 'test/*Spec.js',
                    helpers: 'test/*Helper.js',
                    host: 'http://127.0.0.1:8099',
                    styles: [
                        'node_modules/bootstrap/dist/css/bootstrap.min.css',
                        'build/css/bootstrap-datetimepicker.min.css'
                    ],
                    vendor: [
                        'node_modules/jquery/dist/jquery.min.js',
                        'node_modules/moment/min/moment-with-locales.min.js',
                        'node_modules/moment-timezone/moment-timezone.js',
                        'node_modules/bootstrap/dist/js/bootstrap.min.js'
                    ],
                    display: 'none',
                    summary: 'true'
                }
            }
        },
        nugetpack: {
            less: {
                src: 'src/nuget/Bootstrap.v3.Datetimepicker.nuspec',
                dest: 'build/nuget',
                options: {
                    version: '<%= pkg.version %>'
                }
            },
            css: {
                src: 'src/nuget/Bootstrap.v3.Datetimepicker.CSS.nuspec',
                dest: 'build/nuget',
                options: {
                    version: '<%= pkg.version %>'
                }
            }
        }
    });

    grunt.loadTasks('tasks');
   
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-nuget');

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('copy', ['copy:js']);

    grunt.registerTask('default', ['clean:build', 'jshint', 'jscs','uglify', 'less',  'env:paris', 'connect', 'jasmine']);
    grunt.registerTask('build:travis', [
        // code style
        'jshint', 'jscs',
        // build
        'uglify', 'less',
        // tests
        'env:paris', 'connect', 'jasmine'
    ]);

    // Task to be run when building
    grunt.registerTask('build', ['clean:build', 'jshint', 'jscs', 'uglify', 'less',  'copy']);

    grunt.registerTask('test', ['jshint', 'jscs', 'uglify', 'less', 'env:paris', 'connect', 'jasmine']);

    grunt.registerTask('docs', 'Generate docs', function () {

        grunt.util.spawn({
            cmd: 'mkdocs',
            args: ['build', '--clean']
        });
        
    });

    grunt.registerTask('release', function (version) {

        if (!version || version.split('.').length !== 3) {
            grunt.fail.fatal('malformed version. Use grunt release:1.2.3');
        }

        grunt.task.run([
            'bump_version:' + version,
            'build:travis',
            'docs'
        ]);
    });
};

/* jshint browser:false, node:true */
/* global KENDO_SRC_DIR */
var META = require("./build/kendo-meta.js");
var PATH = require("path");

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-debug-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadTasks('build/grunt/tasks');

    // support different test sets for public|private repo
    var TESTS = require(grunt.file.expand('./build/grunt/test-paths-*.js')[0]);

    function addSrc(f) {
        return PATH.join(KENDO_SRC_DIR, f);
    }

    var browsers = ['Chrome'];

    var tests = [
        "tests/!(download-builder)/**/*.js"
    ];

    var browserOption = grunt.option('browser');
    var testsOption = grunt.option('tests');
    var jqueryOption = grunt.option('jquery');
    var filesOption = grunt.option('files');

    var jquery = PATH.join(KENDO_SRC_DIR, 'jquery.js');

    if (testsOption) {
        tests = [ testsOption ];
    }

    if (jqueryOption) {
        jquery = "http://code.jquery.com/jquery-" + jqueryOption + ".min.js";
    }

    TESTS.beforeTestFiles.push(jquery);
    TESTS.beforeTestFiles.push('tests/jquery.mockjax.js');
    TESTS.beforeTestFiles.push(PATH.join(KENDO_SRC_DIR, 'angular.js'));
    TESTS.beforeTestFiles.push('tests/angular-route.js');

    if (browserOption) {
        browsers = [ browserOption ];
    }

    var reporters = [ 'progress' ];

    if (grunt.option('junit-results')) {
        reporters.push('junit');
    }

    var pkg = grunt.file.readJSON('package.json');

    // all files (including subfiles like editor/main.js etc.)
    var allKendoFiles = META.loadAll().map(addSrc);

    // files directly in src/
    var mainKendoFiles = META.listKendoFiles().map(addSrc);

    // Project configuration.

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: filesOption ? filesOption.split(",") : pkg.jshintFiles,
            options: pkg.jshintConfig
        },
        karma: {
            options: {
                reportSlowerThan: 500,
                basePath: '',
                frameworks: ['qunit'],
                preprocessors: {
                    'tests/**/.html': [],
                    'tests/**/*-fixture.html': ['html2js']
                },
                reporters: ['progress'],
                colors: true,
                autoWatch: true,
                browsers: browsers,
                customLaunchers: {
                    ChromiumTravis: {
                        base: 'Chrome',
                        flags: ['--no-sandbox']
                    }
                },
                captureTimeout: 60000,
                browserNoActivityTimeout: 30000,
                singleRun: grunt.option('single-run')
            },
            jenkins: {
                options: {
                    reporters: ['dots', 'junit'],

                    junitReporter: {
                      outputDir: '.',
                      outputFile: grunt.option('junit-results')
                    },

                    singleRun: true,

                    browsers: browsers,

                    files: [].concat(
                        TESTS.beforeTestFiles,
                        // TESTS.ciFiles,
                        // Temporary override to track offset() error
                        allKendoFiles,
                        TESTS.afterTestFiles,
                        tests
                    )
                }
            },
            travis: {
                options: {
                    reporters: ['dots'],

                    junitReporter: {
                      outputDir: '.',
                      outputFile: grunt.option('junit-results')
                    },

                    singleRun: true,

                    browsers: [ 'ChromiumTravis' ],

                    files: [].concat(
                        TESTS.beforeTestFiles,
                        TESTS.ciFiles,
                        TESTS.afterTestFiles,
                        tests
                    )
                }
            },
            unit: {
                options: {
                    files: [].concat(
                        TESTS.beforeTestFiles,
                        allKendoFiles,
                        TESTS.afterTestFiles,
                        tests
                    )
                }
            },
            download_builder: {
                options: {
                    reporters: ['dots', 'junit'],
                    browsers: ['Chrome'],
                    singleRun: true,
                    reportSlowerThan: 5000,
                    junitReporter: {
                      outputDir: '.',
                      outputFile: grunt.option('junit-results')
                    },

                    files: [].concat(
                        jquery,
                        "download-builder/scripts/script-resolver.js",
                        { pattern: "dist/js/*.js", included: false, served: true },
                        { pattern: "download-builder/config/kendo-config.json", included: false, served: true },
                        "tests/download-builder/*.js"
                    )
                }
            },
            legacyUnit: {
                options: {
                    browsers: browserOption ? [ browserOption ] : [],

                    files: [].concat(
                        TESTS.beforeTestFiles,
                        allKendoFiles,
                        TESTS.afterTestFiles,
                        tests
                    ).filter(function(x) {
                        return !/(themeuilder|less)\.js|angular/i.test(x);
                    })
                }
            }
        },

        copy: {
            jquery: {
                files: [{
                    expand: true,
                    cwd: KENDO_SRC_DIR,
                    src: [ "jquery.*" ],
                    dest: '<%= kendo.options.jsDestDir %>/'
                }]
            },
            angular: {
                files: [{
                    expand: true,
                    cwd: KENDO_SRC_DIR,
                    src: [ "angular.*" ],
                    dest: '<%= kendo.options.jsDestDir %>/'
                }]
            },
            jszip: {
                files: [{
                    expand: true,
                    cwd: KENDO_SRC_DIR,
                    src: [ "jszip.*" ],
                    dest: '<%= kendo.options.jsDestDir %>/'
                }]
            },
            pako: {
                files: [{
                    expand: true,
                    cwd: KENDO_SRC_DIR,
                    src: [ "pako*.*" ],
                    dest: '<%= kendo.options.jsDestDir %>/'
                }]
            },
            timezones: {
                files: [{
                    expand: true,
                    cwd: KENDO_SRC_DIR,
                    src: "kendo.timezones.js" ,
                    dest: '<%= kendo.options.jsDestDir %>/'
                }]
            }
        },

        kendo: {
            options: {
                destDir: "dist",
                jsDestDir: PATH.join("dist", "js"),
                stylesDestDir: PATH.join("dist", "styles")
            },
            min: {
                src: mainKendoFiles,
                dest: "<%= kendo.options.jsDestDir %>",
                ext: ".min.js"
            },
            full: {
                src: mainKendoFiles,
                dest: "<%= kendo.options.jsDestDir %>",
                ext: ".js"
            },
            cultures: {
                src: [ PATH.join(KENDO_SRC_DIR, "cultures/kendo.culture.*.js"),
                       "!" + KENDO_SRC_DIR + "/cultures/kendo.culture.*.min.js" ],
                dest: "<%= kendo.options.jsDestDir %>/cultures"
            },
            messages: {
                src: [ PATH.join(KENDO_SRC_DIR, "messages/kendo.messages.*.js"),
                       "!" + KENDO_SRC_DIR + "/messages/kendo.messages.*.min.js" ],
                dest: "<%= kendo.options.jsDestDir %>/messages"
            }
        },

        download_builder: {
            min: {
                src: mainKendoFiles,
                ext: ".min.js",
                dest: PATH.join("dist", "download-builder", "content", "js")
            },
            config: {
                src: mainKendoFiles,
                dest: "download-builder/config/kendo-config.json"
            }
        },

        custom: {
            options: {
                destDir: "<%= kendo.options.jsDestDir %>"
            }
        },

        shell: {
            options: {
                stderr: false
            },
            gulpStyles: {
                command: 'node node_modules/gulp/bin/gulp.js styles'
            }
        },

        license: {
            apply: {
                src:  [ "<%= kendo.options.destDir %>/**/*" ],
                filter: function(src) {
                    return PATH.basename(src).match(/^kendo(.+)(js|css|less)$/);
                }
            }
        }

    });

    // Default task(s).
    grunt.registerTask('default', ['karma:unit']);
    grunt.registerTask('tests', [ 'styles', 'karma:unit' ]);
    grunt.registerTask('styles', [ 'shell:gulpStyles' ]);
    grunt.registerTask('all', [ 'kendo', 'download_builder', 'copy:jquery', 'copy:angular', 'copy:jszip', 'copy:pako', 'copy:timezones' ]);
    grunt.registerTask('build', [ 'kendo', 'copy:jquery', 'copy:angular', 'copy:pako', 'styles', 'license' ]);
    grunt.registerTask('download_builder_tests', ['download_builder', 'karma:download_builder']);

    grunt.registerTask('ci', [ "all", 'styles', 'karma:jenkins' ]);
    grunt.registerTask("travis", [ 'jshint', 'build', 'karma:travis' ]);
};

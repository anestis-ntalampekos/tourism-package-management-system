module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        ts: {
            app: {
                tsconfig: true, // grab grunt configuration from tsconfig.json
            }
        },
        tslint: {
            options: {
                configuration: 'tslint.json'
            },
            app: {
                src: ['src/**/*.ts']
            }
        },
        watch: {
            ts: {
                files: ['src/**/*.ts'],
                tasks: ['newer:tslint:app', 'ts:app'],
                options: {
                    spawn: false
                }
            }
        },
        copy: {
            public: {
                files: [
                    {
                        src: ['public/**'],
                        dest: './dist',
                        cwd: './src',
                        expand: true,
                    }
                ]
            }
        },
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-newer');

    grunt.registerTask('default', [
        'tslint:app', // check TS files syntax based on tslint.json
        'ts:app', // compile TS files to JS in /dist
        'copy',
    ]);

};
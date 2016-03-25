'use strict';

var gulp        = require('gulp'),
    $$          = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync').create(),
    exec        = require('child_process').exec,
    path        = require('path');

var name     = 'automat',
    main     = name,
    srcDir   = './src/',
    testDir  = './test/',
    buildDir = './build/';

//  //  //  //  //  //  //  //  //  //  //  //

gulp.task('lint', lint);
gulp.task('test', test);
gulp.task('doc', doc);
gulp.task('enclose', enclose); //gulp.task('browserify', browserify);
gulp.task('serve', browserSyncLaunchServer);

gulp.task('build', function(callback) {
    clearBashScreen();
    runSequence(
        'lint',
        'test',
        //'doc',
        'enclose', //'browserify',
        callback
    );
});

gulp.task('reload', function() {
    browserSync.reload();
});

gulp.task('watch', function () {

    gulp.watch([
        srcDir + '**',
        testDir + '**',
        buildDir + '*'
    ], [
        'build'
    ]);

    gulp.watch([
        buildDir + 'lib/' + name + '.js'
    ], [
        'reload'
    ]);

});

gulp.task('default', ['build', 'watch'], browserSyncLaunchServer);

//  //  //  //  //  //  //  //  //  //  //  //

function lint() {
    return gulp.src([srcDir + '**/*.js', buildDir + '*.js'])
        .pipe($$.excludeGitignore())
        .pipe($$.eslint())
        .pipe($$.eslint.format())
        .pipe($$.eslint.failAfterError());
}

function test() {
    return gulp.src(testDir + 'index.js')
        .pipe($$.mocha({reporter: 'spec'}));
}

function browserSyncLaunchServer() {
    browserSync.init({
        server: {
            // Serve up our build folder
            baseDir: buildDir,
            index: 'demo.html'
        },
        port: 9019
    });
}

function doc(callback) {
    exec(path.resolve('jsdoc.sh'), function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        callback(err);
    });
}

function enclose() {
    return gulp.src(srcDir + 'index.js')
        .pipe($$.replace(
            /^([\s\S]*'use strict';\n)\n*([\s\S]*)module.exports =([\s\S]*)$/m,
            '$1\nwindow.' + main + ' = (function(){\n\n$2return $3\n})();\n'
        ))

        .pipe($$.rename(name + '.js'))
        .pipe(gulp.dest(buildDir + 'lib/'))

        .pipe($$.uglify())
        .pipe($$.rename(name + '.min.js'))
        .pipe(gulp.dest(buildDir + 'lib/'))
}

function clearBashScreen() {
    var ESC = '\x1B';
    console.log(ESC + 'c'); // (VT-100 escape sequence)
}

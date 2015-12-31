var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('start', function () {
    var files = ['server.js', './models/*.js'];
    var options = {
        script: 'server.js',
        delayTime: 1,
        ext: 'js'
//        watch: files
    };
    return nodemon(options)
        .on('restart', function () {
            console.log('Restarting app...');
    });
});
/**
 * Created by paul.watkinson on 06/05/2016.
 */

'use strict';

const path = require('path').posix;

const gulp = require('gulp');

const babel = require('gulp-babel');
const strip = require('gulp-strip-comments');
const uglify = require('gulp-uglify');

const del = require('del');

const DIR_NAME = __dirname.replace(/\\/g, '/');
const SOURCE_ROOT = path.join(DIR_NAME, '/src');
const OUTPUT_ROOT = path.join(DIR_NAME, '/bin');

gulp.task('clean:bin', () => {
    return del([OUTPUT_ROOT + '/**/*'], { 'force': true });
});

gulp.task('compile', ['clean:bin'], () => {
    return gulp.src(path.join(SOURCE_ROOT, 'logger.es6'))
        .on('error', function(error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(babel())
        .pipe(strip())
        .pipe(uglify())
        .pipe(gulp.dest(OUTPUT_ROOT));
});

gulp.task('watch', ['compile'], () => {
    return gulp.watch(['es6', 'js', 'json'].map(id => path.join(SOURCE_ROOT, `**/*.${id}`)), ['compile']);
});

gulp.task('build', ['compile'], () => {});

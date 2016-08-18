/**
 * Created by paul.watkinson on 06/05/2016.
 */

'use strict';

const path = require('path').posix;

const gulp = require('gulp');

const browserify = require('browserify');
const incremental = require('browserify-incremental');
const babelify = require('babelify');

const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const strip = require('gulp-strip-comments');
const uglify = require('gulp-uglify');

const del = require('del');

const DIR_NAME = __dirname.replace(/\\/g, '/');
const SOURCE_ROOT = path.join(DIR_NAME, '/src');
const OUTPUT_ROOT = path.join(DIR_NAME, '/bin');

const BROWSERIFY_CONFIG = Object.assign({
    'entries': [path.join(SOURCE_ROOT, '/logger.es6')],
    'paths': [SOURCE_ROOT],
    'extensions': ['.js', '.json', '.es6'],
    'browserField': false,
    'builtins': false,
    'commondir': false,
    'debug': true,
    'insertGlobalVars': {
        'process': 'undefined',
        'global': 'undefined',
        'Buffer.isBuffer': 'undefined',
        'Buffer': 'undefined'
    }
}, incremental.args);

const BABELIFY_CONFIG = {
    'extensions': ['.es6']
};

gulp.task('clean:bin', () => {
    return del([OUTPUT_ROOT + '/**/*'], { 'force': true });
});

let bundler = null;
gulp.task('bundle', ['clean:bin'], () => {
    if (!bundler) {
        let b = browserify(BROWSERIFY_CONFIG);

        incremental(b, {
            'cacheFile': path.join(DIR_NAME, 'cache.json')
        });

        bundler = b.transform(babelify, BABELIFY_CONFIG);
    }

    return bundler
        .bundle()
        .on('error', function(error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(source('logger.js'))
        .pipe(buffer())
        .pipe(strip())
        .pipe(uglify())
        .pipe(gulp.dest(OUTPUT_ROOT));
});

gulp.task('watch', ['bundle'], () => {
    return gulp.watch(['es6', 'js', 'json'].map(id => path.join(SOURCE_ROOT, `**/*.${id}`)), ['bundle']);
});

gulp.task('build', ['bundle'], () => {});

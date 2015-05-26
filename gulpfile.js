var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    pattern: [
        'gulp-*',
        'gulp.*'
    ],
    replaceString: /^gulp(-|\.)/,
    camelize: true,
    lazy: true,
    rename: {
        'gulp-html-replace': 'htmlReplace',
        'gulp-inline-css': 'inlineCSS',
        'imagemin-optipng': 'imageminOptipng',
        'imagemin-jpegoptim': 'imageminJpegoptim',
        'gulp-inline-source': 'inlineSource'
    }
});

var Src  = '_source';
var Dest = '_build';

/* ********************
 ** TASK: CLEAN
 ** ******************** */
gulp.task('clean', function () {
var del = require('del');
    del(['_build/**/*']);
});


/* ********************
 ** TASK: JS
 ** ******************** */
var jsSrc = '_source/js/**/*.js';
var jsDest = '_build/js';

gulp.task('js', function () {
    gulp.src(jsSrc, {
            read: true
        })
    .pipe($.order([
        'jquery*.js',
        'jquery.*.js',
        'd3*.js',
        'wow*.js',
        'app.js',
        'main.js',
        '**/*.js'
    ]))
    .pipe($.concat('main.js'))
    .pipe(gulp.dest(jsDest))
    .pipe($.rename({
        suffix: '.min'
    }))
    .pipe($.uglify())
    .pipe(gulp.dest(jsDest))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: CSS
 ** ******************** */
var cssSrc = '_source/css/**/*.css';
var cssDest = '_build/css';

gulp.task('css', function () {
    gulp.src(cssSrc, {
            read: true
        })
    .pipe($.autoprefixer('last 2 versions', 'ios 7'))
    .pipe($.concat('main.css'))
    .pipe($.uncss({
        html: [
            'index.html',
            '_source/**/*.html'
        ]
    }))
    .pipe($.shorthand())
    .pipe($.csscomb())
    .pipe(gulp.dest(cssDest))
    .pipe($.rename({
        suffix: '.min'
    }))
    .pipe($.csso())
    .pipe(gulp.dest(cssDest))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: IMAGES
 ** ******************** */

var imgSrc  = '_source/i/**/*';
var imgDest = '_build/i';

gulp.task('jpg', function () {
var jpgSrc = '_source/i/**/*.jpg';
var jpegoptim = require('imagemin-jpegoptim');

    gulp.src(jpgSrc, {
            read: true
        })
    .pipe($.newer(imgDest))
    .pipe($.cache(jpegoptim({
        progressive: true,
        max: 80
    })()))
    .pipe(gulp.dest(imgDest));
});

gulp.task('png', function () {
var pngSrc = '_source/i/**/*.png';
var optipng = require('imagemin-optipng');

    gulp.src(pngSrc, {
            read: true
        })
    .pipe($.newer(imgDest))
    .pipe($.cache(optipng({
        optimizationLevel: 3
    })()))
    .pipe(gulp.dest(imgDest));
});

gulp.task('svg', function () {
var svgSrc = '_source/i/**/*.svg';

    gulp.src(svgSrc, {
            read: true
        })
    .pipe($.newer(imgDest))
    .pipe($.cache($.svgmin()))
    .pipe(gulp.dest(imgDest));
});

gulp.task('img', ['jpg', 'png', 'svg'], function () {
    gulp.src('_source/i/**/*')
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: FONTS
 ** ******************** */
var fontsSrc  = '_source/css/fonts/*';

gulp.task('fonts', function () {
    gulp.src(fontsSrc, {
        read: true
    })
    .pipe(gulp.dest('_build/css/fonts'))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: HTML
 ** ******************** */
var htmlSrc  = '_source/*.html';

gulp.task('html', function () {
    gulp.src(htmlSrc, {
        read: true
    })
    .pipe($.htmlReplace({
        'css': 'css/main.min.css',
        'js': 'js/main.min.js'
    }))
    .pipe($.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: false,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeIgnored: true
    }))
    .pipe(gulp.dest(Dest))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: INLINE
 ** ******************** */
gulp.task('inline', function () {
    gulp.src('_build/*.html', {
        read: true
    })
    .pipe($.inlineCSS())
    .pipe($.rename({
        suffix: '.inline'
    }))
    .pipe(gulp.dest(Dest));
});


/* ********************
 ** TASK: MANIFEST
 ** ******************** */
gulp.task('manifest', function () {
    gulp.src(['_build/**/*'])
    .pipe($.manifest({
        hash: true,
        preferOnline: false,
        network: [
            'http://*',
            'https://*'
        ],
        filename: 'cache.manifest',
        exclude: 'cache.manifest'
    }))
    .pipe(gulp.dest(Dest));
});


/* ********************
 ** TASK: BROWSER-SYNC
 ** ******************** */
var browserSync = require('browser-sync');

gulp.task('browser-sync', function () {
    browserSync({
        server: './_build',
        https: false,
        notify: false,
        browser: [
            'google chrome',
            'safari'
        ],
        files: [
            '_source/js/**/*.js',
            '_source/css/**/*.css',
            '_source/*.html'
        ]
    });
    gulp.watch(jsSrc, ['js']);
    gulp.watch(cssSrc, ['css']);
    gulp.watch(fontsSrc, ['fonts']);
    gulp.watch(imgSrc, ['img']);
    gulp.watch(htmlSrc, ['html']);
});


/* ********************
 ** TASK: DEFAULT
 ** ******************** */
gulp.task('build', ['clean', 'js', 'css', 'fonts', 'img', 'html'], function () {
    gulp.start('manifest');
});

gulp.task('default', ['build'], function () {
    gulp.start('browser-sync');
});

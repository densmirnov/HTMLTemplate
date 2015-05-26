var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
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


/* ********************
 ** TASK: CLEAN
 ** ******************** */
var del = require('del');
gulp.task("clean", function() {
    del(['_build/**/*']);
});


/* ********************
 ** TASK: JS
 ** ******************** */
var jsSrc  = '_source/js/**/*.js';
var jsDest = '_build/js';

gulp.task("js", function() {
    return gulp.src(jsSrc)
        .pipe($.order(["jquery*.js", "jquery.*.js", "d3*.js", "wow*.js", "app.js", "main.js", "**/*.js"]))
        .pipe($.concat("main.js"))
        .pipe(gulp.dest(jsDest))
        .pipe($.rename({
            suffix: ".min"
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
var cssSrc  = '_source/css/**/*.css';
var cssDest = '_build/css';

gulp.task("css", function() {
    gulp.src(cssSrc)
        .pipe($.autoprefixer("last 2 versions", "ios 7"))
        .pipe($.concat("main.css"))
        .pipe($.uncss({
            html: ["index.html", "_source/**/*.html"]
        }))
        .pipe($.csscomb())
        .pipe($.shorthand())
        .pipe(gulp.dest(cssDest))
        .pipe($.rename({
            suffix: ".min"
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
var jpgSrc  = '_source/i/**/*.jpg';
var pngSrc  = '_source/i/**/*.png';
var svgSrc  = '_source/i/**/*.svg';
var imgDest = '_build/i';

var imagemin  = require('imagemin');
var jpegoptim = require('imagemin-jpegoptim');
var optipng   = require('imagemin-optipng');

gulp.task('jpg', function () {
    return gulp.src(jpgSrc)
	    .pipe($.newer(imgDest))
        .pipe($.cache(jpegoptim({ progressive: true, max: 80 })()))
    .pipe(gulp.dest(imgDest));
});

gulp.task('png', function () {
    return gulp.src(pngSrc)
	    .pipe($.newer(imgDest))
        .pipe($.cache(optipng({ optimizationLevel: 3 })()))
    .pipe(gulp.dest(imgDest));
});

gulp.task('svg', function () {
    return gulp.src(svgSrc)
	    .pipe($.newer(imgDest))
        .pipe($.cache($.svgmin()))
    .pipe(gulp.dest(imgDest))
});

gulp.task("img", ["jpg", "png", "svg"], function() {
    gulp.src("_source/i/**/*")
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: FONTS
 ** ******************** */
gulp.task("fonts", function() {
    gulp.src("_source/css/fonts/*")
        .pipe(gulp.dest("_build/css/fonts"))
        .pipe(browserSync.reload({
            stream: true
        }));
});


/* ********************
 ** TASK: HTML
 ** ******************** */
gulp.task("html", function() {
    return gulp.src("_source/index.html")
        .pipe($.htmlReplace({
            "css": "css/main.min.css",
            "js": "js/main.min.js"
        }))
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: false,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeIgnored: true
        }))
        .pipe(gulp.dest("_build"))
        .pipe(browserSync.reload({
            stream: true
        }));
});


/* ********************
 ** TASK: INLINE
 ** ******************** */
gulp.task("inline", function() {
    return gulp.src('_build/*.html')
        .pipe($.inlineCSS())
        .pipe($.rename({
            suffix: ".inline"
        }))
        .pipe(gulp.dest('_build/'));
});


/* ********************
 ** TASK: MANIFEST
 ** ******************** */
gulp.task('manifest', function() {
    gulp.src(['_build/**/*'])
        .pipe($.manifest({
            hash: true,
            preferOnline: false,
            network: ['http://*', 'https://*'],
            filename: 'cache.manifest',
            exclude: 'cache.manifest'
        }))
        .pipe(gulp.dest('_build'));
});


/* ********************
 ** TASK: BROWSER-SYNC
 ** ******************** */
var browserSync = require("browser-sync");
gulp.task("browser-sync", function() {
    browserSync({
        server: "./_build",
        https: false,
        notify: false,
        browser: ["google chrome", "safari"],
        files: ["_source/js/**/*.js", "_source/css/**/*.css", "_source/*.html"]
    });

    gulp.watch("_source/js/**/*.js", ["js"]);
    gulp.watch("_source/css/**/*.css", ["css"]);
    gulp.watch("_source/css/fonts/*", ["fonts"]);
    gulp.watch("_source/i/**/*", ["img"]);
    gulp.watch("_source/*.html", ["html"]);
});


/* ********************
 ** TASK: DEFAULT
 ** ******************** */
gulp.task("build", ["clean"], function() {
    gulp.start("js");
    gulp.start("css");
    gulp.start("fonts");
    gulp.start("img");
    gulp.start("svg");
    gulp.start("html");
});

gulp.task("default", ["build"], function() {
    gulp.start("browser-sync");
});

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /^gulp(-|\.)/,
    camelize: true,
    lazy: true,
    rename: {
        'gulp-html-replace': 'htmlReplace',
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
gulp.task("js", function() {
    return gulp.src("_source/js/**/*.js")
        .pipe($.order(["jquery*.js", "jquery.*.js", "d3*.js", "wow*.js", "app.js", "main.js", "**/*.js"]))
        .pipe($.concat("main.js"))
    .pipe(gulp.dest("_build/js/"))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.uglify())
    .pipe(gulp.dest("_build/js/"))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: CSS
 ** ******************** */
gulp.task("css", function() {
    gulp.src(["_source/css/**/*.css"])
        .pipe($.autoprefixer("last 2 versions", "ios 7"))
        .pipe($.concat("main.css"))
        .pipe($.uncss({
            html: ["index.html", "_source/**/*.html"]
        }))
        .pipe($.csscomb())
        .pipe($.shorthand())
    .pipe(gulp.dest("_build/css/"))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.csso())
    .pipe(gulp.dest("_build/css/"))
    .pipe(browserSync.reload({
        stream: true
    }));
});


/* ********************
 ** TASK: IMAGES
 ** ******************** */
gulp.task("img", function() {
    gulp.src("_source/i/**/*")
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest("_build/i/"));
});


/* ********************
 ** TASK: SVG
 ** ******************** */
gulp.task("svg", function() {
    gulp.src("_source/i/**/*.svg")
        .pipe($.svgmin())
        .pipe(gulp.dest("_build/i/"))
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
    return gulp.src('_build/index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('_inline'));
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
    gulp.watch("_source/i/**/*.svg", ["svg"]);
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
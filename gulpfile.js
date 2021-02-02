"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const newer = require('gulp-newer');

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean vendor
function clean() {
    return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap
    var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
        .pipe(gulp.dest('./dist/vendor/bootstrap'));
    // Font Awesome CSS
    var fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
        .pipe(gulp.dest('./dist/vendor/fontawesome-free/css'));
    // Font Awesome Webfonts
    var fontAwesomeWebfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
        .pipe(gulp.dest('./dist/vendor/fontawesome-free/webfonts'));
    // jQuery Easing
    var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest('./dist/vendor/jquery-easing'));
    // Typed js
    var typedJS = gulp.src('./node_modules/typed.js/lib/typed.min.js')
        .pipe(gulp.dest('./dist/vendor/typed-js'));
    // jQuery
    var jquery = gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./dist/vendor/jquery'));
    // Simple Line Icons
    var simpleLineIconsFonts = gulp.src('./node_modules/simple-line-icons/fonts/**')
        .pipe(gulp.dest('./dist/vendor/simple-line-icons/fonts'));
    var simpleLineIconsCSS = gulp.src('./node_modules/simple-line-icons/css/**')
        .pipe(gulp.dest('./dist/vendor/simple-line-icons/css'));
    return merge(bootstrap, fontAwesomeCSS, fontAwesomeWebfonts, jquery, jqueryEasing, simpleLineIconsFonts, simpleLineIconsCSS, typedJS);
}


// CSS task
function css() {
    return gulp
        .src(['./assets/scss/*.scss', './assets/scss/*.css'])
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest("./dist/css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browsersync.stream());
}

// JS task
function js() {
    return gulp
        .src([
            './assets/js/*.js',
            '!./js/*.min.js'
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browsersync.stream());
}

function images() {
    return gulp.src('./assets/images/**/*')
        .pipe(newer('dist/images/'))
        //.pipe(imagemin())
        .pipe(gulp.dest('dist/images/'))
        .pipe(browsersync.stream());
}


function docs() {
    return gulp.src('./assets/docs/**/*')
        .pipe(newer('dist/docs/'))
        //.pipe(imagemin())
        .pipe(gulp.dest('dist/docs/'))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch("./assets/scss/*", css);
    gulp.watch("./assets/js/*", js);
    gulp.watch("./assets/images/*", images);
    gulp.watch("./assets/docs/*", docs);
    gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, images, docs));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.images = images;
exports.docs = docs;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;

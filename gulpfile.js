// Load Node Modules/Plugins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var connect = require('connect');
var serve = require('serve-static');
var browsersync = require('browser-sync');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var beeper = require('beeper');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');

// Error Handler
function onError(err) {
    beeper();
    console.log('Name:', err.name);
    console.log('Reason:', err.reason);
    console.log('File:', err.file);
    console.log('Line:', err.line);
    console.log('Column:', err.column);
}

// Process Styles
gulp.task('styles', function () {
    return gulp.src('assets/css/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            sourceComments: 'map',
            sourceMap: 'scss',
        }).on('error', sass.logError))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('all.css'))
        .pipe(postcss([
            cssnext(),
            cssnano()
        ]))
        .pipe(gulp.dest('dist'));
});

// Process Scripts
gulp.task('scripts', function () {
    return gulp.src('assets/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('dist/maps'))
        .pipe(gulp.dest('dist'));
});

// Process Images
gulp.task('images', function () {
    return gulp.src('assets/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});

// Server Task
gulp.task('server', () => {
    return connect().use(serve(__dirname))
        .listen(8080)
        .on('listening', function () {
            console.log('Server Running: View at http://localhost:8080');
        });
});

// BrowserSync Task
gulp.task('browsersync', () => {
    return browsersync({
        server: {
            baseDir: './'
        }
    });
});

// Browserify Task
gulp.task('browserify', () => {
    return browserify('./assets/js/app.js')
        .transform('babelify', {
            presets: ['env']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'));
});

// Clean Task
gulp.task('clean', () => {
    return del(['dist']);
});

// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('assets/css/*.scss', gulp.series('clean', 'styles', browsersync.reload));
    gulp.watch('assets/js/*.js', gulp.series('clean', 'scripts', browsersync.reload));
    gulp.watch('assets/images/*', gulp.series('clean', 'images', browsersync.reload));
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'images', 'browsersync', 'watch'));


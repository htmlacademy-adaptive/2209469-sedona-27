import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgstore';
import {deleteAsync} from 'del';
import svgomin from 'gulp-svgmin';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

export const html = () => {
  return gulp.src('source/*.html')
   .pipe(htmlmin({ collapseWhitespace: true }))
   .pipe(gulp.dest('build'))
}

// Scripts

export const scripts = () => {
  return gulp.src('source/js/*.js')
   .pipe(terser())
   .pipe(gulp.dest('build/js'))
}

// Images

export const otimizeImages = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
   .pipe(squoosh())
   .pipe(gulp.dest('build/images'))
}

export const copyImages = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
   .pipe(gulp.dest('build/images'))
}

// WebP
export const createWebP = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
   .pipe(squoosh({webp: {}}))
   .pipe(gulp.dest('build/images'))
}

// SVG

export const svg = () => {
  return gulp.src('source/images/**/{*.svg}')
   .pipe(svgo())
   .pipe(gulp.dest('build/images'))
}

// Copy

export const copy = (done) => {
  gulp.src([
    'source/fonts/*.{wolf2,wolf}',
    'source/**/*.ico',
],   {
    base: 'source'
})
   .pipe(gulp.dest('build'))
  done()
}

// Clean

export const deletedFilePaths = () => {
   return deleteAsync('build')
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

export const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('souce/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build

const build = gulp.series(
  deletedFilePaths,
  copy,
  otimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebP,
  ),
);

// Default

export default gulp.series(
  deletedFilePaths,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebP,
  ),
   gulp.series(
    server,
    watcher
   )
);

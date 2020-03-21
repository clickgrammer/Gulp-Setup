// File structure config
const files = {
  ejs: '**/*.ejs',
  resources: '**/*.*',
};
const main = {
  in: 'src/',
  out: 'dist'
};
const paths = {
  html: {
    in: main.in + 'html/pages/',
    out: main.out,
  },
  resources: {
    in: 'src/resources/',
    out: 'dist/resources/',
  },
};
// Dependencies
const { dest, parallel, src, series, watch } = require('gulp');
const ejs = require('gulp-ejs');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const strip = require('gulp-strip-comments'); // remove comments
// ------------------------------
// Tasks
// ------------------------------
// ------------------------------
// EJS
// ------------------------------
function ejsCompile() {
  return src(paths.html.in + files.ejs)
  .pipe(plumber())
  .pipe(ejs({}).on('error', log))
  .pipe(rename({ extname: '.html' }))
  .pipe(strip()) // removes comments
  .pipe(dest(paths.html.out));
  // TODO: add browsersync stream
}
// ------------------------------
// Resources
// ------------------------------
function resources() {
  return src(paths.resources.in + files.resources)
  .pipe(plumber())
  .pipe(dest(paths.resources.out))
  // TODO: add browsersync stream
}
// ------------------------------
// Tasks exports
// ------------------------------
exports.html = ejsCompile;
exports.resources = resources;
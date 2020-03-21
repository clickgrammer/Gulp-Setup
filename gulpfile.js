// File structure config
const files = {
  ejs: '**/*.ejs',
};
const paths = {
  in: 'src/',
  out: 'dist/',
  html: {
    in: 'src/html/pages/',
    out: 'dist/',
  },
};
// Dependencies
const { dest, parallel, src, series, watch } = require('gulp');
const ejs = require('gulp-ejs');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
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
  .pipe(dest(paths.html.out));
  // TODO: add browsersync stream
}
// ------------------------------
// Tasks exports
// ------------------------------
exports.html = ejsCompile;
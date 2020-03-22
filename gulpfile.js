// File names config
const files = {
  ejs: '**/*.ejs',
  scss: 'style.scss',
  css: 'style.css',
  js: {
    in: 'app.js',
    out: 'app.min.js',
  },
  resources: '**/*.*',
};
// Directory structure config
const main = {
  in: 'src/',
  out: 'dist/'
};
const paths = {
  html: {
    in: main.in + 'html/pages/',
    out: main.out,
  },
  scss: {
    in: main.in + 'scss/',
    out: main.out +'css/',
  },
  js: {
    in: main.in + 'js/',
    out: main.out + 'js/',
  },
  resources: {
    in: main.in + 'resources/',
    out: main.out + 'resources/',
  },
};
// Dependencies
const { dest, parallel, src, series, watch } = require('gulp');
const argv = require('yargs').argv;
const browser = require('browser-sync');
const del = require('del');
const ejs = require('gulp-ejs');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const strip = require('gulp-strip-comments'); // remove comments

// Environment
const isProd = (typeof (argv.env) === 'undefined' || argv.env !== 'development');
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
  .pipe(dest(paths.html.out))
  .pipe(browser.stream());
}
// ------------------------------
// SCSS
// ------------------------------
function scss(cb) {
  cb();
}
// ------------------------------
// JS
// ------------------------------
function js(cb) {
  cb();
}
// ------------------------------
// Resources
// ------------------------------
function resources() {
  return src(paths.resources.in + files.resources)
  .pipe(plumber())
  .pipe(dest(paths.resources.out))
  .pipe(browser.stream());
}
// ------------------------------
// Browser Sync
// ------------------------------
function browserSync(cb) {
  if (!isProd) {
    return browser({
      server: {
        baseDir: main.out,
      },
      port: 3000,
    });
  }
  cb();
}
function browserReload(cb) {
  if (!isProd) {
    browser.reload();
  }
  cb();
}
// ------------------------------
// Watch
// ------------------------------
function watcher(cb) {
  if (!isProd) {
    watch(main.in + 'html', ejsCompile);
    watch(paths.scss.in, scss);
    watch(paths.js.in, series(js, browserReload));
    watch(paths.resources.in, resources);
  }
  cb();
}
// ------------------------------
// Clean
// ------------------------------
function clean() {
  // deletes files from dist but not dir itself
  return del([main.out + '**', '!' + main.in]);
}
// ------------------------------
// Tasks exports
// ------------------------------
exports.clean = clean;
exports.html = ejsCompile;
exports.css = scss;
exports.js = js;
exports.resources = resources;
exports.watch = watcher;
exports.default = series(parallel(ejsCompile, scss, js, resources), parallel(browserSync, watcher));

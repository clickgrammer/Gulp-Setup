// Settings
const autoPrefixerSettings = {
  grid: true,
  overrideBrowserslist: [
    '> 0.5%',
  ],
  remove: false,
};
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
const autoprefixer = require('gulp-autoprefixer');
const argv = require('yargs').argv;
const babel = require('rollup-plugin-babel');
const browser = require('browser-sync');
const commonjs = require('rollup-plugin-commonjs');
const del = require('del');
const ejs = require('gulp-ejs');
const { eslint } = require('rollup-plugin-eslint');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const resolve = require('rollup-plugin-node-resolve');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const strip = require('gulp-strip-comments'); // remove comments
const { terser } = require('rollup-plugin-terser');

// Environment
const IS_PROD = (typeof (argv.env) === 'undefined' || argv.env !== 'development');
// ------------------------------
// Tasks
// ------------------------------
// ------------------------------
// EJS
// ------------------------------
function ejsCompile() {
  return src(paths.html.in + files.ejs)
  .pipe(plumber())
  .pipe(ejs({...argv}).on('error', log))
  .pipe(rename({ extname: '.html' }))
  .pipe(strip()) // removes comments
  .pipe(dest(paths.html.out))
  .pipe(browser.stream());
}
// ------------------------------
// SCSS
// ------------------------------
function scss() {
  if (IS_PROD) {
    src(paths.scss.in + files.scss)
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(autoprefixer(autoPrefixerSettings))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(dest(paths.scss.out))
    .pipe(browser.stream());
  }
  return src(paths.scss.in + files.scss)
  .pipe(sourcemaps.init())
  .pipe(plumber())
  .pipe(sass())
  .pipe(sourcemaps.write('.'))
  .pipe(dest(paths.scss.out))
  .pipe(browser.stream());
}
// ------------------------------
// JavaScript
// ------------------------------
function js() {
  if (IS_PROD) {
    rollup.rollup({
      input: paths.js.in + files.js.in,
      plugins: [
        eslint({
          exclude: 'node_modules/**',
        }),
        commonjs(),
        resolve(),
        babel({
          exclude: 'node_modules/**',
        }),
        terser(),
      ],
    })
    .then((bundle) => bundle.write({
      file: paths.js.out + files.js.out,
      format: 'iife',
    }));
  }
  return rollup.rollup({
    input: paths.js.in + files.js.in,
    plugins: [
      eslint({
        exclude: 'node_modules/**',
      }),
      commonjs(),
      resolve(),
    ],
  })
  .then((bundle) => bundle.write({
    file: paths.js.out + files.js.in,
    format: 'iife',
    sourcemap: true,
  }));
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
  if (!IS_PROD) {
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
  if (!IS_PROD) {
    browser.reload();
  }
  cb();
}
// ------------------------------
// Watch
// ------------------------------
function watcher(cb) {
  if (!IS_PROD) {
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

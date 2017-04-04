"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var svgmin = require('gulp-svgmin');
var svgstore = require("gulp-svgstore");
var rename = require("gulp-rename");
var run = require("run-sequence");
var del = require("del");
var concat = require('gulp-concat');
var uglify = require("gulp-uglify");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("clean", function() {
  return del("build");
});


gulp.task('script', function() {
  return gulp.src('build/js/**.js')
    .pipe(concat('style.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(rename('style.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
      ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task('svgmin', function () {
    return gulp.src("build/img/**/*..svg")
        .pipe(svgmin(function getOptions (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest("build/img"));
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("serve", ['copy','style','script','images', 'svgmin'], function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch("js/*.js", ["style"]);
});


gulp.task("build", function(fn) {
  run("clean", "copy", "style", "script", "images", "svgmin", fn);
});


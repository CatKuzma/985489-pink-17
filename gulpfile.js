"use strict";
// начальная настройка проекта
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
//---------Min CSS-------------------------------
var csso = require("gulp-csso");
var rename = require("gulp-rename");
//----------Оптимизация изображений-----------------
var imagemin = require("gulp-imagemin");
//----------Создаём webp-изображения-----------------
var webp = require("gulp-webp");
//----------Создаём Sprite---------------------------
var svgstore = require("gulp-svgstore");
//----------PostHtml---------------------------------
var posthtml = require("gulp-posthtml");
//----------PostHtml-include---------------------------------
var include = require("posthtml-include");

var del = require("del");
//Задачи для предварительной настройки проекта со сборкой файлов SASS в
// Style.scss и перемещением их в папку CSS/Style.css  сдобавлением
// автопрефиксов и настройка локального сервера для отображения результатов
// и автоматических изменений на сайте
//
//----- Copy to Build ------------
gulp.task("clean", function () {
  return del("buils");
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});


gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    //-----Минифицируем CSS-----------------
    .pipe(csso())
    .pipe(rename("style.min.css"))
    //--------------------------------
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    // .pipe(server.stream());
});

//----- Оптимизация изображений -----
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

//----- Создание Webp-Изображений -----
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

//----- Создание Спрайта -----
gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite2.svg"))
    .pipe(gulp.dest("build/img"));
});

//----- PostHtml -----
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});


gulp.task("server", function () {
  server.init({
    server: "build/"
    // notify: false,
    // open: true,
    // cors: true,
    // ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});


gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html"))
gulp.task("start", gulp.series("build", "server"));

//------------------------------------------------------------------------

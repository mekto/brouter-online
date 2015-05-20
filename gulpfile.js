var gulp = require('gulp');
var gutil = require('gulp-util');
var stylus = require('gulp-stylus');
var autoprefixer = require('autoprefixer-stylus');
var nib = require('nib');
var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename');
var path = require('path');
var app = require('./app');

var config = {
  debug: false,
  livereload: false,
};


gulp.task('js', function(callback) {
  var vendors = path.join(__dirname, 'js/vendors');
  var node_modules = path.join(__dirname, 'node_modules');
  return gulp.src('js/init.js')
    .pipe(webpack({
      output: { filename: 'app.js' },
      externals: { 'leaflet': 'L', 'regular': 'Regular' },
      resolve: {
        alias: {
          // 'regular': path.join(vendors, 'regular.js')
          'superagent': path.join(node_modules, 'superagent')
        }
      },
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader?optional=runtime'] },
          { test: /\.html$/, loaders: ['regular'] }
        ]
      }
    }))
    .pipe(gulp.dest('public/'));
});


gulp.task('css', function() {
  var task = gulp.src('css/app.styl')
    .pipe(stylus({sourcemaps: config.debug, use: [nib(), autoprefixer()]}))
      .on('error', gutil.log)
      .on('error', gutil.beep)
    .pipe(rename('style.css'))
    .pipe(gulp.dest('public/'));

    if (config.livereload)
      task.pipe(livereload());
  return task;
});


gulp.task('express', function() {
  var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
});


gulp.task('engine', function() {
  run('./engine/standalone/server.sh');
});


gulp.task('devserver', ['config:debug', 'config:livereload', 'express', 'engine', 'css', 'js'], function() {
  gulp.watch('css/**/*.styl', ['css']);
  gulp.watch('js/**/*.js', ['js']);
  gulp.watch('js/**/*.html', ['js']);
});


gulp.task('build', ['css', 'js']);


/*
 * Config tasks
 */
gulp.task('config:debug', function() { config.debug = true; });
gulp.task('config:livereload', function() { config.livereload = true; livereload.listen(); });


/*
 * Utils
 */
function run(command, args) {
  var cwd = path.resolve(path.dirname(command));
  var cmd = command;

  if (!args) args = args || [];
  if (command.charAt(0) === '.')
    cmd = path.resolve(command);

  require('child_process').spawn(cmd, args, {cwd: cwd, stdio: 'inherit'});
}

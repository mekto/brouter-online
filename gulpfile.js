var gulp = require('gulp');
var gutil = require('gulp-util');
var stylus = require('gulp-stylus');
var autoprefixer = require('autoprefixer-stylus');
var nib = require('nib');
var livereload = require('gulp-livereload');
var webpack = require('webpack');
var rename = require('gulp-rename');
var path = require('path');
var app = require('./app');

var config = {
  debug: false,
  livereload: false,
};


gulp.task('js', function() {
  var webpackConfig = require('./webpack.config.js');
  var handleOutput = function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]');
    console.log(stats.toString({colors: true, modules: false, chunks: false, chunkModules: false, cached: false, cachedAssets: false}));
  };

  if (config.debug) {
    webpackConfig.devtool = 'inline-source-map';
    webpackConfig.debug = true;
  }

  var compiler = webpack(webpackConfig);
  if (config.debug)
    compiler.watch({aggregateTimeout: 10, poll: false}, handleOutput);
  else
    compiler.run(handleOutput);
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


gulp.task('serve', ['express', 'css', 'js']);


gulp.task('devserver', ['config:debug', 'config:livereload', 'serve', 'engine'], function() {
  gulp.watch('css/**/*.styl', ['css']);
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

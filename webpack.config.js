var path = require('path');
var webpack = require('webpack');


var node_modules = path.join(__dirname, 'node_modules');

var webpackConfig = {
  entry: path.join(__dirname, 'js/init.js'),
  output: { path: path.join(__dirname, 'public'), filename: 'app.js' },
  externals: { 'leaflet': 'L', 'regular': 'Regular' },
  resolve: {
    alias: {
      'superagent': path.join(node_modules, 'superagent')
    }
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader?optional=runtime'] },
      { test: /\.html$/, loaders: ['regular'] },
      { test: /\.brf$/, loaders: ['profile'] },
    ]
  }
};


module.exports = webpackConfig;

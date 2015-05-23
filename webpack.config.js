var path = require('path');
var webpack = require('webpack');


var vendors = path.join(__dirname, 'js/vendors');
var node_modules = path.join(__dirname, 'node_modules');

var webpackConfig = {
  entry: path.join(__dirname, 'js/init.js'),
  output: { path: path.join(__dirname, 'public'), filename: 'app.js' },
  externals: { 'regular': 'Regular' },
  resolve: {
    alias: {
      'leaflet': path.join(vendors, 'leaflet'),
      'superagent': path.join(node_modules, 'superagent'),
    }
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: [/node_modules/, /vendors/], loaders: ['babel-loader?optional=runtime'] },
      { test: /\.html$/, loaders: ['regular'] },
      { test: /\.svg$/, loaders: ['raw'] },
      { test: /\.brf$/, loaders: ['profile'] },
    ]
  }
};


module.exports = webpackConfig;

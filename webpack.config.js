var path = require('path');


var vendors = path.join(__dirname, 'js/vendors');
var node_modules = path.join(__dirname, 'node_modules');

var webpackConfig = {
  entry: path.join(__dirname, 'js/init.js'),
  output: { path: path.join(__dirname, 'public'), filename: 'app.js' },
  externals: { 'react': 'React', 'react-dom': 'ReactDOM', 'google': 'google' },
  resolve: {
    alias: {
      'leaflet': path.join(vendors, 'leaflet'),
      'eventemitter': path.join(node_modules, 'eventemitter3'),
    },
    modulesDirectories: ['web_modules', 'node_modules', 'svg'],
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: [/node_modules/, /vendors/], loaders: ['babel-loader?optional=runtime'] },
      { test: /\.svg$/, loaders: ['raw'] },
      { test: /\.brf$/, loaders: ['raw'] },
      { test: /\.brfc$/, loaders: ['profile'] },
    ]
  }
};


module.exports = webpackConfig;

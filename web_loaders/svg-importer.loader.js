var fs = require('fs'),
    path = require('path');


module.exports = function(str) {
  this.cacheable();

  return str.replace(/<svg import="([^"]+)" ?\/>/g, function(match, filename) {
    var filepath = path.join(path.resolve('svg'), filename);
    return fs.readFileSync(filepath);
  });
};

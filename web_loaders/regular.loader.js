var Regular = require('../js/vendors/regular');


module.exports = function(source) {
  this.cacheable();
  return 'module.exports = ' + JSON.stringify(Regular.parse(source));
};

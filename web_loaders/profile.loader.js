var Regular = require('../js/vendors/regular');


module.exports = function(source) {
  this.cacheable();
  source = source.replace(/\s*#[^\n]*/g, '');  // remove comments
  source = source.replace(/ +$/gm, '');  // remove trailing spaces
  source = source.replace(/\n{2,}/gm, '\n');  // remove empty lines
  this.value = source;
  return 'module.exports = ' + JSON.stringify(source);
};

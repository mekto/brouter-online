var getter = function(obj, method) {
  Object.defineProperty(obj, method.name, { get: method });
};


module.exports = {
  getter: getter
};

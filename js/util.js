
function km(valueInMeters) {
  return +(valueInMeters / 1000).toFixed(1) + ' km';
}


function indexToLetter(index) {
  return String.fromCharCode(65 + index);
}


function calculateDistance(latlngs) {
  var distance = 0, i;
  for (i = 1; i < latlngs.length; ++i) {
    distance += latlngs[i - 1].distanceTo(latlngs[i]);
  }
  return distance;
}


function format(string, params) {
  Object.keys(params).forEach(function(key) {
    string = string.replace('{' + key + '}', params[key]);
  });
  return string;
}


function bindMethods(context, ...methods) {
  methods.forEach((method) => {
    context[method] = context[method].bind(context);
  });
}


function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj === undefined || obj === null) return true;

  // objects with length property
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // numbers are not empty
  if (typeof obj === 'number')
    return false;

  return Object.getOwnPropertyNames(obj).length === 0;
}


function toArray(obj) {
  if (Array.isArray(obj))
    return obj;
  return Object.keys(obj).map(function(key) {
    return [key, obj[key]];
  });
}


function toObject(array) {
  var obj = {};
  array.forEach(function(item) {
    obj[item[0]] = item[1];
  });
  return obj;
}


function indexBy(key, array) {
  return toObject(array.map(function(item) {
    return [item[key], item];
  }));
}


function pick(obj, props) {
  var rv = {};
  props.forEach(function(prop) {
    rv[prop] = obj[prop];
  });
  return rv;
}


function skip(obj, props) {
  const rv = {};
  Object.keys(obj).forEach(key => {
    if (props.indexOf(key) === -1) {
      rv[key] = obj[key];
    }
  });
  return rv;
}


function keyMirror(obj) {
  const rv = {};
  Object.keys(obj).forEach(key => {
    rv[key] = key;
  });
  return rv;
}


export default {
  calculateDistance, format, km, indexToLetter, bindMethods,
  isEmpty, toArray, toObject, indexBy, pick, skip, keyMirror,
};

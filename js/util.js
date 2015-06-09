export function id() {
  return new Date().getTime().toString(36) + Math.floor(Math.random() * 9999).toString(36);
}


export function km(valueInMeters, n=1) {
  return +(valueInMeters / 1000).toFixed(n) + ' km';
}


export function indexToLetter(index) {
  return String.fromCharCode(65 + index);
}


export function format(string, params) {
  Object.keys(params).forEach(function(key) {
    string = string.replace('{' + key + '}', params[key]);
  });
  return string;
}


export function bindMethods(context, ...methods) {
  methods.forEach((method) => {
    context[method] = context[method].bind(context);
  });
}


export function isEmpty(obj) {
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


export function toArray(obj) {
  if (Array.isArray(obj))
    return obj;
  return Object.keys(obj).map(function(key) {
    return [key, obj[key]];
  });
}


export function toObject(array) {
  const obj = {};
  array.forEach(function([key, value]) {
    obj[key] = value;
  });
  return obj;
}


export function indexBy(key, array) {
  return toObject(array.map(function(item) {
    return [item[key], item];
  }));
}


export function pick(obj, props) {
  var rv = {};
  props.forEach(function(prop) {
    rv[prop] = obj[prop];
  });
  return rv;
}


export function skip(obj, props) {
  const rv = {};
  Object.keys(obj).forEach(key => {
    if (props.indexOf(key) === -1) {
      rv[key] = obj[key];
    }
  });
  return rv;
}


export default {
  id, km, indexToLetter, format, bindMethods,
  isEmpty, toArray, toObject, indexBy, pick, skip,
};

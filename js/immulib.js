import React from 'react';


export function findById(id) {
  return this.find(function(element) {
    return element.id === id;
  });
}


export function findIndexById(id) {
  return this.findIndex(function(element) {
    return element.id === id;
  });
}


export function merge(props) {
  return React.addons.update(this, {$merge: props});
}


export function set(index, value) {
  return [
    ...this.slice(0, index),
    value,
    ...this.slice(index + 1)
  ];
}


export function remove(index) {
  return [
    ...this.slice(0, index),
    ...this.slice(index + 1)
  ];
}


export default {
  findById, findIndexById, merge, set, remove,
};

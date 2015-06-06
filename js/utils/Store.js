import EventEmitter from 'eventemitter';


export default class Store extends EventEmitter {
  emitChange() {
    this.emit('change');
  }

  addChangeListener(listener) {
    return this.addListener('change', listener);
  }

  removeChangeListener(listener) {
    return this.removeListener('change', listener);
  }
}

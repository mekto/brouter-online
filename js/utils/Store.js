import EventEmitter from 'eventemitter';


export default class Store extends EventEmitter {
  setState(newState) {
    if (typeof newState === 'function') {
      newState = newState(this.state);
    }
    this.state = Object.assign({}, this.state, newState);
    this.emit('change', this.state);
  }

  getStateAsObject() {
    return this.state;
  }

  forceUpdate() {
    this.emit('change', this.state);
  }

  addChangeListener(listener) {
    return this.addListener('change', listener);
  }

  removeChangeListener(listener) {
    return this.removeListener('change', listener);
  }
}

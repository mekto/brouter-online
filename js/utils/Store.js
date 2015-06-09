import EventEmitter from 'eventemitter';
import {registerListeners} from '../dispatcher';


const CHANGE_EVENT = 'change';


export default class Store extends EventEmitter {
  constructor(listeners) {
    super();

    if (listeners) {
      this.dispatchToken = registerListeners(listeners, this);
    }
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(listener) {
    return this.addListener(CHANGE_EVENT, listener);
  }

  removeChangeListener(listener) {
    return this.removeListener(CHANGE_EVENT, listener);
  }
}

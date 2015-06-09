import EventEmitter from 'eventemitter';
import {registerListeners} from '../dispatcher';


const CHANGE_EVENT = 'change';
const requestAnimationFrame = window.requestAnimationFrame
                                || function(cb) { cb(); };


export default class Store extends EventEmitter {
  constructor(listeners) {
    super();
    this._isPendingChangeEvent = false;
    this.emitChangeImmediately = this.emitChangeImmediately.bind(this);

    if (listeners) {
      this.dispatchToken = registerListeners(listeners, this);
    }
  }

  emitChange() {
    if (this._isPendingChangeEvent)
      return;
    this._isPendingChangeEvent = true;
    requestAnimationFrame(this.emitChangeImmediately);
  }

  emitChangeImmediately() {
    this._isPendingChangeEvent = false;
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(listener) {
    return this.addListener(CHANGE_EVENT, listener);
  }

  removeChangeListener(listener) {
    return this.removeListener(CHANGE_EVENT, listener);
  }
}

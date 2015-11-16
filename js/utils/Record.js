import {merge} from '../immulib';


export default class Record {
  constructor(props) {
    Object.assign(this, props);
  }
  clone() {
    return new this.constructor(this);
  }
  merge(props) {
    return React.addons.update(this, {$merge: props});
  }
}

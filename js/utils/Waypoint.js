/* eslint new-cap: 0 */
import {Record} from 'immutable';


export default class Waypoint extends Record({id: null, address: '', marker: null}) {
  getLatLng() {
    if (this.marker)
      return this.marker.getLatLng();
    return null;
  }
}

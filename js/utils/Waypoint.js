/* eslint new-cap: 0 */
import {Record} from 'immutable';


const WaypointRecord = Record({
  id: null,
  address: '',
  marker: '',
  loading: false,
});


export default class Waypoint extends WaypointRecord {
  getLatLng() {
    if (this.marker)
      return this.marker.getLatLng();
    return null;
  }
}

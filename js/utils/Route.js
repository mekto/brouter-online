/* eslint new-cap: 0 */
import {Record} from 'immutable';


const RouteRecord = Record({id: null, geojson: null, name: null, waypoints: null, profile: null,
                            profileSettings: null, routeIndex: null, layer: null,
                            color: null, locked: false});


export default class Route extends RouteRecord {
  get properties() {
    return this.geojson.features[0].properties;
  }
  get trackLength() {
    return +this.properties['track-length'];
  }
  get coordinates() {
    return this.geojson.features[0].geometry.coordinates;
  }
}

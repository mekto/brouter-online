import Record from './Record';


export default class Route extends Record {
  constructor({id = null, geojson = null, name = null, waypoints = null, profile = null,
               profileSettings = null, routeIndex = null, layer = null,
               color = null, locked = false} = {}) {
    super({
      id, geojson, name, waypoints, profile, profileSettings, routeIndex,
      layer, color, locked
    });
  }
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

import Record from './Record';


export default class Waypoint extends Record {
  constructor({id = null, address = '', marker = '', loading = false} = {}) {
    super({id, address, marker, loading});
  }

  getLatLng() {
    if (this.marker)
      return this.marker.getLatLng();
    return null;
  }
}

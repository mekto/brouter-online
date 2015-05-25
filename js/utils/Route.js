import L from 'leaflet';


class Route {
  constructor(geojson, waypoints) {
    this.waypoints = waypoints.map(function(waypoint) {
      return {
        text: waypoint.text,
        latlng: waypoint.marker.getLatLng(),
      };
    });
    this.geojson = geojson;
    this.layer = null;
  }
  addTo(map) {
    this.layer = L.geoJson(this.geojson);
    this.layer.addTo(map);
    return this;
  }
  destroy() {
    if (this.layer) {
      this.layer._map.removeLayer(this.layer);
    }
    this.layer = null;
  }
  get from() {
    return this.waypoints[0];
  }
  get to() {
    return this.waypoints[this.waypoints.length - 1];
  }
  get vias() {
    var length = this.waypoints.length;
    return this.waypoints.filter((_, index) => {
      return index > 0 && index < length - 1;
    });
  }
  get properties() {
    return this.geojson.features[0].properties;
  }
  get trackLength() {
    return parseInt(this.properties['track-length']);
  }
  get cost() {
    return parseInt(this.properties.cost);
  }
}


export default Route;

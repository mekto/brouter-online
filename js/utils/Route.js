import Leaflet from 'leaflet';


class Route {
  constructor(geojson, waypoints, profile, profileSettings, routeIndex, color) {
    this.waypoints = waypoints.map(function(waypoint) {
      return {
        text: waypoint.text,
        latlng: waypoint.marker.getLatLng(),
      };
    });
    this.geojson = geojson;
    this.profile = profile;
    this.profileSettings = profileSettings;
    this.routeIndex = routeIndex;
    this.color = color;
    this.layer = null;
    this.locked = false;
  }
  addTo(map) {
    this.layer = Leaflet.geoJson(this.geojson, {
      style: () => ({color: this.color})
    });
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
  get coordinates() {
    return this.geojson.features[0].geometry.coordinates;
  }
}


export default Route;

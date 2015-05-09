var L = require('leaflet');


class Route {
  constructor(geojson, waypoints) {
    this.waypoints = waypoints.map(function(waypoint) {
      return {
        text: waypoint.text,
        latlng: waypoint.marker.latlng,
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
}


module.exports = Route;

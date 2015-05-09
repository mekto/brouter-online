class Waypoint {
  constructor(map) {
    this.map = map;
    this.text = '';
    this.marker = null;
  }
  setPosition(pos) {
    if (!this.marker) {
      this.marker = new L.Marker(pos.latlng);
      this.marker.addTo(this.map);
    } else {
      this.marker.setLatLng(pos.latlng);
    }
    this.text = pos.address;
    this.map.setView(pos.latlng, 14);
  }
  clear() {
    this.text = '';
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }
}


module.exports = Waypoint;

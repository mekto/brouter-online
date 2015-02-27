function Waypoint(map) {
  this.map = map;
  this.text = '';
  this.marker = null;
}

Waypoint.prototype = {
  setPosition: function(pos) {
    if (!this.marker) {
      this.marker = new L.Marker(pos.latlng);
      this.marker.addTo(this.map);
    } else {
      this.marker.setLatLng(pos.latlng);
    }
    this.text = pos.address;
    this.map.setView(pos.latlng, 14);
  },

  clear: function() {
    this.text = '';
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }
};


module.exports = Waypoint;

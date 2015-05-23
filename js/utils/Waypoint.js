class Waypoint {
  constructor(map) {
    this.map = map;
    this.text = '';
    this.marker = null;
  }
  setPosition(pos) {
    if (!this.marker) {
      var type = 'start';
      this.marker = new L.Marker(pos.latlng, {
        icon: L.divIcon({
          iconSize: (type === 'via') ? [16, 26] : [20, 31],
          iconAnchor: (type === 'via') ? [8, 26] : [10, 31],
          className: type + '-marker',
          html: require('../../svg/marker.svg')
        }),
      });
      this.marker.addTo(this.map);
    } else {
      this.marker.setLatLng(pos.latlng);
    }
    this.text = pos.address;
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

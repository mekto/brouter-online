import L from 'leaflet';


class Waypoint {
  constructor(map, owner) {
    this.map = map;
    this.owner = owner;
    this.text = '';
    this.marker = null;
  }
  setPosition(pos) {
    if (!this.marker) {
      this.marker = new L.Marker(pos.latlng, {
        icon: this.owner.createWaypointIcon(this),
        draggable: true,
      });
      this.marker.on('dragend', () => {
        this.owner.onWaypointDrag(this);
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


export default Waypoint;

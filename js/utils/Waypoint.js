import L from 'leaflet';
import geocoder from '../geocoder';


class Waypoint {
  constructor(map, owner) {
    this.map = map;
    this.owner = owner;
    this.text = '';
    this.marker = null;
  }
  setPosition(pos, callback) {
    if (!this.marker) {
      this.marker = new L.Marker(pos.latlng, {
        icon: this.owner.createWaypointIcon(this),
        draggable: true,
      });
      this.marker.on('dragend', () => {
        this.owner.onWaypointDrag(this);
      });
      this.marker.on('click', () => {
        this.onClick();
      });
      this.marker.addTo(this.map);
    } else {
      this.marker.setLatLng(pos.latlng);
    }

    this.text = pos.address;
    if (this.text === undefined) {
      this.queryAddress(callback);
    }
    if (callback) callback();
  }
  queryAddress(callback) {
    let latlng = this.marker.getLatLng();
    this.text = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;

    geocoder.reverse(latlng, (result) => {
      if (result)
        this.text = result.formatted;
      if (callback) callback();
    });
  }
  clear() {
    this.text = '';
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }
  onClick() {
    if (this.owner.getWaypointType(this) === 'via')
      this.owner.remove(this);
  }
}


export default Waypoint;

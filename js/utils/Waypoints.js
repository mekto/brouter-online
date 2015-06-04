import L from 'leaflet';
import Waypoint from './Waypoint';


class Waypoints extends Array {
  constructor(...args) {
    super(...args);
    this._map = null;
  }
  add() {
    var waypoint = new Waypoint(this._map, this);
    this.push(waypoint);
    this.updateWaypointMarkers();
    return waypoint;
  }
  insert(index) {
    var waypoint = new Waypoint(this._map, this);
    this.splice(index, 0, waypoint);
    this.updateWaypointMarkers();
    return waypoint;
  }
  remove(waypoint) {
    var idx = this.indexOf(waypoint);
    if (idx !== -1) {
      waypoint.clear();
      this.splice(idx, 1);
    }
    this.updateWaypointMarkers();
    this.fire('remove', { waypoint: waypoint });
  }
  swap(first, second) {
    if (first === undefined) {
      this.unshift(this.pop());
    } else {
      const fromIndex = this.indexOf(first);
      const toIndex = this.indexOf(second);
      this.splice(toIndex, 0, this.splice(fromIndex, 1)[0]);
    }
    this.updateWaypointMarkers();
  }
  get first() {
    return this[0];
  }
  get last() {
    return this[this.length - 1];
  }
  get allHaveMarker() {
    return this.every(waypoint => {
      return waypoint.marker;
    });
  }
  getWithMarkers() {
    return this.filter(waypoint => {
      return waypoint.marker;
    });
  }
  getWaypointType(waypoint) {
    if (waypoint === this.first)
      return 'start';
    else if (waypoint === this.last)
      return 'end';
    return 'via';
  }
  createWaypointIcon(waypoint) {
    var type = this.getWaypointType(waypoint);
    var html = require('../../svg/marker.svg').replace('{A}', String.fromCharCode(65 + this.indexOf(waypoint)));

    var icon = L.divIcon({
      iconSize: (type === 'via') ? [16, 26] : [20, 31],
      iconAnchor: (type === 'via') ? [8, 26] : [10, 31],
      className: type + '-marker',
      html: html,
    });
    return icon;
  }
  updateWaypointMarkers() {
    this.getWithMarkers().forEach((waypoint) => {
      waypoint.marker.setIcon(this.createWaypointIcon(waypoint));
    });
  }
  items() {
    return this.filter(() => { return true; });
  }
  onWaypointDrag(waypoint) {
    this.fire('dragend', { waypoint: waypoint });
  }
}

Object.assign(Waypoints.prototype, L.Evented.prototype);


export default Waypoints;

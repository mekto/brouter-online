import L from 'leaflet';
import Waypoint from './Waypoint';


class Waypoints extends Array {
  constructor(...args) {
    super(...args);
    this.map = null;
  }
  add() {
    var waypoint = new Waypoint(this.map, this);
    this.push(waypoint);
    this.updateWaypointMarkers();
    return waypoint;
  }
  insert(index) {
    var waypoint = new Waypoint(this.map, this);
    this.splice(index, 0, waypoint);
    this.updateWaypointMarkers();
    return waypoint;
  }
  remove(waypoint) {
    var idx = this.indexOf(waypoint);
    console.log(idx);
    if (idx !== -1) {
      waypoint.clear();
      this.splice(idx, 1);
    }
    this.fire('remove', { waypoint: waypoint });
  }
  swap() {
    this.unshift(this.pop());
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
    this.fire('waypointdrag', { waypoint: waypoint });
  }
}

Object.assign(Waypoints.prototype, L.Evented.prototype);


export default Waypoints;

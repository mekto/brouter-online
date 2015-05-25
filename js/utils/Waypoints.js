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
    return waypoint;
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
  items() {
    return this.filter(() => { return true; });
  }
}


export default Waypoints;

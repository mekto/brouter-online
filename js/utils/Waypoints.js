class Waypoints extends Array {
  get first() {
    return this[0];
  }
  get last() {
    return this.length ? this[this.length - 1] : undefined;
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
  items() {
    return this.filter(() => { return true; });
  }
}


module.exports = Waypoints;

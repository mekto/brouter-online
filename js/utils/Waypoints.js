var T = require('./T');


var Waypoints = function() {
  var waypoints = [];
  waypoints.push.apply(waypoints, arguments);

  T.getter(waypoints, function first() {
    return this[0];
  });
  T.getter(waypoints, function last() {
    return this.length ? this[this.length - 1] : undefined;
  });

  T.getter(waypoints, function allHaveMarker() {
    return this.every(function(waypoint) {
      return waypoint.marker;
    });
  });

  waypoints.getWithMarkers = function() {
    return this.filter(function(waypoint) {
      return waypoint.marker;
    });
  };

  return waypoints;
};


module.exports = Waypoints;

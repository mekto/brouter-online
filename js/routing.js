var request = require('superagent');
var config = require('../config');


var routing = {
  route(waypoints, profile, idx, callback) {
    var latlngs = waypoints.map(function(waypoint) {
      return waypoint.marker.getLatLng();
    });
    var lonlats = latlngs.map(function(latlng) {
      return latlng.lng + ',' + latlng.lat;
    });

    var req = request.post(config.brouterHost + '/brouter');
    req.query({
      nogos: '',
      alternativeidx: idx,
      format: 'geojson'
    });
    req._query.push('lonlats=' + lonlats.join('|'));
    req.type('text/plain');
    req.send(profile);

    req.end(response => {
      if (response.ok && response.type === 'application/vnd.geo+json') {
        callback(JSON.parse(response.text));
      } else {
        callback(null);
      }
    });
  }
};


module.exports = routing;

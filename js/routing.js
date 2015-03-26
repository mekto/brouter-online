var request = require('superagent');
var config = require('../config');


var routing = {
  route: function(waypoints, callback) {
    var latlngs = waypoints.map(function(waypoint) {
      return waypoint.marker.getLatLng();
    });
    var lonlats = latlngs.map(function(latlng) {
      return latlng.lng + ',' + latlng.lat;
    });

    var req = request.get(config.brouterHost + '/brouter');
    req.query({
      nogos: '',
      profile: 'trekking',
      alternativeidx: '0',
      format: 'geojson'
    });
    req._query.push('lonlats=' + lonlats.join('|'));

    req.end(function(response) {
      if (response.ok) {
        callback(JSON.parse(response.text));
      } else {
        callback(null);
      }
    });
  }
};


module.exports = routing;

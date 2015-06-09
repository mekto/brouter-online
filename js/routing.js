var request = require('superagent');
var config = require('../config');


var routing = {
  route(latLngs, profile, idx, callback) {
    var lonLats = latLngs.map(function(latLng) {
      return latLng.lng + ',' + latLng.lat;
    });

    var req = request.post(config.brouterHost + '/brouter');
    req.query({
      nogos: '',
      alternativeidx: idx,
      format: 'geojson'
    });
    req._query.push('lonlats=' + lonLats.join('|'));
    req.type('text/plain');
    req.send(profile);

    req.end((err, response) => {
      if (!err && response.ok && response.type === 'application/vnd.geo+json') {
        callback(JSON.parse(response.text));
      } else {
        callback(null);
      }
    });
  }
};


module.exports = routing;

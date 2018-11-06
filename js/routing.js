import 'whatwg-fetch';
var config = require('../config');


export default {
  route(latLngs, profile, idx, callback) {
    var lonLats = latLngs.map(function(latLng) {
      return latLng[1] + ',' + latLng[0];
    });

    const url = new URL(config.brouterHost + '/brouter');
    const params = {
      nogos: '',
      alternativeidx: idx,
      format: 'geojson',
      lonlats: lonLats.join('|'),
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url, { method: 'post', body: profile }).then(
      response => response.json()
    ).then(
      response => callback(null, response)
    ).catch(
      error => callback(error)
    )
  }
};

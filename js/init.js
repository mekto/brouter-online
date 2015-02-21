var request = require('superagent');
var map = require('./map');
var geocoder = require('./geocoder');


request.get('http://freegeoip.net/json/').timeout(1999).end(function(err, res) {
  if (res && res.ok) {
    map.setView([res.body.latitude, res.body.longitude], 7);
    geocoder.countryCode = res.body.country_code;
  } else {
    map.setView([49, 18], 4);
  }
});

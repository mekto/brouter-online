var L = require('leaflet');
var request = require('superagent');

var ZoomControl = require('./controls/ZoomControl');
var LocateControl = require('./controls/LocateControl');
var LayersControl = require('./controls/LayersControl');


var map = L.map('map', {zoomControl: false, attributionControl: false});

new L.mapbox.InfoControl().addInfo('© <a href="http://leafletjs.com">Leaflet</a>').addTo(map);
new ZoomControl().addTo(map);
new LocateControl().addTo(map);
new LayersControl().addTo(map);


request.get('http://freegeoip.net/json/').timeout(999).end(function(err, res) {
  if (res && res.ok) {
    map.setView([res.body.latitude, res.body.longitude], 7);
  } else {
    map.setView([49, 18], 4);
  }
});

var L = require('leaflet');

var ZoomControl = require('./controls/ZoomControl');
var LocateControl = require('./controls/LocateControl');


var map = L.map('map', {zoomControl: false, attributionControl: false});
var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  { attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }
);

layer.addTo(map);
map.setView([49, 18], 4);



new L.mapbox.InfoControl().addInfo('© <a href="http://leafletjs.com">Leaflet</a>').addTo(map);
new ZoomControl().addTo(map);
new LocateControl().addTo(map);

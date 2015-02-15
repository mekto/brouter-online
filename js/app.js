var L = require('leaflet');

var ZoomControl = require('./controls/ZoomControl');


var map = L.map('map', {zoomControl: false});
var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }
);

layer.addTo(map);
map.setView([49, 18], 4);



var zoomControl = new ZoomControl();
zoomControl.addTo(map);

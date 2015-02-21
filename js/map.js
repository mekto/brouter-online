var L = require('leaflet');

var ZoomControl = require('./controls/ZoomControl');
var LocateControl = require('./controls/LocateControl');
var LayersControl = require('./controls/LayersControl');
var ToolboxControl = require('./controls/ToolboxControl');


var map = L.map('map', {zoomControl: false, attributionControl: false});

new L.mapbox.InfoControl().addInfo('© <a href="http://leafletjs.com">Leaflet</a>').addTo(map);
new ZoomControl().addTo(map);
new LocateControl().addTo(map);
new LayersControl().addTo(map);
new ToolboxControl().addTo(map);


module.exports = map;

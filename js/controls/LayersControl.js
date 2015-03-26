var L = require('leaflet');
var Control = require('./Control');
var config = require('../../config');

require('../utils/Google');

L.mapbox.accessToken = config.mapboxAccessToken;


var copyrights = {
  OSM: '© <a href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  MapBox: '© <a href="http://www.mapbox.com" target="_blank">MapBox</a>',
  Thunderforest: '© <a href="http://www.thunderforest.com" target="_blank">Thunderforest</a>',
  Heidelberg: '© <a href="http://openmapsurfer.uni-hd.de/" target="_blank">GIScience Research Group @ University of Heidelberg</a>',
  WaymarkedTrails: '© <a href="http://cycling.waymarkedtrails.org" target="_blank">Waymarked Trails</a>',
  OpenMapLT: '© <a href="http://openmap.lt" target="_blank">OpenMap.lt</a>',
  Google: '© <a href="http://www.google.com" target="_blank">Google</a>',
};


var leafletLayer = function(name, url, attribution) {
  return {
    name: name,
    create: function() {
      return L.tileLayer(url, {attribution: attribution});
    }
  };
};

var mapboxLayer = function(name, url, attribution) {
  return {
    name: name,
    create: function() {
      return L.mapbox.tileLayer(url, {attribution: attribution});
    }
  };
};

var googleLayer = function(name, style, attribution) {
  return {
    name: name,
    create: function(variant) {
      return L.Google.tileLayer(style, {layer: variant, attribution: attribution});
    }
  };
};


var baseLayers = [
  leafletLayer('OpenMapSurfer', 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', copyrights.Heidelberg),
  leafletLayer('OSM Standard', 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', copyrights.OSM),
  leafletLayer('OSM Cycle', 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', copyrights.Thunderforest),
  mapboxLayer('MapBox Street', 'mekto.hj5462ii', copyrights.MapBox),
  mapboxLayer('MapBox Terrain', 'mekto.hgp09m7l', copyrights.MapBox),
  leafletLayer('OSM Transport', 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', copyrights.Thunderforest),
  // mapboxLayer('MapBox Outdoors', 'mekto.l8gcl6k6', copyrights.MapBox),
  googleLayer('Google Road', 'ROADMAP', copyrights.Google),
  googleLayer('Google Terrain', 'TERRAIN', copyrights.Google),
  googleLayer('Google Satellite', 'HYBRID', copyrights.Google),
];

var overlays = [
  leafletLayer('Cycling Routes', 'http://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', copyrights.WaymarkedTrails),
  leafletLayer('Public Transport', 'http://pt.openmap.lt/{z}/{x}/{y}.png', copyrights.OpenMapLT),
  leafletLayer('Hillshade', 'http://korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}', copyrights.Heidelberg),
];


var LayersControl = Control.extend({
  position: 'topright',
  template: require('./templates/layers.html'),
  data: {expanded: false, activeLayer: null, activeOverlays: {}, layers: baseLayers, overlays: overlays},

  toggleMenu: function() {
    this.data.expanded = !this.data.expanded;
  },

  closeMenu: function() {
    this.data.expanded = false;
  },

  setLayer: function(layer) {
    var activeLayer = this.data.activeLayer;
    if (layer === activeLayer)
      return false;

    if (activeLayer) {
      this.map.removeLayer(activeLayer.layer);
      delete activeLayer.layer;
    }
    this.data.activeLayer = activeLayer = layer;
    activeLayer.layer = layer.create();
    this.map.addLayer(activeLayer.layer);

    return false;
  },

  toggleOverlay: function(overlay) {
    var activeOverlays = this.data.activeOverlays;
    var layer = activeOverlays[overlay.name];
    if (!layer) {
      layer = activeOverlays[overlay.name] = overlay.create();
      this.map.addLayer(layer);
      layer.bringToFront();
    } else {
      this.map.removeLayer(layer);
      delete activeOverlays[overlay.name];
    }
    return false;
  },

  addTo: function(map) {
    this.supr(map);
    this.setLayer(this.data.layers[1]);

    this.map.on('click', function() {
      if (this.data.expanded) {
        this.$update('expanded', false);
      }
    }.bind(this));
  }
});


var PrevewMinimap = Control.extend({
  name: 'PreviewMinimap',
  template: require('./templates/preview-minimap.html'),

  init: function() {
    this.map = this.data.map;
    this.minimap = L.map(this.$refs.map, {attributionControl: false, zoomControl: false});
    this.layer = this.data.layer.create();

    this.minimap.addLayer(this.layer);
    this.minimap.dragging.disable();
    this.minimap.touchZoom.disable();
    this.minimap.doubleClickZoom.disable();
    this.minimap.scrollWheelZoom.disable();
    this.map.on('moveend', this.updateView.bind(this));

    setTimeout(function() {
      this.updateView();
    }.bind(this));
  },

  updateView: function() {
    this.minimap.invalidateSize();
    this.minimap.setView(this.map.getCenter(), Math.max(this.map.getZoom() - 1, 4));
  },

  destroy: function() {
    this.map.off('moveend', this.updateView);
    this.minimap.removeLayer(this.layer);
    this.minimap.remove();
  }
});


module.exports = LayersControl;

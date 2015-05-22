var L = require('leaflet');
var Control = require('./Control');
var Waypoints = require('../utils/Waypoints');
var Waypoint = require('../utils/Waypoint');
var Routes = require('../utils/Routes');
var Route = require('../utils/Route');
var T = require('../utils/T');
var geocoder = require('../geocoder');
var routing = require('../routing');
var profiles = require('../profiles');
var filters = require('../components/filters');
var config = require('../../config');

require('../components/TypeAheadMenu');


var ToolboxControl = Control.extend({
  position: 'topleft',
  template: require('./templates/toolbox.html'),
  data: {
    loading: false,
    info: null,
    profiles: profiles,
    profile: profiles[0],
    alternativeidx: 0,
    showProfileDropdown: false,
  },

  config(data) {
    data.waypoints = new Waypoints();
    data.routes = new Routes();
  },

  addTo(map) {
    this.supr(map);

    this.data.waypoints.push(new Waypoint(map));
    this.data.waypoints.push(new Waypoint(map));

    this.$update();
  },

  typeahead(waypoint) {
    return {
      getTypeahead: function() { return this.$refs.typeahead; }.bind(this),
      minlength: 2,

      getItems: function(text, callback) {
        geocoder.autocomplete(text, callback);
      },
      onselect: function(input, autocompleteItem) {
        function callback(result) {
          if (result) {
            waypoint.setPosition(result);
            if (!this.calculateRoute()) {
              this.map.setView(result.latlng, 14);
            }
          } else {
            waypoint.clear();
          }
        }
        if (autocompleteItem) {
          geocoder.resolve(autocompleteItem.place_id, callback.bind(this));
        } else {
          if (input.value) {
            geocoder.query(input.value, callback.bind(this));
          } else {
            waypoint.clear();
          }
        }
      }.bind(this)
    };
  },

  calculateRoute(force) {
    var waypoints = this.data.waypoints.getWithMarkers();
    if (waypoints.length < 2)
      return false;

    this.data.routes.clear();

    var latlngs = waypoints.map(waypoint => waypoint.marker.getLatLng());
    var distance = T.calculateDistance(latlngs);
    if (distance > config.maxBrouterCalculationDistance) {
      this.data.info = T.format('Can\'t calculate distances longer than {km} as the crow flies.',
        {km: filters.km(config.maxBrouterCalculationDistance)}
      );
      this.$update();
      return false;
    }
    if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      this.data.info = T.format('Press <em>Find route</em> button to calculate route.',
        filters.km(config.maxBrouterCalculationDistance)
      );
      this.$update();
      return false;
    }

    var simuline = new L.Polyline(latlngs, {color: '#555', weight: 1, className: 'loading-indicator-line'});
    simuline.addTo(this.map);
    this.map.fitBounds(latlngs, {paddingTopLeft: [this.getToolboxWidth(), 0]});

    routing.route(waypoints, this.data.profile.getSource(), this.data.alternativeidx, (geojson) => {
      if (geojson) {
        var route = new Route(geojson, waypoints).addTo(this.map);
        this.data.routes.push(route);

        this.map.fitBounds(route.layer.getBounds(), {paddingTopLeft: [this.getToolboxWidth(), 0]});
      }
      this.map.removeLayer(simuline);
      this.data.loading = false;
      this.$update();
    });

    this.data.loading = true;
    this.data.info = null;
    this.$update();
    return true;
  },

  setProfile(profile) {
    this.data.profile = profile;
    this.data.showProfileDropdown = false;
    this.calculateRoute();
  },

  setAlternativeIndex(idx) {
    this.data.alternativeidx = idx;
    this.calculateRoute();
  },

  toggleProfileDropdown() {
    this.data.showProfileDropdown = !this.data.showProfileDropdown;
  },

  getToolboxWidth() {
    var rect = this.$refs.el.getBoundingClientRect();
    return rect.width + 5;
  }
});


module.exports = ToolboxControl;

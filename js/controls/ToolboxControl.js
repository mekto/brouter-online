var L = require('leaflet');
var Control = require('./Control');
var Waypoint = require('../utils/Waypoint');
var geocoder = require('../geocoder');

require('../components/TypeAheadMenu');


var ToolboxControl = Control.extend({
  position: 'topleft',
  template: require('./templates/toolbox.html'),

  addTo: function(map) {
    this.supr(map);
    this.data.waypoints = [
      new Waypoint(map),
      new Waypoint(map)
    ];
    this.$update();
  },

  suggest: function(ev) {
    var typeahead = this.$refs.typeahead;

    var address = ev.target.value;
    if (address.length > 2) {
      geocoder.autocomplete(address, function(suggestions) {
        typeahead.setItems(suggestions);
      });
    } else {
      typeahead.clear();
    }
  },

  typeahead: function(waypoint) {
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
  }
});


module.exports = ToolboxControl;

var L = require('leaflet');
var Control = require('./Control');
var geocoder = require('../geocoder');

require('../components/TypeAheadMenu');


var ToolboxControl = Control.extend({
  position: 'topleft',
  template: require('./templates/toolbox.html'),

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

  typeahead: function() {
    return {
      getTypeahead: function() { return this.$refs.typeahead; }.bind(this),
      minlength: 2,

      getItems: function(text, callback) {
        geocoder.autocomplete(text, callback);
      },
      onselect: function(input, autocompleteItem) {
        function callback(result) {
          if (result) {
            this.setMarker(result.latlng);
            input.value = result.address;
          }
        }
        if (autocompleteItem) {
          geocoder.resolve(autocompleteItem.place_id, callback.bind(this));
        } else {
          geocoder.geocode(input.value, callback.bind(this));
        }
      }.bind(this)
    };
  },

  setMarker: function(latlng) {
    if (!this.marker) {
      this.marker = new L.Marker(latlng);
      this.marker.addTo(this.map);
    } else {
      this.marker.setLatLng(latlng);
    }
    this.map.setView(latlng, 14);
  }
});


module.exports = ToolboxControl;

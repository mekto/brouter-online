var Regular = require('regular');


var Control = Regular.extend({
  position: 'topright',

  createControl: function() {
    var self = this;

    var LeafletControl = L.Control.extend({
      options: { position: self.position },

      onAdd: function(map) {
        self.map = map;

        L.DomEvent
          .disableClickPropagation(self.$refs.el)
          .disableScrollPropagation(self.$refs.el);

        return self.$refs.el;
      }
    });
    return new LeafletControl();
  },

  addTo: function(map) {
    return this.createControl().addTo(map);
  }
});


module.exports = Control;

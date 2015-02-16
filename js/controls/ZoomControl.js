var Control = require('./Control');


var ZoomControl = Control.extend({
  template: require('./templates/zoom.html'),
  position: 'bottomright',

  zoomIn: function(e) {
    this.map.zoomIn(e.event.shiftKey ? 3 : 1);
  },

  zoomOut: function(e) {
    this.map.zoomOut(e.event.shiftKey ? 3 : 1);
  },
});


module.exports = ZoomControl;

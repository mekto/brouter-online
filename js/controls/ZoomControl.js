var Control = require('./Control');


var ZoomControl = Control.extend({
  template: require('./templates/zoom.html'),
  position: 'topright',

  zoomIn(e) {
    this.map.zoomIn(e.event.shiftKey ? 3 : 1);
  },

  zoomOut(e) {
    this.map.zoomOut(e.event.shiftKey ? 3 : 1);
  },
});


module.exports = ZoomControl;

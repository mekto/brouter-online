var L = require('leaflet');
var Control = require('./Control');


var LocateControl = Control.extend({
  template: require('./templates/locate.html'),
  data: { locateStatus: 'off' },
  position: 'topright',

  toggleLocate() {
    if (this.data.locateStatus === 'off')
      this.locate();
    else
      this.stopLocating();
  },

  locate() {
    this.map.locate({setView: true, maxZoom: 15});
    this.$update('locateStatus', 'searching');
  },

  stopLocating() {
    this.map.stopLocate();
    this.$update('locateStatus', 'off');

    if (this._locationCircle) {
      this.map.removeLayer(this._locationCircle);
      this.map.removeLayer(this._locationMarker);
      this._locationCircle = null;
      this._locationMarker = null;
    }
  },

  onLocationFound(e) {
    this.$update('locateStatus', 'on');

    if (!this._locationCircle) {
      this._locationCircle = L.circle(e.latlng, e.accuracy, {
        color: '#136aec',
        fillColor: '#136aec',
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.5
      });
      this._locationMarker = L.circleMarker(e.latlng, {
        color: '#136aec',
        fillColor: '#2a93ee',
        fillOpacity: 0.7,
        weight: 2,
        opacity: 0.9,
        radius: 5
      });
      this._locationCircle.addTo(this.map);
      this._locationMarker.addTo(this.map);
    } else {
      this._locationCircle.setLatLng(e.latlng).setRadius(e.accuracy);
      this._locationMarker.setLatLng(e.latlng);
    }
  },

  addTo(map) {
    map.on('locationfound', this.onLocationFound.bind(this));
    map.on('locationerror', this.stopLocating.bind(this));
    return this.supr(map);
  }
});


module.exports = LocateControl;

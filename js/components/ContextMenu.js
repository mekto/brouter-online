import L from 'leaflet';
import Regular from 'regular';


var ContextMenu = Regular.extend({
  template: require('./templates/contextmenu.html'),
  data: { visible: false, latlng: null },

  show(latlng) {
    this.data.visible = true;
    this.data.latlng = latlng;
    this.$update();
  },

  hide() {
    this.data.visible = false;
    this.$update();
  },

  setWaypoint(type) {
    this.$emit('setWaypoint', type, this.data.latlng);
    this.hide();
  },

  centerMap() {
    this._map.panTo(this.data.latlng);
    this.hide();
  },
});


export default L.Layer.extend({

  options: {
    pane: 'popupPane',
  },

  onAdd() {
    if (!this._control) {
      this._initLayout();
    }
    return this;
  },

  open(latlng) {
    this._latlng = L.latLng(latlng);
    if (this._map) {
      this._updatePosition();
    }
    this._control.show(latlng);
    return this;
  },

  close() {
    this._control.hide();
  },

  _updatePosition() {
    if (!this._map) { return; }

    var pos = this._map.latLngToLayerPoint(this._latlng);
    L.DomUtil.setPosition(this._control.$refs.el, pos);
  },

  _initLayout() {
    this._control = new ContextMenu();
    this._control._map = this._map;
    this._control.$inject(this.getPane());
    this._control.$on('setWaypoint', (type, latlng) => {
      this.fire('setWaypoint', { waypointType: type, latlng: latlng });
    });

    L.DomEvent
      .disableClickPropagation(this._control.$refs.el)
      .disableScrollPropagation(this._control.$refs.el)
      .on(this._control.$refs.el, {contextmenu: L.DomEvent.stopPropagation});
  },

});

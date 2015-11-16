import Leaflet from 'leaflet';


export default Leaflet.FeatureGroup.extend({
  initialize(geojson, color) {
    const layers = [
      Leaflet.geoJson(geojson, {
        style: () => ({className: 'route-line-0'})
      }),
      Leaflet.geoJson(geojson, {
        style: () => ({color, className: 'route-line'})
      }),
    ];
    Leaflet.FeatureGroup.prototype.initialize.call(this, layers);
  }
});

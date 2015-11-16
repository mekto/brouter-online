import Leaflet from 'leaflet';


export default Leaflet.FeatureGroup.extend({
  initialize(geojson, color) {
    const layers = [
      Leaflet.geoJson(geojson, {
        style: () => ({color, weight: 5, opacity: 0.85, dashArray: [5, 12]})
      }),
    ];
    Leaflet.FeatureGroup.prototype.initialize.call(this, layers);
  }
});

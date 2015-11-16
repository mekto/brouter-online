import Leaflet from 'leaflet';

const map = new Leaflet.Map('map', {zoomControl: false, attributionControl: false});

map.on('zoomend', function() {
  const container = map._container;
  const zoom = map.getZoom();
  const match = /zoom-\d+/.exec(container.className);
  if (match) {
    container.classList.remove(match[0]);
  }
  container.classList.add(`zoom-${zoom}`);
});

export default map;

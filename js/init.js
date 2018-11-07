import map from './map';
import geocoder from './geocoder';

import ZoomControl from './controls/ZoomControl';
import LocateControl from './controls/LocateControl';
import AttributionControl from './controls/AttributionControl';
import LayersControl from './controls/LayersControl';
import ToolboxControl from './controls/ToolboxControl';
import ContextMenu from './controls/ContextMenu';

import { setLocate } from './actions';

import '../css/app.styl';

new ZoomControl().addTo(map);
new LocateControl().addTo(map);
new AttributionControl().addTo(map);
new LayersControl().addTo(map);
new ToolboxControl().addTo(map);
new ContextMenu().addTo(map);


const DEFAULT_POSITION = [49, 18];
const DEFAULT_ZOOM = 4;
map.setView(DEFAULT_POSITION, DEFAULT_ZOOM);

if ("geolocation" in navigator) {
  map.locate({setView: true, maxZoom: 15});
  setLocate('searching');
}

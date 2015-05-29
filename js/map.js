import Leaflet from 'leaflet';

import ZoomControl from './controls/ZoomControl';
import LocateControl from './controls/LocateControl';
import LayersControl from './controls/LayersControl';
import ToolboxControl from './controls/ToolboxControl';


const map = new Leaflet.Map('map', {zoomControl: false, attributionControl: true});

new ZoomControl().addTo(map);
new LocateControl().addTo(map);
new LayersControl().addTo(map);
new ToolboxControl().addTo(map);


export default map;

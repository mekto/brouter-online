import Leaflet from 'leaflet';
import map from '../map';
import util from '../util';
import RouteLayer from './RouteLayer';
import {indexToLetter} from '../filters';
import {routeColors} from '../constants';
import * as actions from '../actions';


export const FIT_OPTIONS = {paddingTopLeft: [360, 20]};

const waypointMarkers = {};
const routeLayers = {};
let trailer = null;


export function updateMarkers(waypoints) {
  waypoints.forEach((waypoint, index) => {
    const id = waypoint.id;
    let marker = waypointMarkers[id];
    if (waypoint.latLng) {
      const icon = createWaypointIcon(index, getWaypointType(index, waypoints.length));
      if (!marker) {
        marker = waypointMarkers[id] = new Leaflet.Marker(waypoint.latLng, {
          icon,
          draggable: true,
        });
        marker.addTo(map);
      } else {
        marker.setLatLng(waypoint.latLng);
        marker.setIcon(icon);
        marker.off('dragend');
        marker.off('click');
      }
      marker.on('dragend', (e) => actions.moveWaypoint(id, latLngToArray(marker.getLatLng())));
      if (index > 0 && index < waypoints.length - 1) {
        marker.on('click', () => actions.deleteWaypointOnClick(id));
      }
    } else {
      if (marker) {
        removeLayer(marker);
        delete waypointMarkers[id];
      }
    }
  });

  // remove markers of deleted waypoints
  const IDs = waypoints.map(waypoint => waypoint.id);
  Object.keys(waypointMarkers).forEach(id => {
    if (!IDs.includes(id)) {
      removeLayer(waypointMarkers[id]);
      delete waypointMarkers[id];
    }
  });
}

export function createWaypointIcon(index, type) {
  const html = require('../../svg/marker.svg').replace('{A}', indexToLetter(index));
  const icon = Leaflet.divIcon({
    iconSize: (type === 'via') ? [16, 26] : [20, 31],
    iconAnchor: (type === 'via') ? [8, 26] : [10, 31],
    className: type + '-marker',
    html: html,
  });
  return icon;
}

export function getWaypointType(index, count) {
  if (index === 0)
    return 'start';
  else if (index === count - 1)
    return 'end';
  return 'via';
}

export function getLatLngsFromWaypoints(waypoints) {
  return waypoints
    .map(waypoint => waypoint.latLng)
    .filter(latLng => latLng);
}

export function calculateDistance(waypoints) {
  const latLngs = getLatLngsFromWaypoints(waypoints).map(latLng => Leaflet.latLng(latLng));
  let distance = 0, i;
  for (i = 1; i < latLngs.length; ++i) {
    distance += latLngs[i - 1].distanceTo(latLngs[i]);
  }
  return distance;
}

export function getWaypointBounds(waypoints) {
  const latLngs = getLatLngsFromWaypoints(waypoints);
  return Leaflet.latLngBounds(latLngs);
}


export function updateWaypointMarkers(waypoints) {
  waypoints.forEach(waypoint => {
    if (waypoint.marker)
      waypoint.marker.setIcon(createWaypointIcon(waypoint.id));
  });
}

export function latLngToString(latLng) {
  latLng = Leaflet.latLng(latLng);
  return `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
}

export function latLngToArray(latLng) {
  latLng = Leaflet.latLng(latLng);
  return [latLng.lat, latLng.lng];
}

export function getRouteFreeColor(routes) {
  const colors = Object.keys(routeColors);
  const takenColors = routes.map(route => route.color);
  for (let i = 0; colors.length; ++i) {
    if (takenColors.indexOf(colors[i]) === -1)
      return colors[i];
  }
  // if all colors are taken just return the first color
  return Object.keys(routeColors)[0];
}

export function createRouteLayer(id, geojson, color) {
  const layer = routeLayers[id] = new RouteLayer(geojson, routeColors[color]);
  layer.addTo(map);
  return layer;
}

export function deleteRouteLayer(id) {
  removeLayer(routeLayers[id]);
  delete routeLayers[id];
}

export function cleanRouteLayers(routes) {
  const IDs = routes.map(route => route.id);
  Object.keys(routeLayers).forEach(id => {
    if (!IDs.includes(id)) {
      deleteRouteLayer(id);
    }
  });
}

export function getRouteLayer(id) {
  return routeLayers[id];
}

export function removeLayer(layer) {
  if (layer)
    map.removeLayer(layer);
  return null;
}

export function showTrailer(latLngs) {
  trailer = Leaflet.polyline(latLngs, {color: '#555', weight: 1, className: 'trailer-line'});
  trailer.addTo(map);
}

export function hideTrailer() {
  map.removeLayer(trailer);
  trailer = null;
}


export default {
  FIT_OPTIONS,
  updateMarkers, getWaypointType, calculateDistance, getLatLngsFromWaypoints,
  getWaypointBounds, updateWaypointMarkers, latLngToString, latLngToArray,
  getRouteFreeColor, createRouteLayer, deleteRouteLayer, cleanRouteLayers, getRouteLayer,
  removeLayer, showTrailer, hideTrailer,
};

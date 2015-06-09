import Leaflet from 'leaflet';
import store from '../store';
import map from '../map';
import util from '../util';
import {routeColors} from '../constants';
import * as actions from '../actions';


export const FIT_OPTIONS = {paddingTopLeft: [360, 20]};


export function createWaypointMarker(id, latLng) {
  const waypoint = store.waypoints.get(id);
  let marker = waypoint.marker;
  if (!marker) {
    marker = new Leaflet.Marker(latLng, {
      icon: createWaypointIcon(id),
      draggable: true,
    });
    marker.addTo(map);
  } else {
    marker.setLatLng(latLng);
    marker.off('dragend');
    marker.off('click');
  }
  marker.on('dragend', () => actions.onWaypointDrag(id));
  marker.on('click', () => actions.onWaypointClick(id));
  return marker;
}

export function createWaypointIcon(id) {
  const index = store.waypoints.keySeq().indexOf(id);
  const type = getWaypointType(id);
  const html = require('../../svg/marker.svg').replace('{A}', util.indexToLetter(index));

  const icon = Leaflet.divIcon({
    iconSize: (type === 'via') ? [16, 26] : [20, 31],
    iconAnchor: (type === 'via') ? [8, 26] : [10, 31],
    className: type + '-marker',
    html: html,
  });
  return icon;
}

export function getWaypointType(id) {
  const waypoint = store.waypoints.get(id);
  if (waypoint === store.waypoints.first())
    return 'start';
  else if (waypoint === store.waypoints.last())
    return 'end';
  return 'via';
}

export function getLatLngsFromWaypoints(waypoints) {
  return waypoints
    .map(waypoint => waypoint.getLatLng())
    .filter(latLng => latLng)
    .toArray();
}

export function calculateDistance(waypoints) {
  const latLngs = getLatLngsFromWaypoints(waypoints);
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

export function getRouteFreeColor() {
  const colors = Object.keys(routeColors);
  const takenColors = store.routes.map(route => route.color).toArray();
  for (let i = 0; colors.length; ++i) {
    if (takenColors.indexOf(colors[i]) === -1)
      return colors[i];
  }
  // if all colors are taken just return the first color
  return Object.keys(routeColors)[0];
}

export function createRouteLayer(geojson, color) {
  const layer = Leaflet.geoJson(geojson, {
    style: () => ({color: routeColors[color]})
  });
  layer.addTo(map);
  return layer;
}

export function removeLayer(layer) {
  if (layer)
    map.removeLayer(layer);
  return null;
}

export function createTrailer(latLngs) {
  const trailer = new Leaflet.Polyline(latLngs, {color: '#555', weight: 1, className: 'trailer-line'});
  trailer.addTo(map);
  return trailer;
}


export default {
  FIT_OPTIONS,
  createWaypointMarker, getWaypointType, calculateDistance, getLatLngsFromWaypoints,
  getWaypointBounds, updateWaypointMarkers, latLngToString,
  getRouteFreeColor, createRouteLayer, removeLayer, createTrailer,
};

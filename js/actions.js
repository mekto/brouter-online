import store from './store';
import { getValidWaypoints } from './reducers/waypoints';
import { getSource } from './reducers/profiles';
import geocoder from './geocoder';
import routing from './routing';
import map from './map';
import config from '../config';
import MapUtils from './utils/MapUtils';
import profiles from './profiles';
import util from './util';
import { findById } from './immulib';
import {messages} from './constants';


const dispatch = store.dispatch;
const getState = store.getState;


function canCalculateRoute(force=false) {
  const state = getState();

  const waypoints = getValidWaypoints(state.waypoints);
  if (waypoints.length < 2)
    return messages.MISSING_WAYPOINTS;

  const profile = state.profiles::findById(state.options.profileId);
  if (!profile.source)
    return messages.EMPTY_PROFILE_SOURCE;

  const distance = MapUtils.calculateDistance(waypoints);
  if (distance > config.maxBrouterCalculationDistance) {
    return messages.DISTANCE_TOO_LONG;
  }
  else if (distance > config.maxBrouterAutoCalculationDistance && !force) {
    return messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION;
  }
  return true;
}


export function calculateRoute(options = {}) {
  const {fit=true, force=false} = options;

  const canCalculate = canCalculateRoute(force);
  if (canCalculate === true) {
    const state = getState();
    const waypoints = getValidWaypoints(state.waypoints);
    if (fit) {
      fitWaypoints(waypoints);
    }
    const latLngs = MapUtils.getLatLngsFromWaypoints(waypoints);
    const profile = state.profiles::findById(state.options.profileId);
    const routeIndex = state.options.routeIndex;
    const profileOptions = state.options.profileOptions;

    dispatch({type: 'CALCULATE_ROUTE'});
    MapUtils.showTrailer(latLngs);
    MapUtils.cleanRouteLayers(getState().routes);

    routing.route(latLngs, getSource(profile, profileOptions), routeIndex, (error, geojson) => {
      if (geojson) {
        const id = util.id();
        const name = `${waypoints[0].address} - ${waypoints[waypoints.length - 1].address}`;
        const route = {id, name, geojson, waypoints, profile, profileOptions, routeIndex, color: MapUtils.getRouteFreeColor(getState().routes)};
        dispatch({type: 'CALCULATE_ROUTE_SUCCESS', ...route});
        MapUtils.createRouteLayer(id, geojson, route.color);
        if (fit) {
          fitRoute(id);
        }
      } else {
        dispatch({type: 'CALCULATE_ROUTE_FAIL', message: error});
      }
      MapUtils.hideTrailer();
    });
  } else {
    dispatch({type: 'CALCULATE_ROUTE_ABORT', message: canCalculate});
  }
}

export function clearErrorMessage() {
  dispatch({type: 'CLEAR_ERROR_MESSAGE'});
}


/*
 * Waypoints
 */
export function putWaypointAtLatLng(type, latLng) {
  let id;
  if (type !== 'via') {
    const waypoints = getState().waypoints;
    if (type === 'start')
      id = waypoints[0].id;
    else if (type === 'end')
      id = waypoints[waypoints.length - 1].id;
    updateWaypoint(id, {latLng, address: MapUtils.latLngToString(latLng)});
  } else {
    id = util.id();
    addViaWaypoint(id, {latLng, address: MapUtils.latLngToString(latLng)});
  }
  reverseGeocodeWaypoint(id, latLng);
  calculateRoute();
  updateMarkers();
}

export function addViaWaypoint(id, props) {
  dispatch({type: 'ADD_VIA_WAYPOINT', id, ...props});
}

export function geocodeWaypoint(id, address) {
  dispatch({type: 'GEOCODE_START', id, address});
  geocoder.query(address, (results) => {
    if (results && results[0]) {
      const result = results[0];
      const latLng = MapUtils.latLngToArray(result.latLng);
      dispatch({type: 'GEOCODE_SUCCESS', id, latLng, address});
      updateMarkers();

      const validWaypoints = getValidWaypoints(getState().waypoints);
      if (validWaypoints.length === 1) {
        zoomWaypoint(latLng);
      } else {
        fitWaypoints(validWaypoints);
        calculateRoute();
      }
    } else {
      dispatch({type: 'GEOCODE_FAIL', id, address});
      updateMarkers();
    }
  });
}

export function reverseGeocodeWaypoint(id, latLng) {
  dispatch({type: 'REVERSE_GEOCODE_START', id, latLng, address: MapUtils.latLngToString(latLng)});
  geocoder.reverse(latLng, (result) => {
    if (result) {
      dispatch({type: 'REVERSE_GEOCODE_SUCCESS', id, latLng, address: result.formatted});
      updateMarkers();
    } else {
      dispatch({type: 'REVERSE_GEOCODE_FAIL', id, latLng});
      updateMarkers();
    }
  });
}

export function zoomWaypoint(latLng) {
  map.setView(latLng, 14);
}

export function fitWaypoints(waypoints) {
  map.fitBounds(MapUtils.getWaypointBounds(waypoints), MapUtils.FIT_OPTIONS);
}

export function moveWaypoint(id, latLng) {
  reverseGeocodeWaypoint(id, latLng);
  calculateRoute({fit: false});
}

export function deleteWaypointOnClick(id) {
  deleteWaypoint(id);
  calculateRoute();
}

export function swapWaypoints() {
  dispatch({type: 'SWAP_WAYPOINTS'});
  calculateRoute();
}

export function reorderWaypoints(idA, idB) {
  dispatch({type: 'REORDER_WAYPOINTS', idA, idB});
}

export function updateWaypoint(id, updates) {
  dispatch({type: 'UPDATE_WAYPOINT', id, ...updates});
  updateMarkers();
}

export function clearWaypoint(id) {
  updateWaypoint(id, {address: '', latLng: null});
}

export function deleteWaypoint(id) {
  dispatch({type: 'DELETE_WAYPOINT', id});
  updateMarkers();
}


/*
 * Routes
 */
export function fitRoute(id) {
  map.fitBounds(MapUtils.getRouteLayer(id).getBounds(), MapUtils.FIT_OPTIONS);
}

export function updateRoute(id, updates) {
  dispatch({type: 'UPDATE_ROUTE', id, ...updates});
}

export function toggleRouteLock(id) {
  const route = getState().routes::findById(id);
  updateRoute(id, {locked: !route.locked});
}

export function deleteRoute(id) {
  dispatch({type: 'DELETE_ROUTE', id});
  MapUtils.cleanRouteLayers(getState().routes);
}


/*
 * Profile
 */
export function setProfile(id) {
  dispatch({type: 'SET_PROFILE', id});
  if (id !== 'custom') {
    calculateRoute();
  }
}

export function setRouteIndex(routeIndex) {
  dispatch({type: 'SET_ROUTE_INDEX', routeIndex});
  calculateRoute();
}

export function setProfileOption(optionId, value) {
  dispatch({type: 'SET_PROFILE_OPTION', optionId, value});
  calculateRoute();
}

export function setCustomProfileSource(source) {
  dispatch({type: 'SET_CUSTOM_PROFILE_SOURCE', source});
}

export function setLocate(status) {
  dispatch({type: 'SET_LOCATE', status});
}


/*
 * Helper functions
 */
function updateMarkers() {
  MapUtils.updateMarkers(getState().waypoints);
}

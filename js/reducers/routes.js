function route(state, action) {
  switch (action.type) {
    case 'CALCULATE_ROUTE_SUCCESS': {
      const { id, geojson, name, waypoints, profile, profileSettings, routeIndex, color, locked=false } = action;
      return { id, geojson, name, waypoints, profile, profileSettings, routeIndex, color, locked };
    }

    case 'UPDATE_ROUTE': {
      if (state.id !== action.id) return state;
      const { type, id, ...updates } = action;
      return { ...state, ...updates };
    }

    default:
      return state;
  }
}


export default function routes(state = [], action = {}) {
  switch (action.type) {
    case 'CALCULATE_ROUTE_SUCCESS':
      return [
        ...state,
        route(undefined, action)
      ];

    case 'CALCULATE_ROUTE':
      return state.filter(r => r.locked);

    case 'UPDATE_ROUTE':
      return state.map(r => route(r, action));

    case 'DELETE_ROUTE':
      return state.filter(r => r.id !== action.id);

    default:
      return state;
  }
}


export function getRouteProperties(route) {
  return route.geojson.features[0].properties;
}

export function getRouteTrackLength(route) {
  return +getRouteProperties(route)['track-length'];
}

export function getRouteCoordinates(route) {
  return route.geojson.features[0].geometry.coordinates;
}

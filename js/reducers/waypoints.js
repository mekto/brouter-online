import { findIndexById } from '../immulib';


const initialState = [
  {id: 'w0', address: '', latLng: null, loading: false},
  {id: 'w1', address: '', latLng: null, loading: false},
];


function waypoint(state, action) {
  switch (action.type) {
    case 'UPDATE_WAYPOINT': {
      if (state.id !== action.id) return state;
      const { type, id, ...updates } = action;
      return { ...state, ...updates };
    }

    case 'ADD_VIA_WAYPOINT': {
      const { id, address, latLng } = action;
      return { id, address, latLng };
    }

    case 'GEOCODE_START':
      if (state.id !== action.id) return state;
      return { ...state, address: action.address, loading: true };

    case 'REVERSE_GEOCODE_START':
      if (state.id !== action.id) return state;
      return { ...state, address: action.address, latLng: action.latLng, loading: true };

    case 'GEOCODE_SUCCESS':
    case 'REVERSE_GEOCODE_SUCCESS':
      if (state.id !== action.id) return state;
      return { ...state, address: action.address, latLng: action.latLng, loading: false };

    case 'GEOCODE_FAIL':
    case 'REVERSE_GEOCODE_FAIL':
      if (state.id !== action.id) return state;
      return { ...state, loading: false };

    default:
      return state;
  }
}


export default function waypoints(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_WAYPOINT':
    case 'GEOCODE_START':
    case 'GEOCODE_SUCCESS':
    case 'GEOCODE_FAIL':
    case 'REVERSE_GEOCODE_START':
    case 'REVERSE_GEOCODE_SUCCESS':
    case 'REVERSE_GEOCODE_FAIL':
      return state.map(w => waypoint(w, action));
    case 'ADD_VIA_WAYPOINT':
      return [
        ...state.slice(0, state.length - 1),
        waypoint(undefined, action),
        ...state.slice(state.length - 1)
      ];
    case 'DELETE_WAYPOINT':
      return state.filter(w => w.id !== action.id);
    case 'SWAP_WAYPOINTS':
      return [
        state[1],
        state[0]
      ];
    case 'REORDER_WAYPOINTS': {
      const indexA = state::findIndexById(action.idA);
      const newState = [...state.slice(0, indexA), ...state.slice(indexA + 1)];
      const indexB = newState::findIndexById(action.idB);
      return [
        ...newState.slice(0, indexB),
        state[indexA],
        ...newState.slice(indexB)
      ];
    }
    default:
      return state;
  }
}


export function getValidWaypoints(state) {
  return state.filter(w => w.latLng);
}

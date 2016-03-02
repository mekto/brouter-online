export default function isPending(state = false, action = {}) {
  switch (action.type) {
    case 'CALCULATE_ROUTE':
      return true;

    case 'CALCULATE_ROUTE_SUCCESS':
    case 'CALCULATE_ROUTE_FAIL':
    case 'CALCULATE_ROUTE_ABORT':
      return false;

    default:
      return state;
  }
}

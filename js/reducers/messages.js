const initialState = {
  info: null,
  error: null,
};


export default function messages(state = initialState, action = {}) {
  switch (action.type) {
    case 'CALCULATE_ROUTE':
      return initialState;

    case 'CALCULATE_ROUTE_FAIL':
      return {
        ...state,
        error: action.message,
      };

    case 'CALCULATE_ROUTE_ABORT':
      return {
        ...state,
        info: action.message,
      };

    case 'CLEAR_ERROR_MESSAGE':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

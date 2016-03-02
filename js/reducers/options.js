import { profileOptions } from '../profiles';


const initialState = {
  profileId: 'trekking',
  routeIndex: 0,
  profileOptions: profileOptions.reduce((obj, option) => {
    obj[option.id] = option.defaultValue;
    return obj;
  }, {}),
};


export default function options(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profileId: action.id,
      };

    case 'SET_ROUTE_INDEX':
      return {
        ...state,
        routeIndex: action.routeIndex,
      };

    case 'SET_PROFILE_OPTION':
      const profileOptions = {
        ...state.profileOptions,
        [action.optionId]: action.value,
      };
      if (action.optionId === 'ignore_cycleroutes' && action.value)
        profileOptions['stick_to_cycleroutes'] = false;
      else if (action.optionId === 'stick_to_cycleroutes' && action.value)
        profileOptions['ignore_cycleroutes'] = false;

      return {
        ...state,
        profileOptions
      };

    default:
      return state;
  }
}

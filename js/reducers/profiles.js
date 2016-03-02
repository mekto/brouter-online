import initialState from '../profiles';
import { findIndexById, set, merge } from '../immulib';


export default function profiles(state = initialState, action = {}) {
  switch (action.type) {
    case 'SET_CUSTOM_PROFILE_SOURCE':
      const index = state::findIndexById('custom');
      return state::set(index, state[index]::merge({source: action.source}));

    default:
      return state;
  }
}

export function getSource(profile, options) {
  let source = profile.source;
  if (!Array.isArray(profile.options))
    return source;

  profile.options.forEach(function(key) {
    source = source.replace(new RegExp('{' + key + '[^}]*}'), options[key] ? '1' : '0');
  });
  return source;
}

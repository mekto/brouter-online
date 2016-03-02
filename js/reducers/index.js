import { combineReducers } from 'redux';
import waypoints from './waypoints';
import routes from './routes';
import profiles from './profiles';
import options from './options';
import messages from './messages';
import isPending from './isPending';


export default combineReducers({
  waypoints,
  routes,
  profiles,
  options,
  messages,
  isPending,
});

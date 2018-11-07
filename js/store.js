import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import reducer from './reducers';


const store = createStore(
  reducer,
  applyMiddleware(createLogger({collapsed: true}))
);


export default store;

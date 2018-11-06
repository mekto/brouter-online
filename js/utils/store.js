import store from '../store';

export function getStateFromStore() {
  const { waypoints, routes, profiles, options, messages, isPending } = store.getState();
  return {
    waypoints,
    routes,
    profiles,
    options,
    messages,
    isPending,
  };
}

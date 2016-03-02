export const profileOptions = [
  {id: 'consider_elevation', name: 'Consider elevation', defaultValue: true},
  {id: 'allow_steps', name: 'Allow steps', defaultValue: true},
  {id: 'allow_ferries', name: 'Allow ferries', deafultValue: true},
  {id: 'ignore_cycleroutes', name: 'Ignore cycleroutes', deafultValue: false},
  {id: 'stick_to_cycleroutes', name: 'Stick to cycleroutes', defaultValue: false},
  {id: 'avoid_unsafe', name: 'Avoid unsafe', defaultValue: false},
];


export default [
  {id: 'trekking', name: 'Trekking', source: require('./profiles/trekking.brfc'), options: ['consider_elevation', 'allow_steps', 'allow_ferries', 'ignore_cycleroutes', 'stick_to_cycleroutes', 'avoid_unsafe']},
  {id: 'fastbike', name: 'Fastbike', source: require('./profiles/fastbike.brfc'), options: ['consider_elevation']},
  {id: 'shortest', name: 'Shortest', source: require('./profiles/shortest.brfc'), options: []},
  {id: 'custom', name: 'Custom', source: require('./profiles/custom.brf'), options: []},
];

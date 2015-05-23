class Profile {
  constructor(id, name, source, options=null) {
    this.id = id;
    this.name = name;
    this.source = source;
    this.options = options;
  }

  getSource(options) {
    var source = this.source;
    if (!Array.isArray(this.options))
      return source;

    this.options.forEach(function(key) {
      source = source.replace(new RegExp('{' + key + '[^}]*}'), options[key] ? '1' : '0');
    });
    return source;
  }
}


module.exports = [
  new Profile('trekking', 'Trekking', require('./profiles/trekking.brf'),
    ['consider_elevation', 'allow_steps', 'allow_ferries', 'ignore_cycleroutes', 'stick_to_cycleroutes', 'avoid_unsafe']
  ),
  new Profile('fastbike', 'Fastbike', require('./profiles/fastbike.brf'),
    ['consider_elevation']
  ),
  new Profile('shortest', 'Shortest', require('./profiles/shortest.brf')),
];

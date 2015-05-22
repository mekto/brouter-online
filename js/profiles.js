class Profile {
  constructor(id, name, source) {
    this.id = id;
    this.name = name;
    this.source = source;
  }

  getSource() {
    return this.source;
  }
}


module.exports = [
  new Profile('trekking', 'Trekking', require('./profiles/trekking.brf')),
  new Profile('fastbike', 'Fastbike', require('./profiles/fastbike.brf')),
  new Profile('shortest', 'Shortest', require('./profiles/shortest.brf')),
];

class Routes extends Array {
  clear() {
    var route = this.pop();
    while (route) {
      route.destroy();
      route = this.pop();
    }
  }
  items() {
    return this.filter(() => { return true; });
  }
}

module.exports = Routes;

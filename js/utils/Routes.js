function Routes() {
  var routes = [];
  routes.push.apply(routes, arguments);

  routes.clear = function() {
    var route = this.pop();
    while (route) {
      route.destroy();
      route = this.pop();
    }
  };

  return routes;
}


module.exports = Routes;

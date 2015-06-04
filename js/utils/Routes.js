const colors = [
  '#3388ff',  // blue
  '#ff4136',  // red
  '#ff851b',  // orange
  '#b10dc9',  // purple
  '#001f3f',  // navy
  '#39cccc',  // teal
  '#f012be',  // fuchsia
];


export default class Routes extends Array {
  clear(removeLocked=false) {
    const routesToRemove = this.filter((route) => {
      return removeLocked || !route.locked;
    });
    routesToRemove.forEach((route) => {
      this.remove(route);
    });
  }
  remove(route) {
    const index = this.indexOf(route);
    if (index !== -1) {
      this.splice(index, 1);
    }
    route.destroy();
  }
  items() {
    return this.filter(() => { return true; });
  }
  getFreeColor() {
    const takenColors = this.map((route) => route.color);
    for (let i = 0; i < colors.length; ++i) {
      if (takenColors.indexOf(colors[i]) === -1) {
        return colors[i];
      }
    }
    // if all colors taken just return first color
    return colors[0];
  }
}

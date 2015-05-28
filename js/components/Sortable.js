import Regular from 'regular';


Regular.extend({
  name: 'Sortable',
  template: '{#include this.$body}',

  setHandle(handle) {
    this.handle = handle;
  },

  dragOver(e, waypoint) {
    e.preventDefault();
    if (this.draggedWaypoint === waypoint)
      return;

    var items = this.data.items;
    var fromIndex = items.indexOf(this.draggedWaypoint);
    var toIndex = items.indexOf(waypoint);

    items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
    this.sorted = true;
  },

  dragStart(e, waypoint) {
    if (!e.target.contains(this.handle)) {
      e.preventDefault();
      return false;
    }
    e.event.dataTransfer.effectAllowed = 'move';
    e.event.dataTransfer.setData('text/plain', '1');
    this.draggedWaypoint = waypoint;
    this.dragged = e.target;
    this.sorted = false;
    this.handle = null;
  },

  dragEnd() {
    if (this.dragged) {
      this.dragged = null;
      this.draggedWaypoint = null;
    }
    if (this.sorted) {
      this.$emit('sort');
      this.sorted = false;
    }
  },
});

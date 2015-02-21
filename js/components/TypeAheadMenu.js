var Regular = require('regular');
var dom = Regular.dom;


var TypeAheadMenu = Regular.extend({
  name: 'TypeAheadMenu',
  template: require('./templates/typeaheadmenu.html'),
  data: {items: [], selectedIndex: null},

  setItems: function(newItems) {
    var items = this.data.items;
    var index = this.data.selectedIndex;

    // keep previously selected item
    if (index !== null && items[index]) {
      var lastId = items[index].id;
      index = null;

      for (var i = 0; i < newItems.length; ++i) {
        if (newItems[i].id === lastId) {
          index = i;
          break;
        }
      }
    }

    this.data.items = newItems;
    this.data.selectedIndex = index;
    this.$update();
  },

  clear: function() {
    this.setItems([]);
  },

  next: function() {
    var index = (this.data.selectedIndex !== null) ? this.data.selectedIndex + 1 : 0;
    this.setSelectedIndex(index);
  },

  prev: function() {
    var index = (this.data.selectedIndex !== null) ? this.data.selectedIndex - 1 : -1;
    this.setSelectedIndex(this.data.selectedIndex - 1);
  },

  setSelectedIndex: function(index) {
    if (this.data.selectedIndex === index)
      return;

    this.data.selectedIndex = index % this.data.items.length;
    if (this.data.selectedIndex < 0)
      this.data.selectedIndex = this.data.items.length + this.data.selectedIndex;
    this.$update();
    this.$emit('change', this.data.items[this.data.selectedIndex]);
  },

  select: function(item) {
    this.$emit('select', item);
    this.clear();
  }
});


Regular.directive('typeahead', function(input, value) {
  var config = value.get(this);
  var minlength = config.minlength || 2;
  var getItems = config.getItems;
  var typeahead = null;

  setTimeout(function() {
    typeahead = config.getTypeahead();
    typeahead.$on('change', handleChange);
    typeahead.$on('select', handleSelect);
  });

  function handleChange(item) {
    input.value = item.description;
    if (document.activeElement === input && config.onchange) {
      config.onchange(input, item);
    }
  }

  function handleSelect(item) {
    if (item) {
      input.value = item.description;
    }
    if (document.activeElement === input && config.onselect) {
      config.onselect(input, item);
    }
  }

  function handleInput(ev) {
    var text = ev.target.value;
    if (text.length > minlength) {
      getItems(text, function(items) {
        typeahead.setItems(items);
      });
    } else {
      typeahead.clear();
    }
  }

  function handleBlur(ev) {
    typeahead.clear();
  }

  function handleKeyDown(ev) {
    if (ev.which === 13) {  // Enter
      typeahead.select(typeahead.data.items[typeahead.data.selectedIndex]);
    } else if (ev.which === 38) {  // Arrow Up
      typeahead.prev();
      ev.preventDefault();
    } else if (ev.which === 40) {  // Arrow Down
      typeahead.next();
      ev.preventDefault();
    } else if (ev.which === 27) {  // Escape
      typeahead.clear();
    }
  }

  dom.on(input, 'input', handleInput);
  dom.on(input, 'blur', handleBlur);
  dom.on(input, 'keydown', handleKeyDown);

  return function destroy() {
    dom.off(input, 'input', handleInput);
    dom.off(input, 'blue', handleBlur);
    dom.off(input, 'keydown', handleKeyDown);

    typeahead.$off('change', handleChange);
    typeahead.$off('select', handleSelect);
  };
});


module.exports = TypeAheadMenu;

export function conditionMenuRootElement() {
  var plugin = hot().getPlugin('filters');
  var root;

  if (plugin && plugin.conditionComponent) {
    root = plugin.conditionComponent.getSelectElement().menu.container;
  }

  return root;
}

export function conditionSelectRootElement() {
  var plugin = hot().getPlugin('filters');
  var root;

  if (plugin && plugin.conditionComponent) {
    root = plugin.conditionComponent.getSelectElement().element;
  }

  return root;
}

export function byValueBoxRootElement() {
  var plugin = hot().getPlugin('filters');
  var root;

  if (plugin) {
    root = byValueMultipleSelect().itemsBox.rootElement;
  }

  return root;
}

export function byValueMultipleSelect() {
  var plugin = hot().getPlugin('filters');
  var root;

  if (plugin && plugin.valueComponent) {
    root = plugin.valueComponent.getMultipleSelectElement();
  }

  return root;
}

export function dateRowFactory(meta) {
  var options = {meta: meta || {}};

  return function(value) {
    options.value = value;

    return options;
  };
}

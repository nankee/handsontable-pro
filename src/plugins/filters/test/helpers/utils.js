
function conditionMenuRootElement() {
  var plugin = hot().getPlugin('filters');
  var root;

  if (plugin && plugin.conditionComponent) {
    root = plugin.conditionComponent.getSelectElement().menu.container;
  }

  return root;
}

function getFilterFormula(name) {
  return Handsontable.utils.FiltersFormulaRegisterer.formulas[name];
}

function dateRowFactory(meta) {
  var options = {meta: meta || {}};

  return function(value) {
    options.value = value;

    return options;
  };
}

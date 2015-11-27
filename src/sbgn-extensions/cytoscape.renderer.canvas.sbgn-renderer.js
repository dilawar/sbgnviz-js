//add compound-padding property to css features
styfn.properties.push({name: 'compound-padding', type: styfn.types.percent});
styfn.properties['compound-padding'] = {name: 'compound-padding', type: styfn.types.percent};

//add dynamic-label-size property to css features
styfn.types.dynamicLabelSize = {enums: ['small', 'regular', 'large']};
styfn.properties.push({name: 'dynamic-label-size', type: styfn.types.dynamicLabelSize});
styfn.properties['dynamic-label-size'] = {name: 'dynamic-label-size', type: styfn.types.dynamicLabelSize};

//add fit-labels-to-nodes property to css features
styfn.types.trueOrFalse = {enums: ['true', 'false']};
styfn.properties.push({name: 'fit-labels-to-nodes', type: styfn.types.trueOrFalse});
styfn.properties['fit-labels-to-nodes'] = {name: 'fit-labels-to-nodes', type: styfn.types.trueOrFalse};

//add expanded-collapsed property to css features
styfn.types.expandedOrcollapsed = {enums: ['expanded', 'collapsed']};
styfn.properties.push({name: 'expanded-collapsed', type: styfn.types.expandedOrcollapsed});
styfn.properties['expanded-collapsed'] = {name: 'expanded-collapsed', type: styfn.types.expandedOrcollapsed};

//add incremental-layout-after-expand-collapse property to css features
styfn.types.trueOrFalse = {enums: ['true', 'false']};
styfn.properties.push({name: 'incremental-layout-after-expand-collapse', type: styfn.types.trueOrFalse});
styfn.properties['incremental-layout-after-expand-collapse'] = {name: 'incremental-layout-after-expand-collapse', type: styfn.types.trueOrFalse};



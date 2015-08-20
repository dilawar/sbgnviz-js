var setFileContent = function (fileName) {
  var span = document.getElementById('file-name');
  while (span.firstChild) {
    span.removeChild(span.firstChild);
  }
  span.appendChild(document.createTextNode(fileName));
}

//Handle keyboard events
$(document).keydown(function (e) {
  if (e.which === 90 && e.ctrlKey) {
    editorActionsManager.undo();
    refreshUndoRedoButtonsStatus();
//    $(document.activeElement).attr("value");
  }
  else if (e.which === 89 && e.ctrlKey) {
    editorActionsManager.redo();
    refreshUndoRedoButtonsStatus();
  }
});

$(document).ready(function () {
  var xmlObject = loadXMLDoc('samples/activated_stat1alpha_induction_of_the_irf1_gene.xml');

  setFileContent("activated_stat1alpha_induction_of_the_irf1_gene.sbgnml");

  (new SBGNContainer({
    el: '#sbgn-network-container',
    model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
  })).render();

  $('#new-file-icon').click(function (e) {
    $('#new-file').trigger("click");
  });

  $('#new-file').click(function (e) {
    setFileContent("new_file.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {
        cytoscapeJsGraph: {
          nodes: [],
          edges: []
        }
      }
    })).render();

    editorActionsManager.reset();
    handleSBGNInspector();
  });

  $('.add-node-menu-item').click(function (e) {
    if (!modeHandler.mode != "add-node-mode") {
      modeHandler.setAddNodeMode();
    }
    var value = $(this).attr('name');
    modeHandler.selectedNodeType = value;
    modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
    modeHandler.setSelectedMenuItem("add-node-mode", value);
  });

  $('.add-edge-menu-item').click(function (e) {
    if (!modeHandler.mode != "add-edge-mode") {
      modeHandler.setAddEdgeMode();
    }
    var value = $(this).attr('name');
    modeHandler.selectedEdgeType = value;
    modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
    modeHandler.setSelectedMenuItem("add-edge-mode", value);
  });

  modeHandler.initilize();

  $('.sbgn-select-node-item').click(function (e) {
    if (!modeHandler.mode != "add-node-mode") {
      modeHandler.setAddNodeMode();
    }
    var value = $('img', this).attr('value');
    modeHandler.selectedNodeType = value;
    modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
    modeHandler.setSelectedMenuItem("add-node-mode", value);
  });

  $('.sbgn-select-edge-item').click(function (e) {
    if (!modeHandler.mode != "add-edge-mode") {
      modeHandler.setAddEdgeMode();
    }
    var value = $('img', this).attr('value');
    modeHandler.selectedEdgeType = value;
    modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
    modeHandler.setSelectedMenuItem("add-edge-mode", value);
  });

  $('#node-list-set-mode-btn').click(function (e) {
    if (modeHandler.mode != "add-node-mode") {
      modeHandler.setAddNodeMode();
    }
  });

  $('#edge-list-set-mode-btn').click(function (e) {
    if (modeHandler.mode != "add-edge-mode") {
      modeHandler.setAddEdgeMode();
    }
  });

  $('#select-icon').click(function (e) {
    modeHandler.setSelectionMode();
  });

  $('#select-edit').click(function (e) {
    modeHandler.setSelectionMode();
  });

  var sbgnLayoutProp = new SBGNLayout({
    el: '#sbgn-layout-table'
  });

  var sbgnProperties = new SBGNProperties({
    el: '#sbgn-properties-table'
  });

  $("body").on("change", "#file-input", function (e) {
    if ($("#file-input").val() == "") {
      return;
    }

    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var textType = /text.*/;

    var reader = new FileReader();

    reader.onload = function (e) {
      (new SBGNContainer({
        el: '#sbgn-network-container',
        model: {cytoscapeJsGraph:
                  sbgnmlToJson.convert(textToXmlObject(this.result))}
      })).render();
    }
    reader.readAsText(file);
    setFileContent(file.name);
    $("#file-input").val("");
  });

  $("#node-legend").click(function (e) {
    e.preventDefault();
    $.fancybox(
            _.template($("#node-legend-template").html(), {}),
            {
              'autoDimensions': true,
              'transitionIn': 'none',
              'transitionOut': 'none',
            });
  });

  $("#node-label-textbox").blur(function () {
    $("#node-label-textbox").hide();
    $("#node-label-textbox").data('node', undefined);
//    $("#node-label-textbox").attr('value', '');
  });
  
  $("#node-label-textbox").on('input', function(){
    var node = $(this).data('node');
    node._private.data.sbgnlabel = $(this).attr('value');
    cy.forceRender();
  });

  $("#edge-legend").click(function (e) {
    e.preventDefault();
    $.fancybox(
            _.template($("#edge-legend-template").html(), {}),
            {
              'autoDimensions': false,
              'width': 400,
              'height': 220,
              'transitionIn': 'none',
              'transitionOut': 'none',
            });
  });

  $("#quick-help").click(function (e) {
    e.preventDefault();
    $.fancybox(
            _.template($("#quick-help-template").html(), {}),
            {
              'autoDimensions': false,
              'width': 420,
              'height': "auto",
              'transitionIn': 'none',
              'transitionOut': 'none'
            });
  });

  $("#how-to-use").click(function (e) {
    var url = "http://www.cs.bilkent.edu.tr/~ivis/sbgnviz-js/SBGNViz.js-1.x.UG.pdf";
    var win = window.open(url, '_blank');
    win.focus();
  });

  $("#about").click(function (e) {
    e.preventDefault();
    $.fancybox(
            _.template($("#about-template").html(), {}),
            {
              'autoDimensions': false,
              'width': 300,
              'height': 320,
              'transitionIn': 'none',
              'transitionOut': 'none',
            });
  });

  $("#load-sample1").click(function (e) {
    var xmlObject = loadXMLDoc('samples/activated_stat1alpha_induction_of_the_irf1_gene.xml');

    setFileContent("activated_stat1alpha_induction_of_the_irf1_gene.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample2").click(function (e) {
    var xmlObject = loadXMLDoc('samples/glycolysis.xml');

    setFileContent("glycolysis.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample3").click(function (e) {
    var xmlObject = loadXMLDoc('samples/mapk_cascade.xml');

    setFileContent("mapk_cascade.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample4").click(function (e) {
    var xmlObject = loadXMLDoc('samples/polyq_proteins_interference.xml');

    $("#quick-help").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#quick-help-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 420,
                'height': "auto",
                'transitionIn': 'none',
                'transitionOut': 'none'
              });
    });

    $("#how-to-use").click(function (e) {
      var url = "http://www.cs.bilkent.edu.tr/~ivis/sbgnviz-js/SBGNViz.js-1.x.UG.pdf";
      var win = window.open(url, '_blank');
      win.focus();
    });

    $("#about").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#about-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 300,
                'height': 320,
                'transitionIn': 'none',
                'transitionOut': 'none',
              });
    });

    setFileContent("polyq_proteins_interference.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample5").click(function (e) {
    var xmlObject = loadXMLDoc('samples/insulin-like_growth_factor_signaling.xml');

    setFileContent("insulin-like_growth_factor_signaling.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample6").click(function (e) {
    var xmlObject = loadXMLDoc('samples/atm_mediated_phosphorylation_of_repair_proteins.xml');

    setFileContent("atm_mediated_phosphorylation_of_repair_proteins.sbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#load-sample7").click(function (e) {
    var xmlObject = loadXMLDoc('samples/vitamins_b6_activation_to_pyridoxal_phosphate.xml');

    setFileContent("vitamins_b6_activation_to_pyridoxal_phosphatesbgnml");

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(xmlObject)}
    })).render();
    
    handleSBGNInspector();
  });

  $("#hide-selected").click(function (e) {
//    sbgnFiltering.hideSelected();
    var param = {};
    param.firstTime = true;
    editorActionsManager._do(new HideSelectedCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#show-selected").click(function (e) {
//    sbgnFiltering.showSelected();
    var param = {};
    param.firstTime = true;
    editorActionsManager._do(new ShowSelectedCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#show-all").click(function (e) {
//    sbgnFiltering.showAll();
    editorActionsManager._do(new ShowAllCommand());
    refreshUndoRedoButtonsStatus();
  });

  $("#delete-selected-smart").click(function (e) {
    //sbgnFiltering.deleteSelected();
    var param = {
      firstTime: true
    };
    editorActionsManager._do(new DeleteSelectedCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#neighbors-of-selected").click(function (e) {
//    sbgnFiltering.highlightNeighborsofSelected();
    var param = {
      firstTime: true
    };
    editorActionsManager._do(new HighlightNeighborsofSelectedCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#processes-of-selected").click(function (e) {
//    sbgnFiltering.highlightProcessesOfSelected();
    var param = {
      firstTime: true
    };
    editorActionsManager._do(new HighlightProcessesOfSelectedCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#remove-highlights").click(function (e) {
//    sbgnFiltering.removeHighlights();
    editorActionsManager._do(new RemoveHighlightsCommand());
    refreshUndoRedoButtonsStatus();
  });

  $("#make-compound-complex").click(function (e) {
    var param = {
      firstTime: true,
      compundType: "complex",
      nodesToMakeCompound: cy.nodes(":selected")
    };
    editorActionsManager._do(new CreateCompundForSelectedNodesCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#make-compound-compartment").click(function (e) {
    var param = {
      firstTime: true,
      compundType: "compartment",
      nodesToMakeCompound: cy.nodes(":selected")
    };
    editorActionsManager._do(new CreateCompundForSelectedNodesCommand(param));
    refreshUndoRedoButtonsStatus();
  });

  $("#layout-properties").click(function (e) {
    sbgnLayoutProp.render();
  });

  $("#delete-selected-simple").click(function (e) {
    var selectedEles = cy.$(":selected");
    editorActionsManager._do(new RemoveElesCommand(selectedEles));
    refreshUndoRedoButtonsStatus();
  });

  $("#sbgn-properties").click(function (e) {
    sbgnProperties.render();
  });

  $("#collapse-selected").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "collapse");

    if (!thereIs) {
      return;
    }

    if (window.incrementalLayoutAfterExpandCollapse == null) {
      window.incrementalLayoutAfterExpandCollapse =
              (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
    }
    if (incrementalLayoutAfterExpandCollapse)
      editorActionsManager._do(new CollapseGivenNodesCommand({
        nodes: cy.nodes(":selected"),
        firstTime: true
      }));
    else
      editorActionsManager._do(new SimpleCollapseGivenNodesCommand(cy.nodes(":selected")));
    refreshUndoRedoButtonsStatus();
  });

  $("#expand-selected").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "expand");

    if (!thereIs) {
      return;
    }

    if (window.incrementalLayoutAfterExpandCollapse == null) {
      window.incrementalLayoutAfterExpandCollapse =
              (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
    }
    if (incrementalLayoutAfterExpandCollapse)
      editorActionsManager._do(new ExpandGivenNodesCommand({
        nodes: cy.nodes(":selected"),
        firstTime: true
      }));
    else
      editorActionsManager._do(new SimpleExpandGivenNodesCommand(cy.nodes(":selected")));
    refreshUndoRedoButtonsStatus();
  });

  $("#collapse-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "collapse");

    if (!thereIs) {
      return;
    }

    if (window.incrementalLayoutAfterExpandCollapse == null) {
      window.incrementalLayoutAfterExpandCollapse =
              (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
    }
    if (incrementalLayoutAfterExpandCollapse)
      editorActionsManager._do(new CollapseGivenNodesCommand({
        nodes: cy.nodes(),
        firstTime: true
      }));
    else
      editorActionsManager._do(new SimpleCollapseGivenNodesCommand(cy.nodes()));
    refreshUndoRedoButtonsStatus();
  });

  $("#expand-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "expand");

    if (!thereIs) {
      return;
    }

    if (window.incrementalLayoutAfterExpandCollapse == null) {
      window.incrementalLayoutAfterExpandCollapse =
              (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
    }
    if (incrementalLayoutAfterExpandCollapse)
      editorActionsManager._do(new ExpandAllNodesCommand({
        firstTime: true
      }));
    else
      editorActionsManager._do(new SimpleExpandAllNodesCommand());
    refreshUndoRedoButtonsStatus();
  });

  $("#perform-layout-icon").click(function (e) {
    if (modeHandler.mode == "selection-mode") {
      $("#perform-layout").trigger('click');
    }
  });

  $("#perform-layout").click(function (e) {
    var nodesData = {};
    var nodes = cy.nodes();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      nodesData[node.id()] = {
        width: node.width(),
        height: node.height(),
        x: node.position("x"),
        y: node.position("y")
      };
    }

    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);

    sbgnLayoutProp.applyLayout();
    editorActionsManager._do(new PerformLayoutCommand(nodesData));

    refreshUndoRedoButtonsStatus();
  });

  $("#perform-incremental-layout").click(function (e) {
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);

    sbgnLayoutProp.applyIncrementalLayout();
  });

  $("#undo-last-action").click(function (e) {
    editorActionsManager.undo();
    refreshUndoRedoButtonsStatus();
  });

  $("#redo-last-action").click(function (e) {
    editorActionsManager.redo();
    refreshUndoRedoButtonsStatus();
  });

  $("#save-as-png").click(function (evt) {
    var pngContent = cy.png({scale: 3, full: true});

    // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    // this is to remove the beginning of the pngContent: data:img/png;base64,
    var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

    saveAs(b64toBlob(b64data, "image/png"), "network.png");

    //window.open(pngContent, "_blank");
  });

  $("#save-as-jpg").click(function (evt) {
    var pngContent = cy.jpg({scale: 3, full: true});

    // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    // this is to remove the beginning of the pngContent: data:img/png;base64,
    var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

    saveAs(b64toBlob(b64data, "image/jpg"), "network.jpg");
  });

  $("#load-file").click(function (evt) {
    $("#file-input").trigger('click');
  });

  $("#load-file-icon").click(function (evt) {
    $("#load-file").trigger('click');
  });

  $("#save-as-sbgnml").click(function (evt) {
    var sbgnmlText = jsonToSbgnml.createSbgnml();

    var blob = new Blob([sbgnmlText], {
      type: "text/plain;charset=utf-8;",
    });
    var filename = document.getElementById('file-name').innerHTML;
    saveAs(blob, filename);
  });

  $("#save-icon").click(function (evt) {
    $("#save-as-sbgnml").trigger('click');
  });

  $("body").on("click", ".biogene-info .expandable", function (evt) {
    var expanderOpts = {slicePoint: 150,
      expandPrefix: ' ',
      expandText: ' (...)',
      userCollapseText: ' (show less)',
      moreClass: 'expander-read-more',
      lessClass: 'expander-read-less',
      detailClass: 'expander-details',
      expandEffect: 'fadeIn',
      collapseEffect: 'fadeOut'
    };

    $(".biogene-info .expandable").expander(expanderOpts);
    expanderOpts.slicePoint = 2;
    expanderOpts.widow = 0;
  });
});

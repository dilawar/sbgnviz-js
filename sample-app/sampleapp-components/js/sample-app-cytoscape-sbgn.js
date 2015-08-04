

function dynamicResize()
{

  var win = $(this); //this = window

  var windowWidth = win.width();
  var windowHeight = win.height();

  var canvasWidth = 1000;
  var canvasHeight = 680;

  if (windowWidth > canvasWidth)
  {
    $("#sbgn-network-container").width(windowWidth * 0.85);
    $(".nav-menu").width(windowWidth * 0.85);
    $(".navbar").width(windowWidth * 0.85);
    $("#sbgn-info-content").width(windowWidth * 0.85);
    $("#sbgn-select-mode").width(windowWidth * 0.85);
  }

  if (windowHeight > canvasHeight)
  {
    $("#sbgn-network-container").height(windowHeight * 0.85);
  }
}

$(window).on('resize', dynamicResize);

$(document).ready(function ()
{
  dynamicResize();
});



var makePresetLayout = function () {
  cy.layout({
    name: "preset"
  });
};

/*
 * This function obtains the info label of the given node by
 * it's children info recursively
 */
var getInfoLabel = function (node) {
  /*
   * Info label of a collapsed node cannot be changed if
   * the node is collapsed return the already existing info label of it
   */
  if (node._private.data.collapsedChildren != null) {
    return node._private.data.infoLabel;
  }

  /*
   * If the node is simple then it's infolabel is equal to it's sbgnlabel
   */
  if (node.children() == null || node.children().length == 0) {
    return node._private.data.sbgnlabel;
  }

  var children = node.children();
  var infoLabel = "";
  /*
   * Get the info label of the given node by it's children info recursively
   */
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var childInfo = getInfoLabel(child);

    if (childInfo == null || childInfo == "") {
      continue;
    }

    if (infoLabel != "") {
      infoLabel += ":";
    }
    infoLabel += childInfo;
  }

  //return info label
  return infoLabel;
};

/*
 * This function create qtip for the given node
 */
var nodeQtipFunction = function (node) {
  /*
   * Check the sbgnlabel of the node if it is not valid 
   * then check the infolabel if it is also not valid do not show qtip
   */
  var label = node._private.data.sbgnlabel;

  if (label == null || label == "")
    label = getInfoLabel(node);

  if (label == null || label == "")
    return;

  node.qtip({
    content: function () {
      var contentHtml = "<b style='text-align:center;font-size:16px;'>" + label + "</b>";
      var sbgnstatesandinfos = node._private.data.sbgnstatesandinfos;
      for (var i = 0; i < sbgnstatesandinfos.length; i++) {
        var sbgnstateandinfo = sbgnstatesandinfos[i];
        if (sbgnstateandinfo.clazz == "state variable") {
          var value = sbgnstateandinfo.state.value;
          var variable = sbgnstateandinfo.state.variable;
          contentHtml += "<div style='text-align:center;font-size:14px;'>" + value + "@" + variable + "</div>";
        }
        else if (sbgnstateandinfo.clazz == "unit of information") {
          contentHtml += "<div style='text-align:center;font-size:14px;'>" + sbgnstateandinfo.label.text + "</div>";
        }
      }
      return contentHtml;
    },
    show: {
      ready: true
    },
    position: {
      my: 'top center',
      at: 'bottom center',
      adjust: {
        cyViewport: true
      }
    },
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 16,
        height: 8
      }
    }
  });

};

/*
 * This function refreshs the enabled-disabled status of undo-redo buttons.
 * The status of buttons are determined by whether the undo-redo stacks are empty.
 */
var refreshUndoRedoButtonsStatus = function () {
  if (editorActionsManager.isUndoStackEmpty()) {
    $("#undo-last-action").parent("li").addClass("disabled");
  }
  else {
    $("#undo-last-action").parent("li").removeClass("disabled");
  }

  if (editorActionsManager.isRedoStackEmpty()) {
    $("#redo-last-action").parent("li").addClass("disabled");
  }
  else {
    $("#redo-last-action").parent("li").removeClass("disabled");
  }
}

var refreshPaddings = function () {
  //If compound padding is not set yet set it by css value
  if (window.compoundPadding == null) {
    window.compoundPadding = parseInt(sbgnStyleRules['compound-padding'], 10);
  }
  var nodes = cy.nodes();
  var total = 0;
  var numOfSimples = 0;

  for (var i = 0; i < nodes.length; i++) {
    var theNode = nodes[i];
    if (theNode.children() == null || theNode.children().length == 0) {
      var collapsedChildren = theNode._private.data.collapsedChildren;
      if (collapsedChildren == null || collapsedChildren.length == 0) {
        total += Number(theNode._private.data.sbgnbbox.w);
        total += Number(theNode._private.data.sbgnbbox.h);
        numOfSimples++;
      }
      else {
        var result = expandCollapseUtilities.getCollapsedChildrenData(collapsedChildren, numOfSimples, total);
        numOfSimples = result.numOfSimples;
        total = result.total;
      }
    }
  }

  var calc_padding = (compoundPadding / 100) * Math.floor(total / (2 * numOfSimples));

  if (calc_padding < 10) {
    calc_padding = 10;
  }

  var complexesAndCompartments = cy.$("node[sbgnclass='complex'], node[sbgnclass='compartment']");
  complexesAndCompartments.css('padding-left', calc_padding + 8);
  complexesAndCompartments.css('padding-right', calc_padding + 8);
  complexesAndCompartments.css('padding-top', calc_padding + 8);
  complexesAndCompartments.css('padding-bottom', calc_padding + 8);

  //To refresh the nodes on the screen apply the preset layout
  makePresetLayout();
};

/*
 * This is a debugging function
 */
var printNodeInfo = function () {
  console.log("print node info");
  var nodes = cy.nodes();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    console.log(node.data("id") + "\t" + node.data("parent"));
  }
  console.log("print edge info");
  var edges = cy.edges();
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    console.log(edge.data("id") + "\t" + edge.data("source") + "\t" + edge.data("target"));
  }
};

//get the style properties for the given selector
var getStyleRules = function (selector) {
  for (var i = 0; i < sbgnStyleSheet.length; i++) {
    var currentStyle = sbgnStyleSheet[i];
    if (currentStyle.selector == selector) {
      return currentStyle.properties;
    }
  }
};

/*
 * get the style rules for .sbgn selector and fill them into sbgnStyleRules map
 */
var getSBGNStyleRules = function () {
  if (window.sbgnStyleRules == null) {
    var styleRulesList = getStyleRules(".sbgn");
    window.sbgnStyleRules = {};
    for (var i = 0; i < styleRulesList.length; i++) {
      var rule = styleRulesList[i];
      window.sbgnStyleRules[rule.name] = rule.value;
    }
  }
  return sbgnStyleRules;
};

var sbgnStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
          'border-width': 1.5,
          'border-color': '#555',
          'background-color': '#f6f6f6',
          'font-size': 11,
          'shape': 'data(sbgnclass)',
          'background-opacity': '0.5'
        })
        .selector("node[sbgnclass='complex']")
        .css({
          'background-color': '#F4F3EE',
          'expanded-collapsed': 'expanded',
          'text-valign': 'bottom',
          'text-halign': 'center',
          'font-size': '16'
        })
        .selector("node[sbgnclass='compartment']")
        .css({
          'background-opacity': '0',
          'background-color': '#FFFFFF',
          'content': 'data(sbgnlabel)',
          'text-valign': 'bottom',
          'text-halign': 'center',
          'font-size': '16',
          'expanded-collapsed': 'expanded'
        })
        .selector("node[sbgnclass='submap']")
        .css({
          'expanded-collapsed': 'expanded'
        })
        .selector("node[sbgnclass!='complex'][sbgnclass!='compartment'][sbgnclass!='submap']")
        .css({
          'width': 'data(sbgnbbox.w)',
          'height': 'data(sbgnbbox.h)'
        })
        .selector("node:selected")
        .css({
          'border-color': '#d67614',
          'target-arrow-color': '#000',
          'text-outline-color': '#000'
        })
        .selector("node:active")
        .css({
          'background-opacity': '0.7',
          'overlay-color': '#d67614',
          'overlay-padding': '14'
        })
        .selector("edge")
        .css({
          'line-color': '#555',
          'target-arrow-fill': 'hollow',
          'source-arrow-fill': 'hollow',
          'width': 1.5,
          'target-arrow-color': '#555',
          'source-arrow-color': '#555',
          'target-arrow-shape': 'data(sbgnclass)'
        })
        .selector("edge[sbgnclass='inhibition']")
        .css({
          'target-arrow-fill': 'filled'
        })
        .selector("edge[sbgnclass='consumption']")
        .css({
          'target-arrow-shape': 'none',
          'source-arrow-shape': 'data(sbgnclass)',
          'line-style': 'consumption'
        })
        .selector("edge[sbgnclass='production']")
        .css({
          'target-arrow-fill': 'filled',
          'line-style': 'production'
        })
        .selector("edge:selected")
        .css({
          'line-color': '#d67614',
          'source-arrow-color': '#d67614',
          'target-arrow-color': '#d67614'
        })
        .selector("edge:active")
        .css({
          'background-opacity': '0.7',
          'overlay-color': '#d67614',
          'overlay-padding': '8'
        })
        .selector("core")
        .css({
          'selection-box-color': '#d67614',
          'selection-box-opacity': '0.2',
          'selection-box-border-color': '#d67614'
        })
        .selector(".ui-cytoscape-edgehandles-source")
        .css({
          'border-color': '#5CC2ED',
          'border-width': 3
        })
        .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
        .css({
          'background-color': '#5CC2ED'
        })
        .selector("edge.ui-cytoscape-edgehandles-preview")
        .css({
          'line-color': '#5CC2ED'
        })
        .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
        .css({
          'shape': 'rectangle',
          'width': 15,
          'height': 15
        })
        .selector('edge.not-highlighted')
        .css({
          'opacity': 0.3,
          'text-opacity': 0.3,
          'background-opacity': 0.3
        })
        .selector('node.not-highlighted')
        .css({
          'border-opacity': 0.3,
          'text-opacity': 0.3,
          'background-opacity': 0.3
        })
        .selector('edge.meta')
        .css({
          'line-color': '#C4C4C4',
          'source-arrow-color': '#C4C4C4',
          'target-arrow-color': '#C4C4C4'
        })
        .selector("edge.meta:selected")
        .css({
          'line-color': '#d67614',
          'source-arrow-color': '#d67614',
          'target-arrow-color': '#d67614'
        })
        .selector("node.collapsed")
        .css({
          'width': 60,
          'height': 60
        })
        .selector(".sbgn")
        .css({
          'compound-padding': 20,
          'dynamic-label-size': 'regular',
          'fit-labels-to-nodes': 'true',
          'incremental-layout-after-expand-collapse': 'true'
        }); // end of sbgnStyleSheet

//get the sbgn style rules
getSBGNStyleRules();

var NotyView = Backbone.View.extend({
  render: function () {
    //this.model["theme"] = " twitter bootstrap";
    this.model["layout"] = "bottomRight";
    this.model["timeout"] = 8000;
    this.model["text"] = "Right click on a gene to see its details!";

    noty(this.model);
    return this;
  }
});

var SBGNContainer = Backbone.View.extend({
  cyStyle: sbgnStyleSheet,
  render: function () {
    (new NotyView({
      template: "#noty-info",
      model: {}
    })).render();

    var container = $(this.el);
    // container.html("");
    // container.append(_.template($("#loading-template").html()));


    var cytoscapeJsGraph = (this.model.cytoscapeJsGraph);

    var positionMap = {};

    //add position information to data for preset layout
    for (var i = 0; i < cytoscapeJsGraph.nodes.length; i++) {
      var xPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.x;
      var yPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.y;
      positionMap[cytoscapeJsGraph.nodes[i].data.id] = {'x': xPos, 'y': yPos};
    }

    var cyOptions = {
      elements: cytoscapeJsGraph,
      style: sbgnStyleSheet,
      layout: {
        name: 'preset',
        positions: positionMap
      },
      showOverlay: false,
      minZoom: 0.125,
      maxZoom: 16,
      boxSelectionEnabled: true,
      motionBlur: true,
      wheelSensitivity: 0.1,
      ready: function ()
      {
        window.cy = this;
        refreshPaddings();

        //For adding edges interactively
        cy.edgehandles({
          complete: function (sourceNode, targetNodes, addedEntities) {
            // fired when edgehandles is done and entities are added
            var param = {};
            param.newEdge = {
              source: sourceNode.id(),
              target: targetNodes[0].id(),
              sbgnclass: modeHandler.elementsHTMLNameToName[modeHandler.selectedEdgeType]
//              sbgnclass: $("#edge-list").data('ddslick').selectedData.value
            };
            param.firstTime = true;
            editorActionsManager._do(new AddEdgeCommand(param));
            refreshUndoRedoButtonsStatus();
          }
        });

        cy.edgehandles('drawoff');

        expandCollapseUtilities.initCollapsedNodes();

        editorActionsManager.reset();
        refreshUndoRedoButtonsStatus();

        var panProps = ({
          fitPadding: 10
        });
        container.cytoscapePanzoom(panProps);

        var lastMouseDownNodeInfo = null;
        cy.on("mousedown", "node", function () {
          lastMouseDownNodeInfo = {};
          lastMouseDownNodeInfo.lastMouseDownPosition = {
            x: this.position("x"),
            y: this.position("y")
          };
          lastMouseDownNodeInfo.node = this;
        });

        cy.on("mouseup", "node", function () {
          if (lastMouseDownNodeInfo == null) {
            return;
          }
          var node = lastMouseDownNodeInfo.node;
          var lastMouseDownPosition = lastMouseDownNodeInfo.lastMouseDownPosition;
          var mouseUpPosition = {
            x: node.position("x"),
            y: node.position("y")
          };
          if (mouseUpPosition.x != lastMouseDownPosition.x ||
                  mouseUpPosition.y != lastMouseDownPosition.y) {
            var positionDiff = {
              x: mouseUpPosition.x - lastMouseDownPosition.x,
              y: mouseUpPosition.y - lastMouseDownPosition.y
            };

            var nodes;

            if (node.selected()) {
              nodes = cy.nodes(":visible").filter(":selected");
            }
            else {
              nodes = [];
              nodes.push(node);
            }

            var param = {
              positionDiff: positionDiff,
              nodes: nodes,
              move: false
            };
            editorActionsManager._do(new MoveNodeCommand(param));

            lastMouseDownNodeInfo = null;
            refreshUndoRedoButtonsStatus();
          }
        });

        cy.on('mouseover', 'node', function (event) {
          var node = this;

          if (!node.mouseover) {
            node.mouseover = true;
            //make preset layout to redraw the nodes
            cy.forceRender();
          }

          $(".qtip").remove();

          if (event.originalEvent.shiftKey)
            return;

          node.qtipTimeOutFcn = setTimeout(function () {
            nodeQtipFunction(node);
          }, 1000);

        });

        cy.on('mouseout', 'node', function (event) {
          if (this.qtipTimeOutFcn != null) {
            clearTimeout(this.qtipTimeOutFcn);
            this.qtipTimeOutFcn = null;
          }
          this.mouseover = false;
          //make preset layout to redraw the nodes
          cy.forceRender();
        });

        cy.on('cxttap', 'node', function (event) {
          var node = this;
          $(".qtip").remove();

          if (node.qtipTimeOutFcn != null) {
            clearTimeout(node.qtipTimeOutFcn);
            node.qtipTimeOutFcn = null;
          }

          var geneClass = node._private.data.sbgnclass;
          if (geneClass != 'macromolecule' && geneClass != 'nucleic acid feature' &&
                  geneClass != 'unspecified entity')
            return;

          var queryScriptURL = "sampleapp-components/php/BioGeneQuery.php";
          var geneName = node._private.data.sbgnlabel;

          // set the query parameters
          var queryParams =
                  {
                    query: geneName,
                    org: "human",
                    format: "json",
                  };

          cy.getElementById(node.id()).qtip({
            content: {
              text: function (event, api) {
                $.ajax({
                  type: "POST",
                  url: queryScriptURL,
                  async: true,
                  data: queryParams,
                })
                        .then(function (content) {
                          queryResult = JSON.parse(content);
                          if (queryResult.count > 0 && queryParams.query != "" && typeof queryParams.query != 'undefined')
                          {
                            var info = (new BioGeneView(
                                    {
                                      el: '#biogene-container',
                                      model: queryResult.geneInfo[0]
                                    })).render();
                            var html = $('#biogene-container').html();
                            api.set('content.text', html);
                          }
                          else {
                            api.set('content.text', "No additional information available &#013; for the selected node!");
                          }
                        }, function (xhr, status, error) {
                          api.set('content.text', "Error retrieving data: " + error);
                        });
                api.set('content.title', node._private.data.sbgnlabel);
                return _.template($("#loading-small-template").html());
              }
            },
            show: {
              ready: true
            },
            position: {
              my: 'top center',
              at: 'bottom center',
              adjust: {
                cyViewport: true
              },
              effect: false
            },
            style: {
              classes: 'qtip-bootstrap',
              tip: {
                width: 16,
                height: 8
              }
            }
          });
        });

        var cancelSelection;
        var selectAgain;
        cy.on('select', 'node', function (event) {
          if (cancelSelection) {
            this.unselect();
            cancelSelection = null;
            selectAgain.select();
            selectAgain = null;
          }
        });

        cy.on('tap', function (event) {
          if (modeHandler.mode == "add-node-mode") {
            var cyPosX = event.cyPosition.x;
            var cyPosY = event.cyPosition.y;
            var param = {};
//            var sbgnclass = $("#node-list").data('ddslick').selectedData.value;
            var sbgnclass = modeHandler.elementsHTMLNameToName[modeHandler.selectedNodeType];
            param.newNode = {
              x: cyPosX,
              y: cyPosY,
              sbgnclass: sbgnclass
            };
            param.firstTime = true;

            editorActionsManager._do(new AddNodeCommand(param));
            refreshUndoRedoButtonsStatus();
          }
        });

        cy.on('tap', 'node', function (event) {
          var node = this;
          //Handle expand-collapse box
          var cyPosX = event.cyPosition.x;
          var cyPosY = event.cyPosition.y;

          if (cyPosX >= node._private.data.expandcollapseStartX
                  && cyPosX <= node._private.data.expandcollapseEndX
                  && cyPosY >= node._private.data.expandcollapseStartY
                  && cyPosY <= node._private.data.expandcollapseEndY) {
            node.children().unselect();
            node.children().connectedEdges().unselect();
            selectAgain = cy.filter(":selected");
            cancelSelection = true;
            var expandedOrcollapsed = this.css('expanded-collapsed');

            if (window.incrementalLayoutAfterExpandCollapse == null) {
              window.incrementalLayoutAfterExpandCollapse =
                      (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
            }

            if (expandedOrcollapsed == 'expanded') {
//              expandCollapseUtilities.collapseNode(this);
              if (incrementalLayoutAfterExpandCollapse)
                editorActionsManager._do(new CollapseNodeCommand(this));
              else
                editorActionsManager._do(new SimpleCollapseNodeCommand(this));
              refreshUndoRedoButtonsStatus();
            }
            else {
              if (incrementalLayoutAfterExpandCollapse)
                editorActionsManager._do(new ExpandNodeCommand(this));
              else
                editorActionsManager._do(new SimpleExpandNodeCommand(this));
              refreshUndoRedoButtonsStatus();
//              expandCollapseUtilities.expandNode(this);
            }
          }

          $(".qtip").remove();

          if (event.originalEvent.shiftKey)
            return;

          if (node.qtipTimeOutFcn != null) {
            clearTimeout(node.qtipTimeOutFcn);
            node.qtipTimeOutFcn = null;
          }

          nodeQtipFunction(node);

        });
      }
    };
    container.html("");
    container.cy(cyOptions);
    return this;
  }
});

var SBGNLayout = Backbone.View.extend({
  defaultLayoutProperties: {
    name: 'cose2',
    nodeRepulsion: 4500,
    nodeOverlap: 10,
    idealEdgeLength: 50,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.4,
    numIter: 2500,
    tile: true,
    animate: true,
    randomize: true
  },
  currentLayoutProperties: null,
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
  },
  copyProperties: function () {
    this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
  },
  applyLayout: function () {
    var options = this.currentLayoutProperties;
    options.fit = options.randomize;
    cy.elements().filter(':visible').layout(options);
  },
  applyIncrementalLayout: function () {
    var options = _.clone(this.currentLayoutProperties);
    options.randomize = false;
    options.animate = false;
    options.fit = false;
    cy.elements().filter(':visible').layout(options);
  },
  render: function () {
    var self = this;
    self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
    $(self.el).html(self.template);

    $(self.el).dialog();

    $("#save-layout").die("click").live("click", function (evt) {
      self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
      self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap").value);
      self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
      self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
      self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
      self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
      self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
      self.currentLayoutProperties.tile = document.getElementById("tile").checked;
      self.currentLayoutProperties.animate = document.getElementById("animate").checked;
      self.currentLayoutProperties.randomize = !document.getElementById("incremental").checked;

      $(self.el).dialog('close');
    });

    $("#default-layout").die("click").live("click", function (evt) {
      self.copyProperties();
      self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});

var SBGNProperties = Backbone.View.extend({
  defaultSBGNProperties: {
    compoundPadding: parseInt(sbgnStyleRules['compound-padding'], 10),
    dynamicLabelSize: sbgnStyleRules['dynamic-label-size'],
    fitLabelsToNodes: (sbgnStyleRules['fit-labels-to-nodes'] == 'true'),
    incrementalLayoutAfterExpandCollapse: (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true')
  },
  currentSBGNProperties: null,
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
  },
  copyProperties: function () {
    this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
  },
  render: function () {
    var self = this;
    self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
    $(self.el).html(self.template);

    $(self.el).dialog();

    $("#save-sbgn").die("click").live("click", function (evt) {

      var param = {};
      param.firstTime = true;
      param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

      self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
      self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
      self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
      self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse =
              document.getElementById("incremental-layout-after-expand-collapse").checked;

      //Refresh paddings if needed
      if (compoundPadding != self.currentSBGNProperties.compoundPadding) {
        compoundPadding = self.currentSBGNProperties.compoundPadding;
        refreshPaddings();
      }
      //Refresh label size if needed
      if (dynamicLabelSize != self.currentSBGNProperties.dynamicLabelSize) {
        dynamicLabelSize = self.currentSBGNProperties.dynamicLabelSize;
        cy.forceRender();
      }
      //Refresh truncations if needed
      if (fitLabelsToNodes != self.currentSBGNProperties.fitLabelsToNodes) {
        fitLabelsToNodes = self.currentSBGNProperties.fitLabelsToNodes;
        cy.forceRender();
      }

      window.incrementalLayoutAfterExpandCollapse =
              self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse;

      $(self.el).dialog('close');
    });

    $("#default-sbgn").die("click").live("click", function (evt) {
      self.copyProperties();
      self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});
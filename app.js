(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var sbgnviz = require('./sbgnviz');
var libs = {};

// The code segment below to be removed if it will not be utilized
/*
var $ = libs['jQuery'] = window.jQuery = window.$ = require('jQuery');
//require('jquery.browser');
//require('./lib/js/jquery.fancybox-1.3.4')($);
require('jquery-expander')($);
require('qtip2'); // Check it
require('bootstrap');
//    Check it most probably it should be included in html
//require('jquery-ui-bundle')($);
var _ = window._ = require('underscore');
window.Backbone = require('backbone');
var cytoscape = window.cytoscape = libs['cytoscape'] = require('./lib/js/cytoscape');
//    Check it most probably it should be included in html
require('filesaverjs');

Backbone.$ = jQuery; */

libs['cytoscape-panzoom'] = require('cytoscape-panzoom');
libs['cytoscape-qtip'] = require('cytoscape-qtip');
libs['cytoscape-cose-bilkent'] = require('cytoscape-cose-bilkent');
libs['cytoscape-undo-redo'] = require('cytoscape-undo-redo');
libs['cytoscape-clipboard'] = require('cytoscape-clipboard');
libs['cytoscape-context-menus'] = require('cytoscape-context-menus');
libs['cytoscape-expand-collapse'] = require('cytoscape-expand-collapse');
libs['cytoscape-edge-bend-editing'] = require('cytoscape-edge-bend-editing');
libs['cytoscape-view-utilities'] = require('cytoscape-view-utilities');

sbgnviz(libs);
},{"./sbgnviz":11,"cytoscape-clipboard":2,"cytoscape-context-menus":3,"cytoscape-cose-bilkent":4,"cytoscape-edge-bend-editing":5,"cytoscape-expand-collapse":6,"cytoscape-panzoom":7,"cytoscape-qtip":8,"cytoscape-undo-redo":9,"cytoscape-view-utilities":10}],2:[function(require,module,exports){
;(function () {
    'use strict';

    // registers the extension on a cytoscape lib ref
    var register = function (cytoscape) {

        if (!cytoscape) {
            return;
        } // can't register if cytoscape unspecified


        var _instance;
        cytoscape('core', 'clipboard', function (opts) {
            var cy = this;

            var options = {
                clipboardSize: 0
            };

            $.extend(true, options, opts);


            function getScratch() {
                if (!cy.scratch("_clipboard")) {
                    cy.scratch("_clipboard", { });

                }
                return cy.scratch("_clipboard");
            }

            var counter = 0;

            function guid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }


            function getItemId(last) {
                return last ? "item_" + counter : "item_" + (++counter);
            }

            function getCloneId() {
                return guid();
            }


            var oldIdToNewId = {};

            function changeIds(jsons) {
                jsons = $.extend(true, [], jsons);
                for (var i = 0; i < jsons.length; i++) {
                    var jsonFirst = jsons[i];
                    var id = getCloneId();
                    oldIdToNewId[jsonFirst.data.id] = id;
                    jsonFirst.data.id = id;
                }

                for (var j = 0; j < jsons.length; j++) {
                    var json = jsons[j];
                    var fields = ["source", "target", "parent"];
                    for (var k = 0; k < fields.length; k++) {
                        var field = fields[k];
                        if (json.data[field] && oldIdToNewId[json.data[field]])
                            json.data[field] = oldIdToNewId[json.data[field]];


                    }
                    if (json.position.x) {
                        json.position.x += 50;
                        json.position.y += 50;
                    }
                }

                return jsons;

            }

            if (!getScratch().isInitialized) {
                getScratch().isInitialized = true;
                var ur;
                var clipboard = {};

                _instance = {
                    copy: function (eles, _id) {
                        var id = _id ? _id : getItemId();
                        eles.unselect();
                        var descs = eles.nodes().descendants();
                        var nodes = eles.nodes().union(descs).filter(":visible");
                        var edges = nodes.edgesWith(nodes).filter(":visible");

                        clipboard[id] = {nodes: nodes.jsons(), edges: edges.jsons()};
                        return id;
                    },
                    paste: function (_id) {
                        var id = _id ? _id : getItemId(true);
                        var res = cy.collection();
                        if (clipboard[id]) {
                            var nodes = changeIds(clipboard[id].nodes);
                            var edges = changeIds(clipboard[id].edges);
                            oldIdToNewId = {};
                            cy.batch(function () {
                                res = cy.add(nodes).union(cy.add(edges));
                                res.select();
                            });

                        }
                        return res;
                    }
                };

                if (cy.undoRedo) {
                    ur = cy.undoRedo({}, true);
                    ur.action("paste", function (eles) {
                        return eles.firstTime ? _instance.paste(eles.id) : eles.restore();
                    }, function (eles) {
                        return eles.remove();
                    });
                }

            }
            return _instance; // chainability
        });

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-clipboard', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape);
    }

})();

},{}],3:[function(require,module,exports){
;(function(){ 'use strict';

  var $ = typeof jQuery === typeof undefined ? null : jQuery;

  var register = function( cytoscape, $ ){
    
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified
    var cy;
    
    var defaults = {
      // List of initial menu items
      menuItems: [
        /*
        {
          id: 'remove',
          title: 'remove',
          selector: 'node, edge',
          onClickFunction: function () {
            console.log('remove element');
          },
          hasTrailingDivider: true
        },
        {
          id: 'hide',
          title: 'hide',
          selector: 'node, edge',
          onClickFunction: function () {
            console.log('hide element');
          },
          disabled: true
        }*/
      ],
      // css classes that menu items will have
      menuItemClasses: [
        // add class names to this list
      ],
      // css classes that context menu will have
      contextMenuClasses: [
        // add class names to this list
      ]
    };
    
    var options;
    var $cxtMenu;
    var menuItemCSSClass = 'cy-context-menus-cxt-menuitem';
    var dividerCSSClass = 'cy-context-menus-divider';
    var eventCyTapStart;
    var active = false;

    // Merge default options with the ones coming from parameter
    function extend(defaults, options) {
      var obj = {};

      for (var i in defaults) {
        obj[i] = defaults[i];
      }

      for (var i in options) {
        obj[i] = options[i];
      }

      return obj;
    };
    
    function preventDefaultContextTap() {
      $("#cy-context-menus-cxt-menu").contextmenu( function() {
          return false;
      });
    }
    
    // Get string representation of css classes
    function getMenuItemClassStr(classes, hasTrailingDivider) {
      var str = getClassStr(classes);
      
      str += ' ' + menuItemCSSClass;
      
      if(hasTrailingDivider) {
        str += ' ' + dividerCSSClass;
      }
      
      return str;
    }
    
    // Get string representation of css classes
    function getClassStr(classes) {
      var str = '';
      
      for( var i = 0; i < classes.length; i++ ) {
        var className = classes[i];
        str += className;
        if(i !== classes.length - 1) {
          str += ' ';
        }
      }
      
      return str;
    }
    
    function displayComponent($component) {
      $component.css('display', 'block');
    }
    
    function hideComponent($component) {
      $component.css('display', 'none');
    }
    
    function hideMenuItemComponents() {
      $cxtMenu.children().css('display', 'none');
    }
    
    function bindOnClickFunction($component, onClickFcn) {
      var callOnClickFcn;
      
      $component.on('click', callOnClickFcn = function() {
        onClickFcn(cy.scratch('currentCyEvent'));
      });
      
      $component.data('call-on-click-function', callOnClickFcn); 
    }
    
    function bindCyCxttap($component, selector, coreAsWell) {
      var cxtfcn;
      var cxtCoreFcn;
      
      if(coreAsWell) {
        cy.on('cxttap', cxtCoreFcn = function(event) {
          if( event.cyTarget != cy ) {
            return;
          }
          
          cy.scratch('currentCyEvent', event);
          adjustCxtMenu(event);
          displayComponent($component);
        });
      }
      
      if(selector) {
        cy.on('cxttap', selector, cxtfcn = function(event) {
          cy.scratch('currentCyEvent', event);
          adjustCxtMenu(event);
          displayComponent($component);
        });
      }
      
      // Bind the event to menu item to be able to remove it back
      $component.data('cy-context-menus-cxtfcn', cxtfcn);
      $component.data('cy-context-menus-cxtcorefcn', cxtCoreFcn);
    }
    
    function bindCyEvents() {
      cy.on('tapstart', eventCyTapStart = function(){
        hideComponent($cxtMenu);
        cy.removeScratch('cxtMenuPosition');
        cy.removeScratch('currentCyEvent');
      });
    }
    
    function performBindings($component, onClickFcn, selector, coreAsWell) {
      bindOnClickFunction($component, onClickFcn);
      bindCyCxttap($component, selector, coreAsWell);
    }
    
    // Adjusts context menu if necessary
    function adjustCxtMenu(event) {
      var currentCxtMenuPosition = cy.scratch('cxtMenuPosition');
      
      if( currentCxtMenuPosition != event.cyPosition ) {
        hideMenuItemComponents();
        cy.scratch('cxtMenuPosition', event.cyPosition);
        
        var containerPos = $(cy.container()).position();

        var left = containerPos.left + event.cyRenderedPosition.x;
        var top = containerPos.top + event.cyRenderedPosition.y;
        
        displayComponent($cxtMenu);
        $cxtMenu.css('left', left);
        $cxtMenu.css('top', top);
      }
    }
    
    function createAndAppendMenuItemComponents(menuItems) {
      for (var i = 0; i < menuItems.length; i++) {
        createAndAppendMenuItemComponent(menuItems[i]);
      }
    }
    
    function createAndAppendMenuItemComponent(menuItem) {
      // Create and append menu item
      var $menuItemComponent = createMenuItemComponent(menuItem);
      appendComponentToCxtMenu($menuItemComponent);
      
      performBindings($menuItemComponent, menuItem.onClickFunction, menuItem.selector, menuItem.coreAsWell);
    }//insertComponentBeforeExistingItem(component, existingItemID)
    
    function createAndInsertMenuItemComponentBeforeExistingComponent(menuItem, existingComponentID) {
      // Create and insert menu item
      var $menuItemComponent = createMenuItemComponent(menuItem);
      insertComponentBeforeExistingItem($menuItemComponent, existingComponentID);
      
      performBindings($menuItemComponent, menuItem.onClickFunction, menuItem.selector, menuItem.coreAsWell);
    }
    
    // create cxtMenu and append it to body
    function createAndAppendCxtMenuComponent() {
      var classes = getClassStr(options.contextMenuClasses);
      $cxtMenu = $('<div id="cy-context-menus-cxt-menu" class=' + classes + '></div>');
      $('body').append($cxtMenu);
      
      return $cxtMenu;
    }
    
    // Creates a menu item as an html component
    function createMenuItemComponent(item) {
      var classStr = getMenuItemClassStr(options.menuItemClasses, item.hasTrailingDivider);
      var itemStr = '<button id="' + item.id + '" title="' + item.title + '" class="' + classStr + '"';
      
      if(item.disabled) {
        itemStr += ' disabled';
      }
      
      itemStr += '></button>';
      var $menuItemComponent = $(itemStr);
      
      $menuItemComponent.data('selector', item.selector); 
      $menuItemComponent.data('on-click-function', item.onClickFunction); 
      
      return $menuItemComponent;
    }
    
    // Appends the given component to cxtMenu
    function appendComponentToCxtMenu(component) {
      $cxtMenu.append(component);
      bindMenuItemClickFunction(component);
    }
    
    // Insert the given component to cxtMenu just before the existing item with given ID
    function insertComponentBeforeExistingItem(component, existingItemID) {
      var $existingItem = $('#' + existingItemID);
      component.insertBefore($existingItem);
    }
    
    function destroyCxtMenu() {
      if(!active) {
        return;
      }
      
      removeAndUnbindMenuItems();
      
      cy.off('tapstart', eventCyTapStart);
      
      $cxtMenu.remove();
      $cxtMenu = undefined;
      active = false;
    }
   
    function removeAndUnbindMenuItems() {
      var children = $cxtMenu.children();
      
      $(children).each(function() {
        removeAndUnbindMenuItem($(this));
      });
    }
    
    function removeAndUnbindMenuItem(itemID) {
      var $component = typeof itemID === 'string' ? $('#' + itemID) : itemID;
      var cxtfcn = $component.data('cy-context-menus-cxtfcn');
      var selector = $component.data('selector');
      var callOnClickFcn = $component.data('call-on-click-function');
      var cxtCoreFcn = $component.data('cy-context-menus-cxtcorefcn');
      
      if(cxtfcn) {
        cy.off('cxttap', selector, cxtfcn);
      }
      
      if(cxtCoreFcn) {
        cy.off('cxttap', cxtCoreFcn);
      }
      
      if(callOnClickFcn) {
        $component.off('click', callOnClickFcn);
      }
      
      $component.remove();
    }
    
    function moveBeforeOtherMenuItemComponent(componentID, existingComponentID) {
      if( componentID === existingComponentID ) {
        return;
      }
      
      var $component = $('#' + componentID).detach();
      var $existingComponent = $('#' + existingComponentID);
      
      $component.insertBefore($existingComponent);
    }
    
    function bindMenuItemClickFunction(component) {
      component.click( function() {
          hideComponent($cxtMenu);
          cy.removeScratch('cxtMenuPosition');
      });
    }
    
    function disableComponent(componentID) {
      $('#' + componentID).attr('disabled', true);
    }
    
    function enableComponent(componentID) {
      $('#' + componentID).attr('disabled', false);
    }
    
    function setTrailingDivider(componentID, status) {
      var $component = $('#' + componentID);
      if(status) {
        $component.addClass(dividerCSSClass);
      }
      else {
        $component.removeClass(dividerCSSClass);
      }
    }
    
    // Get an extension instance to enable users to access extension methods
    function getInstance(cy) {
      var instance = {
        // Returns whether the extension is active
       isActive: function() {
         return active;
       },
       // Appends given menu item to the menu items list.
       appendMenuItem: function(item) {
         createAndAppendMenuItemComponent(item);
         return cy;
       },
       // Appends menu items in the given list to the menu items list.
       appendMenuItems: function(items) {
         createAndAppendMenuItemComponents(items);
         return cy;
       },
       // Removes the menu item with given ID.
       removeMenuItem: function(itemID) {
         removeAndUnbindMenuItem(itemID);
         return cy;
       },
       // Sets whether the menuItem with given ID will have a following divider.
       setTrailingDivider: function(itemID, status) {
         setTrailingDivider(itemID, status);
         return cy;
       },
       // Inserts given item before the existingitem.
       insertBeforeMenuItem: function(item, existingItemID) {
         createAndInsertMenuItemComponentBeforeExistingComponent(item, existingItemID);
         return cy;
       },
       // Moves the item with given ID before the existingitem.
       moveBeforeOtherMenuItem: function(itemID, existingItemID) {
         moveBeforeOtherMenuItemComponent(itemID, existingItemID);
         return cy;
       },
       // Disables the menu item with given ID.
       disableMenuItem: function(itemID) {
         disableComponent(itemID);
         return cy;
       },
       // Enables the menu item with given ID.
       enableMenuItem: function(itemID) {
         enableComponent(itemID);
         return cy;
       },
       // Destroys the extension instance
       destroy: function() {
         destroyCxtMenu();
         return cy;
       }
      };
      
      return instance;
    }
    
    // To initialize with options.
    cytoscape('core', 'contextMenus', function (opts) {
      cy = this;

      if ( opts !== 'get' ) {
        // merge the options with default ones
        options = extend(defaults, opts);

        // Clear old context menu if needed
        if(active) {
          destroyCxtMenu();
        }

        active = true;

        $cxtMenu = createAndAppendCxtMenuComponent();

        var menuItems = options.menuItems;
        createAndAppendMenuItemComponents(menuItems);

        bindCyEvents();
        preventDefaultContextTap();
      }
      
      return getInstance(this);
    });
  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-context-menus', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' && $ ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, $ );
  }

})();

},{}],4:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeCoseBilkent = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function CoSEConstants() {
}

//CoSEConstants inherits static props in FDLayoutConstants
for (var prop in FDLayoutConstants) {
  CoSEConstants[prop] = FDLayoutConstants[prop];
}

CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;

module.exports = CoSEConstants;

},{"./FDLayoutConstants":9}],2:[function(_dereq_,module,exports){
var FDLayoutEdge = _dereq_('./FDLayoutEdge');

function CoSEEdge(source, target, vEdge) {
  FDLayoutEdge.call(this, source, target, vEdge);
}

CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
for (var prop in FDLayoutEdge) {
  CoSEEdge[prop] = FDLayoutEdge[prop];
}

module.exports = CoSEEdge

},{"./FDLayoutEdge":10}],3:[function(_dereq_,module,exports){
var LGraph = _dereq_('./LGraph');

function CoSEGraph(parent, graphMgr, vGraph) {
  LGraph.call(this, parent, graphMgr, vGraph);
}

CoSEGraph.prototype = Object.create(LGraph.prototype);
for (var prop in LGraph) {
  CoSEGraph[prop] = LGraph[prop];
}

module.exports = CoSEGraph;

},{"./LGraph":18}],4:[function(_dereq_,module,exports){
var LGraphManager = _dereq_('./LGraphManager');

function CoSEGraphManager(layout) {
  LGraphManager.call(this, layout);
}

CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
for (var prop in LGraphManager) {
  CoSEGraphManager[prop] = LGraphManager[prop];
}

module.exports = CoSEGraphManager;

},{"./LGraphManager":19}],5:[function(_dereq_,module,exports){
var FDLayout = _dereq_('./FDLayout');
var CoSEGraphManager = _dereq_('./CoSEGraphManager');
var CoSEGraph = _dereq_('./CoSEGraph');
var CoSENode = _dereq_('./CoSENode');
var CoSEEdge = _dereq_('./CoSEEdge');

function CoSELayout() {
  FDLayout.call(this);
}

CoSELayout.prototype = Object.create(FDLayout.prototype);

for (var prop in FDLayout) {
  CoSELayout[prop] = FDLayout[prop];
}

CoSELayout.prototype.newGraphManager = function () {
  var gm = new CoSEGraphManager(this);
  this.graphManager = gm;
  return gm;
};

CoSELayout.prototype.newGraph = function (vGraph) {
  return new CoSEGraph(null, this.graphManager, vGraph);
};

CoSELayout.prototype.newNode = function (vNode) {
  return new CoSENode(this.graphManager, vNode);
};

CoSELayout.prototype.newEdge = function (vEdge) {
  return new CoSEEdge(null, null, vEdge);
};

CoSELayout.prototype.initParameters = function () {
  FDLayout.prototype.initParameters.call(this, arguments);
  if (!this.isSubLayout) {
    if (CoSEConstants.DEFAULT_EDGE_LENGTH < 10)
    {
      this.idealEdgeLength = 10;
    }
    else
    {
      this.idealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
    }

    this.useSmartIdealEdgeLengthCalculation =
            CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
    this.springConstant =
            FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
    this.repulsionConstant =
            FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
    this.gravityConstant =
            FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
    this.compoundGravityConstant =
            FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
    this.gravityRangeFactor =
            FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
    this.compoundGravityRangeFactor =
            FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
  }
};

CoSELayout.prototype.layout = function () {
  var createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  if (createBendsAsNeeded)
  {
    this.createBendpoints();
    this.graphManager.resetAllEdges();
  }

  this.level = 0;
  return this.classicLayout();
};

CoSELayout.prototype.classicLayout = function () {
  this.calculateNodesToApplyGravitationTo();
  this.graphManager.calcLowestCommonAncestors();
  this.graphManager.calcInclusionTreeDepths();
  this.graphManager.getRoot().calcEstimatedSize();
  this.calcIdealEdgeLengths();
  if (!this.incremental)
  {
    var forest = this.getFlatForest();

    // The graph associated with this layout is flat and a forest
    if (forest.length > 0)

    {
      this.positionNodesRadially(forest);
    }
    // The graph associated with this layout is not flat or a forest
    else
    {
      this.positionNodesRandomly();
    }
  }

  this.initSpringEmbedder();
  this.runSpringEmbedder();

  console.log("Classic CoSE layout finished after " +
          this.totalIterations + " iterations");

  return true;
};

CoSELayout.prototype.runSpringEmbedder = function () {
  var lastFrame = new Date().getTime();
  var initialAnimationPeriod = 25;
  var animationPeriod = initialAnimationPeriod;
  do
  {
    this.totalIterations++;

    if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0)
    {
      if (this.isConverged())
      {
        break;
      }

      this.coolingFactor = this.initialCoolingFactor *
              ((this.maxIterations - this.totalIterations) / this.maxIterations);
      animationPeriod = Math.ceil(initialAnimationPeriod * Math.sqrt(this.coolingFactor));

    }
    this.totalDisplacement = 0;
    this.graphManager.updateBounds();
    this.calcSpringForces();
    this.calcRepulsionForces();
    this.calcGravitationalForces();
    this.moveNodes();
    this.animate();
    if (FDLayoutConstants.ANIMATE === 'during' && this.totalIterations % animationPeriod == 0) {
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - lastFrame) > 25) {
          break;
        }
      }
      lastFrame = new Date().getTime();
      var allNodes = this.graphManager.getAllNodes();
      var pData = {};
      for (var i = 0; i < allNodes.length; i++) {
        var rect = allNodes[i].rect;
        var id = allNodes[i].id;
        pData[id] = {
          id: id,
          x: rect.getCenterX(),
          y: rect.getCenterY(),
          w: rect.width,
          h: rect.height
        };
      }
      broadcast({pData: pData});
    }
  }
  while (this.totalIterations < this.maxIterations);

  this.graphManager.updateBounds();
};

CoSELayout.prototype.calculateNodesToApplyGravitationTo = function () {
  var nodeList = [];
  var graph;

  var graphs = this.graphManager.getGraphs();
  var size = graphs.length;
  var i;
  for (i = 0; i < size; i++)
  {
    graph = graphs[i];

    graph.updateConnected();

    if (!graph.isConnected)
    {
      nodeList = nodeList.concat(graph.getNodes());
    }
  }

  this.graphManager.setAllNodesToApplyGravitation(nodeList);
};

CoSELayout.prototype.createBendpoints = function () {
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  var visited = new HashSet();
  var i;
  for (i = 0; i < edges.length; i++)
  {
    var edge = edges[i];

    if (!visited.contains(edge))
    {
      var source = edge.getSource();
      var target = edge.getTarget();

      if (source == target)
      {
        edge.getBendpoints().push(new PointD());
        edge.getBendpoints().push(new PointD());
        this.createDummyNodesForBendpoints(edge);
        visited.add(edge);
      }
      else
      {
        var edgeList = [];

        edgeList = edgeList.concat(source.getEdgeListToNode(target));
        edgeList = edgeList.concat(target.getEdgeListToNode(source));

        if (!visited.contains(edgeList[0]))
        {
          if (edgeList.length > 1)
          {
            var k;
            for (k = 0; k < edgeList.length; k++)
            {
              var multiEdge = edgeList[k];
              multiEdge.getBendpoints().push(new PointD());
              this.createDummyNodesForBendpoints(multiEdge);
            }
          }
          visited.addAll(list);
        }
      }
    }

    if (visited.size() == edges.length)
    {
      break;
    }
  }
};

CoSELayout.prototype.positionNodesRadially = function (forest) {
  // We tile the trees to a grid row by row; first tree starts at (0,0)
  var currentStartingPoint = new Point(0, 0);
  var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
  var height = 0;
  var currentY = 0;
  var currentX = 0;
  var point = new PointD(0, 0);

  for (var i = 0; i < forest.length; i++)
  {
    if (i % numberOfColumns == 0)
    {
      // Start of a new row, make the x coordinate 0, increment the
      // y coordinate with the max height of the previous row
      currentX = 0;
      currentY = height;

      if (i != 0)
      {
        currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
      }

      height = 0;
    }

    var tree = forest[i];

    // Find the center of the tree
    var centerNode = Layout.findCenterOfTree(tree);

    // Set the staring point of the next tree
    currentStartingPoint.x = currentX;
    currentStartingPoint.y = currentY;

    // Do a radial layout starting with the center
    point =
            CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);

    if (point.y > height)
    {
      height = Math.floor(point.y);
    }

    currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
  }

  this.transform(
          new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2,
                  LayoutConstants.WORLD_CENTER_Y - point.y / 2));
};

CoSELayout.radialLayout = function (tree, centerNode, startingPoint) {
  var radialSep = Math.max(this.maxDiagonalInTree(tree),
          CoSEConstants.DEFAULT_RADIAL_SEPARATION);
  CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
  var bounds = LGraph.calculateBounds(tree);

  var transform = new Transform();
  transform.setDeviceOrgX(bounds.getMinX());
  transform.setDeviceOrgY(bounds.getMinY());
  transform.setWorldOrgX(startingPoint.x);
  transform.setWorldOrgY(startingPoint.y);

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    node.transform(transform);
  }

  var bottomRight =
          new PointD(bounds.getMaxX(), bounds.getMaxY());

  return transform.inverseTransformPoint(bottomRight);
};

CoSELayout.branchRadialLayout = function (node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
  // First, position this node by finding its angle.
  var halfInterval = ((endAngle - startAngle) + 1) / 2;

  if (halfInterval < 0)
  {
    halfInterval += 180;
  }

  var nodeAngle = (halfInterval + startAngle) % 360;
  var teta = (nodeAngle * IGeometry.TWO_PI) / 360;

  // Make polar to java cordinate conversion.
  var cos_teta = Math.cos(teta);
  var x_ = distance * Math.cos(teta);
  var y_ = distance * Math.sin(teta);

  node.setCenter(x_, y_);

  // Traverse all neighbors of this node and recursively call this
  // function.
  var neighborEdges = [];
  neighborEdges = neighborEdges.concat(node.getEdges());
  var childCount = neighborEdges.length;

  if (parentOfNode != null)
  {
    childCount--;
  }

  var branchCount = 0;

  var incEdgesCount = neighborEdges.length;
  var startIndex;

  var edges = node.getEdgesBetween(parentOfNode);

  // If there are multiple edges, prune them until there remains only one
  // edge.
  while (edges.length > 1)
  {
    //neighborEdges.remove(edges.remove(0));
    var temp = edges[0];
    edges.splice(0, 1);
    var index = neighborEdges.indexOf(temp);
    if (index >= 0) {
      neighborEdges.splice(index, 1);
    }
    incEdgesCount--;
    childCount--;
  }

  if (parentOfNode != null)
  {
    //assert edges.length == 1;
    startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
  }
  else
  {
    startIndex = 0;
  }

  var stepAngle = Math.abs(endAngle - startAngle) / childCount;

  for (var i = startIndex;
          branchCount != childCount;
          i = (++i) % incEdgesCount)
  {
    var currentNeighbor =
            neighborEdges[i].getOtherEnd(node);

    // Don't back traverse to root node in current tree.
    if (currentNeighbor == parentOfNode)
    {
      continue;
    }

    var childStartAngle =
            (startAngle + branchCount * stepAngle) % 360;
    var childEndAngle = (childStartAngle + stepAngle) % 360;

    CoSELayout.branchRadialLayout(currentNeighbor,
            node,
            childStartAngle, childEndAngle,
            distance + radialSeparation, radialSeparation);

    branchCount++;
  }
};

CoSELayout.maxDiagonalInTree = function (tree) {
  var maxDiagonal = Integer.MIN_VALUE;

  for (var i = 0; i < tree.length; i++)
  {
    var node = tree[i];
    var diagonal = node.getDiagonal();

    if (diagonal > maxDiagonal)
    {
      maxDiagonal = diagonal;
    }
  }

  return maxDiagonal;
};

CoSELayout.prototype.calcRepulsionRange = function () {
  // formula is 2 x (level + 1) x idealEdgeLength
  return (2 * (this.level + 1) * this.idealEdgeLength);
};

module.exports = CoSELayout;

},{"./CoSEEdge":2,"./CoSEGraph":3,"./CoSEGraphManager":4,"./CoSENode":6,"./FDLayout":8}],6:[function(_dereq_,module,exports){
var FDLayoutNode = _dereq_('./FDLayoutNode');

function CoSENode(gm, loc, size, vNode) {
  FDLayoutNode.call(this, gm, loc, size, vNode);
}


CoSENode.prototype = Object.create(FDLayoutNode.prototype);
for (var prop in FDLayoutNode) {
  CoSENode[prop] = FDLayoutNode[prop];
}

CoSENode.prototype.move = function ()
{
  var layout = this.graphManager.getLayout();
  this.displacementX = layout.coolingFactor *
          (this.springForceX + this.repulsionForceX + this.gravitationForceX);
  this.displacementY = layout.coolingFactor *
          (this.springForceY + this.repulsionForceY + this.gravitationForceY);


  if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementX);
  }

  if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement)
  {
    this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement *
            IMath.sign(this.displacementY);
  }

  // a simple node, just move it
  if (this.child == null)
  {
    this.moveBy(this.displacementX, this.displacementY);
  }
  // an empty compound node, again just move it
  else if (this.child.getNodes().length == 0)
  {
    this.moveBy(this.displacementX, this.displacementY);
  }
  // non-empty compound node, propogate movement to children as well
  else
  {
    this.propogateDisplacementToChildren(this.displacementX,
            this.displacementY);
  }

  layout.totalDisplacement +=
          Math.abs(this.displacementX) + Math.abs(this.displacementY);

  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  this.displacementX = 0;
  this.displacementY = 0;
};

CoSENode.prototype.propogateDisplacementToChildren = function (dX, dY)
{
  var nodes = this.getChild().getNodes();
  var node;
  for (var i = 0; i < nodes.length; i++)
  {
    node = nodes[i];
    if (node.getChild() == null)
    {
      node.moveBy(dX, dY);
      node.displacementX += dX;
      node.displacementY += dY;
    }
    else
    {
      node.propogateDisplacementToChildren(dX, dY);
    }
  }
};

CoSENode.prototype.setPred1 = function (pred1)
{
  this.pred1 = pred1;
};

CoSENode.prototype.getPred1 = function ()
{
  return pred1;
};

CoSENode.prototype.getPred2 = function ()
{
  return pred2;
};

CoSENode.prototype.setNext = function (next)
{
  this.next = next;
};

CoSENode.prototype.getNext = function ()
{
  return next;
};

CoSENode.prototype.setProcessed = function (processed)
{
  this.processed = processed;
};

CoSENode.prototype.isProcessed = function ()
{
  return processed;
};

module.exports = CoSENode;

},{"./FDLayoutNode":11}],7:[function(_dereq_,module,exports){
function DimensionD(width, height) {
  this.width = 0;
  this.height = 0;
  if (width !== null && height !== null) {
    this.height = height;
    this.width = width;
  }
}

DimensionD.prototype.getWidth = function ()
{
  return this.width;
};

DimensionD.prototype.setWidth = function (width)
{
  this.width = width;
};

DimensionD.prototype.getHeight = function ()
{
  return this.height;
};

DimensionD.prototype.setHeight = function (height)
{
  this.height = height;
};

module.exports = DimensionD;

},{}],8:[function(_dereq_,module,exports){
var Layout = _dereq_('./Layout');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function FDLayout() {
  Layout.call(this);

  this.useSmartIdealEdgeLengthCalculation = FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
  this.idealEdgeLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
  this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
  this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
  this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
  this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
  this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
  this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
  this.displacementThresholdPerNode = (3.0 * FDLayoutConstants.DEFAULT_EDGE_LENGTH) / 100;
  this.coolingFactor = 1.0;
  this.initialCoolingFactor = 1.0;
  this.totalDisplacement = 0.0;
  this.oldTotalDisplacement = 0.0;
  this.maxIterations = FDLayoutConstants.MAX_ITERATIONS;
}

FDLayout.prototype = Object.create(Layout.prototype);

for (var prop in Layout) {
  FDLayout[prop] = Layout[prop];
}

FDLayout.prototype.initParameters = function () {
  Layout.prototype.initParameters.call(this, arguments);

  if (this.layoutQuality == LayoutConstants.DRAFT_QUALITY)
  {
    this.displacementThresholdPerNode += 0.30;
    this.maxIterations *= 0.8;
  }
  else if (this.layoutQuality == LayoutConstants.PROOF_QUALITY)
  {
    this.displacementThresholdPerNode -= 0.30;
    this.maxIterations *= 1.2;
  }

  this.totalIterations = 0;
  this.notAnimatedIterations = 0;

//    this.useFRGridVariant = layoutOptionsPack.smartRepulsionRangeCalc;
};

FDLayout.prototype.calcIdealEdgeLengths = function () {
  var edge;
  var lcaDepth;
  var source;
  var target;
  var sizeOfSourceInLca;
  var sizeOfTargetInLca;

  var allEdges = this.getGraphManager().getAllEdges();
  for (var i = 0; i < allEdges.length; i++)
  {
    edge = allEdges[i];

    edge.idealLength = this.idealEdgeLength;

    if (edge.isInterGraph)
    {
      source = edge.getSource();
      target = edge.getTarget();

      sizeOfSourceInLca = edge.getSourceInLca().getEstimatedSize();
      sizeOfTargetInLca = edge.getTargetInLca().getEstimatedSize();

      if (this.useSmartIdealEdgeLengthCalculation)
      {
        edge.idealLength += sizeOfSourceInLca + sizeOfTargetInLca -
                2 * LayoutConstants.SIMPLE_NODE_SIZE;
      }

      lcaDepth = edge.getLca().getInclusionTreeDepth();

      edge.idealLength += FDLayoutConstants.DEFAULT_EDGE_LENGTH *
              FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR *
              (source.getInclusionTreeDepth() +
                      target.getInclusionTreeDepth() - 2 * lcaDepth);
    }
  }
};

FDLayout.prototype.initSpringEmbedder = function () {

  if (this.incremental)
  {
    this.coolingFactor = 0.8;
    this.initialCoolingFactor = 0.8;
    this.maxNodeDisplacement =
            FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL;
  }
  else
  {
    this.coolingFactor = 1.0;
    this.initialCoolingFactor = 1.0;
    this.maxNodeDisplacement =
            FDLayoutConstants.MAX_NODE_DISPLACEMENT;
  }

  this.maxIterations =
          Math.max(this.getAllNodes().length * 5, this.maxIterations);

  this.totalDisplacementThreshold =
          this.displacementThresholdPerNode * this.getAllNodes().length;

  this.repulsionRange = this.calcRepulsionRange();
};

FDLayout.prototype.calcSpringForces = function () {
  var lEdges = this.getAllEdges();
  var edge;

  for (var i = 0; i < lEdges.length; i++)
  {
    edge = lEdges[i];

    this.calcSpringForce(edge, edge.idealLength);
  }
};

FDLayout.prototype.calcRepulsionForces = function () {
  var i, j;
  var nodeA, nodeB;
  var lNodes = this.getAllNodes();

  for (i = 0; i < lNodes.length; i++)
  {
    nodeA = lNodes[i];

    for (j = i + 1; j < lNodes.length; j++)
    {
      nodeB = lNodes[j];

      // If both nodes are not members of the same graph, skip.
      if (nodeA.getOwner() != nodeB.getOwner())
      {
        continue;
      }

      this.calcRepulsionForce(nodeA, nodeB);
    }
  }
};

FDLayout.prototype.calcGravitationalForces = function () {
  var node;
  var lNodes = this.getAllNodesToApplyGravitation();

  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    this.calcGravitationalForce(node);
  }
};

FDLayout.prototype.moveNodes = function () {
  var lNodes = this.getAllNodes();
  var node;

  for (var i = 0; i < lNodes.length; i++)
  {
    node = lNodes[i];
    node.move();
  }
}

FDLayout.prototype.calcSpringForce = function (edge, idealLength) {
  var sourceNode = edge.getSource();
  var targetNode = edge.getTarget();

  var length;
  var springForce;
  var springForceX;
  var springForceY;

  // Update edge length
  if (this.uniformLeafNodeSizes &&
          sourceNode.getChild() == null && targetNode.getChild() == null)
  {
    edge.updateLengthSimple();
  }
  else
  {
    edge.updateLength();

    if (edge.isOverlapingSourceAndTarget)
    {
      return;
    }
  }

  length = edge.getLength();

  // Calculate spring forces
  springForce = this.springConstant * (length - idealLength);

  // Project force onto x and y axes
  springForceX = springForce * (edge.lengthX / length);
  springForceY = springForce * (edge.lengthY / length);

  // Apply forces on the end nodes
  sourceNode.springForceX += springForceX;
  sourceNode.springForceY += springForceY;
  targetNode.springForceX -= springForceX;
  targetNode.springForceY -= springForceY;
};

FDLayout.prototype.calcRepulsionForce = function (nodeA, nodeB) {
  var rectA = nodeA.getRect();
  var rectB = nodeB.getRect();
  var overlapAmount = new Array(2);
  var clipPoints = new Array(4);
  var distanceX;
  var distanceY;
  var distanceSquared;
  var distance;
  var repulsionForce;
  var repulsionForceX;
  var repulsionForceY;

  if (rectA.intersects(rectB))// two nodes overlap
  {
    // calculate separation amount in x and y directions
    IGeometry.calcSeparationAmount(rectA,
            rectB,
            overlapAmount,
            FDLayoutConstants.DEFAULT_EDGE_LENGTH / 2.0);

    repulsionForceX = overlapAmount[0];
    repulsionForceY = overlapAmount[1];
  }
  else// no overlap
  {
    // calculate distance

    if (this.uniformLeafNodeSizes &&
            nodeA.getChild() == null && nodeB.getChild() == null)// simply base repulsion on distance of node centers
    {
      distanceX = rectB.getCenterX() - rectA.getCenterX();
      distanceY = rectB.getCenterY() - rectA.getCenterY();
    }
    else// use clipping points
    {
      IGeometry.getIntersection(rectA, rectB, clipPoints);

      distanceX = clipPoints[2] - clipPoints[0];
      distanceY = clipPoints[3] - clipPoints[1];
    }

    // No repulsion range. FR grid variant should take care of this.
    if (Math.abs(distanceX) < FDLayoutConstants.MIN_REPULSION_DIST)
    {
      distanceX = IMath.sign(distanceX) *
              FDLayoutConstants.MIN_REPULSION_DIST;
    }

    if (Math.abs(distanceY) < FDLayoutConstants.MIN_REPULSION_DIST)
    {
      distanceY = IMath.sign(distanceY) *
              FDLayoutConstants.MIN_REPULSION_DIST;
    }

    distanceSquared = distanceX * distanceX + distanceY * distanceY;
    distance = Math.sqrt(distanceSquared);

    repulsionForce = this.repulsionConstant / distanceSquared;

    // Project force onto x and y axes
    repulsionForceX = repulsionForce * distanceX / distance;
    repulsionForceY = repulsionForce * distanceY / distance;
  }

  // Apply forces on the two nodes
  nodeA.repulsionForceX -= repulsionForceX;
  nodeA.repulsionForceY -= repulsionForceY;
  nodeB.repulsionForceX += repulsionForceX;
  nodeB.repulsionForceY += repulsionForceY;
};

FDLayout.prototype.calcGravitationalForce = function (node) {
  var ownerGraph;
  var ownerCenterX;
  var ownerCenterY;
  var distanceX;
  var distanceY;
  var absDistanceX;
  var absDistanceY;
  var estimatedSize;
  ownerGraph = node.getOwner();

  ownerCenterX = (ownerGraph.getRight() + ownerGraph.getLeft()) / 2;
  ownerCenterY = (ownerGraph.getTop() + ownerGraph.getBottom()) / 2;
  distanceX = node.getCenterX() - ownerCenterX;
  distanceY = node.getCenterY() - ownerCenterY;
  absDistanceX = Math.abs(distanceX);
  absDistanceY = Math.abs(distanceY);

  if (node.getOwner() == this.graphManager.getRoot())// in the root graph
  {
    Math.floor(80);
    estimatedSize = Math.floor(ownerGraph.getEstimatedSize() *
            this.gravityRangeFactor);

    if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
    {
      node.gravitationForceX = -this.gravityConstant * distanceX;
      node.gravitationForceY = -this.gravityConstant * distanceY;
    }
  }
  else// inside a compound
  {
    estimatedSize = Math.floor((ownerGraph.getEstimatedSize() *
            this.compoundGravityRangeFactor));

    if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
    {
      node.gravitationForceX = -this.gravityConstant * distanceX *
              this.compoundGravityConstant;
      node.gravitationForceY = -this.gravityConstant * distanceY *
              this.compoundGravityConstant;
    }
  }
};

FDLayout.prototype.isConverged = function () {
  var converged;
  var oscilating = false;

  if (this.totalIterations > this.maxIterations / 3)
  {
    oscilating =
            Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
  }

  converged = this.totalDisplacement < this.totalDisplacementThreshold;

  this.oldTotalDisplacement = this.totalDisplacement;

  return converged || oscilating;
};

FDLayout.prototype.animate = function () {
  if (this.animationDuringLayout && !this.isSubLayout)
  {
    if (this.notAnimatedIterations == this.animationPeriod)
    {
      this.update();
      this.notAnimatedIterations = 0;
    }
    else
    {
      this.notAnimatedIterations++;
    }
  }
};

FDLayout.prototype.calcRepulsionRange = function () {
  return 0.0;
};

module.exports = FDLayout;

},{"./FDLayoutConstants":9,"./Layout":22}],9:[function(_dereq_,module,exports){
var LayoutConstants = _dereq_('./LayoutConstants');

function FDLayoutConstants() {
}

//FDLayoutConstants inherits static props in LayoutConstants
for (var prop in LayoutConstants) {
  FDLayoutConstants[prop] = LayoutConstants[prop];
}

FDLayoutConstants.MAX_ITERATIONS = 2500;

FDLayoutConstants.DEFAULT_EDGE_LENGTH = 50;
FDLayoutConstants.DEFAULT_SPRING_STRENGTH = 0.45;
FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = 4500.0;
FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = 0.4;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1.0;
FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = 3.8;
FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100.0;
FDLayoutConstants.MAX_NODE_DISPLACEMENT = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
FDLayoutConstants.MIN_REPULSION_DIST = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 10.0;
FDLayoutConstants.CONVERGENCE_CHECK_PERIOD = 100;
FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
FDLayoutConstants.MIN_EDGE_LENGTH = 1;
FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD = 10;

module.exports = FDLayoutConstants;

},{"./LayoutConstants":23}],10:[function(_dereq_,module,exports){
var LEdge = _dereq_('./LEdge');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');

function FDLayoutEdge(source, target, vEdge) {
  LEdge.call(this, source, target, vEdge);
  this.idealLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
}

FDLayoutEdge.prototype = Object.create(LEdge.prototype);

for (var prop in LEdge) {
  FDLayoutEdge[prop] = LEdge[prop];
}

module.exports = FDLayoutEdge;

},{"./FDLayoutConstants":9,"./LEdge":17}],11:[function(_dereq_,module,exports){
var LNode = _dereq_('./LNode');

function FDLayoutNode(gm, loc, size, vNode) {
  // alternative constructor is handled inside LNode
  LNode.call(this, gm, loc, size, vNode);
  //Spring, repulsion and gravitational forces acting on this node
  this.springForceX = 0;
  this.springForceY = 0;
  this.repulsionForceX = 0;
  this.repulsionForceY = 0;
  this.gravitationForceX = 0;
  this.gravitationForceY = 0;
  //Amount by which this node is to be moved in this iteration
  this.displacementX = 0;
  this.displacementY = 0;

  //Start and finish grid coordinates that this node is fallen into
  this.startX = 0;
  this.finishX = 0;
  this.startY = 0;
  this.finishY = 0;

  //Geometric neighbors of this node
  this.surrounding = [];
}

FDLayoutNode.prototype = Object.create(LNode.prototype);

for (var prop in LNode) {
  FDLayoutNode[prop] = LNode[prop];
}

FDLayoutNode.prototype.setGridCoordinates = function (_startX, _finishX, _startY, _finishY)
{
  this.startX = _startX;
  this.finishX = _finishX;
  this.startY = _startY;
  this.finishY = _finishY;

};

module.exports = FDLayoutNode;

},{"./LNode":21}],12:[function(_dereq_,module,exports){
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');

function HashMap() {
  this.map = {};
  this.keys = [];
}

HashMap.prototype.put = function (key, value) {
  var theId = UniqueIDGeneretor.createID(key);
  if (!this.contains(theId)) {
    this.map[theId] = value;
    this.keys.push(key);
  }
};

HashMap.prototype.contains = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[key] != null;
};

HashMap.prototype.get = function (key) {
  var theId = UniqueIDGeneretor.createID(key);
  return this.map[theId];
};

HashMap.prototype.keySet = function () {
  return this.keys;
};

module.exports = HashMap;

},{"./UniqueIDGeneretor":29}],13:[function(_dereq_,module,exports){
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');

function HashSet() {
  this.set = {};
}
;

HashSet.prototype.add = function (obj) {
  var theId = UniqueIDGeneretor.createID(obj);
  if (!this.contains(theId))
    this.set[theId] = obj;
};

HashSet.prototype.remove = function (obj) {
  delete this.set[UniqueIDGeneretor.createID(obj)];
};

HashSet.prototype.clear = function () {
  this.set = {};
};

HashSet.prototype.contains = function (obj) {
  return this.set[UniqueIDGeneretor.createID(obj)] == obj;
};

HashSet.prototype.isEmpty = function () {
  return this.size() === 0;
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

//concats this.set to the given list
HashSet.prototype.addAllTo = function (list) {
  var keys = Object.keys(this.set);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    list.push(this.set[keys[i]]);
  }
};

HashSet.prototype.size = function () {
  return Object.keys(this.set).length;
};

HashSet.prototype.addAll = function (list) {
  var s = list.length;
  for (var i = 0; i < s; i++) {
    var v = list[i];
    this.add(v);
  }
};

module.exports = HashSet;

},{"./UniqueIDGeneretor":29}],14:[function(_dereq_,module,exports){
function IGeometry() {
}

IGeometry.calcSeparationAmount = function (rectA, rectB, overlapAmount, separationBuffer)
{
  if (!rectA.intersects(rectB)) {
    throw "assert failed";
  }
  var directions = new Array(2);
  IGeometry.decideDirectionsForOverlappingNodes(rectA, rectB, directions);
  overlapAmount[0] = Math.min(rectA.getRight(), rectB.getRight()) -
          Math.max(rectA.x, rectB.x);
  overlapAmount[1] = Math.min(rectA.getBottom(), rectB.getBottom()) -
          Math.max(rectA.y, rectB.y);
  // update the overlapping amounts for the following cases:
  if ((rectA.getX() <= rectB.getX()) && (rectA.getRight() >= rectB.getRight()))
  {
    overlapAmount[0] += Math.min((rectB.getX() - rectA.getX()),
            (rectA.getRight() - rectB.getRight()));
  }
  else if ((rectB.getX() <= rectA.getX()) && (rectB.getRight() >= rectA.getRight()))
  {
    overlapAmount[0] += Math.min((rectA.getX() - rectB.getX()),
            (rectB.getRight() - rectA.getRight()));
  }
  if ((rectA.getY() <= rectB.getY()) && (rectA.getBottom() >= rectB.getBottom()))
  {
    overlapAmount[1] += Math.min((rectB.getY() - rectA.getY()),
            (rectA.getBottom() - rectB.getBottom()));
  }
  else if ((rectB.getY() <= rectA.getY()) && (rectB.getBottom() >= rectA.getBottom()))
  {
    overlapAmount[1] += Math.min((rectA.getY() - rectB.getY()),
            (rectB.getBottom() - rectA.getBottom()));
  }

  // find slope of the line passes two centers
  var slope = Math.abs((rectB.getCenterY() - rectA.getCenterY()) /
          (rectB.getCenterX() - rectA.getCenterX()));
  // if centers are overlapped
  if ((rectB.getCenterY() == rectA.getCenterY()) &&
          (rectB.getCenterX() == rectA.getCenterX()))
  {
    // assume the slope is 1 (45 degree)
    slope = 1.0;
  }

  var moveByY = slope * overlapAmount[0];
  var moveByX = overlapAmount[1] / slope;
  if (overlapAmount[0] < moveByX)
  {
    moveByX = overlapAmount[0];
  }
  else
  {
    moveByY = overlapAmount[1];
  }
  // return half the amount so that if each rectangle is moved by these
  // amounts in opposite directions, overlap will be resolved
  overlapAmount[0] = -1 * directions[0] * ((moveByX / 2) + separationBuffer);
  overlapAmount[1] = -1 * directions[1] * ((moveByY / 2) + separationBuffer);
}

IGeometry.decideDirectionsForOverlappingNodes = function (rectA, rectB, directions)
{
  if (rectA.getCenterX() < rectB.getCenterX())
  {
    directions[0] = -1;
  }
  else
  {
    directions[0] = 1;
  }

  if (rectA.getCenterY() < rectB.getCenterY())
  {
    directions[1] = -1;
  }
  else
  {
    directions[1] = 1;
  }
}

IGeometry.getIntersection2 = function (rectA, rectB, result)
{
  //result[0-1] will contain clipPoint of rectA, result[2-3] will contain clipPoint of rectB
  var p1x = rectA.getCenterX();
  var p1y = rectA.getCenterY();
  var p2x = rectB.getCenterX();
  var p2y = rectB.getCenterY();

  //if two rectangles intersect, then clipping points are centers
  if (rectA.intersects(rectB))
  {
    result[0] = p1x;
    result[1] = p1y;
    result[2] = p2x;
    result[3] = p2y;
    return true;
  }
  //variables for rectA
  var topLeftAx = rectA.getX();
  var topLeftAy = rectA.getY();
  var topRightAx = rectA.getRight();
  var bottomLeftAx = rectA.getX();
  var bottomLeftAy = rectA.getBottom();
  var bottomRightAx = rectA.getRight();
  var halfWidthA = rectA.getWidthHalf();
  var halfHeightA = rectA.getHeightHalf();
  //variables for rectB
  var topLeftBx = rectB.getX();
  var topLeftBy = rectB.getY();
  var topRightBx = rectB.getRight();
  var bottomLeftBx = rectB.getX();
  var bottomLeftBy = rectB.getBottom();
  var bottomRightBx = rectB.getRight();
  var halfWidthB = rectB.getWidthHalf();
  var halfHeightB = rectB.getHeightHalf();
  //flag whether clipping points are found
  var clipPointAFound = false;
  var clipPointBFound = false;

  // line is vertical
  if (p1x == p2x)
  {
    if (p1y > p2y)
    {
      result[0] = p1x;
      result[1] = topLeftAy;
      result[2] = p2x;
      result[3] = bottomLeftBy;
      return false;
    }
    else if (p1y < p2y)
    {
      result[0] = p1x;
      result[1] = bottomLeftAy;
      result[2] = p2x;
      result[3] = topLeftBy;
      return false;
    }
    else
    {
      //not line, return null;
    }
  }
  // line is horizontal
  else if (p1y == p2y)
  {
    if (p1x > p2x)
    {
      result[0] = topLeftAx;
      result[1] = p1y;
      result[2] = topRightBx;
      result[3] = p2y;
      return false;
    }
    else if (p1x < p2x)
    {
      result[0] = topRightAx;
      result[1] = p1y;
      result[2] = topLeftBx;
      result[3] = p2y;
      return false;
    }
    else
    {
      //not valid line, return null;
    }
  }
  else
  {
    //slopes of rectA's and rectB's diagonals
    var slopeA = rectA.height / rectA.width;
    var slopeB = rectB.height / rectB.width;

    //slope of line between center of rectA and center of rectB
    var slopePrime = (p2y - p1y) / (p2x - p1x);
    var cardinalDirectionA;
    var cardinalDirectionB;
    var tempPointAx;
    var tempPointAy;
    var tempPointBx;
    var tempPointBy;

    //determine whether clipping point is the corner of nodeA
    if ((-slopeA) == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = bottomLeftAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = topRightAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
    }
    else if (slopeA == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = topLeftAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = bottomRightAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
    }

    //determine whether clipping point is the corner of nodeB
    if ((-slopeB) == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = bottomLeftBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = topRightBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
    }
    else if (slopeB == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = topLeftBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = bottomRightBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
    }

    //if both clipping points are corners
    if (clipPointAFound && clipPointBFound)
    {
      return false;
    }

    //determine Cardinal Direction of rectangles
    if (p1x > p2x)
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 4);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 2);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 3);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 1);
      }
    }
    else
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 1);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 3);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 2);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 4);
      }
    }
    //calculate clipping Point if it is not found before
    if (!clipPointAFound)
    {
      switch (cardinalDirectionA)
      {
        case 1:
          tempPointAy = topLeftAy;
          tempPointAx = p1x + (-halfHeightA) / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 2:
          tempPointAx = bottomRightAx;
          tempPointAy = p1y + halfWidthA * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 3:
          tempPointAy = bottomLeftAy;
          tempPointAx = p1x + halfHeightA / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 4:
          tempPointAx = bottomLeftAx;
          tempPointAy = p1y + (-halfWidthA) * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
      }
    }
    if (!clipPointBFound)
    {
      switch (cardinalDirectionB)
      {
        case 1:
          tempPointBy = topLeftBy;
          tempPointBx = p2x + (-halfHeightB) / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 2:
          tempPointBx = bottomRightBx;
          tempPointBy = p2y + halfWidthB * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 3:
          tempPointBy = bottomLeftBy;
          tempPointBx = p2x + halfHeightB / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 4:
          tempPointBx = bottomLeftBx;
          tempPointBy = p2y + (-halfWidthB) * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
      }
    }
  }
  return false;
}

IGeometry.getCardinalDirection = function (slope, slopePrime, line)
{
  if (slope > slopePrime)
  {
    return line;
  }
  else
  {
    return 1 + line % 4;
  }
}

IGeometry.getIntersection = function (s1, s2, f1, f2)
{
  if (f2 == null) {
    return IGeometry.getIntersection2(s1, s2, f1);
  }
  var x1 = s1.x;
  var y1 = s1.y;
  var x2 = s2.x;
  var y2 = s2.y;
  var x3 = f1.x;
  var y3 = f1.y;
  var x4 = f2.x;
  var y4 = f2.y;
  var x, y; // intersection point
  var a1, a2, b1, b2, c1, c2; // coefficients of line eqns.
  var denom;

  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;  // { a1*x + b1*y + c1 = 0 is line 1 }

  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;  // { a2*x + b2*y + c2 = 0 is line 2 }

  denom = a1 * b2 - a2 * b1;

  if (denom == 0)
  {
    return null;
  }

  x = (b1 * c2 - b2 * c1) / denom;
  y = (a2 * c1 - a1 * c2) / denom;

  return new Point(x, y);
}

// -----------------------------------------------------------------------------
// Section: Class Constants
// -----------------------------------------------------------------------------
/**
 * Some useful pre-calculated constants
 */
IGeometry.HALF_PI = 0.5 * Math.PI;
IGeometry.ONE_AND_HALF_PI = 1.5 * Math.PI;
IGeometry.TWO_PI = 2.0 * Math.PI;
IGeometry.THREE_PI = 3.0 * Math.PI;

module.exports = IGeometry;

},{}],15:[function(_dereq_,module,exports){
function IMath() {
}

/**
 * This method returns the sign of the input value.
 */
IMath.sign = function (value) {
  if (value > 0)
  {
    return 1;
  }
  else if (value < 0)
  {
    return -1;
  }
  else
  {
    return 0;
  }
}

IMath.floor = function (value) {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

IMath.ceil = function (value) {
  return value < 0 ? Math.floor(value) : Math.ceil(value);
}

module.exports = IMath;

},{}],16:[function(_dereq_,module,exports){
function Integer() {
}

Integer.MAX_VALUE = 2147483647;
Integer.MIN_VALUE = -2147483648;

module.exports = Integer;

},{}],17:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');

function LEdge(source, target, vEdge) {
  LGraphObject.call(this, vEdge);

  this.isOverlapingSourceAndTarget = false;
  this.vGraphObject = vEdge;
  this.bendpoints = [];
  this.source = source;
  this.target = target;
}

LEdge.prototype = Object.create(LGraphObject.prototype);

for (var prop in LGraphObject) {
  LEdge[prop] = LGraphObject[prop];
}

LEdge.prototype.getSource = function ()
{
  return this.source;
};

LEdge.prototype.getTarget = function ()
{
  return this.target;
};

LEdge.prototype.isInterGraph = function ()
{
  return this.isInterGraph;
};

LEdge.prototype.getLength = function ()
{
  return this.length;
};

LEdge.prototype.isOverlapingSourceAndTarget = function ()
{
  return this.isOverlapingSourceAndTarget;
};

LEdge.prototype.getBendpoints = function ()
{
  return this.bendpoints;
};

LEdge.prototype.getLca = function ()
{
  return this.lca;
};

LEdge.prototype.getSourceInLca = function ()
{
  return this.sourceInLca;
};

LEdge.prototype.getTargetInLca = function ()
{
  return this.targetInLca;
};

LEdge.prototype.getOtherEnd = function (node)
{
  if (this.source === node)
  {
    return this.target;
  }
  else if (this.target === node)
  {
    return this.source;
  }
  else
  {
    throw "Node is not incident with this edge";
  }
}

LEdge.prototype.getOtherEndInGraph = function (node, graph)
{
  var otherEnd = this.getOtherEnd(node);
  var root = graph.getGraphManager().getRoot();

  while (true)
  {
    if (otherEnd.getOwner() == graph)
    {
      return otherEnd;
    }

    if (otherEnd.getOwner() == root)
    {
      break;
    }

    otherEnd = otherEnd.getOwner().getParent();
  }

  return null;
};

LEdge.prototype.updateLength = function ()
{
  var clipPointCoordinates = new Array(4);

  this.isOverlapingSourceAndTarget =
          IGeometry.getIntersection(this.target.getRect(),
                  this.source.getRect(),
                  clipPointCoordinates);

  if (!this.isOverlapingSourceAndTarget)
  {
    this.lengthX = clipPointCoordinates[0] - clipPointCoordinates[2];
    this.lengthY = clipPointCoordinates[1] - clipPointCoordinates[3];

    if (Math.abs(this.lengthX) < 1.0)
    {
      this.lengthX = IMath.sign(this.lengthX);
    }

    if (Math.abs(this.lengthY) < 1.0)
    {
      this.lengthY = IMath.sign(this.lengthY);
    }

    this.length = Math.sqrt(
            this.lengthX * this.lengthX + this.lengthY * this.lengthY);
  }
};

LEdge.prototype.updateLengthSimple = function ()
{
  this.lengthX = this.target.getCenterX() - this.source.getCenterX();
  this.lengthY = this.target.getCenterY() - this.source.getCenterY();

  if (Math.abs(this.lengthX) < 1.0)
  {
    this.lengthX = IMath.sign(this.lengthX);
  }

  if (Math.abs(this.lengthY) < 1.0)
  {
    this.lengthY = IMath.sign(this.lengthY);
  }

  this.length = Math.sqrt(
          this.lengthX * this.lengthX + this.lengthY * this.lengthY);
}

module.exports = LEdge;

},{"./LGraphObject":20}],18:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');
var Integer = _dereq_('./Integer');
var LayoutConstants = _dereq_('./LayoutConstants');
var LGraphManager = _dereq_('./LGraphManager');
var LNode = _dereq_('./LNode');

function LGraph(parent, obj2, vGraph) {
  LGraphObject.call(this, vGraph);
  this.estimatedSize = Integer.MIN_VALUE;
  this.margin = LayoutConstants.DEFAULT_GRAPH_MARGIN;
  this.edges = [];
  this.nodes = [];
  this.isConnected = false;
  this.parent = parent;

  if (obj2 != null && obj2 instanceof LGraphManager) {
    this.graphManager = obj2;
  }
  else if (obj2 != null && obj2 instanceof Layout) {
    this.graphManager = obj2.graphManager;
  }
}

LGraph.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LGraph[prop] = LGraphObject[prop];
}

LGraph.prototype.getNodes = function () {
  return this.nodes;
};

LGraph.prototype.getEdges = function () {
  return this.edges;
};

LGraph.prototype.getGraphManager = function ()
{
  return this.graphManager;
};

LGraph.prototype.getParent = function ()
{
  return this.parent;
};

LGraph.prototype.getLeft = function ()
{
  return this.left;
};

LGraph.prototype.getRight = function ()
{
  return this.right;
};

LGraph.prototype.getTop = function ()
{
  return this.top;
};

LGraph.prototype.getBottom = function ()
{
  return this.bottom;
};

LGraph.prototype.isConnected = function ()
{
  return this.isConnected;
};

LGraph.prototype.add = function (obj1, sourceNode, targetNode) {
  if (sourceNode == null && targetNode == null) {
    var newNode = obj1;
    if (this.graphManager == null) {
      throw "Graph has no graph mgr!";
    }
    if (this.getNodes().indexOf(newNode) > -1) {
      throw "Node already in graph!";
    }
    newNode.owner = this;
    this.getNodes().push(newNode);

    return newNode;
  }
  else {
    var newEdge = obj1;
    if (!(this.getNodes().indexOf(sourceNode) > -1 && (this.getNodes().indexOf(targetNode)) > -1)) {
      throw "Source or target not in graph!";
    }

    if (!(sourceNode.owner == targetNode.owner && sourceNode.owner == this)) {
      throw "Both owners must be this graph!";
    }

    if (sourceNode.owner != targetNode.owner)
    {
      return null;
    }

    // set source and target
    newEdge.source = sourceNode;
    newEdge.target = targetNode;

    // set as intra-graph edge
    newEdge.isInterGraph = false;

    // add to graph edge list
    this.getEdges().push(newEdge);

    // add to incidency lists
    sourceNode.edges.push(newEdge);

    if (targetNode != sourceNode)
    {
      targetNode.edges.push(newEdge);
    }

    return newEdge;
  }
};

LGraph.prototype.remove = function (obj) {
  var node = obj;
  if (obj instanceof LNode) {
    if (node == null) {
      throw "Node is null!";
    }
    if (!(node.owner != null && node.owner == this)) {
      throw "Owner graph is invalid!";
    }
    if (this.graphManager == null) {
      throw "Owner graph manager is invalid!";
    }
    // remove incident edges first (make a copy to do it safely)
    var edgesToBeRemoved = node.edges.slice();
    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      edge = edgesToBeRemoved[i];

      if (edge.isInterGraph)
      {
        this.graphManager.remove(edge);
      }
      else
      {
        edge.source.owner.remove(edge);
      }
    }

    // now the node itself
    var index = this.nodes.indexOf(node);
    if (index == -1) {
      throw "Node not in owner node list!";
    }

    this.nodes.splice(index, 1);
  }
  else if (obj instanceof LEdge) {
    var edge = obj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }
    if (!(edge.source.owner != null && edge.target.owner != null &&
            edge.source.owner == this && edge.target.owner == this)) {
      throw "Source and/or target owner is invalid!";
    }

    var sourceIndex = edge.source.edges.indexOf(edge);
    var targetIndex = edge.target.edges.indexOf(edge);
    if (!(sourceIndex > -1 && targetIndex > -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    edge.source.edges.splice(sourceIndex, 1);

    if (edge.target != edge.source)
    {
      edge.target.edges.splice(targetIndex, 1);
    }

    var index = edge.source.owner.getEdges().indexOf(edge);
    if (index == -1) {
      throw "Not in owner's edge list!";
    }

    edge.source.owner.getEdges().splice(index, 1);
  }
};

LGraph.prototype.updateLeftTop = function ()
{
  var top = Integer.MAX_VALUE;
  var left = Integer.MAX_VALUE;
  var nodeTop;
  var nodeLeft;

  var nodes = this.getNodes();
  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    nodeTop = Math.floor(lNode.getTop());
    nodeLeft = Math.floor(lNode.getLeft());

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }
  }

  // Do we have any nodes in this graph?
  if (top == Integer.MAX_VALUE)
  {
    return null;
  }

  this.left = left - this.margin;
  this.top = top - this.margin;

  // Apply the margins and return the result
  return new Point(this.left, this.top);
};

LGraph.prototype.updateBounds = function (recursive)
{
  // calculate bounds
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;

  var nodes = this.nodes;
  var s = nodes.length;
  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];

    if (recursive && lNode.child != null)
    {
      lNode.updateBounds();
    }
    nodeLeft = Math.floor(lNode.getLeft());
    nodeRight = Math.floor(lNode.getRight());
    nodeTop = Math.floor(lNode.getTop());
    nodeBottom = Math.floor(lNode.getBottom());

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }

    if (right < nodeRight)
    {
      right = nodeRight;
    }

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (bottom < nodeBottom)
    {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);
  if (left == Integer.MAX_VALUE)
  {
    this.left = Math.floor(this.parent.getLeft());
    this.right = Math.floor(this.parent.getRight());
    this.top = Math.floor(this.parent.getTop());
    this.bottom = Math.floor(this.parent.getBottom());
  }

  this.left = boundingRect.x - this.margin;
  this.right = boundingRect.x + boundingRect.width + this.margin;
  this.top = boundingRect.y - this.margin;
  this.bottom = boundingRect.y + boundingRect.height + this.margin;
};

LGraph.calculateBounds = function (nodes)
{
  var left = Integer.MAX_VALUE;
  var right = -Integer.MAX_VALUE;
  var top = Integer.MAX_VALUE;
  var bottom = -Integer.MAX_VALUE;
  var nodeLeft;
  var nodeRight;
  var nodeTop;
  var nodeBottom;

  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    nodeLeft = Math.floor(lNode.getLeft());
    nodeRight = Math.floor(lNode.getRight());
    nodeTop = Math.floor(lNode.getTop());
    nodeBottom = Math.floor(lNode.getBottom());

    if (left > nodeLeft)
    {
      left = nodeLeft;
    }

    if (right < nodeRight)
    {
      right = nodeRight;
    }

    if (top > nodeTop)
    {
      top = nodeTop;
    }

    if (bottom < nodeBottom)
    {
      bottom = nodeBottom;
    }
  }

  var boundingRect = new RectangleD(left, top, right - left, bottom - top);

  return boundingRect;
};

LGraph.prototype.getInclusionTreeDepth = function ()
{
  if (this == this.graphManager.getRoot())
  {
    return 1;
  }
  else
  {
    return this.parent.getInclusionTreeDepth();
  }
};

LGraph.prototype.getEstimatedSize = function ()
{
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LGraph.prototype.calcEstimatedSize = function ()
{
  var size = 0;
  var nodes = this.nodes;
  var s = nodes.length;

  for (var i = 0; i < s; i++)
  {
    var lNode = nodes[i];
    size += lNode.calcEstimatedSize();
  }

  if (size == 0)
  {
    this.estimatedSize = LayoutConstants.EMPTY_COMPOUND_NODE_SIZE;
  }
  else
  {
    this.estimatedSize = Math.floor(size / Math.sqrt(this.nodes.length));
  }

  return Math.floor(this.estimatedSize);
};

LGraph.prototype.updateConnected = function ()
{
  if (this.nodes.length == 0)
  {
    this.isConnected = true;
    return;
  }

  var toBeVisited = [];
  var visited = new HashSet();
  var currentNode = this.nodes[0];
  var neighborEdges;
  var currentNeighbor;
  toBeVisited = toBeVisited.concat(currentNode.withChildren());

  while (toBeVisited.length > 0)
  {
    currentNode = toBeVisited.shift();
    visited.add(currentNode);

    // Traverse all neighbors of this node
    neighborEdges = currentNode.getEdges();
    var s = neighborEdges.length;
    for (var i = 0; i < s; i++)
    {
      var neighborEdge = neighborEdges[i];
      currentNeighbor =
              neighborEdge.getOtherEndInGraph(currentNode, this);

      // Add unvisited neighbors to the list to visit
      if (currentNeighbor != null &&
              !visited.contains(currentNeighbor))
      {
        toBeVisited = toBeVisited.concat(currentNeighbor.withChildren());
      }
    }
  }

  this.isConnected = false;

  if (visited.size() >= this.nodes.length)
  {
    var noOfVisitedInThisGraph = 0;

    var s = visited.size();
    for (var visitedId in visited.set)
    {
      var visitedNode = visited.set[visitedId];
      if (visitedNode.owner == this)
      {
        noOfVisitedInThisGraph++;
      }
    }

    if (noOfVisitedInThisGraph == this.nodes.length)
    {
      this.isConnected = true;
    }
  }
};

module.exports = LGraph;

},{"./Integer":16,"./LGraphManager":19,"./LGraphObject":20,"./LNode":21,"./LayoutConstants":23}],19:[function(_dereq_,module,exports){
function LGraphManager(layout) {
  this.layout = layout;

  this.graphs = [];
  this.edges = [];
}

LGraphManager.prototype.addRoot = function ()
{
  var ngraph = this.layout.newGraph();
  var nnode = this.layout.newNode(null);
  var root = this.add(ngraph, nnode);
  this.setRootGraph(root);
  return this.rootGraph;
};

LGraphManager.prototype.add = function (newGraph, parentNode, newEdge, sourceNode, targetNode)
{
  //there are just 2 parameters are passed then it adds an LGraph else it adds an LEdge
  if (newEdge == null && sourceNode == null && targetNode == null) {
    if (newGraph == null) {
      throw "Graph is null!";
    }
    if (parentNode == null) {
      throw "Parent node is null!";
    }
    if (this.graphs.indexOf(newGraph) > -1) {
      throw "Graph already in this graph mgr!";
    }

    this.graphs.push(newGraph);

    if (newGraph.parent != null) {
      throw "Already has a parent!";
    }
    if (parentNode.child != null) {
      throw  "Already has a child!";
    }

    newGraph.parent = parentNode;
    parentNode.child = newGraph;

    return newGraph;
  }
  else {
    //change the order of the parameters
    targetNode = newEdge;
    sourceNode = parentNode;
    newEdge = newGraph;
    var sourceGraph = sourceNode.getOwner();
    var targetGraph = targetNode.getOwner();

    if (!(sourceGraph != null && sourceGraph.getGraphManager() == this)) {
      throw "Source not in this graph mgr!";
    }
    if (!(targetGraph != null && targetGraph.getGraphManager() == this)) {
      throw "Target not in this graph mgr!";
    }

    if (sourceGraph == targetGraph)
    {
      newEdge.isInterGraph = false;
      return sourceGraph.add(newEdge, sourceNode, targetNode);
    }
    else
    {
      newEdge.isInterGraph = true;

      // set source and target
      newEdge.source = sourceNode;
      newEdge.target = targetNode;

      // add edge to inter-graph edge list
      if (this.edges.indexOf(newEdge) > -1) {
        throw "Edge already in inter-graph edge list!";
      }

      this.edges.push(newEdge);

      // add edge to source and target incidency lists
      if (!(newEdge.source != null && newEdge.target != null)) {
        throw "Edge source and/or target is null!";
      }

      if (!(newEdge.source.edges.indexOf(newEdge) == -1 && newEdge.target.edges.indexOf(newEdge) == -1)) {
        throw "Edge already in source and/or target incidency list!";
      }

      newEdge.source.edges.push(newEdge);
      newEdge.target.edges.push(newEdge);

      return newEdge;
    }
  }
};

LGraphManager.prototype.remove = function (lObj) {
  if (lObj instanceof LGraph) {
    var graph = lObj;
    if (graph.getGraphManager() != this) {
      throw "Graph not in this graph mgr";
    }
    if (!(graph == this.rootGraph || (graph.parent != null && graph.parent.graphManager == this))) {
      throw "Invalid parent node!";
    }

    // first the edges (make a copy to do it safely)
    var edgesToBeRemoved = [];

    edgesToBeRemoved = edgesToBeRemoved.concat(graph.getEdges());

    var edge;
    var s = edgesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      edge = edgesToBeRemoved[i];
      graph.remove(edge);
    }

    // then the nodes (make a copy to do it safely)
    var nodesToBeRemoved = [];

    nodesToBeRemoved = nodesToBeRemoved.concat(graph.getNodes());

    var node;
    s = nodesToBeRemoved.length;
    for (var i = 0; i < s; i++)
    {
      node = nodesToBeRemoved[i];
      graph.remove(node);
    }

    // check if graph is the root
    if (graph == this.rootGraph)
    {
      this.setRootGraph(null);
    }

    // now remove the graph itself
    var index = this.graphs.indexOf(graph);
    this.graphs.splice(index, 1);

    // also reset the parent of the graph
    graph.parent = null;
  }
  else if (lObj instanceof LEdge) {
    edge = lObj;
    if (edge == null) {
      throw "Edge is null!";
    }
    if (!edge.isInterGraph) {
      throw "Not an inter-graph edge!";
    }
    if (!(edge.source != null && edge.target != null)) {
      throw "Source and/or target is null!";
    }

    // remove edge from source and target nodes' incidency lists

    if (!(edge.source.edges.indexOf(edge) != -1 && edge.target.edges.indexOf(edge) != -1)) {
      throw "Source and/or target doesn't know this edge!";
    }

    var index = edge.source.edges.indexOf(edge);
    edge.source.edges.splice(index, 1);
    index = edge.target.edges.indexOf(edge);
    edge.target.edges.splice(index, 1);

    // remove edge from owner graph manager's inter-graph edge list

    if (!(edge.source.owner != null && edge.source.owner.getGraphManager() != null)) {
      throw "Edge owner graph or owner graph manager is null!";
    }
    if (edge.source.owner.getGraphManager().edges.indexOf(edge) == -1) {
      throw "Not in owner graph manager's edge list!";
    }

    var index = edge.source.owner.getGraphManager().edges.indexOf(edge);
    edge.source.owner.getGraphManager().edges.splice(index, 1);
  }
};

LGraphManager.prototype.updateBounds = function ()
{
  this.rootGraph.updateBounds(true);
};

LGraphManager.prototype.getGraphs = function ()
{
  return this.graphs;
};

LGraphManager.prototype.getAllNodes = function ()
{
  if (this.allNodes == null)
  {
    var nodeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < s; i++)
    {
      nodeList = nodeList.concat(graphs[i].getNodes());
    }
    this.allNodes = nodeList;
  }
  return this.allNodes;
};

LGraphManager.prototype.resetAllNodes = function ()
{
  this.allNodes = null;
};

LGraphManager.prototype.resetAllEdges = function ()
{
  this.allEdges = null;
};

LGraphManager.prototype.resetAllNodesToApplyGravitation = function ()
{
  this.allNodesToApplyGravitation = null;
};

LGraphManager.prototype.getAllEdges = function ()
{
  if (this.allEdges == null)
  {
    var edgeList = [];
    var graphs = this.getGraphs();
    var s = graphs.length;
    for (var i = 0; i < graphs.length; i++)
    {
      edgeList = edgeList.concat(graphs[i].getEdges());
    }

    edgeList = edgeList.concat(this.edges);

    this.allEdges = edgeList;
  }
  return this.allEdges;
};

LGraphManager.prototype.getAllNodesToApplyGravitation = function ()
{
  return this.allNodesToApplyGravitation;
};

LGraphManager.prototype.setAllNodesToApplyGravitation = function (nodeList)
{
  if (this.allNodesToApplyGravitation != null) {
    throw "assert failed";
  }

  this.allNodesToApplyGravitation = nodeList;
};

LGraphManager.prototype.getRoot = function ()
{
  return this.rootGraph;
};

LGraphManager.prototype.setRootGraph = function (graph)
{
  if (graph.getGraphManager() != this) {
    throw "Root not in this graph mgr!";
  }

  this.rootGraph = graph;
  // root graph must have a root node associated with it for convenience
  if (graph.parent == null)
  {
    graph.parent = this.layout.newNode("Root node");
  }
};

LGraphManager.prototype.getLayout = function ()
{
  return this.layout;
};

LGraphManager.prototype.isOneAncestorOfOther = function (firstNode, secondNode)
{
  if (!(firstNode != null && secondNode != null)) {
    throw "assert failed";
  }

  if (firstNode == secondNode)
  {
    return true;
  }
  // Is second node an ancestor of the first one?
  var ownerGraph = firstNode.getOwner();
  var parentNode;

  do
  {
    parentNode = ownerGraph.getParent();

    if (parentNode == null)
    {
      break;
    }

    if (parentNode == secondNode)
    {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null)
    {
      break;
    }
  } while (true);
  // Is first node an ancestor of the second one?
  ownerGraph = secondNode.getOwner();

  do
  {
    parentNode = ownerGraph.getParent();

    if (parentNode == null)
    {
      break;
    }

    if (parentNode == firstNode)
    {
      return true;
    }

    ownerGraph = parentNode.getOwner();
    if (ownerGraph == null)
    {
      break;
    }
  } while (true);

  return false;
};

LGraphManager.prototype.calcLowestCommonAncestors = function ()
{
  var edge;
  var sourceNode;
  var targetNode;
  var sourceAncestorGraph;
  var targetAncestorGraph;

  var edges = this.getAllEdges();
  var s = edges.length;
  for (var i = 0; i < s; i++)
  {
    edge = edges[i];

    sourceNode = edge.source;
    targetNode = edge.target;
    edge.lca = null;
    edge.sourceInLca = sourceNode;
    edge.targetInLca = targetNode;

    if (sourceNode == targetNode)
    {
      edge.lca = sourceNode.getOwner();
      continue;
    }

    sourceAncestorGraph = sourceNode.getOwner();

    while (edge.lca == null)
    {
      targetAncestorGraph = targetNode.getOwner();

      while (edge.lca == null)
      {
        if (targetAncestorGraph == sourceAncestorGraph)
        {
          edge.lca = targetAncestorGraph;
          break;
        }

        if (targetAncestorGraph == this.rootGraph)
        {
          break;
        }

        if (edge.lca != null) {
          throw "assert failed";
        }
        edge.targetInLca = targetAncestorGraph.getParent();
        targetAncestorGraph = edge.targetInLca.getOwner();
      }

      if (sourceAncestorGraph == this.rootGraph)
      {
        break;
      }

      if (edge.lca == null)
      {
        edge.sourceInLca = sourceAncestorGraph.getParent();
        sourceAncestorGraph = edge.sourceInLca.getOwner();
      }
    }

    if (edge.lca == null) {
      throw "assert failed";
    }
  }
};

LGraphManager.prototype.calcLowestCommonAncestor = function (firstNode, secondNode)
{
  if (firstNode == secondNode)
  {
    return firstNode.getOwner();
  }
  var firstOwnerGraph = firstNode.getOwner();

  do
  {
    if (firstOwnerGraph == null)
    {
      break;
    }
    var secondOwnerGraph = secondNode.getOwner();

    do
    {
      if (secondOwnerGraph == null)
      {
        break;
      }

      if (secondOwnerGraph == firstOwnerGraph)
      {
        return secondOwnerGraph;
      }
      secondOwnerGraph = secondOwnerGraph.getParent().getOwner();
    } while (true);

    firstOwnerGraph = firstOwnerGraph.getParent().getOwner();
  } while (true);

  return firstOwnerGraph;
};

LGraphManager.prototype.calcInclusionTreeDepths = function (graph, depth) {
  if (graph == null && depth == null) {
    graph = this.rootGraph;
    depth = 1;
  }
  var node;

  var nodes = graph.getNodes();
  var s = nodes.length;
  for (var i = 0; i < s; i++)
  {
    node = nodes[i];
    node.inclusionTreeDepth = depth;

    if (node.child != null)
    {
      this.calcInclusionTreeDepths(node.child, depth + 1);
    }
  }
};

LGraphManager.prototype.includesInvalidEdge = function ()
{
  var edge;

  var s = this.edges.length;
  for (var i = 0; i < s; i++)
  {
    edge = this.edges[i];

    if (this.isOneAncestorOfOther(edge.source, edge.target))
    {
      return true;
    }
  }
  return false;
};

module.exports = LGraphManager;

},{}],20:[function(_dereq_,module,exports){
function LGraphObject(vGraphObject) {
  this.vGraphObject = vGraphObject;
}

module.exports = LGraphObject;

},{}],21:[function(_dereq_,module,exports){
var LGraphObject = _dereq_('./LGraphObject');
var Integer = _dereq_('./Integer');
var RectangleD = _dereq_('./RectangleD');

function LNode(gm, loc, size, vNode) {
  //Alternative constructor 1 : LNode(LGraphManager gm, Point loc, Dimension size, Object vNode)
  if (size == null && vNode == null) {
    vNode = loc;
  }

  LGraphObject.call(this, vNode);

  //Alternative constructor 2 : LNode(Layout layout, Object vNode)
  if (gm.graphManager != null)
    gm = gm.graphManager;

  this.estimatedSize = Integer.MIN_VALUE;
  this.inclusionTreeDepth = Integer.MAX_VALUE;
  this.vGraphObject = vNode;
  this.edges = [];
  this.graphManager = gm;

  if (size != null && loc != null)
    this.rect = new RectangleD(loc.x, loc.y, size.width, size.height);
  else
    this.rect = new RectangleD();
}

LNode.prototype = Object.create(LGraphObject.prototype);
for (var prop in LGraphObject) {
  LNode[prop] = LGraphObject[prop];
}

LNode.prototype.getEdges = function ()
{
  return this.edges;
};

LNode.prototype.getChild = function ()
{
  return this.child;
};

LNode.prototype.getOwner = function ()
{
  if (this.owner != null) {
    if (!(this.owner == null || this.owner.getNodes().indexOf(this) > -1)) {
      throw "assert failed";
    }
  }

  return this.owner;
};

LNode.prototype.getWidth = function ()
{
  return this.rect.width;
};

LNode.prototype.setWidth = function (width)
{
  this.rect.width = width;
};

LNode.prototype.getHeight = function ()
{
  return this.rect.height;
};

LNode.prototype.setHeight = function (height)
{
  this.rect.height = height;
};

LNode.prototype.getCenterX = function ()
{
  return this.rect.x + this.rect.width / 2;
};

LNode.prototype.getCenterY = function ()
{
  return this.rect.y + this.rect.height / 2;
};

LNode.prototype.getCenter = function ()
{
  return new PointD(this.rect.x + this.rect.width / 2,
          this.rect.y + this.rect.height / 2);
};

LNode.prototype.getLocation = function ()
{
  return new PointD(this.rect.x, this.rect.y);
};

LNode.prototype.getRect = function ()
{
  return this.rect;
};

LNode.prototype.getDiagonal = function ()
{
  return Math.sqrt(this.rect.width * this.rect.width +
          this.rect.height * this.rect.height);
};

LNode.prototype.setRect = function (upperLeft, dimension)
{
  this.rect.x = upperLeft.x;
  this.rect.y = upperLeft.y;
  this.rect.width = dimension.width;
  this.rect.height = dimension.height;
};

LNode.prototype.setCenter = function (cx, cy)
{
  this.rect.x = cx - this.rect.width / 2;
  this.rect.y = cy - this.rect.height / 2;
};

LNode.prototype.setLocation = function (x, y)
{
  this.rect.x = x;
  this.rect.y = y;
};

LNode.prototype.moveBy = function (dx, dy)
{
  this.rect.x += dx;
  this.rect.y += dy;
};

LNode.prototype.getEdgeListToNode = function (to)
{
  var edgeList = [];
  var edge;

  for (var obj in this.edges)
  {
    edge = obj;

    if (edge.target == to)
    {
      if (edge.source != this)
        throw "Incorrect edge source!";

      edgeList.push(edge);
    }
  }

  return edgeList;
};

LNode.prototype.getEdgesBetween = function (other)
{
  var edgeList = [];
  var edge;

  for (var obj in this.edges)
  {
    edge = this.edges[obj];

    if (!(edge.source == this || edge.target == this))
      throw "Incorrect edge source and/or target";

    if ((edge.target == other) || (edge.source == other))
    {
      edgeList.push(edge);
    }
  }

  return edgeList;
};

LNode.prototype.getNeighborsList = function ()
{
  var neighbors = new HashSet();
  var edge;

  for (var obj in this.edges)
  {
    edge = this.edges[obj];

    if (edge.source == this)
    {
      neighbors.add(edge.target);
    }
    else
    {
      if (!edge.target == this)
        throw "Incorrect incidency!";
      neighbors.add(edge.source);
    }
  }

  return neighbors;
};

LNode.prototype.withChildren = function ()
{
  var withNeighborsList = [];
  var childNode;

  withNeighborsList.push(this);

  if (this.child != null)
  {
    var nodes = this.child.getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      childNode = nodes[i];

      withNeighborsList = withNeighborsList.concat(childNode.withChildren());
    }
  }

  return withNeighborsList;
};

LNode.prototype.getEstimatedSize = function () {
  if (this.estimatedSize == Integer.MIN_VALUE) {
    throw "assert failed";
  }
  return this.estimatedSize;
};

LNode.prototype.calcEstimatedSize = function () {
  if (this.child == null)
  {
    return this.estimatedSize = Math.floor((this.rect.width + this.rect.height) / 2);
  }
  else
  {
    this.estimatedSize = this.child.calcEstimatedSize();
    this.rect.width = this.estimatedSize;
    this.rect.height = this.estimatedSize;

    return this.estimatedSize;
  }
};

LNode.prototype.scatter = function () {
  var randomCenterX;
  var randomCenterY;

  var minX = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxX = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterX = LayoutConstants.WORLD_CENTER_X +
          (RandomSeed.nextDouble() * (maxX - minX)) + minX;

  var minY = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
  var maxY = LayoutConstants.INITIAL_WORLD_BOUNDARY;
  randomCenterY = LayoutConstants.WORLD_CENTER_Y +
          (RandomSeed.nextDouble() * (maxY - minY)) + minY;

  this.rect.x = randomCenterX;
  this.rect.y = randomCenterY
};

LNode.prototype.updateBounds = function () {
  if (this.getChild() == null) {
    throw "assert failed";
  }
  if (this.getChild().getNodes().length != 0)
  {
    // wrap the children nodes by re-arranging the boundaries
    var childGraph = this.getChild();
    childGraph.updateBounds(true);

    this.rect.x = childGraph.getLeft();
    this.rect.y = childGraph.getTop();

    this.setWidth(childGraph.getRight() - childGraph.getLeft() +
            2 * LayoutConstants.COMPOUND_NODE_MARGIN);
    this.setHeight(childGraph.getBottom() - childGraph.getTop() +
            2 * LayoutConstants.COMPOUND_NODE_MARGIN +
            LayoutConstants.LABEL_HEIGHT);
  }
};

LNode.prototype.getInclusionTreeDepth = function ()
{
  if (this.inclusionTreeDepth == Integer.MAX_VALUE) {
    throw "assert failed";
  }
  return this.inclusionTreeDepth;
};

LNode.prototype.transform = function (trans)
{
  var left = this.rect.x;

  if (left > LayoutConstants.WORLD_BOUNDARY)
  {
    left = LayoutConstants.WORLD_BOUNDARY;
  }
  else if (left < -LayoutConstants.WORLD_BOUNDARY)
  {
    left = -LayoutConstants.WORLD_BOUNDARY;
  }

  var top = this.rect.y;

  if (top > LayoutConstants.WORLD_BOUNDARY)
  {
    top = LayoutConstants.WORLD_BOUNDARY;
  }
  else if (top < -LayoutConstants.WORLD_BOUNDARY)
  {
    top = -LayoutConstants.WORLD_BOUNDARY;
  }

  var leftTop = new PointD(left, top);
  var vLeftTop = trans.inverseTransformPoint(leftTop);

  this.setLocation(vLeftTop.x, vLeftTop.y);
};

LNode.prototype.getLeft = function ()
{
  return this.rect.x;
};

LNode.prototype.getRight = function ()
{
  return this.rect.x + this.rect.width;
};

LNode.prototype.getTop = function ()
{
  return this.rect.y;
};

LNode.prototype.getBottom = function ()
{
  return this.rect.y + this.rect.height;
};

LNode.prototype.getParent = function ()
{
  if (this.owner == null)
  {
    return null;
  }

  return this.owner.getParent();
};

module.exports = LNode;

},{"./Integer":16,"./LGraphObject":20,"./RectangleD":27}],22:[function(_dereq_,module,exports){
var LayoutConstants = _dereq_('./LayoutConstants');
var HashMap = _dereq_('./HashMap');
var LGraphManager = _dereq_('./LGraphManager');

function Layout(isRemoteUse) {
  //Layout Quality: 0:proof, 1:default, 2:draft
  this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;
  //Whether layout should create bendpoints as needed or not
  this.createBendsAsNeeded =
          LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  //Whether layout should be incremental or not
  this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
  //Whether we animate from before to after layout node positions
  this.animationOnLayout =
          LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
  //Whether we animate the layout process or not
  this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
  //Number iterations that should be done between two successive animations
  this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
  /**
   * Whether or not leaf nodes (non-compound nodes) are of uniform sizes. When
   * they are, both spring and repulsion forces between two leaf nodes can be
   * calculated without the expensive clipping point calculations, resulting
   * in major speed-up.
   */
  this.uniformLeafNodeSizes =
          LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
  /**
   * This is used for creation of bendpoints by using dummy nodes and edges.
   * Maps an LEdge to its dummy bendpoint path.
   */
  this.edgeToDummyNodes = new HashMap();
  this.graphManager = new LGraphManager(this);
  this.isLayoutFinished = false;
  this.isSubLayout = false;
  this.isRemoteUse = false;

  if (isRemoteUse != null) {
    this.isRemoteUse = isRemoteUse;
  }
}

Layout.RANDOM_SEED = 1;

Layout.prototype.getGraphManager = function () {
  return this.graphManager;
};

Layout.prototype.getAllNodes = function () {
  return this.graphManager.getAllNodes();
};

Layout.prototype.getAllEdges = function () {
  return this.graphManager.getAllEdges();
};

Layout.prototype.getAllNodesToApplyGravitation = function () {
  return this.graphManager.getAllNodesToApplyGravitation();
};

Layout.prototype.newGraphManager = function () {
  var gm = new LGraphManager(this);
  this.graphManager = gm;
  return gm;
};

Layout.prototype.newGraph = function (vGraph)
{
  return new LGraph(null, this.graphManager, vGraph);
};

Layout.prototype.newNode = function (vNode)
{
  return new LNode(this.graphManager, vNode);
};

Layout.prototype.newEdge = function (vEdge)
{
  return new LEdge(null, null, vEdge);
};

Layout.prototype.runLayout = function ()
{
  this.isLayoutFinished = false;

  this.initParameters();
  var isLayoutSuccessfull;

  if ((this.graphManager.getRoot() == null)
          || this.graphManager.getRoot().getNodes().length == 0
          || this.graphManager.includesInvalidEdge())
  {
    isLayoutSuccessfull = false;
  }
  else
  {
    // calculate execution time
    var startTime = 0;

    if (!this.isSubLayout)
    {
      startTime = new Date().getTime()
    }

    isLayoutSuccessfull = this.layout();

    if (!this.isSubLayout)
    {
      var endTime = new Date().getTime();
      var excTime = endTime - startTime;

      console.log("Total execution time: " + excTime + " miliseconds.");
    }
  }

  if (isLayoutSuccessfull)
  {
    if (!this.isSubLayout)
    {
      this.doPostLayout();
    }
  }

  this.isLayoutFinished = true;

  return isLayoutSuccessfull;
};

/**
 * This method performs the operations required after layout.
 */
Layout.prototype.doPostLayout = function ()
{
  //assert !isSubLayout : "Should not be called on sub-layout!";
  // Propagate geometric changes to v-level objects
  this.transform();
  this.update();
};

/**
 * This method updates the geometry of the target graph according to
 * calculated layout.
 */
Layout.prototype.update2 = function () {
  // update bend points
  if (this.createBendsAsNeeded)
  {
    this.createBendpointsFromDummyNodes();

    // reset all edges, since the topology has changed
    this.graphManager.resetAllEdges();
  }

  // perform edge, node and root updates if layout is not called
  // remotely
  if (!this.isRemoteUse)
  {
    // update all edges
    var edge;
    var allEdges = this.graphManager.getAllEdges();
    for (var i = 0; i < allEdges.length; i++)
    {
      edge = allEdges[i];
//      this.update(edge);
    }

    // recursively update nodes
    var node;
    var nodes = this.graphManager.getRoot().getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      node = nodes[i];
//      this.update(node);
    }

    // update root graph
    this.update(this.graphManager.getRoot());
  }
};

Layout.prototype.update = function (obj) {
  if (obj == null) {
    this.update2();
  }
  else if (obj instanceof LNode) {
    var node = obj;
    if (node.getChild() != null)
    {
      // since node is compound, recursively update child nodes
      var nodes = node.getChild().getNodes();
      for (var i = 0; i < nodes.length; i++)
      {
        update(nodes[i]);
      }
    }

    // if the l-level node is associated with a v-level graph object,
    // then it is assumed that the v-level node implements the
    // interface Updatable.
    if (node.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vNode = node.vGraphObject;

      // call the update method of the interface
      vNode.update(node);
    }
  }
  else if (obj instanceof LEdge) {
    var edge = obj;
    // if the l-level edge is associated with a v-level graph object,
    // then it is assumed that the v-level edge implements the
    // interface Updatable.

    if (edge.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vEdge = edge.vGraphObject;

      // call the update method of the interface
      vEdge.update(edge);
    }
  }
  else if (obj instanceof LGraph) {
    var graph = obj;
    // if the l-level graph is associated with a v-level graph object,
    // then it is assumed that the v-level object implements the
    // interface Updatable.

    if (graph.vGraphObject != null)
    {
      // cast to Updatable without any type check
      var vGraph = graph.vGraphObject;

      // call the update method of the interface
      vGraph.update(graph);
    }
  }
};

/**
 * This method is used to set all layout parameters to default values
 * determined at compile time.
 */
Layout.prototype.initParameters = function () {
  if (!this.isSubLayout)
  {
    this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;
    this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
    this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;
    this.animationOnLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
    this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;
    this.createBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
    this.uniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
  }

  if (this.animationDuringLayout)
  {
    animationOnLayout = false;
  }
};

Layout.prototype.transform = function (newLeftTop) {
  if (newLeftTop == undefined) {
    this.transform(new PointD(0, 0));
  }
  else {
    // create a transformation object (from Eclipse to layout). When an
    // inverse transform is applied, we get upper-left coordinate of the
    // drawing or the root graph at given input coordinate (some margins
    // already included in calculation of left-top).

    var trans = new Transform();
    var leftTop = this.graphManager.getRoot().updateLeftTop();

    if (leftTop != null)
    {
      trans.setWorldOrgX(newLeftTop.x);
      trans.setWorldOrgY(newLeftTop.y);

      trans.setDeviceOrgX(leftTop.x);
      trans.setDeviceOrgY(leftTop.y);

      var nodes = this.getAllNodes();
      var node;

      for (var i = 0; i < nodes.length; i++)
      {
        node = nodes[i];
        node.transform(trans);
      }
    }
  }
};

Layout.prototype.positionNodesRandomly = function (graph) {

  if (graph == undefined) {
    //assert !this.incremental;
    this.positionNodesRandomly(this.getGraphManager().getRoot());
    this.getGraphManager().getRoot().updateBounds(true);
  }
  else {
    var lNode;
    var childGraph;

    var nodes = graph.getNodes();
    for (var i = 0; i < nodes.length; i++)
    {
      lNode = nodes[i];
      childGraph = lNode.getChild();

      if (childGraph == null)
      {
        lNode.scatter();
      }
      else if (childGraph.getNodes().length == 0)
      {
        lNode.scatter();
      }
      else
      {
        this.positionNodesRandomly(childGraph);
        lNode.updateBounds();
      }
    }
  }
};

/**
 * This method returns a list of trees where each tree is represented as a
 * list of l-nodes. The method returns a list of size 0 when:
 * - The graph is not flat or
 * - One of the component(s) of the graph is not a tree.
 */
Layout.prototype.getFlatForest = function ()
{
  var flatForest = [];
  var isForest = true;

  // Quick reference for all nodes in the graph manager associated with
  // this layout. The list should not be changed.
  var allNodes = this.graphManager.getRoot().getNodes();

  // First be sure that the graph is flat
  var isFlat = true;

  for (var i = 0; i < allNodes.length; i++)
  {
    if (allNodes[i].getChild() != null)
    {
      isFlat = false;
    }
  }

  // Return empty forest if the graph is not flat.
  if (!isFlat)
  {
    return flatForest;
  }

  // Run BFS for each component of the graph.

  var visited = new HashSet();
  var toBeVisited = [];
  var parents = new HashMap();
  var unProcessedNodes = [];

  unProcessedNodes = unProcessedNodes.concat(allNodes);

  // Each iteration of this loop finds a component of the graph and
  // decides whether it is a tree or not. If it is a tree, adds it to the
  // forest and continued with the next component.

  while (unProcessedNodes.length > 0 && isForest)
  {
    toBeVisited.push(unProcessedNodes[0]);

    // Start the BFS. Each iteration of this loop visits a node in a
    // BFS manner.
    while (toBeVisited.length > 0 && isForest)
    {
      //pool operation
      var currentNode = toBeVisited[0];
      toBeVisited.splice(0, 1);
      visited.add(currentNode);

      // Traverse all neighbors of this node
      var neighborEdges = currentNode.getEdges();

      for (var i = 0; i < neighborEdges.length; i++)
      {
        var currentNeighbor =
                neighborEdges[i].getOtherEnd(currentNode);

        // If BFS is not growing from this neighbor.
        if (parents.get(currentNode) != currentNeighbor)
        {
          // We haven't previously visited this neighbor.
          if (!visited.contains(currentNeighbor))
          {
            toBeVisited.push(currentNeighbor);
            parents.put(currentNeighbor, currentNode);
          }
          // Since we have previously visited this neighbor and
          // this neighbor is not parent of currentNode, given
          // graph contains a component that is not tree, hence
          // it is not a forest.
          else
          {
            isForest = false;
            break;
          }
        }
      }
    }

    // The graph contains a component that is not a tree. Empty
    // previously found trees. The method will end.
    if (!isForest)
    {
      flatForest = [];
    }
    // Save currently visited nodes as a tree in our forest. Reset
    // visited and parents lists. Continue with the next component of
    // the graph, if any.
    else
    {
      var temp = [];
      visited.addAllTo(temp);
      flatForest.push(temp);
      //flatForest = flatForest.concat(temp);
      //unProcessedNodes.removeAll(visited);
      for (var i = 0; i < temp.length; i++) {
        var value = temp[i];
        var index = unProcessedNodes.indexOf(value);
        if (index > -1) {
          unProcessedNodes.splice(index, 1);
        }
      }
      visited = new HashSet();
      parents = new HashMap();
    }
  }

  return flatForest;
};

/**
 * This method creates dummy nodes (an l-level node with minimal dimensions)
 * for the given edge (one per bendpoint). The existing l-level structure
 * is updated accordingly.
 */
Layout.prototype.createDummyNodesForBendpoints = function (edge)
{
  var dummyNodes = [];
  var prev = edge.source;

  var graph = this.graphManager.calcLowestCommonAncestor(edge.source, edge.target);

  for (var i = 0; i < edge.bendpoints.length; i++)
  {
    // create new dummy node
    var dummyNode = this.newNode(null);
    dummyNode.setRect(new Point(0, 0), new Dimension(1, 1));

    graph.add(dummyNode);

    // create new dummy edge between prev and dummy node
    var dummyEdge = this.newEdge(null);
    this.graphManager.add(dummyEdge, prev, dummyNode);

    dummyNodes.add(dummyNode);
    prev = dummyNode;
  }

  var dummyEdge = this.newEdge(null);
  this.graphManager.add(dummyEdge, prev, edge.target);

  this.edgeToDummyNodes.put(edge, dummyNodes);

  // remove real edge from graph manager if it is inter-graph
  if (edge.isInterGraph())
  {
    this.graphManager.remove(edge);
  }
  // else, remove the edge from the current graph
  else
  {
    graph.remove(edge);
  }

  return dummyNodes;
};

/**
 * This method creates bendpoints for edges from the dummy nodes
 * at l-level.
 */
Layout.prototype.createBendpointsFromDummyNodes = function ()
{
  var edges = [];
  edges = edges.concat(this.graphManager.getAllEdges());
  edges = this.edgeToDummyNodes.keySet().concat(edges);

  for (var k = 0; k < edges.length; k++)
  {
    var lEdge = edges[k];

    if (lEdge.bendpoints.length > 0)
    {
      var path = this.edgeToDummyNodes.get(lEdge);

      for (var i = 0; i < path.length; i++)
      {
        var dummyNode = path[i];
        var p = new PointD(dummyNode.getCenterX(),
                dummyNode.getCenterY());

        // update bendpoint's location according to dummy node
        var ebp = lEdge.bendpoints.get(i);
        ebp.x = p.x;
        ebp.y = p.y;

        // remove the dummy node, dummy edges incident with this
        // dummy node is also removed (within the remove method)
        dummyNode.getOwner().remove(dummyNode);
      }

      // add the real edge to graph
      this.graphManager.add(lEdge, lEdge.source, lEdge.target);
    }
  }
};

Layout.transform = function (sliderValue, defaultValue, minDiv, maxMul) {
  if (minDiv != undefined && maxMul != undefined) {
    var value = defaultValue;

    if (sliderValue <= 50)
    {
      var minValue = defaultValue / minDiv;
      value -= ((defaultValue - minValue) / 50) * (50 - sliderValue);
    }
    else
    {
      var maxValue = defaultValue * maxMul;
      value += ((maxValue - defaultValue) / 50) * (sliderValue - 50);
    }

    return value;
  }
  else {
    var a, b;

    if (sliderValue <= 50)
    {
      a = 9.0 * defaultValue / 500.0;
      b = defaultValue / 10.0;
    }
    else
    {
      a = 9.0 * defaultValue / 50.0;
      b = -8 * defaultValue;
    }

    return (a * sliderValue + b);
  }
};

/**
 * This method finds and returns the center of the given nodes, assuming
 * that the given nodes form a tree in themselves.
 */
Layout.findCenterOfTree = function (nodes)
{
  var list = [];
  list = list.concat(nodes);

  var removedNodes = [];
  var remainingDegrees = new HashMap();
  var foundCenter = false;
  var centerNode = null;

  if (list.length == 1 || list.length == 2)
  {
    foundCenter = true;
    centerNode = list[0];
  }

  for (var i = 0; i < list.length; i++)
  {
    var node = list[i];
    var degree = node.getNeighborsList().size();
    remainingDegrees.put(node, node.getNeighborsList().size());

    if (degree == 1)
    {
      removedNodes.push(node);
    }
  }

  var tempList = [];
  tempList = tempList.concat(removedNodes);

  while (!foundCenter)
  {
    var tempList2 = [];
    tempList2 = tempList2.concat(tempList);
    tempList = [];

    for (var i = 0; i < list.length; i++)
    {
      var node = list[i];

      var index = list.indexOf(node);
      if (index >= 0) {
        list.splice(index, 1);
      }

      var neighbours = node.getNeighborsList();

      for (var j in neighbours.set)
      {
        var neighbour = neighbours.set[j];
        if (removedNodes.indexOf(neighbour) < 0)
        {
          var otherDegree = remainingDegrees.get(neighbour);
          var newDegree = otherDegree - 1;

          if (newDegree == 1)
          {
            tempList.push(neighbour);
          }

          remainingDegrees.put(neighbour, newDegree);
        }
      }
    }

    removedNodes = removedNodes.concat(tempList);

    if (list.length == 1 || list.length == 2)
    {
      foundCenter = true;
      centerNode = list[0];
    }
  }

  return centerNode;
};

/**
 * During the coarsening process, this layout may be referenced by two graph managers
 * this setter function grants access to change the currently being used graph manager
 */
Layout.prototype.setGraphManager = function (gm)
{
  this.graphManager = gm;
};

module.exports = Layout;

},{"./HashMap":12,"./LGraphManager":19,"./LayoutConstants":23}],23:[function(_dereq_,module,exports){
function LayoutConstants() {
}

/**
 * Layout Quality
 */
LayoutConstants.PROOF_QUALITY = 0;
LayoutConstants.DEFAULT_QUALITY = 1;
LayoutConstants.DRAFT_QUALITY = 2;

/**
 * Default parameters
 */
LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
//LayoutConstants.DEFAULT_INCREMENTAL = true;
LayoutConstants.DEFAULT_INCREMENTAL = false;
LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT = true;
LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT = false;
LayoutConstants.DEFAULT_ANIMATION_PERIOD = 50;
LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;

// -----------------------------------------------------------------------------
// Section: General other constants
// -----------------------------------------------------------------------------
/*
 * Margins of a graph to be applied on bouding rectangle of its contents. We
 * assume margins on all four sides to be uniform.
 */
LayoutConstants.DEFAULT_GRAPH_MARGIN = 10;

/*
 * The height of the label of a compound. We assume the label of a compound
 * node is placed at the bottom with a dynamic width same as the compound
 * itself.
 */
LayoutConstants.LABEL_HEIGHT = 20;

/*
 * Additional margins that we maintain as safety buffer for node-node
 * overlaps. Compound node labels as well as graph margins are handled
 * separately!
 */
LayoutConstants.COMPOUND_NODE_MARGIN = 5;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_SIZE = 40;

/*
 * Default dimension of a non-compound node.
 */
LayoutConstants.SIMPLE_NODE_HALF_SIZE = LayoutConstants.SIMPLE_NODE_SIZE / 2;

/*
 * Empty compound node size. When a compound node is empty, its both
 * dimensions should be of this value.
 */
LayoutConstants.EMPTY_COMPOUND_NODE_SIZE = 40;

/*
 * Minimum length that an edge should take during layout
 */
LayoutConstants.MIN_EDGE_LENGTH = 1;

/*
 * World boundaries that layout operates on
 */
LayoutConstants.WORLD_BOUNDARY = 1000000;

/*
 * World boundaries that random positioning can be performed with
 */
LayoutConstants.INITIAL_WORLD_BOUNDARY = LayoutConstants.WORLD_BOUNDARY / 1000;

/*
 * Coordinates of the world center
 */
LayoutConstants.WORLD_CENTER_X = 1200;
LayoutConstants.WORLD_CENTER_Y = 900;

module.exports = LayoutConstants;

},{}],24:[function(_dereq_,module,exports){
/*
 *This class is the javascript implementation of the Point.java class in jdk
 */
function Point(x, y, p) {
  this.x = null;
  this.y = null;
  if (x == null && y == null && p == null) {
    this.x = 0;
    this.y = 0;
  }
  else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    this.x = x;
    this.y = y;
  }
  else if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.x = p.x;
    this.y = p.y;
  }
}

Point.prototype.getX = function () {
  return this.x;
}

Point.prototype.getY = function () {
  return this.y;
}

Point.prototype.getLocation = function () {
  return new Point(this.x, this.y);
}

Point.prototype.setLocation = function (x, y, p) {
  if (x.constructor.name == 'Point' && y == null && p == null) {
    p = x;
    this.setLocation(p.x, p.y);
  }
  else if (typeof x == 'number' && typeof y == 'number' && p == null) {
    //if both parameters are integer just move (x,y) location
    if (parseInt(x) == x && parseInt(y) == y) {
      this.move(x, y);
    }
    else {
      this.x = Math.floor(x + 0.5);
      this.y = Math.floor(y + 0.5);
    }
  }
}

Point.prototype.move = function (x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.translate = function (dx, dy) {
  this.x += dx;
  this.y += dy;
}

Point.prototype.equals = function (obj) {
  if (obj.constructor.name == "Point") {
    var pt = obj;
    return (this.x == pt.x) && (this.y == pt.y);
  }
  return this == obj;
}

Point.prototype.toString = function () {
  return new Point().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
}

module.exports = Point;

},{}],25:[function(_dereq_,module,exports){
function PointD(x, y) {
  if (x == null && y == null) {
    this.x = 0;
    this.y = 0;
  } else {
    this.x = x;
    this.y = y;
  }
}

PointD.prototype.getX = function ()
{
  return this.x;
};

PointD.prototype.getY = function ()
{
  return this.y;
};

PointD.prototype.setX = function (x)
{
  this.x = x;
};

PointD.prototype.setY = function (y)
{
  this.y = y;
};

PointD.prototype.getDifference = function (pt)
{
  return new DimensionD(this.x - pt.x, this.y - pt.y);
};

PointD.prototype.getCopy = function ()
{
  return new PointD(this.x, this.y);
};

PointD.prototype.translate = function (dim)
{
  this.x += dim.width;
  this.y += dim.height;
  return this;
};

module.exports = PointD;

},{}],26:[function(_dereq_,module,exports){
function RandomSeed() {
}
RandomSeed.seed = 1;
RandomSeed.x = 0;

RandomSeed.nextDouble = function () {
  RandomSeed.x = Math.sin(RandomSeed.seed++) * 10000;
  return RandomSeed.x - Math.floor(RandomSeed.x);
};

module.exports = RandomSeed;

},{}],27:[function(_dereq_,module,exports){
function RectangleD(x, y, width, height) {
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;

  if (x != null && y != null && width != null && height != null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

RectangleD.prototype.getX = function ()
{
  return this.x;
};

RectangleD.prototype.setX = function (x)
{
  this.x = x;
};

RectangleD.prototype.getY = function ()
{
  return this.y;
};

RectangleD.prototype.setY = function (y)
{
  this.y = y;
};

RectangleD.prototype.getWidth = function ()
{
  return this.width;
};

RectangleD.prototype.setWidth = function (width)
{
  this.width = width;
};

RectangleD.prototype.getHeight = function ()
{
  return this.height;
};

RectangleD.prototype.setHeight = function (height)
{
  this.height = height;
};

RectangleD.prototype.getRight = function ()
{
  return this.x + this.width;
};

RectangleD.prototype.getBottom = function ()
{
  return this.y + this.height;
};

RectangleD.prototype.intersects = function (a)
{
  if (this.getRight() < a.x)
  {
    return false;
  }

  if (this.getBottom() < a.y)
  {
    return false;
  }

  if (a.getRight() < this.x)
  {
    return false;
  }

  if (a.getBottom() < this.y)
  {
    return false;
  }

  return true;
};

RectangleD.prototype.getCenterX = function ()
{
  return this.x + this.width / 2;
};

RectangleD.prototype.getMinX = function ()
{
  return this.getX();
};

RectangleD.prototype.getMaxX = function ()
{
  return this.getX() + this.width;
};

RectangleD.prototype.getCenterY = function ()
{
  return this.y + this.height / 2;
};

RectangleD.prototype.getMinY = function ()
{
  return this.getY();
};

RectangleD.prototype.getMaxY = function ()
{
  return this.getY() + this.height;
};

RectangleD.prototype.getWidthHalf = function ()
{
  return this.width / 2;
};

RectangleD.prototype.getHeightHalf = function ()
{
  return this.height / 2;
};

module.exports = RectangleD;

},{}],28:[function(_dereq_,module,exports){
function Transform(x, y) {
  this.lworldOrgX = 0.0;
  this.lworldOrgY = 0.0;
  this.ldeviceOrgX = 0.0;
  this.ldeviceOrgY = 0.0;
  this.lworldExtX = 1.0;
  this.lworldExtY = 1.0;
  this.ldeviceExtX = 1.0;
  this.ldeviceExtY = 1.0;
}

Transform.prototype.getWorldOrgX = function ()
{
  return this.lworldOrgX;
}

Transform.prototype.setWorldOrgX = function (wox)
{
  this.lworldOrgX = wox;
}

Transform.prototype.getWorldOrgY = function ()
{
  return this.lworldOrgY;
}

Transform.prototype.setWorldOrgY = function (woy)
{
  this.lworldOrgY = woy;
}

Transform.prototype.getWorldExtX = function ()
{
  return this.lworldExtX;
}

Transform.prototype.setWorldExtX = function (wex)
{
  this.lworldExtX = wex;
}

Transform.prototype.getWorldExtY = function ()
{
  return this.lworldExtY;
}

Transform.prototype.setWorldExtY = function (wey)
{
  this.lworldExtY = wey;
}

/* Device related */

Transform.prototype.getDeviceOrgX = function ()
{
  return this.ldeviceOrgX;
}

Transform.prototype.setDeviceOrgX = function (dox)
{
  this.ldeviceOrgX = dox;
}

Transform.prototype.getDeviceOrgY = function ()
{
  return this.ldeviceOrgY;
}

Transform.prototype.setDeviceOrgY = function (doy)
{
  this.ldeviceOrgY = doy;
}

Transform.prototype.getDeviceExtX = function ()
{
  return this.ldeviceExtX;
}

Transform.prototype.setDeviceExtX = function (dex)
{
  this.ldeviceExtX = dex;
}

Transform.prototype.getDeviceExtY = function ()
{
  return this.ldeviceExtY;
}

Transform.prototype.setDeviceExtY = function (dey)
{
  this.ldeviceExtY = dey;
}

Transform.prototype.transformX = function (x)
{
  var xDevice = 0.0;
  var worldExtX = this.lworldExtX;
  if (worldExtX != 0.0)
  {
    xDevice = this.ldeviceOrgX +
            ((x - this.lworldOrgX) * this.ldeviceExtX / worldExtX);
  }

  return xDevice;
}

Transform.prototype.transformY = function (y)
{
  var yDevice = 0.0;
  var worldExtY = this.lworldExtY;
  if (worldExtY != 0.0)
  {
    yDevice = this.ldeviceOrgY +
            ((y - this.lworldOrgY) * this.ldeviceExtY / worldExtY);
  }


  return yDevice;
}

Transform.prototype.inverseTransformX = function (x)
{
  var xWorld = 0.0;
  var deviceExtX = this.ldeviceExtX;
  if (deviceExtX != 0.0)
  {
    xWorld = this.lworldOrgX +
            ((x - this.ldeviceOrgX) * this.lworldExtX / deviceExtX);
  }


  return xWorld;
}

Transform.prototype.inverseTransformY = function (y)
{
  var yWorld = 0.0;
  var deviceExtY = this.ldeviceExtY;
  if (deviceExtY != 0.0)
  {
    yWorld = this.lworldOrgY +
            ((y - this.ldeviceOrgY) * this.lworldExtY / deviceExtY);
  }
  return yWorld;
}

Transform.prototype.inverseTransformPoint = function (inPoint)
{
  var outPoint =
          new PointD(this.inverseTransformX(inPoint.x),
                  this.inverseTransformY(inPoint.y));
  return outPoint;
}

module.exports = Transform;

},{}],29:[function(_dereq_,module,exports){
function UniqueIDGeneretor() {
}

UniqueIDGeneretor.lastID = 0;

UniqueIDGeneretor.createID = function (obj) {
  if (UniqueIDGeneretor.isPrimitive(obj)) {
    return obj;
  }
  if (obj.uniqueID != null) {
    return obj.uniqueID;
  }
  obj.uniqueID = UniqueIDGeneretor.getString();
  UniqueIDGeneretor.lastID++;
  return obj.uniqueID;
}

UniqueIDGeneretor.getString = function (id) {
  if (id == null)
    id = UniqueIDGeneretor.lastID;
  return "Object#" + id + "";
}

UniqueIDGeneretor.isPrimitive = function (arg) {
  var type = typeof arg;
  return arg == null || (type != "object" && type != "function");
}

module.exports = UniqueIDGeneretor;

},{}],30:[function(_dereq_,module,exports){
'use strict';

var Thread;

var DimensionD = _dereq_('./DimensionD');
var HashMap = _dereq_('./HashMap');
var HashSet = _dereq_('./HashSet');
var IGeometry = _dereq_('./IGeometry');
var IMath = _dereq_('./IMath');
var Integer = _dereq_('./Integer');
var Point = _dereq_('./Point');
var PointD = _dereq_('./PointD');
var RandomSeed = _dereq_('./RandomSeed');
var RectangleD = _dereq_('./RectangleD');
var Transform = _dereq_('./Transform');
var UniqueIDGeneretor = _dereq_('./UniqueIDGeneretor');
var LGraphObject = _dereq_('./LGraphObject');
var LGraph = _dereq_('./LGraph');
var LEdge = _dereq_('./LEdge');
var LGraphManager = _dereq_('./LGraphManager');
var LNode = _dereq_('./LNode');
var Layout = _dereq_('./Layout');
var LayoutConstants = _dereq_('./LayoutConstants');
var FDLayout = _dereq_('./FDLayout');
var FDLayoutConstants = _dereq_('./FDLayoutConstants');
var FDLayoutEdge = _dereq_('./FDLayoutEdge');
var FDLayoutNode = _dereq_('./FDLayoutNode');
var CoSEConstants = _dereq_('./CoSEConstants');
var CoSEEdge = _dereq_('./CoSEEdge');
var CoSEGraph = _dereq_('./CoSEGraph');
var CoSEGraphManager = _dereq_('./CoSEGraphManager');
var CoSELayout = _dereq_('./CoSELayout');
var CoSENode = _dereq_('./CoSENode');

_CoSELayout.idToLNode = {};
_CoSELayout.toBeTiled = {};

var defaults = {
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8
};

function extend(defaults, options) {
  var obj = {};

  for (var i in defaults) {
    obj[i] = defaults[i];
  }

  for (var i in options) {
    obj[i] = options[i];
  }

  return obj;
}
;

_CoSELayout.layout = new CoSELayout();
function _CoSELayout(options) {

  this.options = extend(defaults, options);
  _CoSELayout.getUserOptions(this.options);
}

_CoSELayout.getUserOptions = function (options) {
  if (options.nodeRepulsion != null)
    CoSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
  if (options.idealEdgeLength != null)
    CoSEConstants.DEFAULT_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
  if (options.edgeElasticity != null)
    CoSEConstants.DEFAULT_SPRING_STRENGTH = FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
  if (options.nestingFactor != null)
    CoSEConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
  if (options.gravity != null)
    CoSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
  if (options.numIter != null)
    CoSEConstants.MAX_ITERATIONS = FDLayoutConstants.MAX_ITERATIONS = options.numIter;
  if (options.gravityRange != null)
    CoSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;
  if(options.gravityCompound != null)
    CoSEConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = options.gravityCompound;
  if(options.gravityRangeCompound != null)
    CoSEConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = options.gravityRangeCompound;
  
  CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL =
          !(options.randomize);
  CoSEConstants.ANIMATE = FDLayoutConstants.ANIMATE = options.animate;
};

_CoSELayout.prototype.run = function () {
  var layout = this;

  _CoSELayout.idToLNode = {};
  _CoSELayout.toBeTiled = {};
  _CoSELayout.layout = new CoSELayout();
  this.cy = this.options.cy;
  var after = this;

  this.cy.trigger('layoutstart');

  var gm = _CoSELayout.layout.newGraphManager();
  this.gm = gm;

  var nodes = this.options.eles.nodes();
  var edges = this.options.eles.edges();

  this.root = gm.addRoot();

  if (!this.options.tile) {
    this.processChildrenList(this.root, _CoSELayout.getTopMostNodes(nodes));
  }
  else {
    // Find zero degree nodes and create a compound for each level
    var memberGroups = this.groupZeroDegreeMembers();
    // Tile and clear children of each compound
    var tiledMemberPack = this.clearCompounds(this.options);
    // Separately tile and clear zero degree nodes for each level
    var tiledZeroDegreeNodes = this.clearZeroDegreeMembers(memberGroups);
  }


  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var sourceNode = _CoSELayout.idToLNode[edge.data("source")];
    var targetNode = _CoSELayout.idToLNode[edge.data("target")];
    var e1 = gm.add(_CoSELayout.layout.newEdge(), sourceNode, targetNode);
    e1.id = edge.id();
  }


  var t1 = layout.thread;

  if (!t1 || t1.stopped()) { // try to reuse threads
    t1 = layout.thread = Thread();

    t1.require(DimensionD, 'DimensionD');
    t1.require(HashMap, 'HashMap');
    t1.require(HashSet, 'HashSet');
    t1.require(IGeometry, 'IGeometry');
    t1.require(IMath, 'IMath');
    t1.require(Integer, 'Integer');
    t1.require(Point, 'Point');
    t1.require(PointD, 'PointD');
    t1.require(RandomSeed, 'RandomSeed');
    t1.require(RectangleD, 'RectangleD');
    t1.require(Transform, 'Transform');
    t1.require(UniqueIDGeneretor, 'UniqueIDGeneretor');
    t1.require(LGraphObject, 'LGraphObject');
    t1.require(LGraph, 'LGraph');
    t1.require(LEdge, 'LEdge');
    t1.require(LGraphManager, 'LGraphManager');
    t1.require(LNode, 'LNode');
    t1.require(Layout, 'Layout');
    t1.require(LayoutConstants, 'LayoutConstants');
    t1.require(FDLayout, 'FDLayout');
    t1.require(FDLayoutConstants, 'FDLayoutConstants');
    t1.require(FDLayoutEdge, 'FDLayoutEdge');
    t1.require(FDLayoutNode, 'FDLayoutNode');
    t1.require(CoSEConstants, 'CoSEConstants');
    t1.require(CoSEEdge, 'CoSEEdge');
    t1.require(CoSEGraph, 'CoSEGraph');
    t1.require(CoSEGraphManager, 'CoSEGraphManager');
    t1.require(CoSELayout, 'CoSELayout');
    t1.require(CoSENode, 'CoSENode');
  }

  var nodes = this.options.eles.nodes();
  var edges = this.options.eles.edges();

  // First I need to create the data structure to pass to the worker
  var pData = {
    'nodes': [],
    'edges': []
  };

  //Map the ids of nodes in the list to check if a node is in the list in constant time
  var nodeIdMap = {};
  
  //Fill the map in linear time
  for(var i = 0; i < nodes.length; i++){
    nodeIdMap[nodes[i].id()] = true;
  }

  var lnodes = gm.getAllNodes();
  for (var i = 0; i < lnodes.length; i++) {
    var lnode = lnodes[i];
    var nodeId = lnode.id;
    var cyNode = this.options.cy.getElementById(nodeId);
    
    var parentId = cyNode.data('parent');
    parentId = nodeIdMap[parentId]?parentId:undefined;
    
    var w = lnode.rect.width;
    var posX = lnode.rect.x;
    var posY = lnode.rect.y;
    var h = lnode.rect.height;
    var dummy_parent_id = null;
    if(cyNode.scratch('coseBilkent') && cyNode.scratch('coseBilkent').dummy_parent_id)
      dummy_parent_id = cyNode.scratch('coseBilkent').dummy_parent_id;

    pData[ 'nodes' ].push({
      id: nodeId,
      pid: parentId,
      x: posX,
      y: posY,
      width: w,
      height: h,
      dummy_parent_id: dummy_parent_id
    });

  }

  var ledges = gm.getAllEdges();
  for (var i = 0; i < ledges.length; i++) {
    var ledge = ledges[i];
    var edgeId = ledge.id;
    var cyEdge = this.options.cy.getElementById(edgeId);
    var srcNodeId = cyEdge.source().id();
    var tgtNodeId = cyEdge.target().id();
    pData[ 'edges' ].push({
      id: edgeId,
      source: srcNodeId,
      target: tgtNodeId
    });
  }

  var ready = false;

  t1.pass(pData).run(function (pData) {
    var log = function (msg) {
      broadcast({log: msg});
    };

    log("start thread");

    //the layout will be run in the thread and the results are to be passed
    //to the main thread with the result map
    var layout_t = new CoSELayout();
    var gm_t = layout_t.newGraphManager();
    var ngraph = gm_t.layout.newGraph();
    var nnode = gm_t.layout.newNode(null);
    var root = gm_t.add(ngraph, nnode);
    root.graphManager = gm_t;
    gm_t.setRootGraph(root);
    var root_t = gm_t.rootGraph;

    //maps for inner usage of the thread
    var orphans_t = [];
    var idToLNode_t = {};
    var childrenMap = {};

    //A map of node id to corresponding node position and sizes
    //it is to be returned at the end of the thread function
    var result = {};

    //this function is similar to processChildrenList function in the main thread
    //it is to process the nodes in correct order recursively
    var processNodes = function (parent, children) {
      var size = children.length;
      for (var i = 0; i < size; i++) {
        var theChild = children[i];
        var children_of_children = childrenMap[theChild.id];
        var theNode;

        if (theChild.width != null
                && theChild.height != null) {
          theNode = parent.add(new CoSENode(gm_t,
                  new PointD(theChild.x, theChild.y),
                  new DimensionD(parseFloat(theChild.width),
                          parseFloat(theChild.height))));
        }
        else {
          theNode = parent.add(new CoSENode(gm_t));
        }
        theNode.id = theChild.id;
        idToLNode_t[theChild.id] = theNode;

        if (isNaN(theNode.rect.x)) {
          theNode.rect.x = 0;
        }

        if (isNaN(theNode.rect.y)) {
          theNode.rect.y = 0;
        }

        if (children_of_children != null && children_of_children.length > 0) {
          var theNewGraph;
          theNewGraph = layout_t.getGraphManager().add(layout_t.newGraph(), theNode);
          theNewGraph.graphManager = gm_t;
          processNodes(theNewGraph, children_of_children);
        }
      }
    }

    //fill the chidrenMap and orphans_t maps to process the nodes in the correct order
    var nodes = pData.nodes;
    for (var i = 0; i < nodes.length; i++) {
      var theNode = nodes[i];
      var p_id = theNode.pid;
      if (p_id != null) {
        if (childrenMap[p_id] == null) {
          childrenMap[p_id] = [];
        }
        childrenMap[p_id].push(theNode);
      }
      else {
        orphans_t.push(theNode);
      }
    }

    processNodes(root_t, orphans_t);

    //handle the edges
    var edges = pData.edges;
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var sourceNode = idToLNode_t[edge.source];
      var targetNode = idToLNode_t[edge.target];
      var e1 = gm_t.add(layout_t.newEdge(), sourceNode, targetNode);
    }

    //run the layout crated in this thread
    layout_t.runLayout();

    //fill the result map
    for (var id in idToLNode_t) {
      var lNode = idToLNode_t[id];
      var rect = lNode.rect;
      result[id] = {
        id: id,
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height
      };
    }
    var seeds = {};
    seeds.rsSeed = RandomSeed.seed;
    seeds.rsX = RandomSeed.x;
    var pass = {
      result: result,
      seeds: seeds
    }
    //return the result map to pass it to the then function as parameter
    return pass;
  }).then(function (pass) {
    var result = pass.result;
    var seeds = pass.seeds;
    RandomSeed.seed = seeds.rsSeed;
    RandomSeed.x = seeds.rsX;
    //refresh the lnode positions and sizes by using result map
    for (var id in result) {
      var lNode = _CoSELayout.idToLNode[id];
      var node = result[id];
      lNode.rect.x = node.x;
      lNode.rect.y = node.y;
      lNode.rect.width = node.w;
      lNode.rect.height = node.h;
    }
    if (after.options.tile) {
      // Repopulate members
      after.repopulateZeroDegreeMembers(tiledZeroDegreeNodes);
      after.repopulateCompounds(tiledMemberPack);
      after.options.eles.nodes().updateCompoundBounds();
    }

    var getPositions = function(i ,ele){
      var theId = ele.data('id');
      var lNode = _CoSELayout.idToLNode[theId];

      return {
        x: lNode.getRect().getCenterX(),
        y: lNode.getRect().getCenterY()
      };
    };

    if(after.options.animate !== 'during'){
      after.options.eles.nodes().layoutPositions(after, after.options, getPositions);
    }
    else {
      after.options.eles.nodes().positions(getPositions);
      
      if (after.options.fit)
        after.options.cy.fit(after.options.eles.nodes(), after.options.padding);
    
      //trigger layoutready when each node has had its position set at least once
      if (!ready) {
        after.cy.one('layoutready', after.options.ready);
        after.cy.trigger('layoutready');
      }
      
      // trigger layoutstop when the layout stops (e.g. finishes)
      after.cy.one('layoutstop', after.options.stop);
      after.cy.trigger('layoutstop');
    }
    
    t1.stop();
    after.options.eles.nodes().removeScratch('coseBilkent');
  });

  t1.on('message', function (e) {
    var logMsg = e.message.log;
    if (logMsg != null) {
      console.log('Thread log: ' + logMsg);
      return;
    }
    var pData = e.message.pData;
    if (pData != null) {
      after.options.eles.nodes().positions(function (i, ele) {
        if (ele.scratch('coseBilkent') && ele.scratch('coseBilkent').dummy_parent_id) {
          var dummyParent = ele.scratch('coseBilkent').dummy_parent_id;
          return {
            x: dummyParent.x,
            y: dummyParent.y
          };
        }
        var theId = ele.data('id');
        var pNode = pData[theId];
        var temp = this;
        while (pNode == null) {
          temp = temp.parent()[0];
          pNode = pData[temp.id()];
          pData[theId] = pNode;
        }
        return {
          x: pNode.x,
          y: pNode.y
        };
      });

      if (after.options.fit)
        after.options.cy.fit(after.options.eles.nodes(), after.options.padding);

      if (!ready) {
        ready = true;
        after.one('layoutready', after.options.ready);
        after.trigger({type: 'layoutready', layout: after});
      }
      return;
    }
  });

  return this; // chaining
};

//Get the top most ones of a list of nodes
_CoSELayout.getTopMostNodes = function(nodes) {
  var nodesMap = {};
  for (var i = 0; i < nodes.length; i++) {
      nodesMap[nodes[i].id()] = true;
  }
  var roots = nodes.filter(function (i, ele) {
      var parent = ele.parent()[0];
      while(parent != null){
        if(nodesMap[parent.id()]){
          return false;
        }
        parent = parent.parent()[0];
      }
      return true;
  });

  return roots;
};

_CoSELayout.prototype.getToBeTiled = function (node) {
  var id = node.data("id");
  //firstly check the previous results
  if (_CoSELayout.toBeTiled[id] != null) {
    return _CoSELayout.toBeTiled[id];
  }

  //only compound nodes are to be tiled
  var children = node.children();
  if (children == null || children.length == 0) {
    _CoSELayout.toBeTiled[id] = false;
    return false;
  }

  //a compound node is not to be tiled if all of its compound children are not to be tiled
  for (var i = 0; i < children.length; i++) {
    var theChild = children[i];

    if (this.getNodeDegree(theChild) > 0) {
      _CoSELayout.toBeTiled[id] = false;
      return false;
    }

    //pass the children not having the compound structure
    if (theChild.children() == null || theChild.children().length == 0) {
      _CoSELayout.toBeTiled[theChild.data("id")] = false;
      continue;
    }

    if (!this.getToBeTiled(theChild)) {
      _CoSELayout.toBeTiled[id] = false;
      return false;
    }
  }
  _CoSELayout.toBeTiled[id] = true;
  return true;
};

_CoSELayout.prototype.getNodeDegree = function (node) {
  var id = node.id();
  var edges = this.options.eles.edges().filter(function (i, ele) {
    var source = ele.data('source');
    var target = ele.data('target');
    if (source != target && (source == id || target == id)) {
      return true;
    }
  });
  return edges.length;
};

_CoSELayout.prototype.getNodeDegreeWithChildren = function (node) {
  var degree = this.getNodeDegree(node);
  var children = node.children();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    degree += this.getNodeDegreeWithChildren(child);
  }
  return degree;
};

_CoSELayout.prototype.groupZeroDegreeMembers = function () {
  // array of [parent_id x oneDegreeNode_id] 
  var tempMemberGroups = [];
  var memberGroups = [];
  var self = this;
  var parentMap = {};
  
  for(var i = 0; i < this.options.eles.nodes().length; i++){
    parentMap[this.options.eles.nodes()[i].id()] = true;
  }
  
  // Find all zero degree nodes which aren't covered by a compound
  var zeroDegree = this.options.eles.nodes().filter(function (i, ele) {
    var pid = ele.data('parent');
    if(pid != undefined && !parentMap[pid]){
      pid = undefined;
    }
    
    if (self.getNodeDegreeWithChildren(ele) == 0 && (pid == undefined || (pid != undefined && !self.getToBeTiled(ele.parent()[0]))))
      return true;
    else
      return false;
  });

  // Create a map of parent node and its zero degree members
  for (var i = 0; i < zeroDegree.length; i++)
  {
    var node = zeroDegree[i];
    var p_id = node.parent().id();
    
    if(p_id != undefined && !parentMap[p_id]){
      p_id = undefined;
    }

    if (typeof tempMemberGroups[p_id] === "undefined")
      tempMemberGroups[p_id] = [];

    tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node);
  }

  // If there are at least two nodes at a level, create a dummy compound for them
  for (var p_id in tempMemberGroups) {
    if (tempMemberGroups[p_id].length > 1) {
      var dummyCompoundId = "DummyCompound_" + p_id;
      memberGroups[dummyCompoundId] = tempMemberGroups[p_id];

      // Create a dummy compound
      if (this.options.cy.getElementById(dummyCompoundId).empty()) {
        this.options.cy.add({
          group: "nodes",
          data: {id: dummyCompoundId, parent: p_id
          }
        });

        var dummy = this.options.cy.nodes()[this.options.cy.nodes().length - 1];
        this.options.eles = this.options.eles.union(dummy);
        dummy.hide();

        for (var i = 0; i < tempMemberGroups[p_id].length; i++) {
          if (i == 0) {
            dummy.scratch('coseBilkent', {tempchildren: []});
          }
          var node = tempMemberGroups[p_id][i];
          var scratchObj = node.scratch('coseBilkent');
          if(!scratchObj) {
              scratchObj = {};
              node.scratch('coseBilkent', scratchObj); 
          }
          scratchObj['dummy_parent_id'] = dummyCompoundId;
          this.options.cy.add({
            group: "nodes",
            data: {parent: dummyCompoundId, width: node.width(), height: node.height()
            }
          });
          var tempchild = this.options.cy.nodes()[this.options.cy.nodes().length - 1];
          tempchild.hide();
          tempchild.css('width', tempchild.data('width'));
          tempchild.css('height', tempchild.data('height'));
          tempchild.width();
          dummy.scratch('coseBilkent').tempchildren.push(tempchild);
        }
      }
    }
  }

  return memberGroups;
};

_CoSELayout.prototype.performDFSOnCompounds = function (options) {
  var compoundOrder = [];

  var roots = _CoSELayout.getTopMostNodes(this.options.eles.nodes());
  this.fillCompexOrderByDFS(compoundOrder, roots);

  return compoundOrder;
};

_CoSELayout.prototype.fillCompexOrderByDFS = function (compoundOrder, children) {
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    this.fillCompexOrderByDFS(compoundOrder, child.children());
    if (this.getToBeTiled(child)) {
      compoundOrder.push(child);
    }
  }
};

_CoSELayout.prototype.clearCompounds = function (options) {
  var childGraphMap = [];

  // Get compound ordering by finding the inner one first
  var compoundOrder = this.performDFSOnCompounds(options);
  _CoSELayout.compoundOrder = compoundOrder;
  this.processChildrenList(this.root, _CoSELayout.getTopMostNodes(this.options.eles.nodes()));

  for (var i = 0; i < compoundOrder.length; i++) {
    // find the corresponding layout node
    var lCompoundNode = _CoSELayout.idToLNode[compoundOrder[i].id()];

    childGraphMap[compoundOrder[i].id()] = compoundOrder[i].children();

    // Remove children of compounds 
    lCompoundNode.child = null;
  }

  // Tile the removed children
  var tiledMemberPack = this.tileCompoundMembers(childGraphMap);

  return tiledMemberPack;
};

_CoSELayout.prototype.clearZeroDegreeMembers = function (memberGroups) {
  var tiledZeroDegreePack = [];

  for (var id in memberGroups) {
    var compoundNode = _CoSELayout.idToLNode[id];

    tiledZeroDegreePack[id] = this.tileNodes(memberGroups[id]);

    // Set the width and height of the dummy compound as calculated
    compoundNode.rect.width = tiledZeroDegreePack[id].width;
    compoundNode.rect.height = tiledZeroDegreePack[id].height;
  }
  return tiledZeroDegreePack;
};

_CoSELayout.prototype.repopulateCompounds = function (tiledMemberPack) {
  for (var i = _CoSELayout.compoundOrder.length - 1; i >= 0; i--) {
    var id = _CoSELayout.compoundOrder[i].id();
    var lCompoundNode = _CoSELayout.idToLNode[id];
    var horizontalMargin = parseInt(_CoSELayout.compoundOrder[i].css('padding-left'));
    var verticalMargin = parseInt(_CoSELayout.compoundOrder[i].css('padding-top'));

    this.adjustLocations(tiledMemberPack[id], lCompoundNode.rect.x, lCompoundNode.rect.y, horizontalMargin, verticalMargin);
  }
};

_CoSELayout.prototype.repopulateZeroDegreeMembers = function (tiledPack) {
  for (var i in tiledPack) {
    var compound = this.cy.getElementById(i);
    var compoundNode = _CoSELayout.idToLNode[i];
    var horizontalMargin = parseInt(compound.css('padding-left'));
    var verticalMargin = parseInt(compound.css('padding-top'));
    
    // Adjust the positions of nodes wrt its compound
    this.adjustLocations(tiledPack[i], compoundNode.rect.x, compoundNode.rect.y, horizontalMargin, verticalMargin);

    var tempchildren = compound.scratch('coseBilkent').tempchildren;
    for (var i = 0; i < tempchildren.length; i++) {
      tempchildren[i].remove();
    }

    // Remove the dummy compound
    compound.remove();
  }
};

/**
 * This method places each zero degree member wrt given (x,y) coordinates (top left). 
 */
_CoSELayout.prototype.adjustLocations = function (organization, x, y, compoundHorizontalMargin, compoundVerticalMargin) {
  x += compoundHorizontalMargin;
  y += compoundVerticalMargin;

  var left = x;

  for (var i = 0; i < organization.rows.length; i++) {
    var row = organization.rows[i];
    x = left;
    var maxHeight = 0;

    for (var j = 0; j < row.length; j++) {
      var lnode = row[j];
      var node = this.cy.getElementById(lnode.id);

      lnode.rect.x = x;// + lnode.rect.width / 2;
      lnode.rect.y = y;// + lnode.rect.height / 2;

      x += lnode.rect.width + organization.horizontalPadding;

      if (lnode.rect.height > maxHeight)
        maxHeight = lnode.rect.height;
    }

    y += maxHeight + organization.verticalPadding;
  }
};

_CoSELayout.prototype.tileCompoundMembers = function (childGraphMap) {
  var tiledMemberPack = [];

  for (var id in childGraphMap) {
    // Access layoutInfo nodes to set the width and height of compounds
    var compoundNode = _CoSELayout.idToLNode[id];

    tiledMemberPack[id] = this.tileNodes(childGraphMap[id]);

    compoundNode.rect.width = tiledMemberPack[id].width + 20;
    compoundNode.rect.height = tiledMemberPack[id].height + 20;
  }

  return tiledMemberPack;
};

_CoSELayout.prototype.tileNodes = function (nodes) {
  var self = this;
  var verticalPadding = typeof self.options.tilingPaddingVertical === 'function' ? self.options.tilingPaddingVertical.call() : self.options.tilingPaddingVertical;
  var horizontalPadding = typeof self.options.tilingPaddingHorizontal === 'function' ? self.options.tilingPaddingHorizontal.call() : self.options.tilingPaddingHorizontal;
  var organization = {
    rows: [],
    rowWidth: [],
    rowHeight: [],
    width: 20,
    height: 20,
    verticalPadding: verticalPadding,
    horizontalPadding: horizontalPadding
  };

  var layoutNodes = [];

  // Get layout nodes
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var lNode = _CoSELayout.idToLNode[node.id()];

    if (!node.scratch('coseBilkent')  || !node.scratch('coseBilkent').dummy_parent_id) {
      var owner = lNode.owner;
      owner.remove(lNode);

      this.gm.resetAllNodes();
      this.gm.getAllNodes();
    }

    layoutNodes.push(lNode);
  }

  // Sort the nodes in ascending order of their areas
  layoutNodes.sort(function (n1, n2) {
    if (n1.rect.width * n1.rect.height > n2.rect.width * n2.rect.height)
      return -1;
    if (n1.rect.width * n1.rect.height < n2.rect.width * n2.rect.height)
      return 1;
    return 0;
  });

  // Create the organization -> tile members
  for (var i = 0; i < layoutNodes.length; i++) {
    var lNode = layoutNodes[i];
    
    var cyNode = this.cy.getElementById(lNode.id).parent()[0];
    var minWidth = 0;
    if(cyNode){
      minWidth = parseInt(cyNode.css('padding-left')) + parseInt(cyNode.css('padding-right'));
    }
    
    if (organization.rows.length == 0) {
      this.insertNodeToRow(organization, lNode, 0, minWidth);
    }
    else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
      this.insertNodeToRow(organization, lNode, this.getShortestRowIndex(organization), minWidth);
    }
    else {
      this.insertNodeToRow(organization, lNode, organization.rows.length, minWidth);
    }

    this.shiftToLastRow(organization);
  }

  return organization;
};

_CoSELayout.prototype.insertNodeToRow = function (organization, node, rowIndex, minWidth) {
  var minCompoundSize = minWidth;

  // Add new row if needed
  if (rowIndex == organization.rows.length) {
    var secondDimension = [];

    organization.rows.push(secondDimension);
    organization.rowWidth.push(minCompoundSize);
    organization.rowHeight.push(0);
  }

  // Update row width
  var w = organization.rowWidth[rowIndex] + node.rect.width;

  if (organization.rows[rowIndex].length > 0) {
    w += organization.horizontalPadding;
  }

  organization.rowWidth[rowIndex] = w;
  // Update compound width
  if (organization.width < w) {
    organization.width = w;
  }

  // Update height
  var h = node.rect.height;
  if (rowIndex > 0)
    h += organization.verticalPadding;

  var extraHeight = 0;
  if (h > organization.rowHeight[rowIndex]) {
    extraHeight = organization.rowHeight[rowIndex];
    organization.rowHeight[rowIndex] = h;
    extraHeight = organization.rowHeight[rowIndex] - extraHeight;
  }

  organization.height += extraHeight;

  // Insert node
  organization.rows[rowIndex].push(node);
};

//Scans the rows of an organization and returns the one with the min width
_CoSELayout.prototype.getShortestRowIndex = function (organization) {
  var r = -1;
  var min = Number.MAX_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {
    if (organization.rowWidth[i] < min) {
      r = i;
      min = organization.rowWidth[i];
    }
  }
  return r;
};

//Scans the rows of an organization and returns the one with the max width
_CoSELayout.prototype.getLongestRowIndex = function (organization) {
  var r = -1;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < organization.rows.length; i++) {

    if (organization.rowWidth[i] > max) {
      r = i;
      max = organization.rowWidth[i];
    }
  }

  return r;
};

/**
 * This method checks whether adding extra width to the organization violates
 * the aspect ratio(1) or not.
 */
_CoSELayout.prototype.canAddHorizontal = function (organization, extraWidth, extraHeight) {

  var sri = this.getShortestRowIndex(organization);

  if (sri < 0) {
    return true;
  }

  var min = organization.rowWidth[sri];

  if (min + organization.horizontalPadding + extraWidth <= organization.width)
    return true;

  var hDiff = 0;

  // Adding to an existing row
  if (organization.rowHeight[sri] < extraHeight) {
    if (sri > 0)
      hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
  }

  var add_to_row_ratio;
  if (organization.width - min >= extraWidth + organization.horizontalPadding) {
    add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
  } else {
    add_to_row_ratio = (organization.height + hDiff) / organization.width;
  }

  // Adding a new row for this node
  hDiff = extraHeight + organization.verticalPadding;
  var add_new_row_ratio;
  if (organization.width < extraWidth) {
    add_new_row_ratio = (organization.height + hDiff) / extraWidth;
  } else {
    add_new_row_ratio = (organization.height + hDiff) / organization.width;
  }

  if (add_new_row_ratio < 1)
    add_new_row_ratio = 1 / add_new_row_ratio;

  if (add_to_row_ratio < 1)
    add_to_row_ratio = 1 / add_to_row_ratio;

  return add_to_row_ratio < add_new_row_ratio;
};


//If moving the last node from the longest row and adding it to the last
//row makes the bounding box smaller, do it.
_CoSELayout.prototype.shiftToLastRow = function (organization) {
  var longest = this.getLongestRowIndex(organization);
  var last = organization.rowWidth.length - 1;
  var row = organization.rows[longest];
  var node = row[row.length - 1];

  var diff = node.width + organization.horizontalPadding;

  // Check if there is enough space on the last row
  if (organization.width - organization.rowWidth[last] > diff && longest != last) {
    // Remove the last element of the longest row
    row.splice(-1, 1);

    // Push it to the last row
    organization.rows[last].push(node);

    organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
    organization.rowWidth[last] = organization.rowWidth[last] + diff;
    organization.width = organization.rowWidth[this.getLongestRowIndex(organization)];

    // Update heights of the organization
    var maxHeight = Number.MIN_VALUE;
    for (var i = 0; i < row.length; i++) {
      if (row[i].height > maxHeight)
        maxHeight = row[i].height;
    }
    if (longest > 0)
      maxHeight += organization.verticalPadding;

    var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];

    organization.rowHeight[longest] = maxHeight;
    if (organization.rowHeight[last] < node.height + organization.verticalPadding)
      organization.rowHeight[last] = node.height + organization.verticalPadding;

    var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
    organization.height += (finalTotal - prevTotal);

    this.shiftToLastRow(organization);
  }
};

/**
 * @brief : called on continuous layouts to stop them before they finish
 */
_CoSELayout.prototype.stop = function () {
  this.stopped = true;

  if( this.thread ){
    this.thread.stop();
  }
  
  this.trigger('layoutstop');

  return this; // chaining
};

_CoSELayout.prototype.processChildrenList = function (parent, children) {
  var size = children.length;
  for (var i = 0; i < size; i++) {
    var theChild = children[i];
    this.options.eles.nodes().length;
    var children_of_children = theChild.children();
    var theNode;

    if (theChild.width() != null
            && theChild.height() != null) {
      theNode = parent.add(new CoSENode(_CoSELayout.layout.graphManager,
              new PointD(theChild.position('x'), theChild.position('y')),
              new DimensionD(parseFloat(theChild.width()),
                      parseFloat(theChild.height()))));
    }
    else {
      theNode = parent.add(new CoSENode(this.graphManager));
    }
    theNode.id = theChild.data("id");
    _CoSELayout.idToLNode[theChild.data("id")] = theNode;

    if (isNaN(theNode.rect.x)) {
      theNode.rect.x = 0;
    }

    if (isNaN(theNode.rect.y)) {
      theNode.rect.y = 0;
    }

    if (children_of_children != null && children_of_children.length > 0) {
      var theNewGraph;
      theNewGraph = _CoSELayout.layout.getGraphManager().add(_CoSELayout.layout.newGraph(), theNode);
      this.processChildrenList(theNewGraph, children_of_children);
    }
  }
};

module.exports = function get(cytoscape) {
  Thread = cytoscape.Thread;

  return _CoSELayout;
};

},{"./CoSEConstants":1,"./CoSEEdge":2,"./CoSEGraph":3,"./CoSEGraphManager":4,"./CoSELayout":5,"./CoSENode":6,"./DimensionD":7,"./FDLayout":8,"./FDLayoutConstants":9,"./FDLayoutEdge":10,"./FDLayoutNode":11,"./HashMap":12,"./HashSet":13,"./IGeometry":14,"./IMath":15,"./Integer":16,"./LEdge":17,"./LGraph":18,"./LGraphManager":19,"./LGraphObject":20,"./LNode":21,"./Layout":22,"./LayoutConstants":23,"./Point":24,"./PointD":25,"./RandomSeed":26,"./RectangleD":27,"./Transform":28,"./UniqueIDGeneretor":29}],31:[function(_dereq_,module,exports){
'use strict';

// registers the extension on a cytoscape lib ref
var getLayout = _dereq_('./Layout');

var register = function( cytoscape ){
  var Layout = getLayout( cytoscape );

  cytoscape('layout', 'cose-bilkent', Layout);
};

if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
  register( cytoscape );
}

module.exports = register;

},{"./Layout":30}]},{},[31])(31)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeEdgeBendEditing = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var debounce = _dereq_('./debounce');
var bendPointUtilities = _dereq_('./bendPointUtilities');
var registerUndoRedoFunctions = _dereq_('./registerUndoRedoFunctions');

module.exports = function (params, cy) {
  var fn = params;

  var addBendPointCxtMenuId = 'cy-edge-bend-editing-cxt-add-bend-point';
  var removeBendPointCxtMenuId = 'cy-edge-bend-editing-cxt-remove-bend-point';
  var ePosition, eRemove, eZoom, eSelect, eUnselect, eTapStart, eTapDrag, eTapEnd, eCxtTap;
  var functions = {
    init: function () {
      // register undo redo functions
      registerUndoRedoFunctions(cy);
      
      var self = this;
      var opts = params;
      var $container = $(this);
      var $canvas = $('<canvas></canvas>');

      $container.append($canvas);

      var cxtAddBendPointFcn = function (event) {
        var edge = event.cyTarget;
        
        var param = {
          edge: edge,
          weights: edge.scratch('cyedgebendeditingWeights')?[].concat(edge.scratch('cyedgebendeditingWeights')):edge.scratch('cyedgebendeditingWeights'),
          distances: edge.scratch('cyedgebendeditingDistances')?[].concat(edge.scratch('cyedgebendeditingDistances')):edge.scratch('cyedgebendeditingDistances')
        };
        
        bendPointUtilities.addBendPoint();
        
        if(options().undoable) {
          cy.undoRedo().do('changeBendPoints', param);
        }
        
        clearDraws(true);
      };

      var cxtRemoveBendPointFcn = function (event) {
        var edge = event.cyTarget;
        
        var param = {
          edge: edge,
          weights: [].concat(edge.scratch('cyedgebendeditingWeights')),
          distances: [].concat(edge.scratch('cyedgebendeditingDistances'))
        };

        bendPointUtilities.removeBendPoint();
        
        if(options().undoable) {
          cy.undoRedo().do('changeBendPoints', param);
        }
        
        clearDraws(true);
      };
      
      var menuItems = [
        {
          id: addBendPointCxtMenuId,
          title: opts.addBendMenuItemTitle,
          selector: 'edge:selected',
          onClickFunction: cxtAddBendPointFcn
        },
        {
          id: removeBendPointCxtMenuId,
          title: opts.removeBendMenuItemTitle,
          selector: 'edge:selected',
          onClickFunction: cxtRemoveBendPointFcn
        }
      ];
      
      if(cy.contextMenus) {
        var menus = cy.contextMenus('get');
        // If context menus is active just append menu items else activate the extension
        // with initial menu items
        if (menus.isActive()) {
          menus.appendMenuItems(menuItems);
        }
        else {
          cy.contextMenus({
            menuItems: menuItems,
            menuItemClasses: ['cy-edge-bend-editing-cxt-operation']
          });
        }
      }
      
      var _sizeCanvas = debounce(function () {
        $canvas
          .attr('height', $container.height())
          .attr('width', $container.width())
          .css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'z-index': '999'
          })
        ;

        setTimeout(function () {
          var canvasBb = $canvas.offset();
          var containerBb = $container.offset();

          $canvas
            .css({
              'top': -(canvasBb.top - containerBb.top),
              'left': -(canvasBb.left - containerBb.left)
            })
          ;

          // redraw on canvas resize
          if(cy){
            clearDraws(true);
          }
        }, 0);

      }, 250);

      function sizeCanvas() {
        _sizeCanvas();
      }

      sizeCanvas();

      $(window).bind('resize', function () {
        sizeCanvas();
      });

      var ctx = $canvas[0].getContext('2d');

      // write options to data
      var data = $container.data('cyedgebendediting');
      if (data == null) {
        data = {};
      }
      data.options = opts;

      var optCache;

      function options() {
        return optCache || (optCache = $container.data('cyedgebendediting').options);
      }
      
      // we will need to convert model positons to rendered positions
      function convertToRenderedPosition(modelPosition) {
        var pan = cy.pan();
        var zoom = cy.zoom();

        var x = modelPosition.x * zoom + pan.x;
        var y = modelPosition.y * zoom + pan.y;

        return {
          x: x,
          y: y
        };
      }

      function clearDraws(renderSelectedBendShapes) {

        var w = $container.width();
        var h = $container.height();

        ctx.clearRect(0, 0, w, h);
        
        if( renderSelectedBendShapes ) {
          var selectedEdges = cy.edges(':selected');
        
          for( var i = 0; i < selectedEdges.length; i++ ) {
            var edge = selectedEdges[i];
            renderBendShapes(edge);
          }
        }
      }
      
      
      // render the bend shapes of the given edge
      function renderBendShapes(edge) {
        
        if(!edge.hasClass('edgebendediting-hasbendpoints')) {
          return;
        }
        
        var segpts = bendPointUtilities.getSegmentPoints(edge);//edge._private.rscratch.segpts;
        var length = getBendShapesLenght(edge);
        
        var srcPos = edge.source().position();
        var tgtPos = edge.target().position();
        
        var weights = edge.scratch('cyedgebendeditingWeights');
        var distances = edge.scratch('cyedgebendeditingDistances');

        for(var i = 0; segpts && i < segpts.length; i = i + 2){
          var bendX = segpts[i];
          var bendY = segpts[i + 1];

          var oldStyle = ctx.fillStyle;
          ctx.fillStyle = edge.css('line-color');
          renderBendShape(bendX, bendY, length);
          ctx.fillStyle = oldStyle;
        }
      }
      
      // render a bend shape with the given parameters
      function renderBendShape(bendX, bendY, length) {
        // get the top left coordinates
        var topLeftX = bendX - length / 2;
        var topLeftY = bendY - length / 2;
        
        // convert to rendered parameters
        var renderedTopLeftPos = convertToRenderedPosition({x: topLeftX, y: topLeftY});
        length *= cy.zoom();
        
        // render bend shape
        ctx.beginPath();
        ctx.rect(renderedTopLeftPos.x, renderedTopLeftPos.y, length, length);
        ctx.fill();
        ctx.closePath();
      }
      
      // get the length of bend points to be rendered
      function getBendShapesLenght(edge) {
        var factor = options().bendShapeSizeFactor;
        var length = parseFloat(edge.css('width')) * factor;
        return length;
      }
      
      // check if the point represented by {x, y} is inside the bend shape
      function checkIfInsideBendShape(x, y, length, centerX, centerY){
        var minX = centerX - length / 2;
        var maxX = centerX + length / 2;
        var minY = centerY - length / 2;
        var maxY = centerY + length / 2;
        
        var inside = (x >= minX && x <= maxX) && (y >= minY && y <= maxY);
        return inside;
      }

      // get tge index of bend point containing the point represented by {x, y}
      function getContainingBendShapeIndex(x, y, edge) {
        if(edge.scratch('cyedgebendeditingWeights') == null || edge.scratch('cyedgebendeditingWeights').lenght == 0){
          return -1;
        }

        var segpts = bendPointUtilities.getSegmentPoints(edge);//edge._private.rscratch.segpts;
        var length = getBendShapesLenght(edge);

        for(var i = 0; segpts && i < segpts.length; i = i + 2){
          var bendX = segpts[i];
          var bendY = segpts[i + 1];

          var inside = checkIfInsideBendShape(x, y, length, bendX, bendY);
          if(inside){
            return i / 2;
          }
        }

        return -1;
      };

      // last status of gestures
      var lastPanningEnabled, lastZoomingEnabled, lastBoxSelectionEnabled;
      
      // store the current status of gestures and set them to false
      function disableGestures() {
        lastPanningEnabled = cy.panningEnabled();
        lastZoomingEnabled = cy.zoomingEnabled();
        lastBoxSelectionEnabled = cy.boxSelectionEnabled();

        cy.zoomingEnabled(false)
          .panningEnabled(false)
          .boxSelectionEnabled(false);
      }
      
      // reset the gestures by their latest status
      function resetGestures() {
        cy.zoomingEnabled(lastZoomingEnabled)
          .panningEnabled(lastPanningEnabled)
          .boxSelectionEnabled(lastBoxSelectionEnabled);
      }

      $container.cytoscape(function (e) {
        clearDraws(true);
        
        lastPanningEnabled = cy.panningEnabled();
        lastZoomingEnabled = cy.zoomingEnabled();
        lastBoxSelectionEnabled = cy.boxSelectionEnabled();
        
        cy.bind('zoom pan', eZoom = function () {
          clearDraws(true);
        });

        cy.on('position', 'node', ePosition = function () {
          var node = this;
          
          clearDraws(true);
        });

        cy.on('remove', 'edge', eRemove = function () {
          var node = this;
          
          clearDraws(true);
        });
        
        cy.on('select', 'edge', eSelect = function () {
          var edge = this;
          
          renderBendShapes(edge);
        });
        
        cy.on('unselect', 'edge', eUnselect = function () {
          var edge = this;
          
          clearDraws(true);
        });
        
        var movedBendIndex;
        var movedBendEdge;
        var moveBendParam;
        var createBendOnDrag;
        
        cy.on('tapstart', 'edge', eTapStart = function (event) {
          var edge = this;
          movedBendEdge = edge;
          
          moveBendParam = {
            edge: edge,
            weights: edge.scratch('cyedgebendeditingWeights') ? [].concat(edge.scratch('cyedgebendeditingWeights')) : [],
            distances: edge.scratch('cyedgebendeditingDistances') ? [].concat(edge.scratch('cyedgebendeditingDistances')) : []
          };
          
          var cyPosX = event.cyPosition.x;
          var cyPosY = event.cyPosition.y;

          var index = getContainingBendShapeIndex(cyPosX, cyPosY, edge);
          if (index != -1) {
            movedBendIndex = index;
//            movedBendEdge = edge;
            disableGestures();
          }
          else {
            createBendOnDrag = true;
          }
        });
        
        cy.on('tapdrag', eTapDrag = function (event) {
          var edge = movedBendEdge;
          
          if(createBendOnDrag) {
            bendPointUtilities.addBendPoint(edge, event.cyPosition);
            movedBendIndex = getContainingBendShapeIndex(event.cyPosition.x, event.cyPosition.y, edge);
            movedBendEdge = edge;
            createBendOnDrag = undefined;
            disableGestures();
          }
          
          if (movedBendEdge === undefined || movedBendIndex === undefined) {
            return;
          }

          var weights = edge.scratch('cyedgebendeditingWeights');
          var distances = edge.scratch('cyedgebendeditingDistances');

          var relativeBendPosition = bendPointUtilities.convertToRelativeBendPosition(edge, event.cyPosition);
          weights[movedBendIndex] = relativeBendPosition.weight;
          distances[movedBendIndex] = relativeBendPosition.distance;

          edge.scratch('cyedgebendeditingWeights', weights);
          edge.scratch('cyedgebendeditingDistances', distances);
          
          clearDraws(true);
        });
        
        cy.on('tapend', eTapEnd = function (event) {
          var edge = movedBendEdge;
          
          if( edge !== undefined ) {
            if( movedBendIndex != undefined ) {
              var startX = edge.source().position('x');
              var startY = edge.source().position('y');
              var endX = edge.target().position('x');
              var endY = edge.target().position('y');
              
              var segPts = bendPointUtilities.getSegmentPoints(edge);
              var allPts = [startX, startY].concat(segPts).concat([endX, endY]);
              
              var pointIndex = movedBendIndex + 1;
              var preIndex = pointIndex - 1;
              var posIndex = pointIndex + 1;
              
              var point = {
                x: allPts[2 * pointIndex],
                y: allPts[2 * pointIndex + 1]
              };
              
              var prePoint = {
                x: allPts[2 * preIndex],
                y: allPts[2 * preIndex + 1]
              };
              
              var posPoint = {
                x: allPts[2 * posIndex],
                y: allPts[2 * posIndex + 1]
              };
              
              var nearToLine;
              
              if( ( point.x === prePoint.x && point.y === prePoint.y ) || ( point.x === prePoint.x && point.y === prePoint.y ) ) {
                nearToLine = true;
              }
              else {
                var m1 = ( prePoint.y - posPoint.y ) / ( prePoint.x - posPoint.x );
                var m2 = -1 / m1;

                var srcTgtPointsAndTangents = {
                  srcPoint: prePoint,
                  tgtPoint: posPoint,
                  m1: m1,
                  m2: m2
                };

                //get the intersection of the current segment with the new bend point
                var currentIntersection = bendPointUtilities.getIntersection(edge, point, srcTgtPointsAndTangents);
                var dist = Math.sqrt( Math.pow( (point.x - currentIntersection.x), 2 ) 
                        + Math.pow( (point.y - currentIntersection.y), 2 ));
                
//                var length = Math.sqrt( Math.pow( (posPoint.x - prePoint.x), 2 ) 
//                        + Math.pow( (posPoint.y - prePoint.y), 2 ));
                
                if( dist  < 8 ) {
                  nearToLine = true;
                }
                
              }
              
              if( nearToLine )
              {
                bendPointUtilities.removeBendPoint(edge, movedBendIndex);
              }
              
            }
          }
          
          if (edge !== undefined && moveBendParam !== undefined && edge.scratch('cyedgebendeditingWeights')
                  && edge.scratch('cyedgebendeditingWeights').toString() != moveBendParam.weights.toString()) {
            
            if(options().undoable) {
              cy.undoRedo().do('changeBendPoints', moveBendParam);
            }
          }

          movedBendIndex = undefined;
          movedBendEdge = undefined;
          moveBendParam = undefined;
          createBendOnDrag = undefined;

          resetGestures();
          clearDraws(true);
        });
        
        cy.on('cxttap', 'edge', eCxtTap = function (event) {
          var edge = this;
          
          if(!edge.selected()) {
            return;
          }

          var selectedBendIndex = getContainingBendShapeIndex(event.cyPosition.x, event.cyPosition.y, edge);
          if (selectedBendIndex == -1) {
            $('#' + removeBendPointCxtMenuId).css('display', 'none');
            bendPointUtilities.currentCtxPos = event.cyPosition;
          }
          else {
            $('#' + addBendPointCxtMenuId).css('display', 'none');
            bendPointUtilities.currentBendIndex = selectedBendIndex;
          }

          bendPointUtilities.currentCtxEdge = edge;
        });
        
        cy.on('cyedgebendediting.changeBendPoints', 'edge', function() {
          var edge = this;
          edge.select();
          clearDraws(true);
          
        });
        
      });

      $container.data('cyedgebendediting', data);
    },
    unbind: function () {
        cy.off('position', 'node', ePosition)
          .off('remove', 'node', eRemove)
          .off('select', 'edge', eSelect)
          .off('unselect', 'edge', eUnselect)
          .off('tapstart', 'edge', eTapStart)
          .off('tapdrag', eTapDrag)
          .off('tapend', eTapEnd)
          .off('cxttap', eCxtTap);

        cy.unbind("zoom pan", eZoom);
    }
  };

  if (functions[fn]) {
    return functions[fn].apply($(cy.container()), Array.prototype.slice.call(arguments, 1));
  } else if (typeof fn == 'object' || !fn) {
    return functions.init.apply($(cy.container()), arguments);
  } else {
    $.error('No such function `' + fn + '` for cytoscape.js-edge-bend-editing');
  }

  return $(this);
};
},{"./bendPointUtilities":2,"./debounce":3,"./registerUndoRedoFunctions":5}],2:[function(_dereq_,module,exports){
var bendPointUtilities = {
  currentCtxEdge: undefined,
  currentCtxPos: undefined,
  currentBendIndex: undefined,
  // initilize bend points based on bendPositionsFcn
  initBendPoints: function(bendPositionsFcn, edges) {
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      
      // get the bend positions by applying the function for this edge
      var bendPositions = bendPositionsFcn.apply(this, edge);
      // calculate relative bend positions
      var result = this.convertToRelativeBendPositions(edge, bendPositions);

      // if there are bend points set weights and distances accordingly and add class to enable style changes
      if (result.distances.length > 0) {
        edge.scratch('cyedgebendeditingWeights', result.weights);
        edge.scratch('cyedgebendeditingDistances', result.distances);
        edge.addClass('edgebendediting-hasbendpoints');
      }
    }
  },
  //Get the direction of the line from source point to the target point
  getLineDirection: function(srcPoint, tgtPoint){
    if(srcPoint.y == tgtPoint.y && srcPoint.x < tgtPoint.x){
      return 1;
    }
    if(srcPoint.y < tgtPoint.y && srcPoint.x < tgtPoint.x){
      return 2;
    }
    if(srcPoint.y < tgtPoint.y && srcPoint.x == tgtPoint.x){
      return 3;
    }
    if(srcPoint.y < tgtPoint.y && srcPoint.x > tgtPoint.x){
      return 4;
    }
    if(srcPoint.y == tgtPoint.y && srcPoint.x > tgtPoint.x){
      return 5;
    }
    if(srcPoint.y > tgtPoint.y && srcPoint.x > tgtPoint.x){
      return 6;
    }
    if(srcPoint.y > tgtPoint.y && srcPoint.x == tgtPoint.x){
      return 7;
    }
    return 8;//if srcPoint.y > tgtPoint.y and srcPoint.x < tgtPoint.x
  },
  getSrcTgtPointsAndTangents: function (edge) {
    var sourceNode = edge.source();
    var targetNode = edge.target();
    
    var tgtPosition = targetNode.position();
    var srcPosition = sourceNode.position();
    
    var srcPoint = sourceNode.position();
    var tgtPoint = targetNode.position();


    var m1 = (tgtPoint.y - srcPoint.y) / (tgtPoint.x - srcPoint.x);
    var m2 = -1 / m1;

    return {
      m1: m1,
      m2: m2,
      srcPoint: srcPoint,
      tgtPoint: tgtPoint
    };
  },
  getIntersection: function(edge, point, srcTgtPointsAndTangents){
    if (srcTgtPointsAndTangents === undefined) {
      srcTgtPointsAndTangents = this.getSrcTgtPointsAndTangents(edge);
    }

    var srcPoint = srcTgtPointsAndTangents.srcPoint;
    var tgtPoint = srcTgtPointsAndTangents.tgtPoint;
    var m1 = srcTgtPointsAndTangents.m1;
    var m2 = srcTgtPointsAndTangents.m2;

    var intersectX;
    var intersectY;

    if(m1 == Infinity || m1 == -Infinity){
      intersectX = srcPoint.x;
      intersectY = point.y;
    }
    else if(m1 == 0){
      intersectX = point.x;
      intersectY = srcPoint.y;
    }
    else {
      var a1 = srcPoint.y - m1 * srcPoint.x;
      var a2 = point.y - m2 * point.x;

      intersectX = (a2 - a1) / (m1 - m2);
      intersectY = m1 * intersectX + a1;
    }

    //Intersection point is the intersection of the lines passing through the nodes and
    //passing through the bend point and perpendicular to the other line
    var intersectionPoint = {
      x: intersectX,
      y: intersectY
    };
    
    return intersectionPoint;
  },
  getSegmentPoints: function(edge) {
    
    if( edge.css('curve-style') !== 'segments' ) {
      return undefined;
    }
    
    var segpts = [];

    var segmentWs = edge.pstyle( 'segment-weights' ).pfValue;
    var segmentDs = edge.pstyle( 'segment-distances' ).pfValue;
    var segmentsN = Math.min( segmentWs.length, segmentDs.length );
    
    var srcPos = edge.source().position();
    var tgtPos = edge.target().position();

    var dy = ( tgtPos.y - srcPos.y );
    var dx = ( tgtPos.x - srcPos.x );
    
    var l = Math.sqrt( dx * dx + dy * dy );

    var vector = {
      x: dx,
      y: dy
    };

    var vectorNorm = {
      x: vector.x / l,
      y: vector.y / l
    };
    
    var vectorNormInverse = {
      x: -vectorNorm.y,
      y: vectorNorm.x
    };

    for( var s = 0; s < segmentsN; s++ ){
      var w = segmentWs[ s ];
      var d = segmentDs[ s ];

      // d = swappedDirection ? -d : d;
      //
      // d = Math.abs(d);

      // var w1 = !swappedDirection ? (1 - w) : w;
      // var w2 = !swappedDirection ? w : (1 - w);

      var w1 = (1 - w);
      var w2 = w;

      var posPts = {
        x1: srcPos.x,
        x2: tgtPos.x,
        y1: srcPos.y,
        y2: tgtPos.y
      };

      var midptPts = posPts;
      
      

      var adjustedMidpt = {
        x: midptPts.x1 * w1 + midptPts.x2 * w2,
        y: midptPts.y1 * w1 + midptPts.y2 * w2
      };

      segpts.push(
        adjustedMidpt.x + vectorNormInverse.x * d,
        adjustedMidpt.y + vectorNormInverse.y * d
      );
    }
    
    return segpts;
  },
  convertToRelativeBendPosition: function (edge, bendPoint, srcTgtPointsAndTangents) {
    if (srcTgtPointsAndTangents === undefined) {
      srcTgtPointsAndTangents = this.getSrcTgtPointsAndTangents(edge);
    }
    
    var intersectionPoint = this.getIntersection(edge, bendPoint, srcTgtPointsAndTangents);
    var intersectX = intersectionPoint.x;
    var intersectY = intersectionPoint.y;
    
    var srcPoint = srcTgtPointsAndTangents.srcPoint;
    var tgtPoint = srcTgtPointsAndTangents.tgtPoint;
    
    var weight;
    
    if( intersectX != srcPoint.x ) {
      weight = (intersectX - srcPoint.x) / (tgtPoint.x - srcPoint.x);
    }
    else if( intersectY != srcPoint.y ) {
      weight = (intersectY - srcPoint.y) / (tgtPoint.y - srcPoint.y);
    }
    else {
      weight = 0;
    }
    
    var distance = Math.sqrt(Math.pow((intersectY - bendPoint.y), 2)
        + Math.pow((intersectX - bendPoint.x), 2));
    
    //Get the direction of the line form source point to target point
    var direction1 = this.getLineDirection(srcPoint, tgtPoint);
    //Get the direction of the line from intesection point to bend point
    var direction2 = this.getLineDirection(intersectionPoint, bendPoint);
    
    //If the difference is not -2 and not 6 then the direction of the distance is negative
    if(direction1 - direction2 != -2 && direction1 - direction2 != 6){
      if(distance != 0)
        distance = -1 * distance;
    }
    
    return {
      weight: weight,
      distance: distance
    };
  },
  convertToRelativeBendPositions: function (edge, bendPoints) {
    var srcTgtPointsAndTangents = this.getSrcTgtPointsAndTangents(edge);
//    var bendPoints = edge.data('bendPointPositions');
    //output variables
    var weights = [];
    var distances = [];

    for (var i = 0; bendPoints && i < bendPoints.length; i++) {
      var bendPoint = bendPoints[i];
      var relativeBendPosition = this.convertToRelativeBendPosition(edge, bendPoint, srcTgtPointsAndTangents);

      weights.push(relativeBendPosition.weight);
      distances.push(relativeBendPosition.distance);
    }

    return {
      weights: weights,
      distances: distances
    };
  },
  getSegmentDistancesString: function (edge) {
    var str = "";

    var distances = edge.scratch('cyedgebendeditingDistances');
    for (var i = 0; distances && i < distances.length; i++) {
      str = str + " " + distances[i];
    }
    
    return str;
  },
  getSegmentWeightsString: function (edge) {
    var str = "";

    var weights = edge.scratch('cyedgebendeditingWeights');
    for (var i = 0; weights && i < weights.length; i++) {
      str = str + " " + weights[i];
    }
    
    return str;
  },
  addBendPoint: function(edge, newBendPoint) {
    if(edge === undefined || newBendPoint === undefined){
      edge = this.currentCtxEdge;
      newBendPoint = this.currentCtxPos;
    }
    
    var relativeBendPosition = this.convertToRelativeBendPosition(edge, newBendPoint);
    var originalPointWeight = relativeBendPosition.weight;
    
    var startX = edge.source().position('x');
    var startY = edge.source().position('y');
    var endX = edge.target().position('x');
    var endY = edge.target().position('y');
    
    var startWeight = this.convertToRelativeBendPosition(edge, {x: startX, y: startY}).weight;
    var endWeight = this.convertToRelativeBendPosition(edge, {x: endX, y: endY}).weight;
    var weightsWithTgtSrc = [startWeight].concat(edge.scratch('cyedgebendeditingWeights')?edge.scratch('cyedgebendeditingWeights'):[]).concat([endWeight]);
    
    var segPts = this.getSegmentPoints(edge);
    
    var minDist = Infinity;
    var intersection;
    var segptsWithTgtSrc = [startX, startY]
            .concat(segPts?segPts:[])
            .concat([endX, endY]);
    var newBendIndex = -1;
    
    for(var i = 0; i < weightsWithTgtSrc.length - 1; i++){
      var w1 = weightsWithTgtSrc[i];
      var w2 = weightsWithTgtSrc[i + 1];
      
      //check if the weight is between w1 and w2
      if((originalPointWeight <= w1 && originalPointWeight >= w2) || (originalPointWeight <= w2 && originalPointWeight >= w1)){
        var startX = segptsWithTgtSrc[2 * i];
        var startY = segptsWithTgtSrc[2 * i + 1];
        var endX = segptsWithTgtSrc[2 * i + 2];
        var endY = segptsWithTgtSrc[2 * i + 3];
        
        var start = {
          x: startX,
          y: startY
        };
        
        var end = {
          x: endX,
          y: endY
        };
        
        var m1 = ( startY - endY ) / ( startX - endX );
        var m2 = -1 / m1;
        
        var srcTgtPointsAndTangents = {
          srcPoint: start,
          tgtPoint: end,
          m1: m1,
          m2: m2
        };
        
        //get the intersection of the current segment with the new bend point
        var currentIntersection = this.getIntersection(edge, newBendPoint, srcTgtPointsAndTangents);
        var dist = Math.sqrt( Math.pow( (newBendPoint.x - currentIntersection.x), 2 ) 
                + Math.pow( (newBendPoint.y - currentIntersection.y), 2 ));
        
        //Update the minimum distance
        if(dist < minDist){
          minDist = dist;
          intersection = currentIntersection;
          newBendIndex = i;
        }
      }
    }
    
    if(intersection !== undefined){
      newBendPoint = intersection;
    }
    
    relativeBendPosition = this.convertToRelativeBendPosition(edge, newBendPoint);
    
    if(intersection === undefined){
      relativeBendPosition.distance = 0;
    }

    var weights = edge.scratch('cyedgebendeditingWeights');
    var distances = edge.scratch('cyedgebendeditingDistances');
    
    weights = weights?weights:[];
    distances = distances?distances:[];
    
    if(weights.length === 0) {
      newBendIndex = 0;
    }
    
//    weights.push(relativeBendPosition.weight);
//    distances.push(relativeBendPosition.distance);
    if(newBendIndex != -1){
      weights.splice(newBendIndex, 0, relativeBendPosition.weight);
      distances.splice(newBendIndex, 0, relativeBendPosition.distance);
    }
   
    edge.scratch('cyedgebendeditingWeights', weights);
    edge.scratch('cyedgebendeditingDistances', distances);
    
    edge.addClass('edgebendediting-hasbendpoints');
    
    return relativeBendPosition;
  },
  removeBendPoint: function(edge, bendPointIndex){
    if(edge === undefined || bendPointIndex === undefined){
      edge = this.currentCtxEdge;
      bendPointIndex = this.currentBendIndex;
    }
    
    var distances = edge.scratch('cyedgebendeditingDistances');
    var weights = edge.scratch('cyedgebendeditingWeights');
    
    distances.splice(bendPointIndex, 1);
    weights.splice(bendPointIndex, 1);
    
    
    if(distances.length == 0 || weights.lenght == 0){
      edge.removeClass('edgebendediting-hasbendpoints');
    }
    else {
      edge.scratch('cyedgebendeditingDistances', distances);
      edge.scratch('cyedgebendeditingWeights', weights);
    }
  },
  calculateDistance: function(pt1, pt2) {
    var diffX = pt1.x - pt2.x;
    var diffY = pt1.y - pt2.y;
    
    var dist = Math.sqrt( Math.pow( diffX, 2 ) + Math.pow( diffY, 2 ) );
    return dist;
  }
};

module.exports = bendPointUtilities;
},{}],3:[function(_dereq_,module,exports){
var debounce = (function () {
  /**
   * lodash 3.1.1 (Custom Build) <https://lodash.com/>
   * Build: `lodash modern modularize exports="npm" -o ./`
   * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   * Available under MIT license <https://lodash.com/license>
   */
  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Native method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
          nativeNow = Date.now;

  /**
   * Gets the number of milliseconds that have elapsed since the Unix epoch
   * (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @category Date
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => logs the number of milliseconds it took for the deferred function to be invoked
   */
  var now = nativeNow || function () {
    return new Date().getTime();
  };

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed invocations. Provide an options object to indicate that `func`
   * should be invoked on the leading and/or trailing edge of the `wait` timeout.
   * Subsequent calls to the debounced function return the result of the last
   * `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
   * on the trailing edge of the timeout only if the the debounced function is
   * invoked more than once during the `wait` timeout.
   *
   * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.leading=false] Specify invoking on the leading
   *  edge of the timeout.
   * @param {number} [options.maxWait] The maximum time `func` is allowed to be
   *  delayed before it's invoked.
   * @param {boolean} [options.trailing=true] Specify invoking on the trailing
   *  edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // avoid costly calculations while the window size is in flux
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
   * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // ensure `batchLog` is invoked once after 1 second of debounced calls
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', _.debounce(batchLog, 250, {
   *   'maxWait': 1000
   * }));
   *
   * // cancel a debounced call
   * var todoChanges = _.debounce(batchLog, 1000);
   * Object.observe(models.todo, todoChanges);
   *
   * Object.observe(models, function(changes) {
   *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
   *     todoChanges.cancel();
   *   }
   * }, ['delete']);
   *
   * // ...at some point `models.todo` is changed
   * models.todo.completed = true;
   *
   * // ...before 1 second has passed `models.todo` is deleted
   * // which cancels the debounced `todoChanges` call
   * delete models.todo;
   */
  function debounce(func, wait, options) {
    var args,
            maxTimeoutId,
            result,
            stamp,
            thisArg,
            timeoutId,
            trailingCall,
            lastCalled = 0,
            maxWait = false,
            trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = wait < 0 ? 0 : (+wait || 0);
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = !!options.leading;
      maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function cancel() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      lastCalled = 0;
      maxTimeoutId = timeoutId = trailingCall = undefined;
    }

    function complete(isCalled, id) {
      if (id) {
        clearTimeout(id);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = undefined;
        }
      }
    }

    function delayed() {
      var remaining = wait - (now() - stamp);
      if (remaining <= 0 || remaining > wait) {
        complete(trailingCall, maxTimeoutId);
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    }

    function maxDelayed() {
      complete(trailing, timeoutId);
    }

    function debounced() {
      args = arguments;
      stamp = now();
      thisArg = this;
      trailingCall = trailing && (timeoutId || !leading);

      if (maxWait === false) {
        var leadingCall = leading && !timeoutId;
      } else {
        if (!maxTimeoutId && !leading) {
          lastCalled = stamp;
        }
        var remaining = maxWait - (stamp - lastCalled),
                isCalled = remaining <= 0 || remaining > maxWait;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
      return result;
    }

    debounced.cancel = cancel;
    return debounced;
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  return debounce;

})();

module.exports = debounce;
},{}],4:[function(_dereq_,module,exports){
;(function(){ 'use strict';
  
  var bendPointUtilities = _dereq_('./bendPointUtilities');
  
  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape, $ ){
    var uiUtilities = _dereq_('./UIUtilities');
    
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    var defaults = {
      // this function specifies the poitions of bend points
      bendPositionsFunction: function(ele) {
        return ele.data('bendPointPositions');
      },
      // whether to initilize bend points on creation of this extension automatically
      initBendPointsAutomatically: true,
      // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
      undoable: false,
      // the size of bend shape is obtained by multipling width of edge with this parameter
      bendShapeSizeFactor: 6,
      // whether to start the plugin in the enabled state
      enabled: true,
      // title of add bend point menu item (User may need to adjust width of menu items according to length of this option)
      addBendMenuItemTitle: "Add Bend Point",
      // title of remove bend point menu item (User may need to adjust width of menu items according to length of this option)
      removeBendMenuItemTitle: "Remove Bend Point"
    };
    
    var options;
    
    // Merge default options with the ones coming from parameter
    function extend(defaults, options) {
      var obj = {};

      for (var i in defaults) {
        obj[i] = defaults[i];
      }

      for (var i in options) {
        obj[i] = options[i];
      }

      return obj;
    };
    
    cytoscape( 'core', 'edgeBendEditing', function(opts){
      var cy = this;
      
      if( opts !== 'get' ) {
        // merge the options with default ones
        options = extend(defaults, opts);

        // define edgebendediting-hasbendpoints css class
        cy.style().selector('.edgebendediting-hasbendpoints').css({
          'curve-style': 'segments',
          'segment-distances': function (ele) {
            return bendPointUtilities.getSegmentDistancesString(ele);
          },
          'segment-weights': function (ele) {
            return bendPointUtilities.getSegmentWeightsString(ele);
          },
          'edge-distances': 'node-position'
        });

        // init bend positions conditionally
        if (options.initBendPointsAutomatically) {
          bendPointUtilities.initBendPoints(options.bendPositionsFunction, cy.edges());
        }

        if(options.enabled)
          uiUtilities(options, cy);
        else
          uiUtilities("unbind", cy);
      }
      
      var instance = {
        /*
        * get segment points of the given edge in an array A,
        * A[2 * i] is the x coordinate and A[2 * i + 1] is the y coordinate
        * of the ith bend point. (Returns undefined if the curve style is not segments)
        */
        getSegmentPoints: function(ele) {
          return bendPointUtilities.getSegmentPoints(ele);
        },
        // Initilize bend points for the given edges using 'options.bendPositionsFunction'
        initBendPoints: function(eles) {
          bendPointUtilities.initBendPoints(options.bendPositionsFunction, eles);
        }
      };

      return instance; // chainability
    } );

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-edge-bend-editing', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' && $ ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, $ );
  }

})();

},{"./UIUtilities":1,"./bendPointUtilities":2}],5:[function(_dereq_,module,exports){
module.exports = function (cy) {
  if (cy.undoRedo == null)
    return;

  var ur = cy.undoRedo({
    defaultActions: false,
    isDebug: true
  });

  function changeBendPoints(param) {
    var edge = param.edge;
    var result = {
      edge: edge,
      weights: param.set ? edge.scratch('cyedgebendeditingWeights') : param.weights,
      distances: param.set ? edge.scratch('cyedgebendeditingDistances') : param.distances,
      set: true//As the result will not be used for the first function call params should be used to set the data
    };

    var hasBend = param.weights && param.weights.length > 0;

    //Check if we need to set the weights and distances by the param values
    if (param.set) {
      hasBend ? edge.scratch('cyedgebendeditingWeights', param.weights) : edge.removeScratch('cyedgebendeditingWeights');
      hasBend ? edge.scratch('cyedgebendeditingDistances', param.distances) : edge.removeScratch('cyedgebendeditingDistances');

      //refresh the curve style as the number of bend point would be changed by the previous operation
      if (hasBend) {
        edge.addClass('edgebendediting-hasbendpoints');
      }
      else {
        edge.removeClass('edgebendediting-hasbendpoints');
      }
    }
    
    edge.trigger('cyedgebendediting.changeBendPoints');

    return result;
  }

  ur.action('changeBendPoints', changeBendPoints, changeBendPoints);
};
},{}]},{},[4])(4)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeExpandCollapse = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var boundingBoxUtilities = {
  equalBoundingBoxes: function(bb1, bb2){
      return bb1.x1 == bb2.x1 && bb1.x2 == bb2.x2 && bb1.y1 == bb2.y1 && bb1.y2 == bb2.y2;
  },
  getUnion: function(bb1, bb2){
      var union = {
      x1: Math.min(bb1.x1, bb2.x1),
      x2: Math.max(bb1.x2, bb2.x2),
      y1: Math.min(bb1.y1, bb2.y1),
      y2: Math.max(bb1.y2, bb2.y2),
    };

    union.w = union.x2 - union.x1;
    union.h = union.y2 - union.y1;

    return union;
  }
};

module.exports = boundingBoxUtilities;
},{}],2:[function(_dereq_,module,exports){
var debounce = _dereq_('./debounce');
var elementUtilities;

module.exports = function (params) {
  var fn = params;

  var eMouseOver, eMouseOut, ePosition, eRemove, eTap, eZoom, eAdd, eFree;
  var functions = {
    init: function () {
      var self = this;
      var opts = params;
      var $container = this;
      var cy = this.cytoscape('get');
      var $canvas = $('<canvas></canvas>');
      elementUtilities = _dereq_('./elementUtilities')(cy);

      $container.append($canvas);

      var _sizeCanvas = debounce(function () {
        $canvas
          .attr('height', $container.height())
          .attr('width', $container.width())
          .css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'z-index': '999'
          })
        ;

        setTimeout(function () {
          var canvasBb = $canvas.offset();
          var containerBb = $container.offset();

          $canvas
            .css({
              'top': -(canvasBb.top - containerBb.top),
              'left': -(canvasBb.left - containerBb.left)
            })
          ;

          // refresh the cues on canvas resize
          if(cy){
            clearDraws(true);
          }
        }, 0);

      }, 250);

      function sizeCanvas() {
        _sizeCanvas();
      }

      sizeCanvas();

      $(window).bind('resize', function () {
        sizeCanvas();
      });

      var ctx = $canvas[0].getContext('2d');

      // write options to data
      var data = $container.data('cyexpandcollapse');
      if (data == null) {
        data = {};
      }
      data.options = opts;

      var optCache;

      function options() {
        return optCache || (optCache = $container.data('cyexpandcollapse').options);
      }

      function clearDraws(keepExpandCues) {

        var w = $container.width();
        var h = $container.height();

        ctx.clearRect(0, 0, w, h);

        if (keepExpandCues) {
          var collapsedNodes = cy.nodes('[expanded-collapsed="collapsed"]');
          for (var i = 0; i < collapsedNodes.length; i++) {
            drawExpandCollapseCue(collapsedNodes[i]);
          }
        }
      }

      function clearNodeDraw(node) {

        var x = node._private.data.expandcollapseRenderedStartX;
        var y = node._private.data.expandcollapseRenderedStartY;
        var s = node._private.data.expandcollapseRenderedCueSize;

        if (node.data('expanded-collapsed') === 'collapsed') {
          drawExpandCollapseCue(node);
        }
        ctx.clearRect(x, y, s, s);
      }

      function drawExpandCollapseCue(node) {
        var cy = node.cy();
        var children = node.children();
        var collapsedChildren = node._private.data.collapsedChildren;
        var hasChildren = children != null && children.length > 0;
        //check if the expand or collapse cue is to be drawn
        if (!hasChildren && collapsedChildren == null) {
          return;
        }

        var expandedOrcollapsed = node.data('expanded-collapsed');

        //Draw expand-collapse rectangles
        var rectSize = options().expandCollapseCueSize;
        var lineSize = options().expandCollapseCueLineSize;
        var diff;

        rectSize = rectSize * cy.zoom();
        lineSize = lineSize * cy.zoom();
        diff = (rectSize - lineSize) / 2;

        var expandcollapseStartX;
        var expandcollapseStartY;
        var expandcollapseEndX;
        var expandcollapseEndY;
        var expandcollapseRectSize;

        var expandcollapseCenterX;
        var expandcollapseCenterY;

        if (options().expandCollapseCuePosition === 'top-left') {
          var p = node.renderedPosition();
          var w = node.renderedOuterWidth();
          var h = node.renderedOuterHeight();

          expandcollapseCenterX = p.x - w / 2 - rectSize / 4 + rectSize / 2;
          expandcollapseCenterY = p.y - h / 2 - rectSize / 4 + rectSize / 2;
        } else {
          var option = options().expandCollapseCuePosition;
          var cueCenter = typeof option === 'function' ? option.call(this, node) : option;
          var expandcollapseCenter = elementUtilities.convertToRenderedPosition(cueCenter);

          expandcollapseCenterX = expandcollapseCenter.x;
          expandcollapseCenterY = expandcollapseCenter.y;
        }

        expandcollapseStartX = expandcollapseCenterX - rectSize / 2;
        expandcollapseStartY = expandcollapseCenterY - rectSize / 2;
        expandcollapseEndX = expandcollapseStartX + rectSize;
        expandcollapseEndY = expandcollapseStartY + rectSize;
        expandcollapseRectSize = rectSize;

        // Draw expand/collapse cue if specified use image else draw it
        if (expandedOrcollapsed === 'expanded' && options().expandCueImage) {
          var img=new Image();
          img.src = options().expandCueImage;
          ctx.drawImage(img, expandcollapseCenterX, expandcollapseCenterY, rectSize, rectSize);
        }
        else if (expandedOrcollapsed === 'collapsed' && options().collapseCueImage) {
          var img=new Image();
          img.src = options().collapseCueImage;
          ctx.drawImage(img, expandcollapseCenterX, expandcollapseCenterY, rectSize, rectSize);
        }
        else {
          var oldFillStyle = ctx.fillStyle;
          var oldWidth = ctx.lineWidth;
          var oldStrokeStyle = ctx.strokeStyle;

          ctx.fillStyle = "black";
          ctx.strokeStyle = "black";

          ctx.ellipse(expandcollapseCenterX, expandcollapseCenterY, rectSize / 2, rectSize / 2, 0, 0, 2 * Math.PI);
          ctx.fill();

          ctx.beginPath();

          ctx.strokeStyle = "white";
          ctx.lineWidth = 2.6 * cy.zoom();

          ctx.moveTo(expandcollapseStartX + diff, expandcollapseStartY + rectSize / 2);
          ctx.lineTo(expandcollapseStartX + lineSize + diff, expandcollapseStartY + rectSize / 2);

          if (expandedOrcollapsed == 'collapsed') {
            ctx.moveTo(expandcollapseStartX + rectSize / 2, expandcollapseStartY + diff);
            ctx.lineTo(expandcollapseStartX + rectSize / 2, expandcollapseStartY + lineSize + diff);
          }

          ctx.closePath();
          ctx.stroke();

          ctx.strokeStyle = oldStrokeStyle;
          ctx.fillStyle = oldFillStyle;
          ctx.lineWidth = oldWidth;
        }

        node._private.data.expandcollapseRenderedStartX = expandcollapseStartX;
        node._private.data.expandcollapseRenderedStartY = expandcollapseStartY;
        node._private.data.expandcollapseRenderedCueSize = expandcollapseRectSize;
      }

      $container.cytoscape(function (e) {
        cy = this;
        clearDraws(true);

        cy.bind('zoom pan', eZoom = function () {
          clearDraws(true);
        });


        cy.on('mouseover', 'node', eMouseOver = function (e) {
          var node = this;

          // remove old handle
          clearDraws(true);

          // add new handle
          drawExpandCollapseCue(node);

          var lastPosition = {};

        });

        cy.on('mouseout tapdragout', 'node', eMouseOut = function (e) {

          clearDraws(true);

        });

        cy.on('position', 'node', ePosition = function () {
          var node = this;

          clearDraws(true);
        });

        cy.on('remove', 'node', eRemove = function () {
          var node = this;
          clearNodeDraw(node);
        });
        
        cy.on('add', 'node', eAdd = function () {
          var node = this;
          drawExpandCollapseCue(node);
        });
        
        cy.on('free', 'node', eFree = function () {
          var node = this;
          
          clearDraws(true);
        });
        
        var ur;
        cy.on('tap', 'node', eTap = function (event) {
          var node = this;

          var expandcollapseRenderedStartX = node._private.data.expandcollapseRenderedStartX;
          var expandcollapseRenderedStartY = node._private.data.expandcollapseRenderedStartY;
          var expandcollapseRenderedRectSize = node._private.data.expandcollapseRenderedCueSize;
          var expandcollapseRenderedEndX = expandcollapseRenderedStartX + expandcollapseRenderedRectSize;
          var expandcollapseRenderedEndY = expandcollapseRenderedStartY + expandcollapseRenderedRectSize;

          var cyRenderedPosX = event.cyRenderedPosition.x;
          var cyRenderedPosY = event.cyRenderedPosition.y;
          var factor = (options().expandCollapseCueSensitivity - 1) / 2;

          if (cyRenderedPosX >= expandcollapseRenderedStartX - expandcollapseRenderedRectSize * factor
            && cyRenderedPosX <= expandcollapseRenderedEndX + expandcollapseRenderedRectSize * factor
            && cyRenderedPosY >= expandcollapseRenderedStartY - expandcollapseRenderedRectSize * factor
            && cyRenderedPosY <= expandcollapseRenderedEndY + expandcollapseRenderedRectSize * factor) {
            if(opts.undoable && !ur)
              ur = cy.undoRedo({
                defaultActions: false
              });
            if(node.isCollapsible())
              if (opts.undoable)
                ur.do("collapse", {
                  nodes: node,
                  options: opts
                });
              else
                node.collapse(opts);
            else if(node.isExpandable())
              if (opts.undoable)
                ur.do("expand", {
                  nodes: node,
                  options: opts
                });
              else
                node.expand(opts);
          }
        });
      });

      $container.data('cyexpandcollapse', data);
    },
    unbind: function () {
        var cy = this.cytoscape('get');
        cy.off('mouseover', 'node', eMouseOver)
          .off('mouseout tapdragout', 'node', eMouseOut)
          .off('position', 'node', ePosition)
          .off('remove', 'node', eRemove)
          .off('tap', 'node', eTap)
          .off('add', 'node', eAdd)
          .off('free', 'node', eFree);

        cy.unbind("zoom pan", eZoom);
    }
  };

  if (functions[fn]) {
    return functions[fn].apply($(cy.container()), Array.prototype.slice.call(arguments, 1));
  } else if (typeof fn == 'object' || !fn) {
    return functions.init.apply($(cy.container()), arguments);
  } else {
    $.error('No such function `' + fn + '` for cytoscape.js-expand-collapse');
  }

  return $(this);
};

},{"./debounce":3,"./elementUtilities":4}],3:[function(_dereq_,module,exports){
var debounce = (function () {
  /**
   * lodash 3.1.1 (Custom Build) <https://lodash.com/>
   * Build: `lodash modern modularize exports="npm" -o ./`
   * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   * Available under MIT license <https://lodash.com/license>
   */
  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Native method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
          nativeNow = Date.now;

  /**
   * Gets the number of milliseconds that have elapsed since the Unix epoch
   * (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @category Date
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => logs the number of milliseconds it took for the deferred function to be invoked
   */
  var now = nativeNow || function () {
    return new Date().getTime();
  };

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed invocations. Provide an options object to indicate that `func`
   * should be invoked on the leading and/or trailing edge of the `wait` timeout.
   * Subsequent calls to the debounced function return the result of the last
   * `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
   * on the trailing edge of the timeout only if the the debounced function is
   * invoked more than once during the `wait` timeout.
   *
   * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.leading=false] Specify invoking on the leading
   *  edge of the timeout.
   * @param {number} [options.maxWait] The maximum time `func` is allowed to be
   *  delayed before it's invoked.
   * @param {boolean} [options.trailing=true] Specify invoking on the trailing
   *  edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // avoid costly calculations while the window size is in flux
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
   * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // ensure `batchLog` is invoked once after 1 second of debounced calls
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', _.debounce(batchLog, 250, {
   *   'maxWait': 1000
   * }));
   *
   * // cancel a debounced call
   * var todoChanges = _.debounce(batchLog, 1000);
   * Object.observe(models.todo, todoChanges);
   *
   * Object.observe(models, function(changes) {
   *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
   *     todoChanges.cancel();
   *   }
   * }, ['delete']);
   *
   * // ...at some point `models.todo` is changed
   * models.todo.completed = true;
   *
   * // ...before 1 second has passed `models.todo` is deleted
   * // which cancels the debounced `todoChanges` call
   * delete models.todo;
   */
  function debounce(func, wait, options) {
    var args,
            maxTimeoutId,
            result,
            stamp,
            thisArg,
            timeoutId,
            trailingCall,
            lastCalled = 0,
            maxWait = false,
            trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = wait < 0 ? 0 : (+wait || 0);
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = !!options.leading;
      maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function cancel() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      lastCalled = 0;
      maxTimeoutId = timeoutId = trailingCall = undefined;
    }

    function complete(isCalled, id) {
      if (id) {
        clearTimeout(id);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = undefined;
        }
      }
    }

    function delayed() {
      var remaining = wait - (now() - stamp);
      if (remaining <= 0 || remaining > wait) {
        complete(trailingCall, maxTimeoutId);
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    }

    function maxDelayed() {
      complete(trailing, timeoutId);
    }

    function debounced() {
      args = arguments;
      stamp = now();
      thisArg = this;
      trailingCall = trailing && (timeoutId || !leading);

      if (maxWait === false) {
        var leadingCall = leading && !timeoutId;
      } else {
        if (!maxTimeoutId && !leading) {
          lastCalled = stamp;
        }
        var remaining = maxWait - (stamp - lastCalled),
                isCalled = remaining <= 0 || remaining > maxWait;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
      return result;
    }

    debounced.cancel = cancel;
    return debounced;
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  return debounce;

})();

module.exports = debounce;
},{}],4:[function(_dereq_,module,exports){
function elementUtilities(cy) {
 return {
  moveNodes: function (positionDiff, nodes, notCalcTopMostNodes) {
    var topMostNodes = notCalcTopMostNodes ? nodes : this.getTopMostNodes(nodes);
    for (var i = 0; i < topMostNodes.length; i++) {
      var node = topMostNodes[i];
      var oldX = node.position("x");
      var oldY = node.position("y");
      node.position({
        x: oldX + positionDiff.x,
        y: oldY + positionDiff.y
      });
      var children = node.children();
      this.moveNodes(positionDiff, children, true);
    }
  },
  getTopMostNodes: function (nodes) {//*//
    var nodesMap = {};
    for (var i = 0; i < nodes.length; i++) {
      nodesMap[nodes[i].id()] = true;
    }
    var roots = nodes.filter(function (i, ele) {
      var parent = ele.parent()[0];
      while (parent != null) {
        if (nodesMap[parent.id()]) {
          return false;
        }
        parent = parent.parent()[0];
      }
      return true;
    });

    return roots;
  },
  rearrange: function (layoutBy) {
    if (typeof layoutBy === "function") {
      layoutBy();
    } else if (layoutBy != null) {
      cy.layout(layoutBy);
    }
  },
  convertToRenderedPosition: function (modelPosition) {
    var pan = cy.pan();
    var zoom = cy.zoom();

    var x = modelPosition.x * zoom + pan.x;
    var y = modelPosition.y * zoom + pan.y;

    return {
      x: x,
      y: y
    };
  }
 };
}

module.exports = elementUtilities;

},{}],5:[function(_dereq_,module,exports){
var boundingBoxUtilities = _dereq_('./boundingBoxUtilities');

// Expand collapse utilities
function expandCollapseUtilities(cy) {
var elementUtilities = _dereq_('./elementUtilities')(cy);
return {
  //the number of nodes moving animatedly after expand operation
  animatedlyMovingNodeCount: 0,
  //A funtion basicly expanding a node it is to be called when a node is expanded anyway
  expandNodeBaseFunction: function (node, triggerLayout, single, layoutBy) {//*//
    //check how the position of the node is changed
    var positionDiff = {
      x: node.position('x') - node.data('position-before-collapse').x,
      y: node.position('y') - node.data('position-before-collapse').y
    };

    node.removeData("infoLabel");
    node.data('expanded-collapsed', 'expanded');

    node.trigger("beforeExpand");
    node._private.data.collapsedChildren.restore();
    this.repairEdges(node);
    node._private.data.collapsedChildren = null;
    node.trigger("afterExpand");


    elementUtilities.moveNodes(positionDiff, node.children());
    node.removeData('position-before-collapse');

    if (single)
      this.endOperation(layoutBy);
    // refreshPaddings();
   /* if (triggerLayout)
      elementUtilities.rearrange(layoutBy);*/
  },
  simpleCollapseGivenNodes: function (nodes) {//*//
    nodes.data("collapse", true);
    var roots = elementUtilities.getTopMostNodes(nodes);
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      
      // Collapse the nodes in bottom up order
      cy.startBatch();
      this.collapseBottomUp(root);
      cy.endBatch();
    }
    
    // Update the style
    cy.style().update();
    return nodes;
  },
  simpleExpandGivenNodes: function (nodes, applyFishEyeViewToEachNode) {//*//
    nodes.data("expand", true);
    var roots = elementUtilities.getTopMostNodes(nodes);
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      this.expandTopDown(root, applyFishEyeViewToEachNode);
    }
    return nodes;
  },
  simpleExpandAllNodes: function (nodes, applyFishEyeViewToEachNode) {//*//
    if (nodes === undefined) {
      nodes = cy.nodes();
    }
    var orphans;
    orphans = elementUtilities.getTopMostNodes(nodes);
    var expandStack = [];
    for (var i = 0; i < orphans.length; i++) {
      var root = orphans[i];
      this.expandAllTopDown(root, expandStack, applyFishEyeViewToEachNode);
    }
    return expandStack;
  },
  endOperation: function (layoutBy) {
    var self = this;
    cy.ready(function () {
      elementUtilities.rearrange(layoutBy);
    });
  },
  expandAllNodes: function (nodes, options) {//*//
    var expandedStack = this.simpleExpandAllNodes(nodes, options.fisheye);

    this.endOperation(options.layoutBy);

    //elementUtilities.rearrange(options.layoutBy);

    /*
     * return the nodes to undo the operation
     */
    return expandedStack;
  },
  expandAllTopDown: function (root, expandStack, applyFishEyeViewToEachNode) {//*//
    if (root._private.data.collapsedChildren != null) {
      expandStack.push(root);
      this.simpleExpandNode(root, applyFishEyeViewToEachNode);
    }
    var children = root.children();
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      this.expandAllTopDown(node, expandStack, applyFishEyeViewToEachNode);
    }
  },
  //Expand the given nodes perform incremental layout after expandation
  expandGivenNodes: function (nodes, options) {//*//
    if (nodes.length === 1) {
      this.expandNode(nodes[0], options.fisheye, options.animate, options.layoutBy);

    } else {
      this.simpleExpandGivenNodes(nodes, options.fisheye);
      this.endOperation(options.layoutBy);

      //elementUtilities.rearrange(options.layoutBy);
    }

    /*
     * return the nodes to undo the operation
     */
    return nodes;
  },
  //collapse the given nodes then make incremental layout
  collapseGivenNodes: function (nodes, options) {//*//
    this.simpleCollapseGivenNodes(nodes, options);

    this.endOperation(options.layoutBy);
    //elementUtilities.rearrange(options.layoutBy);

    /*
     * return the nodes to undo the operation
     */
    return nodes;
  },
  //collapse the nodes in bottom up order starting from the root
  collapseBottomUp: function (root) {//*//
    var children = root.children();
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      this.collapseBottomUp(node);
    }
    //If the root is a compound node to be collapsed then collapse it
    if (root.data("collapse") && root.children().length > 0) {
      this.simpleCollapseNode(root);
      root.removeData("collapse");
    }
  },
  //expand the nodes in top down order starting from the root
  expandTopDown: function (root, applyFishEyeViewToEachNode) {//*//
    if (root.data("expand") && root._private.data.collapsedChildren != null) {
      this.simpleExpandNode(root, applyFishEyeViewToEachNode);
      root.removeData("expand");
    }
    var children = root.children();
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      this.expandTopDown(node);
    }
  },
  expandNode: function (node, fisheye, animate, layoutBy) {
    if (node._private.data.collapsedChildren != null) {
      this.simpleExpandNode(node, fisheye, true, animate, layoutBy);

      /*
       * return the node to undo the operation
       */
      return node;
    }
  },
  convertToModelPosition: function (renderedPosition) {
    var pan = cy.pan();
    var zoom = cy.zoom();

    var x = (renderedPosition.x - pan.x) / zoom;
    var y = (renderedPosition.y - pan.y) / zoom;

    return {
      x: x,
      y: y
    };
  },
  /*
   *
   * This method expands the given node
   * without making incremental layout
   * after expand operation it will be simply
   * used to undo the collapse operation
   */
  simpleExpandNode: function (node, applyFishEyeViewToEachNode, singleNotSimple, animate, layoutBy) {//*//
    var self = this;
    
    if( !animate ) {
      cy.startBatch();
    }

    var commonExpandOperation = function (node, applyFishEyeViewToEachNode, singleNotSimple, animate, layoutBy) {
      if (applyFishEyeViewToEachNode) {

        node.data('width-before-fisheye', node.data('size-before-collapse').w);
        node.data('height-before-fisheye', node.data('size-before-collapse').h);

        self.fishEyeViewExpandGivenNode(node, singleNotSimple, node, animate, layoutBy);
      }

      if (!singleNotSimple || !applyFishEyeViewToEachNode || !animate) {
        self.expandNodeBaseFunction(node, singleNotSimple, singleNotSimple, layoutBy); //*****
      }
    };

    if (node._private.data.collapsedChildren != null) {
      this.storeWidthHeight(node);
      if (applyFishEyeViewToEachNode && singleNotSimple) {
        var topLeftPosition = this.convertToModelPosition({x: 0, y: 0});
        var bottomRightPosition = this.convertToModelPosition({x: cy.width(), y: cy.height()});
        var padding = 80;
        var bb = {
          x1: topLeftPosition.x,
          x2: bottomRightPosition.x,
          y1: topLeftPosition.y,
          y2: bottomRightPosition.y
        };

        var nodeBB = {
          x1: node.position('x') - node.data('size-before-collapse').w / 2 - padding,
          x2: node.position('x') + node.data('size-before-collapse').w / 2 + padding,
          y1: node.position('y') - node.data('size-before-collapse').h / 2 - padding,
          y2: node.position('y') + node.data('size-before-collapse').h / 2 + padding
        };

        var unionBB = boundingBoxUtilities.getUnion(nodeBB, bb);
        var animating = false;

        if (!boundingBoxUtilities.equalBoundingBoxes(unionBB, bb)) {
          var viewPort = cy.getFitViewport(unionBB, 10);
          var self = this;
          animating = animate;
          if (animate) {
            cy.animate({
              pan: viewPort.pan,
              zoom: viewPort.zoom,
              complete: function () {
                commonExpandOperation(node, applyFishEyeViewToEachNode, singleNotSimple, animate, layoutBy);
              }
            }, {
              duration: 1000
            });
          }
          else {
            cy.zoom(viewPort.zoom);
            cy.pan(viewPort.pan);
          }
        }
        if (!animating) {
          commonExpandOperation(node, applyFishEyeViewToEachNode, singleNotSimple, animate, layoutBy);
        }
      }
      else {
        commonExpandOperation(node, applyFishEyeViewToEachNode, singleNotSimple, animate, layoutBy);
      }
      
      if( !animate ) {
        cy.endBatch();
      }

      //return the node to undo the operation
      return node;
    }
  },
  //collapse the given node without making incremental layout
  simpleCollapseNode: function (node) {//*//
    if (node._private.data.collapsedChildren == null) {
      node.data('position-before-collapse', {
        x: node.position().x,
        y: node.position().y
      });

      node.data('size-before-collapse', {
        w: node.outerWidth(),
        h: node.outerHeight()
      });

      node.children().unselect();
      node.children().connectedEdges().unselect();

      node.data('expanded-collapsed', 'collapsed');

      var children = node.children();

      node.trigger("beforeCollapse");
      this.barrowEdgesOfcollapsedChildren(node);

      this.removeChildren(node, node);

      node.trigger("afterCollapse");
      
      node.position(node.data('position-before-collapse'));

      //return the node to undo the operation
      return node;
    }
  },
  storeWidthHeight: function (node) {//*//
    if (node != null) {
      node.data('x-before-fisheye', this.xPositionInParent(node));
      node.data('y-before-fisheye', this.yPositionInParent(node));
      node.data('width-before-fisheye', node.outerWidth());
      node.data('height-before-fisheye', node.outerHeight());

      if (node.parent()[0] != null) {
        this.storeWidthHeight(node.parent()[0]);
      }
    }

  },
  fishEyeViewExpandGivenNode: function (node, singleNotSimple, nodeToExpand, animate, layoutBy) {//*//
    var siblings = this.getSiblings(node);

    var x_a = this.xPositionInParent(node);
    var y_a = this.yPositionInParent(node);

    var d_x_left = Math.abs((node.data('width-before-fisheye') - node.outerWidth()) / 2);
    var d_x_right = Math.abs((node.data('width-before-fisheye') - node.outerWidth()) / 2);
    var d_y_upper = Math.abs((node.data('height-before-fisheye') - node.outerHeight()) / 2);
    var d_y_lower = Math.abs((node.data('height-before-fisheye') - node.outerHeight()) / 2);

    var abs_diff_on_x = Math.abs(node.data('x-before-fisheye') - x_a);
    var abs_diff_on_y = Math.abs(node.data('y-before-fisheye') - y_a);

    // Center went to LEFT
    if (node.data('x-before-fisheye') > x_a) {
      d_x_left = d_x_left + abs_diff_on_x;
      d_x_right = d_x_right - abs_diff_on_x;
    }
    // Center went to RIGHT
    else {
      d_x_left = d_x_left - abs_diff_on_x;
      d_x_right = d_x_right + abs_diff_on_x;
    }

    // Center went to UP
    if (node.data('y-before-fisheye') > y_a) {
      d_y_upper = d_y_upper + abs_diff_on_y;
      d_y_lower = d_y_lower - abs_diff_on_y;
    }
    // Center went to DOWN
    else {
      d_y_upper = d_y_upper - abs_diff_on_y;
      d_y_lower = d_y_lower + abs_diff_on_y;
    }

    var xPosInParentSibling = [];
    var yPosInParentSibling = [];

    for (var i = 0; i < siblings.length; i++) {
      xPosInParentSibling.push(this.xPositionInParent(siblings[i]));
      yPosInParentSibling.push(this.yPositionInParent(siblings[i]));
    }

    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];

      var x_b = xPosInParentSibling[i];
      var y_b = yPosInParentSibling[i];

      var slope = (y_b - y_a) / (x_b - x_a);

      var d_x = 0;
      var d_y = 0;
      var T_x = 0;
      var T_y = 0;

      // Current sibling is on the LEFT
      if (x_a > x_b) {
        d_x = d_x_left;
      }
      // Current sibling is on the RIGHT
      else {
        d_x = d_x_right;
      }
      // Current sibling is on the UPPER side
      if (y_a > y_b) {
        d_y = d_y_upper;
      }
      // Current sibling is on the LOWER side
      else {
        d_y = d_y_lower;
      }

      if (isFinite(slope)) {
        T_x = Math.min(d_x, (d_y / Math.abs(slope)));
      }

      if (slope !== 0) {
        T_y = Math.min(d_y, (d_x * Math.abs(slope)));
      }

      if (x_a > x_b) {
        T_x = -1 * T_x;
      }

      if (y_a > y_b) {
        T_y = -1 * T_y;
      }

      this.fishEyeViewMoveNode(sibling, T_x, T_y, nodeToExpand, singleNotSimple, animate, layoutBy);
    }

    if (siblings.length == 0) {
      this.expandNodeBaseFunction(nodeToExpand, singleNotSimple, true, layoutBy);
    }

    if (node.parent()[0] != null) {
      this.fishEyeViewExpandGivenNode(node.parent()[0], singleNotSimple, nodeToExpand, animate, layoutBy);
    }

    return node;
  },
  getSiblings: function (node) {//*//
    var siblings;

    if (node.parent()[0] == null) {
      siblings = cy.collection();
      var orphans = cy.nodes().orphans();

      for (var i = 0; i < orphans.length; i++) {
        if (orphans[i] != node) {
          siblings = siblings.add(orphans[i]);
        }
      }
    } else {
      siblings = node.siblings();
    }

    return siblings;
  },
  /*
   * Move node operation specialized for fish eye view expand operation
   * Moves the node by moving its descandents. Movement is animated if singleNotSimple flag is truthy.
   */
  fishEyeViewMoveNode: function (node, T_x, T_y, nodeToExpand, singleNotSimple, animate, layoutBy) {//*//
    var childrenList = node.children();
    var self = this;

    if (childrenList.length == 0) {
      var newPosition = {x: node.position('x') + T_x, y: node.position('y') + T_y};
      if (!singleNotSimple || !animate) {
        node.position(newPosition);
      }
      else {
        this.animatedlyMovingNodeCount++;
        node.animate({
          position: newPosition,
          complete: function () {
            self.animatedlyMovingNodeCount--;
            if (self.animatedlyMovingNodeCount > 0 || nodeToExpand.data('expanded-collapsed') === 'expanded') {

              return;
            }

            self.expandNodeBaseFunction(nodeToExpand, singleNotSimple, true, layoutBy);

          }
        }, {
          duration: 1000
        });
      }
    }
    else {

      for (var i = 0; i < childrenList.length; i++) {
        this.fishEyeViewMoveNode(childrenList[i], T_x, T_y, nodeToExpand, singleNotSimple, animate, layoutBy);
      }
    }
  },
  xPositionInParent: function (node) {//*//
    var parent = node.parent()[0];
    var x_a = 0.0;

    // Given node is not a direct child of the the root graph
    if (parent != null) {
      x_a = node.relativePosition('x') + (parent.width() / 2);
    }
    // Given node is a direct child of the the root graph

    else {
      x_a = node.position('x');
    }

    return x_a;
  },
  yPositionInParent: function (node) {//*//
    var parent = node.parent()[0];

    var y_a = 0.0;

    // Given node is not a direct child of the the root graph
    if (parent != null) {
      y_a = node.relativePosition('y') + (parent.height() / 2);
    }
    // Given node is a direct child of the the root graph

    else {
      y_a = node.position('y');
    }

    return y_a;
  },
  /*
   * for all children of the node parameter call this method
   * with the same root parameter,
   * remove the child and add the removed child to the collapsedchildren data
   * of the root to restore them in the case of expandation
   * root._private.data.collapsedChildren keeps the nodes to restore when the
   * root is expanded
   */
  removeChildren: function (node, root) {//*//
    var children = node.children();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      this.removeChildren(child, root);
      var removedChild = child.remove();
      if (root._private.data.collapsedChildren == null) {
        root._private.data.collapsedChildren = removedChild;
      }
      else {
        root._private.data.collapsedChildren = root._private.data.collapsedChildren.union(removedChild);
      }
    }
  },
  isMetaEdge: function(edge) {
    return edge.hasClass("meta");
  },
  barrowEdgesOfcollapsedChildren: function(node) {
    var relatedNodes = node.descendants();
    var edges = relatedNodes.edgesWith(cy.nodes().not(relatedNodes.union(node)));
    
    var relatedNodeMap = {};
    
    relatedNodes.each(function(i, ele) {
      relatedNodeMap[ele.id()] = true;
    });
    
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var source = edge.source();
      var target = edge.target();
      
      if (!this.isMetaEdge(edge)) { // is original
        var originalEndsData = {
          source: source,
          target: target
        };
        
        edge.addClass("meta");
        edge.data('originalEnds', originalEndsData);
      }
      
      edge.move({
        target: !relatedNodeMap[target.id()] ? target.id() : node.id(),
        source: !relatedNodeMap[source.id()] ? source.id() : node.id()
      });
    }
  },
  findNewEnd: function(node) {
    var current = node;
    
    while( !current.inside() ) {
      current = current.parent();
    }
    
    return current;
  },
  repairEdges: function(node) {
    var connectedMetaEdges = node.connectedEdges('.meta');
    
    for (var i = 0; i < connectedMetaEdges.length; i++) {
      var edge = connectedMetaEdges[i];
      var originalEnds = edge.data('originalEnds');
      var currentSrcId = edge.data('source');
      var currentTgtId = edge.data('target');
      
      if ( currentSrcId === node.id() ) {
        edge = edge.move({
          source: this.findNewEnd(originalEnds.source).id()
        });
      } else {
        edge = edge.move({
          target: this.findNewEnd(originalEnds.target).id()
        });
      }
      
      if ( edge.data('source') === originalEnds.source.id() && edge.data('target') === originalEnds.target.id() ) {
        edge.removeClass('meta');
        edge.removeData('originalEnds');
      }
    }
  },
  /*node is an outer node of root
   if root is not it's anchestor
   and it is not the root itself*/
  isOuterNode: function (node, root) {//*//
    var temp = node;
    while (temp != null) {
      if (temp == root) {
        return false;
      }
      temp = temp.parent()[0];
    }
    return true;
  }
}
};

module.exports = expandCollapseUtilities;

},{"./boundingBoxUtilities":1,"./elementUtilities":4}],6:[function(_dereq_,module,exports){
;
(function () {
  'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape, $) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    var expandCollapseUtilities = _dereq_('./expandCollapseUtilities');
    var undoRedoUtilities = _dereq_('./undoRedoUtilities');
    var elementUtilities = _dereq_('./elementUtilities');
    var cueUtilities = _dereq_("./cueUtilities");

    var options = {
      layoutBy: null, // for rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
      fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
      animate: true, // whether to animate on drawing changes you can specify a function too
      ready: function () { }, // callback when expand/collapse initialized
      undoable: true, // and if undoRedoExtension exists,

      cueEnabled: true, // Whether cues are enabled
      expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
      expandCollapseCueSize: 12, // size of expand-collapse cue
      expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
      expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
      collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
      expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
    };

    function setOptions(from) {
      var tempOpts = {};
      for (var key in options)
        tempOpts[key] = options[key];

      for (var key in from)
        if (tempOpts.hasOwnProperty(key))
          tempOpts[key] = from[key];
      return tempOpts;
    }
    
    // evaluate some specific options in case of they are specified as functions to be dynamically changed
    function evalOptions(options) {
      var animate = typeof options.animate === 'function' ? options.animate.call() : options.animate;
      var fisheye = typeof options.fisheye === 'function' ? options.fisheye.call() : options.fisheye;
      
      options.animate = animate;
      options.fisheye = fisheye;
    }


    // cy.expandCollapse()
    cytoscape("core", "expandCollapse", function (opts) {
      var cy = this;
      options = setOptions(opts);

      // All parent nodes are expanded on load
      cy.nodes(':parent').data('expanded-collapsed', 'expanded');
      undoRedoUtilities(cy);
      
      if(options.cueEnabled)
        cueUtilities(options);
      else
        cueUtilities("unbind");


      options.ready();


      return cy;
    });
    
    // set functions
    
    // set all options at once
    cytoscape("core", "setExpandCollapseOptions", function (opts) {
      options = opts;
    });
    
    // set the option whose name is given
    cytoscape("core", "setExpandCollapseOption", function (name, value) {
      options[name] = value;
    });

    // Collection functions

    // eles.collapse(options)
    cytoscape('collection', 'collapse', function (opts) {
      var eles = this.collapsibleNodes();
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return expandCollapseUtilities(this.cy()).collapseGivenNodes(eles, tempOptions);
    });

    // eles.collapseAll(options)
    cytoscape('collection', 'collapseRecursively', function (opts) {
      var eles = this.collapsibleNodes();
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return eles.union(eles.descendants()).collapse(tempOptions);
    });

    // eles.expand(options)
    cytoscape('collection', 'expand', function (opts) {
      var eles = this.expandableNodes();
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return expandCollapseUtilities(this.cy()).expandGivenNodes(eles, tempOptions);
    });

    // eles.expandAll(options)
    cytoscape('collection', 'expandRecursively', function (opts) {
      var eles = this.expandableNodes();
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return expandCollapseUtilities(this.cy()).expandAllNodes(eles, tempOptions);
    });


    // Core functions

    // cy.collapseAll(options)
    cytoscape('core', 'collapseAll', function (opts) {
      var cy = this;
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return cy.collapsibleNodes().collapseRecursively(tempOptions);
    });

    // cy.expandAll(options)
    cytoscape('core', 'expandAll', function (opts) {
      var cy = this;
      var tempOptions = setOptions(opts);
      evalOptions(tempOptions);

      return cy.expandableNodes().expandRecursively(tempOptions);
    });


    // Utility functions

    // ele.isCollapsible()
    cytoscape('collection', 'isExpandable', function () {
      var ele = this;

      return (ele.data("expanded-collapsed") === "collapsed");
    });

    // ele.isExpandable()
    cytoscape('collection', 'isCollapsible', function () {
      var ele = this;
      return !ele.isExpandable() && ele.isParent();
    });

    // eles.collapsed()
    cytoscape('collection', 'collapsibleNodes', function () {
      var eles = this;

      return eles.filter(function (i, ele) {
        return ele.isCollapsible();
      });
    });

    // eles.expanded()
    cytoscape('collection', 'expandableNodes', function () {
      var eles = this;

      return eles.filter(function (i, ele) {
        return ele.isExpandable();
      });
    });
    // eles.collapsed()
    cytoscape('core', 'collapsibleNodes', function () {
      var cy = this;

      return cy.nodes().collapsibleNodes();
    });

    // eles.expanded()
    cytoscape('core', 'expandableNodes', function () {
      var cy = this;

      return cy.nodes().expandableNodes();
    });
  };

  if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = register;
  }

  if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
    define('cytoscape-expand-collapse', function () {
      return register;
    });
  }

    if (typeof cytoscape !== 'undefined' && typeof jQuery !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
      register(cytoscape, jQuery);
  }

})();

},{"./cueUtilities":2,"./elementUtilities":4,"./expandCollapseUtilities":5,"./undoRedoUtilities":7}],7:[function(_dereq_,module,exports){
module.exports = function (cy) {
  if (cy.undoRedo == null)
    return;

  var ur = cy.undoRedo({}, true);

  function getEles(_eles) {
    return (typeof _eles === "string") ? cy.$(_eles) : _eles;
  }

  function getNodePositionsAndSizes() {
    var positionsAndSizes = {};
    var nodes = cy.nodes();

    for (var i = 0; i < nodes.length; i++) {
      var ele = nodes[i];
      positionsAndSizes[ele.id()] = {
        width: ele.width(),
        height: ele.height(),
        x: ele.position("x"),
        y: ele.position("y")
      };
    }

    return positionsAndSizes;
  }

  function returnToPositionsAndSizes(nodesData) {
    var currentPositionsAndSizes = {};
    cy.nodes().positions(function (i, ele) {
      currentPositionsAndSizes[ele.id()] = {
        width: ele.width(),
        height: ele.height(),
        x: ele.position("x"),
        y: ele.position("y")
      };
      var data = nodesData[ele.id()];
      ele._private.data.width = data.width;
      ele._private.data.height = data.height;
      return {
        x: data.x,
        y: data.y
      };
    });

    return currentPositionsAndSizes;
  }

  var secondTimeOpts = {
    layoutBy: null,
    animate: false,
    fisheye: false
  };

  function doIt(func) {
    return function (args) {
      var result = {};
      var nodes = getEles(args.nodes);
      if (args.firstTime) {
        result.oldData = getNodePositionsAndSizes();
        result.nodes = func.indexOf("All") > 0 ? cy[func](args.options) : nodes[func](args.options);
      } else {
        result.oldData = getNodePositionsAndSizes();
        result.nodes = func.indexOf("All") > 0 ? cy[func](secondTimeOpts) : cy.collection(nodes)[func](secondTimeOpts);
        returnToPositionsAndSizes(args.oldData);
      }

      return result;
    };
  }

  var actions = ["collapse", "collapseRecursively", "collapseAll", "expand", "expandRecursively", "expandAll"];

  for (var i = 0; i < actions.length; i++) {
    ur.action(actions[i], doIt(actions[i]), doIt(actions[(i + 3) % 6]));
  }

};

},{}]},{},[6])(6)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
/*!
Copyright (c) The Cytoscape Consortium

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

;(function(){ 'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape, $ ){
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    $.fn.cyPanzoom = $.fn.cytoscapePanzoom = function( options ){
      panzoom.apply( this, [ options, $ ] );

      return this; // chainability
    };

    // if you want a core extension
    cytoscape('core', 'panzoom', function( options ){ // could use options object, but args are up to you
      var cy = this;

      panzoom.apply( cy.container(), [ options, $ ] );

      return this; // chainability
    });

  };

  var defaults = {
    zoomFactor: 0.05, // zoom factor per zoom tick
    zoomDelay: 45, // how many ms between zoom ticks
    minZoom: 0.1, // min zoom level
    maxZoom: 10, // max zoom level
    fitPadding: 50, // padding when fitting
    panSpeed: 10, // how many ms in between pan ticks
    panDistance: 10, // max pan distance per tick
    panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
    panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
    panInactiveArea: 8, // radius of inactive area in pan drag box
    panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
    zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
    fitSelector: undefined, // selector of elements to fit
    animateOnFit: function(){ // whether to animate on fit
      return false;
    },
    fitAnimationDuration: 1000, // duration of animation on fit

    // icon class names
    sliderHandleIcon: 'fa fa-minus',
    zoomInIcon: 'fa fa-plus',
    zoomOutIcon: 'fa fa-minus',
    resetIcon: 'fa fa-expand'
  };

  var panzoom = function( params, $ ){
    var options = $.extend(true, {}, defaults, params);
    var fn = params;

    var functions = {
      destroy: function(){
        var $this = $(this);
        var $pz = $this.find(".cy-panzoom");

        $pz.data('winbdgs').forEach(function( l ){
          $(window).unbind( l.evt, l.fn );
        });

        $pz.data('cybdgs').forEach(function( l ){
          $this.cytoscape('get').off( l.evt, l.fn );
        });

        $pz.remove();
      },

      init: function(){
        var browserIsMobile = 'ontouchstart' in window;

        return $(this).each(function(){
          var $container = $(this);

          var winbdgs = [];
          var $win = $(window);

          var windowBind = function( evt, fn ){
            winbdgs.push({ evt: evt, fn: fn });

            $win.bind( evt, fn );
          };

          var windowUnbind = function( evt, fn ){
            for( var i = 0; i < winbdgs.length; i++ ){
              var l = winbdgs[i];

              if( l.evt === evt && l.fn === fn ){
                winbdgs.splice( i, 1 );
                break;
              }
            }

            $win.unbind( evt, fn );
          };

          var cybdgs = [];
          var cy = $container.cytoscape('get');

          var cyOn = function( evt, fn ){
            cybdgs.push({ evt: evt, fn: fn });

            cy.on( evt, fn );
          };

          var cyOff = function( evt, fn ){
            for( var i = 0; i < cybdgs.length; i++ ){
              var l = cybdgs[i];

              if( l.evt === evt && l.fn === fn ){
                cybdgs.splice( i, 1 );
                break;
              }
            }

            cy.off( evt, fn );
          };

          var $panzoom = $('<div class="cy-panzoom"></div>');
          $container.prepend( $panzoom );

          $panzoom.css('position', 'absolute'); // must be absolute regardless of stylesheet

          $panzoom.data('winbdgs', winbdgs);
          $panzoom.data('cybdgs', cybdgs);

          if( options.zoomOnly ){
            $panzoom.addClass("cy-panzoom-zoom-only");
          }

          // add base html elements
          /////////////////////////

          var $zoomIn = $('<div class="cy-panzoom-zoom-in cy-panzoom-zoom-button"><span class="icon '+ options.zoomInIcon +'"></span></div>');
          $panzoom.append( $zoomIn );

          var $zoomOut = $('<div class="cy-panzoom-zoom-out cy-panzoom-zoom-button"><span class="icon ' + options.zoomOutIcon + '"></span></div>');
          $panzoom.append( $zoomOut );

          var $reset = $('<div class="cy-panzoom-reset cy-panzoom-zoom-button"><span class="icon ' + options.resetIcon + '"></span></div>');
          $panzoom.append( $reset );

          var $slider = $('<div class="cy-panzoom-slider"></div>');
          $panzoom.append( $slider );

          $slider.append('<div class="cy-panzoom-slider-background"></div>');

          var $sliderHandle = $('<div class="cy-panzoom-slider-handle"><span class="icon ' + options.sliderHandleIcon + '"></span></div>');
          $slider.append( $sliderHandle );

          var $noZoomTick = $('<div class="cy-panzoom-no-zoom-tick"></div>');
          $slider.append( $noZoomTick );

          var $panner = $('<div class="cy-panzoom-panner"></div>');
          $panzoom.append( $panner );

          var $pHandle = $('<div class="cy-panzoom-panner-handle"></div>');
          $panner.append( $pHandle );

          var $pUp = $('<div class="cy-panzoom-pan-up cy-panzoom-pan-button"></div>');
          var $pDown = $('<div class="cy-panzoom-pan-down cy-panzoom-pan-button"></div>');
          var $pLeft = $('<div class="cy-panzoom-pan-left cy-panzoom-pan-button"></div>');
          var $pRight = $('<div class="cy-panzoom-pan-right cy-panzoom-pan-button"></div>');
          $panner.append( $pUp ).append( $pDown ).append( $pLeft ).append( $pRight );

          var $pIndicator = $('<div class="cy-panzoom-pan-indicator"></div>');
          $panner.append( $pIndicator );

          // functions for calculating panning
          ////////////////////////////////////

          function handle2pan(e){
            var v = {
              x: e.originalEvent.pageX - $panner.offset().left - $panner.width()/2,
              y: e.originalEvent.pageY - $panner.offset().top - $panner.height()/2
            }

            var r = options.panDragAreaSize;
            var d = Math.sqrt( v.x*v.x + v.y*v.y );
            var percent = Math.min( d/r, 1 );

            if( d < options.panInactiveArea ){
              return {
                x: NaN,
                y: NaN
              };
            }

            v = {
              x: v.x/d,
              y: v.y/d
            };

            percent = Math.max( options.panMinPercentSpeed, percent );

            var vnorm = {
              x: -1 * v.x * (percent * options.panDistance),
              y: -1 * v.y * (percent * options.panDistance)
            };

            return vnorm;
          }

          function donePanning(){
            clearInterval(panInterval);
            windowUnbind("mousemove", handler);

            $pIndicator.hide();
          }

          function positionIndicator(pan){
            var v = pan;
            var d = Math.sqrt( v.x*v.x + v.y*v.y );
            var vnorm = {
              x: -1 * v.x/d,
              y: -1 * v.y/d
            };

            var w = $panner.width();
            var h = $panner.height();
            var percent = d/options.panDistance;
            var opacity = Math.max( options.panIndicatorMinOpacity, percent );
            var color = 255 - Math.round( opacity * 255 );

            $pIndicator.show().css({
              left: w/2 * vnorm.x + w/2,
              top: h/2 * vnorm.y + h/2,
              background: "rgb(" + color + ", " + color + ", " + color + ")"
            });
          }

          function calculateZoomCenterPoint(){
            var cy = $container.cytoscape("get");
            var pan = cy.pan();
            var zoom = cy.zoom();

            zx = $container.width()/2;
            zy = $container.height()/2;
          }

          var zooming = false;
          function startZooming(){
            zooming = true;

            calculateZoomCenterPoint();
          }


          function endZooming(){
            zooming = false;
          }

          var zx, zy;
          function zoomTo(level){
            var cy = $container.cytoscape("get");

            if( !zooming ){ // for non-continuous zooming (e.g. click slider at pt)
              calculateZoomCenterPoint();
            }

            cy.zoom({
              level: level,
              renderedPosition: { x: zx, y: zy }
            });
          }

          var panInterval;

          var handler = function(e){
            e.stopPropagation(); // don't trigger dragging of panzoom
            e.preventDefault(); // don't cause text selection
            clearInterval(panInterval);

            var pan = handle2pan(e);

            if( isNaN(pan.x) || isNaN(pan.y) ){
              $pIndicator.hide();
              return;
            }

            positionIndicator(pan);
            panInterval = setInterval(function(){
              $container.cytoscape("get").panBy(pan);
            }, options.panSpeed);
          };

          $pHandle.bind("mousedown", function(e){
            // handle click of icon
            handler(e);

            // update on mousemove
            windowBind("mousemove", handler);
          });

          $pHandle.bind("mouseup", function(){
            donePanning();
          });

          windowBind("mouseup blur", function(){
            donePanning();
          });



          // set up slider behaviour
          //////////////////////////

          $slider.bind('mousedown', function(){
            return false; // so we don't pan close to the slider handle
          });

          var sliderVal;
          var sliding = false;
          var sliderPadding = 2;

          function setSliderFromMouse(evt, handleOffset){
            if( handleOffset === undefined ){
              handleOffset = 0;
            }

            var padding = sliderPadding;
            var min = 0 + padding;
            var max = $slider.height() - $sliderHandle.height() - 2*padding;
            var top = evt.pageY - $slider.offset().top - handleOffset;

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

            var percent = 1 - (top - min) / ( max - min );

            // move the handle
            $sliderHandle.css('top', top);

            var zmin = options.minZoom;
            var zmax = options.maxZoom;

            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = (1 - x)*percent + x;

            // change the zoom level
            var z = Math.pow( zmax, p );

            // bound the zoom value in case of floating pt rounding error
            if( z < zmin ){
              z = zmin;
            } else if( z > zmax ){
              z = zmax;
            }

            zoomTo( z );
          }

          var sliderMdownHandler, sliderMmoveHandler;
          $sliderHandle.bind('mousedown', sliderMdownHandler = function( mdEvt ){
            var handleOffset = mdEvt.target === $sliderHandle[0] ? mdEvt.offsetY : 0;
            sliding = true;

            startZooming();
            $sliderHandle.addClass("active");

            var lastMove = 0;
            windowBind('mousemove', sliderMmoveHandler = function( mmEvt ){
              var now = +new Date;

              // throttle the zooms every 10 ms so we don't call zoom too often and cause lag
              if( now > lastMove + 10 ){
                lastMove = now;
              } else {
                return false;
              }

              setSliderFromMouse(mmEvt, handleOffset);

              return false;
            });

            // unbind when
            windowBind('mouseup', function(){
              windowUnbind('mousemove', sliderMmoveHandler);
              sliding = false;

              $sliderHandle.removeClass("active");
              endZooming();
            });

            return false;
          });

          $slider.bind('mousedown', function(e){
            if( e.target !== $sliderHandle[0] ){
              sliderMdownHandler(e);
              setSliderFromMouse(e);
            }
          });

          function positionSliderFromZoom(){
            var cy = $container.cytoscape("get");
            var z = cy.zoom();
            var zmin = options.minZoom;
            var zmax = options.maxZoom;

            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = Math.log(z) / Math.log(zmax);
            var percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction

            var min = sliderPadding;
            var max = $slider.height() - $sliderHandle.height() - 2*sliderPadding;
            var top = percent * ( max - min );

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

            // move the handle
            $sliderHandle.css('top', top);
          }

          positionSliderFromZoom();

          cyOn('zoom', function(){
            if( !sliding ){
              positionSliderFromZoom();
            }
          });

          // set the position of the zoom=1 tick
          (function(){
            var z = 1;
            var zmin = options.minZoom;
            var zmax = options.maxZoom;

            // assume (zoom = zmax ^ p) where p ranges on (x, 1) with x negative
            var x = Math.log(zmin) / Math.log(zmax);
            var p = Math.log(z) / Math.log(zmax);
            var percent = 1 - (p - x) / (1 - x); // the 1- bit at the front b/c up is in the -ve y direction

            if( percent > 1 || percent < 0 ){
              $noZoomTick.hide();
              return;
            }

            var min = sliderPadding;
            var max = $slider.height() - $sliderHandle.height() - 2*sliderPadding;
            var top = percent * ( max - min );

            // constrain to slider bounds
            if( top < min ){ top = min }
            if( top > max ){ top = max }

            $noZoomTick.css('top', top);
          })();

          // set up zoom in/out buttons
          /////////////////////////////

          function bindButton($button, factor){
            var zoomInterval;

            $button.bind("mousedown", function(e){
              e.preventDefault();
              e.stopPropagation();

              if( e.button != 0 ){
                return;
              }

              var cy = $container.cytoscape("get");
              var doZoom = function(){
                var zoom = cy.zoom();
                var lvl = cy.zoom() * factor;

                if( lvl < options.minZoom ){
                  lvl = options.minZoom;
                }

                if( lvl > options.maxZoom ){
                  lvl = options.maxZoom;
                }

                if( (lvl == options.maxZoom && zoom == options.maxZoom) ||
                  (lvl == options.minZoom && zoom == options.minZoom)
                ){
                  return;
                }

                zoomTo(lvl);
              };

              startZooming();
              doZoom();
              zoomInterval = setInterval(doZoom, options.zoomDelay);

              return false;
            });

            windowBind("mouseup blur", function(){
              clearInterval(zoomInterval);
              endZooming();
            });
          }

          bindButton( $zoomIn, (1 + options.zoomFactor) );
          bindButton( $zoomOut, (1 - options.zoomFactor) );

          $reset.bind("mousedown", function(e){
            if( e.button != 0 ){
              return;
            }

            var cy = $container.cytoscape("get");
            var elesToFit = options.fitSelector?cy.elements(options.fitSelector):cy.elements();
            
            if( elesToFit.size() === 0 ){
              cy.reset();
            } else {
              var animateOnFit = typeof options.animateOnFit === 'function' ? options.animateOnFit.call() : options.animateOnFit;
              if(animateOnFit){
                cy.animate({
                  fit: {
                    eles: elesToFit,
                    padding: options.fitPadding
                  }
                }, {
                  duration: options.fitAnimationDuration
                });
              }
              else{
                cy.fit( elesToFit, options.fitPadding );
              }
              
            }

            return false;
          });



        });
      }
    };

    if( functions[fn] ){
      return functions[fn].apply(this, Array.prototype.slice.call( arguments, 1 ));
    } else if( typeof fn == 'object' || !fn ) {
      return functions.init.apply( this, arguments );
    } else {
      $.error("No such function `"+ fn +"` for jquery.cytoscapePanzoom");
    }

    return $(this);
  };


  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-panzoom', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' && typeof jQuery !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, jQuery );
  }

})();

},{}],8:[function(require,module,exports){
/*!
Copyright (c) The Cytoscape Consortium

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

;(function( $, $$ ){ 'use strict';

  var isObject = function(o){
    return o != null && typeof o === 'object';
  };

  var isFunction = function(o){
    return o != null && typeof o === 'function';
  };

  var isNumber = function(o){
    return o != null && typeof o === 'number';
  };

  var isString = function(o){
    return o != null && typeof o === 'string';
  };

  var isUndef = function(o){
    return o === undefined;
  };

  var wrap = function(obj, target) {
    if( isFunction(obj) ) {
      return function(event, api){
        return obj.apply( target, [event, api] );
      };
    } else {
      return obj;
    }
  };

  var throttle = function(func, wait, options) {
    var leading = true,
        trailing = true;

    if (options === false) {
      leading = false;
    } else if (isObject(options)) {
      leading = 'leading' in options ? options.leading : leading;
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    options = options || {};
    options.leading = leading;
    options.maxWait = wait;
    options.trailing = trailing;

    return debounce(func, wait, options);
  };

  var debounce = function(func, wait, options) { // ported lodash debounce function
    var args,
        maxTimeoutId,
        result,
        stamp,
        thisArg,
        timeoutId,
        trailingCall,
        lastCalled = 0,
        maxWait = false,
        trailing = true;

    if (!isFunction(func)) {
      return;
    }
    wait = Math.max(0, wait) || 0;
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = options.leading;
      maxWait = 'maxWait' in options && (Math.max(wait, options.maxWait) || 0);
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    var delayed = function() {
      var remaining = wait - (Date.now() - stamp);
      if (remaining <= 0) {
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
        }
        var isCalled = trailingCall;
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (isCalled) {
          lastCalled = Date.now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    };

    var maxDelayed = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (trailing || (maxWait !== wait)) {
        lastCalled = Date.now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    };

    return function() {
      args = arguments;
      stamp = Date.now();
      thisArg = this;
      trailingCall = trailing && (timeoutId || !leading);

      if (maxWait === false) {
        var leadingCall = leading && !timeoutId;
      } else {
        if (!maxTimeoutId && !leading) {
          lastCalled = stamp;
        }
        var remaining = maxWait - (stamp - lastCalled),
            isCalled = remaining <= 0;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
      return result;
    };
  };

  function register( $$, $ ){

    // use a single dummy dom ele as target for every qtip
    var $qtipContainer = $('<div></div>');
    var viewportDebounceRate = 250;

    function generateOpts( target, passedOpts ){
      var qtip = target.scratch().qtip;
      var opts = $.extend( {}, passedOpts );

      if( !opts.id ){
        opts.id = 'cy-qtip-target-' + ( Date.now() + Math.round( Math.random() * 10000) );
      }

      if( !qtip.$domEle ){
        qtip.$domEle = $qtipContainer;
      }

      // qtip should be positioned relative to cy dom container
      opts.position = opts.position || {};
      opts.position.container = opts.position.container || $( document.body );
      opts.position.viewport = opts.position.viewport || $( document.body );
      opts.position.target = [0, 0];
      opts.position.my = opts.position.my || 'top center';
      opts.position.at = opts.position.at || 'bottom center';

      // adjust
      var adjust = opts.position.adjust = opts.position.adjust || {};
      adjust.method = adjust.method || 'flip';
      adjust.mouse = false;

      if( isUndef(adjust.cyAdjustToEleBB) ){
        adjust.cyAdjustToEleBB = true;
      }

      // default show event
      opts.show = opts.show || {};

      if( isUndef(opts.show.event) ){
        opts.show.event = 'tap';
      }

      // default hide event
      opts.hide = opts.hide || {};
      opts.hide.cyViewport = opts.hide.cyViewport === undefined ? true : opts.hide.cyViewport;

      if( isUndef(opts.hide.event) ){
        opts.hide.event = 'unfocus';
      }

      // so multiple qtips can exist at once (only works on recent qtip2 versions)
      opts.overwrite = false;

      if( opts.content ){
        if ( isFunction(opts.content) || isString(opts.content) ){
          opts.content = wrap( opts.content, target );
        } else {
          opts.content = {
            text: wrap( opts.content.text, target ),
            title: wrap( opts.content.title, target )
          };
        }
      }

      return opts;
    }

    $$('collection', 'qtip', function( passedOpts ){
      var eles = this;
      var cy = this.cy();
      var container = cy.container();

      if( passedOpts === 'api' ){
        return this.scratch().qtip.api;
      }

      eles.each(function(i, ele){
        var scratch = ele.scratch();
        var qtip = scratch.qtip = scratch.qtip || {};
        var opts = generateOpts( ele, passedOpts );
        var adjNums = opts.position.adjust;


        qtip.$domEle.qtip( opts );
        var qtipApi = qtip.api = qtip.$domEle.qtip('api'); // save api ref
        qtip.$domEle.removeData('qtip'); // remove qtip dom/api ref to be safe

        var updatePosition = function(e){
          var cOff = container.getBoundingClientRect();
          var pos = ele.renderedPosition() || ( e ? e.cyRenderedPosition : undefined );
          if( !pos || pos.x == null || isNaN(pos.x) ){ return; }

          if( opts.position.adjust.cyAdjustToEleBB && ele.isNode() ){
            var my = opts.position.my.toLowerCase();
            var at = opts.position.at.toLowerCase();
            var z = cy.zoom();
            var w = ele.outerWidth() * z;
            var h = ele.outerHeight() * z;

            if( at.match('top') ){
              pos.y -= h/2;
            } else if( at.match('bottom') ){
              pos.y += h/2;
            }

            if( at.match('left') ){
              pos.x -= w/2;
            } else if( at.match('right') ){
              pos.x += w/2;
            }

            if( isNumber(adjNums.x) ){
              pos.x += adjNums.x;
            }

            if( isNumber(adjNums.y) ){
              pos.y += adjNums.y;
            }
          }

          qtipApi.set('position.adjust.x', cOff.left + pos.x + window.pageXOffset);
          qtipApi.set('position.adjust.y', cOff.top + pos.y + window.pageYOffset);
        };
        updatePosition();

        ele.on( opts.show.event, function(e){
          updatePosition(e);

          qtipApi.show();
        } );

        ele.on( opts.hide.event, function(e){
          qtipApi.hide();
        } );

        if( opts.hide.cyViewport ){
          cy.on('viewport', debounce(function(){
            qtipApi.hide();
          }, viewportDebounceRate, { leading: true }) );
        }

        if( opts.position.adjust.cyViewport ){
          cy.on('pan zoom', debounce(function(e){
            updatePosition(e);

            qtipApi.reposition();
          }, viewportDebounceRate, { trailing: true }) );
        }

      });

      return this; // chainability

    });

    $$('core', 'qtip', function( passedOpts ){
      var cy = this;
      var container = cy.container();

      if( passedOpts === 'api' ){
        return this.scratch().qtip.api;
      }

      var scratch = cy.scratch();
      var qtip = scratch.qtip = scratch.qtip || {};
      var opts = generateOpts( cy, passedOpts );


      qtip.$domEle.qtip( opts );
      var qtipApi = qtip.api = qtip.$domEle.qtip('api'); // save api ref
      qtip.$domEle.removeData('qtip'); // remove qtip dom/api ref to be safe

      var updatePosition = function(e){
        var cOff = container.getBoundingClientRect();
        var pos = e.cyRenderedPosition;
        if( !pos || pos.x == null || isNaN(pos.x) ){ return; }

        qtipApi.set('position.adjust.x', cOff.left + pos.x + window.pageXOffset);
        qtipApi.set('position.adjust.y', cOff.top + pos.y + window.pageYOffset);
      };

      cy.on( opts.show.event, function(e){
        if( !opts.show.cyBgOnly || (opts.show.cyBgOnly && e.cyTarget === cy) ){
          updatePosition(e);

          qtipApi.show();
        }
      } );

      cy.on( opts.hide.event, function(e){
        if( !opts.hide.cyBgOnly || (opts.hide.cyBgOnly && e.cyTarget === cy) ){
          qtipApi.hide();
        }
      } );

      if( opts.hide.cyViewport ){
        cy.on('viewport', debounce(function(){
          qtipApi.hide();
        }, viewportDebounceRate, { leading: true }) );
      }

      return this; // chainability

    });

  }

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-qtip', function(){
      return register;
    });
  }

  if( $ && $$ ){
    register( $$, $ );
  }

})(
  typeof jQuery !== 'undefined' ? jQuery : null,
  typeof cytoscape !== 'undefined' ? cytoscape : null
);

},{}],9:[function(require,module,exports){
;(function () {
    'use strict';

// registers the extension on a cytoscape lib ref
    var register = function (cytoscape) {

        if (!cytoscape) {
            return;
        } // can't register if cytoscape unspecified

        var cy;
        var actions = {};
        var undoStack = [];
        var redoStack = [];

        var _instance = {
            options: {
                isDebug: false, // Debug mode for console messages
                actions: {},// actions to be added
                undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
                beforeUndo: function () { // callback before undo is triggered.

                },
                afterUndo: function () { // callback after undo is triggered.

                },
                beforeRedo: function () { // callback before redo is triggered.

                },
                afterRedo: function () { // callback after redo is triggered.

                },
                ready: function () {

                }
            }
        };


        // design implementation
        cytoscape("core", "undoRedo", function (options, dontInit) {
            cy = this;



            function getScratch() {
                if (!cy.scratch("_undoRedo")) {
                    cy.scratch("_undoRedo", { });

                }
                return cy.scratch("_undoRedo");
            }

            if (options) {
                for (var key in options)
                    if (_instance.options.hasOwnProperty(key))
                        _instance.options[key] = options[key];

                if (options.actions)
                    for (var key in options.actions)
                        actions[key] = options.actions[key];


            }

            if (!getScratch().isInitialized && !dontInit) {

                var defActions = defaultActions();
                for (var key in defActions)
                    actions[key] = defActions[key];


                setDragUndo(_instance.options.undoableDrag);
                getScratch().isInitialized = true;
            }

            _instance.options.ready();
            return _instance;

        });

        //resets undo and redo stacks
        _instance.reset = function()
        {
            undoStack = [];
            redoStack = [];
        }

        // Undo last action
        _instance.undo = function () {
            if (!this.isUndoStackEmpty()) {

                var action = undoStack.pop();
                cy.trigger("beforeUndo", [action.name, action.args]);

                var res = actions[action.name]._undo(action.args);

                redoStack.push({
                    name: action.name,
                    args: res
                });

                cy.trigger("afterUndo", [action.name, action.args]);
                return res;
            } else if (_instance.options.isDebug) {
                console.log("Undoing cannot be done because undo stack is empty!");
            }
        };

        // Redo last action
        _instance.redo = function () {

            if (!this.isRedoStackEmpty()) {
                var action = redoStack.pop();

                cy.trigger(action.firstTime ? "beforeDo" : "beforeRedo", [action.name, action.args]);

                if (!action.args)
                  action.args = {};
                action.args.firstTime = action.firstTime ? true : false;

                var res = actions[action.name]._do(action.args);

                undoStack.push({
                    name: action.name,
                    args: res
                });

                cy.trigger(action.firstTime ? "afterDo" : "afterRedo", [action.name, action.args]);
                return res;
            } else if (_instance.options.isDebug) {
                console.log("Redoing cannot be done because redo stack is empty!");
            }

        };

        // Calls registered function with action name actionName via actionFunction(args)
        _instance.do = function (actionName, args) {

            redoStack = [];
            redoStack.push({
                name: actionName,
                args: args,
                firstTime: true
            });

            return this.redo();
        };

        // Register action with its undo function & action name.
        _instance.action = function (actionName, _do, _undo) {

            actions[actionName] = {
                _do: _do,
                _undo: _undo
            };


            return _instance;
        };

        // Removes action stated with actionName param
        _instance.removeAction = function (actionName) {
            delete actions[actionName];
        };

        // Gets whether undo stack is empty
        _instance.isUndoStackEmpty = function () {
            return (undoStack.length === 0);
        };

        // Gets whether redo stack is empty
        _instance.isRedoStackEmpty = function () {
            return (redoStack.length === 0);
        };

        // Gets actions (with their args) in undo stack
        _instance.getUndoStack = function () {
            return undoStack;
        };

        // Gets actions (with their args) in redo stack
        _instance.getRedoStack = function () {
            return redoStack;
        };


        var lastMouseDownNodeInfo = null;
        var isDragDropSet = false;

        function setDragUndo(undoable) {
            isDragDropSet = true;
            cy.on("grab", "node", function () {
                if (typeof undoable === 'function' ? undoable.call(this) : undoable) {
                    lastMouseDownNodeInfo = {};
                    lastMouseDownNodeInfo.lastMouseDownPosition = {
                        x: this.position("x"),
                        y: this.position("y")
                    };
                    lastMouseDownNodeInfo.node = this;
                }
            });
            cy.on("free", "node", function () {
                if (typeof undoable === 'function' ? undoable.call(this) : undoable) {
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
                            nodes = cy.collection([node]);
                        }

                        var param = {
                            positionDiff: positionDiff,
                            nodes: nodes, move: false
                        };
                        _instance.do("drag", param);

                        lastMouseDownNodeInfo = null;
                    }
                }
            });
        }

        function getTopMostNodes(nodes) {
            var nodesMap = {};
            for (var i = 0; i < nodes.length; i++) {
                nodesMap[nodes[i].id()] = true;
            }
            var roots = nodes.filter(function (i, ele) {
                var parent = ele.parent()[0];
                while(parent != null){
                    if(nodesMap[parent.id()]){
                        return false;
                    }
                    parent = parent.parent()[0];
                }
                return true;
            });

            return roots;
        }

        function moveNodes(positionDiff, nodes, notCalcTopMostNodes) {
            var topMostNodes = notCalcTopMostNodes?nodes:getTopMostNodes(nodes);
            for (var i = 0; i < topMostNodes.length; i++) {
                var node = topMostNodes[i];
                var oldX = node.position("x");
                var oldY = node.position("y");
                node.position({
                    x: oldX + positionDiff.x,
                    y: oldY + positionDiff.y
                });
                var children = node.children();
                moveNodes(positionDiff, children, true);
            }
        }

        function getEles(_eles) {
            return (typeof _eles === "string") ? cy.$(_eles) : _eles;
        }

        function restoreEles(_eles) {
            return getEles(_eles).restore();
        }


        function returnToPositionsAndSizes(nodesData) {
            var currentPositionsAndSizes = {};
            cy.nodes().positions(function (i, ele) {
                currentPositionsAndSizes[ele.id()] = {
                    width: ele.width(),
                    height: ele.height(),
                    x: ele.position("x"),
                    y: ele.position("y")
                };
                var data = nodesData[ele.id()];
                ele._private.data.width = data.width;
                ele._private.data.height = data.height;
                return {
                    x: data.x,
                    y: data.y
                };
            });

            return currentPositionsAndSizes;
        }

        function getNodesData() {
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
            return nodesData;
        }

        function changeParent(param) {
          var result = {
          };

          var nodes = param.nodes;

          var transferedNodeMap = {};

          // Map the nodes included in the original node list
          for (var i = 0; i < param.nodes.length; i++) {
            var node = param.nodes[i];
            transferedNodeMap[node.id()] = true;
          }

          if (!param.firstTime) {
            // If it is not the first time get the updated nodes
            nodes = cy.nodes().filter(function (i, ele) {
              return (transferedNodeMap[ele.id()]);
            });
          }

          result.posDiffX = -1 * param.posDiffX;
          result.posDiffY = -1 * param.posDiffY;

          result.parentData = {}; // For undo / redo cases it keeps the previous parent info per node

          // Fill parent data
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            result.parentData[node.id()] = node.data('parent');
          }

          var newParentId;

          if (param.firstTime) {
            newParentId = param.parentData == undefined ? null : param.parentData;
            nodes.move({"parent": newParentId});
          }
          else {
            for (var i = 0; i < nodes.length; i++) {
              var node = nodes[i];

              newParentId = param.parentData[node.id()] == undefined ? null : param.parentData[node.id()];
              node.move({"parent": newParentId});
            }
          }

          var posDiff = {
            x: param.posDiffX,
            y: param.posDiffY
          };

          // We should get the updated nodes to move them
          result.nodes = cy.nodes().filter(function (i, ele) {
            return (transferedNodeMap[ele.id()]);
          });

          moveNodes(posDiff, result.nodes);

          return result;
        }

        // Default actions
        function defaultActions() {
            return {
                "add": {
                    _do: function (eles) {
                        return eles.firstTime ? cy.add(eles) : restoreEles(eles);
                    },
                    _undo: cy.remove
                },
                "remove": {
                    _do: cy.remove,
                    _undo: restoreEles
                },
                "restore": {
                    _do: restoreEles,
                    _undo: cy.remove
                },
                "select": {
                    _do: function (_eles) {
                        return getEles(_eles).select();
                    },
                    _undo: function (_eles) {
                        return getEles(_eles).unselect();
                    }
                },
                "unselect": {
                    _do: function (_eles) {
                        return getEles(_eles).unselect();
                    },
                    _undo: function (_eles) {
                        return getEles(_eles).select();
                    }
                },
                "move": {
                    _do: function (args) {
                        var eles = getEles(args.eles);
                        var nodes = eles.nodes();
                        var edges = eles.edges();

                        return {
                            oldNodes: nodes,
                            newNodes: nodes.move(args.location),
                            oldEdges: edges,
                            newEdges: edges.move(args.location)
                        };
                    },
                    _undo: function (eles) {
                        var newEles = cy.collection();
                        var location = {};
                        if (eles.newNodes.length > 0) {
                            location.parent = eles.newNodes[0].parent();

                            for (var i = 0; i < eles.newNodes.length; i++) {
                                var newNode = eles.newNodes[i].move({
                                    parent: eles.oldNodes[i].parent()
                                });
                                newEles.union(newNode);
                            }
                        } else {
                            location.source = location.newEdges[0].source();
                            location.target = location.newEdges[0].target();

                            for (var i = 0; i < eles.newEdges.length; i++) {
                                var newEdge = eles.newEdges[i].move({
                                    source: eles.oldEdges[i].source(),
                                    target: eles.oldEdges[i].target()
                                });
                                newEles.union(newEdge);
                            }
                        }
                        return {
                            eles: newEles,
                            location: location
                        };
                    }
                },
                "drag": {
                    _do: function (args) {
                        if (args.move)
                            moveNodes(args.positionDiff, args.nodes);
                        return args;
                    },
                    _undo: function (args) {
                        var diff = {
                            x: -1 * args.positionDiff.x,
                            y: -1 * args.positionDiff.y
                        };
                        var result = {
                            positionDiff: args.positionDiff,
                            nodes: args.nodes,
                            move: true
                        };
                        moveNodes(diff, args.nodes);
                        return result;
                    }
                },
                "layout": {
                    _do: function (args) {
                        if (args.firstTime){
                            var nodesData = getNodesData();
                            if(args.eles)
                                getEles(args.eles).layout(args.options);
                            else
                              cy.layout(args.options);
                            return nodesData;
                        } else
                            return returnToPositionsAndSizes(args.options);
                    },
                    _undo: function (nodesData) {
                        return returnToPositionsAndSizes(nodesData);
                    }
                },
                "changeParent": {
                    _do: function (args) {
                        return changeParent(args);
                    },
                    _undo: function (args) {
                        return changeParent(args);
                    }
                }
            };
        }

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape.js-undo-redo', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape);
    }

})();

},{}],10:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeViewUtilities = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = function (cytoscape, cy, options, ur) {

    cy
        .style()
        .selector("node.hidden")
        .css(options.node.hidden)
        .selector("edge.hidden")
        .css(options.edge.hidden);

    function elesScratchHidden(eles, val){
        return eles.each(function (i, ele) {
            if (!ele.scratch("_viewUtilities"))
                ele.scratch("_viewUtilities", {});
            ele.scratch("_viewUtilities").hidden = val;
        });
    }

    cytoscape("collection", "hideEles", function () {
        var eles = this.not(".hidden");
        eles = eles.union(eles.connectedEdges());

        elesScratchHidden(eles, true)
            .addClass("hidden")
            .unselect();

        return eles;
    });

    cytoscape("collection", "showEles", function () {
        var eles = this.filter(".hidden");
        eles = eles.union(eles.connectedEdges());
        
        elesScratchHidden(eles, false)
            .removeClass("hidden");

        return eles;
    });

    if (ur) {
        function urShow(eles) {
            return eles.showEles();
        }

        function urHide(eles) {
            return eles.hideEles();
        }

        ur.action("show", urShow, urHide);
        ur.action("hide", urHide, urShow);
    }

};
},{}],2:[function(_dereq_,module,exports){
module.exports = function (cytoscape, cy, options, ur) {

    cy
        .style()
        .selector("node.highlighted")
        .css(options.node.highlighted)
        .selector("node.unhighlighted")
        .css(options.node.unhighlighted)
        .selector("edge.highlighted")
        .css(options.edge.highlighted)
        .selector("edge.unhighlighted")
        .css(options.edge.unhighlighted)
        .update();

    function elesScratchHighlighted(eles, val) {
        return eles.each(function (i, ele) {
            if (!ele.scratch("_viewUtilities"))
                ele.scratch("_viewUtilities", {});
            ele.scratch("_viewUtilities").highlighted = val;
        });
    }

    function highlight(eles) {
        elesScratchHighlighted(eles, true)
            .removeClass("unhighlighted")
            .addClass("highlighted");
    }

    function unhighlight(eles) {
        elesScratchHighlighted(eles, false)
            .removeClass("highlighted")
            .addClass("unhighlighted");
    }

    function getWithNeighbors(eles) {
        return eles.add(eles.descendants()).closedNeighborhood();
    }

    cytoscape("collection", "highlight", function () {
        var eles = this; //.filter("[!highlighted]")
        var cy = eles.cy();


        var others = cy.elements().difference(eles.union(eles.ancestors()));

        if (cy.$(".highlighted:visible").length == 0)
            unhighlight(others);

        highlight(eles);

        return this;

    });

    cytoscape("collection", "unhighlight", function () {
        var eles = this;//.filter("[highlighted='true'], [^highlighted]");

        unhighlight(eles);

        return this;
    });


    cytoscape("collection", "highlightNeighbors", function () {
        var eles = this;

        var allEles = getWithNeighbors(eles);

        return allEles.highlight();

    });

    cytoscape("collection", "unhighlightNeighbors", function () {
        var eles = this;

        var allEles = getWithNeighbors(eles);

        return allEles.unhighlight();
    });

    cytoscape("collection", "highlightNeighbours", function () {
        var eles = this;

        return eles.highlightNeighbors();
    });

    cytoscape("collection", "unhighlightNeighbours", function () {
        var eles = this;

        return eles.unhighlightNeighbors();
    });

    cytoscape("collection", "removeHighlights", function () {
        var eles = this;

        return eles
            .removeClass("highlighted")
            .removeClass("unhighlighted")
            .removeData("highlighted");
    });

    cytoscape("core", "removeHighlights", function () {
        var cy = this;
        var eles = cy.elements();

        return eles.removeHighlights();
    });

    cytoscape("collection", "isHighlighted", function () {
        var ele = this;
        return ele.is(".highlighted:visible") ? true : false;
    });

    if (ur) {

        function getStatus(eles) {
            eles = eles ? eles : cy.elements();
            return {
                highlighteds: eles.filter(".highlighted:visible"),
                unhighlighteds: eles.filter(".unhighlighted:visible"),
                notHighlighteds: eles.filter(":visible").not(".highlighted, .unhighlighted")
            };
        }

        function generalUndo(args) {

            var current = args.current;
            var highlighteds = args.highlighteds.highlight();
            var unhighlighteds = args.unhighlighteds.unhighlight();
            var notHighlighteds = args.notHighlighteds.removeHighlights();


            return {
                highlighteds: highlighteds,
                unhighlighteds: unhighlighteds,
                notHighlighteds: notHighlighteds,
                current: current
            };
        }

        function generalRedo(args) {

            var current = args.current;
            var highlighteds = args.current.highlighteds.highlight();
            var unhighlighteds = args.current.unhighlighteds.unhighlight();
            var notHighlighteds = args.current.notHighlighteds.removeHighlights();

            return {
                highlighteds: highlighteds,
                unhighlighteds: unhighlighteds,
                notHighlighteds: notHighlighteds,
                current: current
            };
        }

        function generateDoFunc(func) {
            return function (eles) {
                var res = getStatus();

                if (eles.firstTime)
                    eles[func]();
                else
                    generalRedo(eles);

                res.current = getStatus();

                return res;
            }
        }

        function urRemoveHighlights(args) {
            var res = getStatus();

            if (args.firstTime)
                cy.removeHighlights();
            else
                generalRedo(args);

            res.current = getStatus();

            return res;
        }

        ur.action("highlightNeighbors", generateDoFunc("highlightNeighbors"), generalUndo);
        ur.action("highlightNeighbours", generateDoFunc("highlightNeighbours"), generalUndo);
        ur.action("highlight", generateDoFunc("highlight"), generalUndo);
        ur.action("unhighlight", generateDoFunc("unhighlight"), generalUndo);
        ur.action("unhighlightNeighbors", generateDoFunc("unhighlightNeighbors"), generalUndo);
        ur.action("unhighlightNeighbours", generateDoFunc("unhighlightNeighbours"), generalUndo);
        ur.action("removeHighlights", urRemoveHighlights, generalUndo);
    }
};
},{}],3:[function(_dereq_,module,exports){
;(function () {
    'use strict';

    // registers the extension on a cytoscape lib ref
    var register = function (cytoscape, $) {

        if (!cytoscape || !$) {
            return;
        } // can't register if cytoscape unspecified

        var options = {
            node: {
                highlighted: {}, // styles for when nodes are highlighted.
                unhighlighted: { // styles for when nodes are unhighlighted.
                    'opacity': 0.3
                },
                hidden: {
                    "display": "none"
                }
            },
            edge: {
                highlighted: {}, // styles for when edges are highlighted.
                unhighlighted: { // styles for when edges are unhighlighted.
                    'opacity': 0.3
                },
                hidden: {
                    "display": "none"
                }
            },
            searchBy: ["id"] // Array of data fields will a string be searched on or function which executes search.
        };


        var hideShow = _dereq_("./hide-show");
        var search = _dereq_("./search");
        var highlight = _dereq_("./highlight");

        cytoscape('core', 'viewUtilities', function (opts) {
            var cy = this;
            
            $.extend(true, options, opts);
            
            function getScratch(eleOrCy) {
              if (!eleOrCy.scratch("_viewUtilities")) {
                eleOrCy.scratch("_viewUtilities", {});
              }
              
              return eleOrCy.scratch("_viewUtilities");
            }

            if (!getScratch(cy).initialized) {
                getScratch(cy).initialized = true;

                if (cy.undoRedo)
                    var ur = cy.undoRedo(null, true);

                highlight(cytoscape, cy, options, ur);
                hideShow(cytoscape, cy, options, ur);
                search(cytoscape, cy, options);

            }
            return this;
        });

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-view-utilities', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined' && typeof $ !== "undefined") { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape, $);
    }

})();

},{"./hide-show":1,"./highlight":2,"./search":4}],4:[function(_dereq_,module,exports){
module.exports = function (cytoscape, cy, options) {

    cytoscape("collection", "search", function (text, searchBy) {
        var eles = this;

        if (!searchBy)
            searchBy = options.searchBy;

        var res;
        if (typeof searchBy == "function")
            res = searchBy(text);
        else {
            res = eles.filter(function (i, ele) {
                return searchBy.map(function (field) {
                        return ele.data(field) ? ele.data(field) : "";
                    }).join("$^>").indexOf(text) >= 0;
            });
        }

        return res;
    });

};
},{}]},{},[3])(3)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sbgnviz = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = function () {
  var commonAppUtilities = _dereq_('./common-app-utilities');
  var undoRedoActionFunctions = _dereq_('./undo-redo-action-functions');
  var sbgnElementUtilities = _dereq_('../../src/utilities/sbgn-element-utilities');
  
  var getExpandCollapseOptions = commonAppUtilities.getExpandCollapseOptions.bind(commonAppUtilities);
  var getInfoLabel = commonAppUtilities.getInfoLabel.bind(commonAppUtilities);
  var nodeQtipFunction = commonAppUtilities.nodeQtipFunction.bind(commonAppUtilities);
  var refreshUndoRedoButtonsStatus = commonAppUtilities.refreshUndoRedoButtonsStatus.bind(commonAppUtilities);
  var refreshPaddings = commonAppUtilities.refreshPaddings.bind(commonAppUtilities);
  var sbgnStyleRules = commonAppUtilities.sbgnStyleRules;

  $(document).ready(function ()
  {
    commonAppUtilities.sbgnNetworkContainer = $('#sbgn-network-container');
    // create and init cytoscape:
    var cy = cytoscape({
      container: commonAppUtilities.sbgnNetworkContainer,
      style: sbgnStyleSheet,
      showOverlay: false, minZoom: 0.125, maxZoom: 16,
      boxSelectionEnabled: true,
      motionBlur: true,
      wheelSensitivity: 0.1,
      ready: function () {
        window.cy = this;
        registerUndoRedoActions();
        cytoscapeExtensionsAndContextMenu();
        bindCyEvents();
      }
    });
  });

  var sbgnStyleSheet = cytoscape.stylesheet()
          .selector("node")
          .css({
            'border-width': 1.5,
            'border-color': '#555',
            'background-color': '#f6f6f6',
            'font-size': 11,
            'background-opacity': 0.5,
            'text-opacity': 1,
            'opacity': 1
          })
          .selector("node[?sbgnclonemarker][sbgnclass='perturbing agent']")
          .css({
            'background-image': 'sample-app/sampleapp-images/clone_bg.png',
            'background-position-x': '50%',
            'background-position-y': '100%',
            'background-width': '100%',
            'background-height': '25%',
            'background-fit': 'none',
            'background-image-opacity': function (ele) {
              if (!ele.data('sbgnclonemarker')) {
                return 0;
              }
              return ele.css('background-opacity');
            }
          })
          .selector("node[sbgnclass][sbgnclass!='complex'][sbgnclass!='process'][sbgnclass!='association'][sbgnclass!='dissociation'][sbgnclass!='compartment'][sbgnclass!='source and sink']")
          .css({
            'content': function (ele) {
              return sbgnElementUtilities.getElementContent(ele);
            },
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': function (ele) {
              return sbgnElementUtilities.getLabelTextSize(ele);
            }
          })
          .selector("node[sbgnclass]")
          .css({
            'shape': function (ele) {
              return sbgnElementUtilities.getCyShape(ele);
            }
          })
          .selector("node[sbgnclass='perturbing agent']")
          .css({
            'shape-polygon-points': '-1, -1,   -0.5, 0,  -1, 1,   1, 1,   0.5, 0, 1, -1'
          })
          .selector("node[sbgnclass='association']")
          .css({
            'background-color': '#6B6B6B'
          })
          .selector("node[sbgnclass='tag']")
          .css({
            'shape-polygon-points': '-1, -1,   0.25, -1,   1, 0,    0.25, 1,    -1, 1'
          })
          .selector("node[sbgnclass='complex']")
          .css({
            'background-color': '#F4F3EE',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'content': function (ele) {
              return sbgnElementUtilities.getElementContent(ele);
            }
          })
          .selector("node[sbgnclass='compartment']")
          .css({
            'border-width': 3.75,
            'background-opacity': 0,
            'background-color': '#FFFFFF',
            'content': function (ele) {
              return sbgnElementUtilities.getElementContent(ele);
            },
            'text-valign': 'bottom',
            'text-halign': 'center'
          })
          .selector("node[sbgnbbox][sbgnclass][sbgnclass!='complex'][sbgnclass!='compartment'][sbgnclass!='submap']")
          .css({
            'width': 'data(sbgnbbox.w)',
            'height': 'data(sbgnbbox.h)'
          })
          .selector("node[expanded-collapsed='collapsed']")
          .css({
            'width': 36,
            'height': 36
          })
          .selector("node:selected")
          .css({
            'border-color': '#d67614',
            'target-arrow-color': '#000',
            'text-outline-color': '#000'})
          .selector("node:active")
          .css({
            'background-opacity': 0.7, 'overlay-color': '#d67614',
            'overlay-padding': '14'
          })
          .selector("edge")
          .css({
            'curve-style': 'bezier',
            'line-color': '#555',
            'target-arrow-fill': 'hollow',
            'source-arrow-fill': 'hollow',
            'width': 1.5,
            'target-arrow-color': '#555',
            'source-arrow-color': '#555',
            'text-border-color': function (ele) {
              if (ele.selected()) {
                return '#d67614';
              }
              return ele.data('lineColor') || ele.css('line-color');
            },
            'color': function (ele) {
              if (ele.selected()) {
                return '#d67614';
              }
              return ele.data('lineColor') || ele.css('line-color');
            }
//          'target-arrow-shape': 'data(sbgnclass)'
          })
          .selector("edge[sbgncardinality > 0]")
          .css({
            'text-rotation': 'autorotate',
            'text-background-shape': 'rectangle',
            'text-border-opacity': '1',
            'text-border-width': '1',
            'text-background-color': 'white',
            'text-background-opacity': '1'
          })
          .selector("edge[sbgnclass='consumption'][sbgncardinality > 0]")
          .css({
            'source-label': function (ele) {
              return '' + ele.data('sbgncardinality');
            },
            'source-text-margin-y': '-10',
            'source-text-offset': function (ele) {
              return sbgnElementUtilities.getCardinalityDistance(ele);
            }
          })
          .selector("edge[sbgnclass='production'][sbgncardinality > 0]")
          .css({
            'target-label': function (ele) {
              return '' + ele.data('sbgncardinality');
            },
            'target-text-margin-y': '-10',
            'target-text-offset': function (ele) {
              return sbgnElementUtilities.getCardinalityDistance(ele);
            }
          })
          .selector("edge[sbgnclass]")
          .css({
            'target-arrow-shape': function (ele) {
              return sbgnElementUtilities.getCyArrowShape(ele);
            },
            'source-arrow-shape': 'none'
          })
          .selector("edge[sbgnclass='inhibition']")
          .css({
            'target-arrow-fill': 'filled'
          })
          .selector("edge[sbgnclass='production']")
          .css({
            'target-arrow-fill': 'filled'
          })
          .selector("edge:selected")
          .css({
            'line-color': '#d67614',
            'source-arrow-color': '#d67614',
            'target-arrow-color': '#d67614'
          })
          .selector("edge:active")
          .css({
            'background-opacity': 0.7, 'overlay-color': '#d67614',
            'overlay-padding': '8'
          })
          .selector("core")
          .css({
            'selection-box-color': '#d67614',
            'selection-box-opacity': '0.2', 'selection-box-border-color': '#d67614'
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
          .selector("node.changeBackgroundOpacity[backgroundOpacity]")
          .css({
            'background-opacity': 'data(backgroundOpacity)'
          })
          .selector("node.changeLabelTextSize")
          .css({
            'font-size': function (ele) {
              return sbgnElementUtilities.getLabelTextSize(ele);
            }
          })
          .selector("node.changeContent")
          .css({
            'content': function (ele) {
              return sbgnElementUtilities.getElementContent(ele);
            }
          })
          .selector("node.changeBorderColor")
          .css({
            'border-color': 'data(borderColor)'
          })
          .selector("node.changeBorderColor:selected")
          .css({
            'border-color': '#d67614'
          })
          .selector("edge.changeLineColor")
          .css({
            'line-color': 'data(lineColor)',
            'source-arrow-color': 'data(lineColor)',
            'target-arrow-color': 'data(lineColor)'
          })
          .selector("edge.changeLineColor:selected")
          .css({
            'line-color': '#d67614',
            'source-arrow-color': '#d67614',
            'target-arrow-color': '#d67614'
          })
          .selector('edge.changeLineColor.meta')
          .css({
            'line-color': '#C4C4C4',
            'source-arrow-color': '#C4C4C4',
            'target-arrow-color': '#C4C4C4'
          })
          .selector("edge.changeLineColor.meta:selected")
          .css({
            'line-color': '#d67614',
            'source-arrow-color': '#d67614',
            'target-arrow-color': '#d67614'
          }).selector("node.changeClonedStatus")
          .css({
            'background-image-opacity': function (ele) {
              if (!ele.data('sbgnclonemarker')) {
                return 0;
              }
              return ele.css('background-opacity');
            }
          });
// end of sbgnStyleSheet

// Note that in ChiSE this function is in a seperate file but in the viewer it has just 2 methods and so it is located in this file
  function registerUndoRedoActions() {
    // create undo-redo instance
    var ur = cy.undoRedo({});

    // register general actions
    // register add remove actions
    ur.action("deleteElesSimple", undoRedoActionFunctions.deleteElesSimple, undoRedoActionFunctions.restoreEles);
    ur.action("deleteElesSmart", undoRedoActionFunctions.deleteElesSmart, undoRedoActionFunctions.restoreEles);
  }

  function cytoscapeExtensionsAndContextMenu() {
    cy.expandCollapse(getExpandCollapseOptions());

    var contextMenus = cy.contextMenus({
      menuItemClasses: ['customized-context-menus-menu-item']
    });

    cy.edgeBendEditing({
      // this function specifies the positions of bend points
      bendPositionsFunction: function (ele) {
        return ele.data('bendPointPositions');
      },
      // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
      undoable: true,
      // title of remove bend point menu item
      removeBendMenuItemTitle: "Delete Bend Point",
      // whether to initilize bend points on creation of this extension automatically
      initBendPointsAutomatically: false
    });

    contextMenus.appendMenuItems([
      {
        id: 'ctx-menu-sbgn-properties',
        title: 'Properties...',
        coreAsWell: true,
        onClickFunction: function (event) {
          $("#sbgn-properties").trigger("click");
        }
      },
      {
        id: 'ctx-menu-delete',
        title: 'Delete',
        selector: 'node, edge',
        onClickFunction: function (event) {
          cy.undoRedo().do("deleteElesSimple", {
            eles: event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-delete-selected',
        title: 'Delete Selected',
        onClickFunction: function () {
          $("#delete-selected-simple").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-hide-selected',
        title: 'Hide Selected',
        onClickFunction: function () {
          $("#hide-selected").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-show-all',
        title: 'Show All',
        onClickFunction: function () {
          $("#show-all").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-expand', // ID of menu item
        title: 'Expand', // Title of menu item
        // Filters the elements to have this menu item on cxttap
        // If the selector is not truthy no elements will have this menu item on cxttap
        selector: 'node[expanded-collapsed="collapsed"]',
        onClickFunction: function (event) { // The function to be executed on click
          cy.undoRedo().do("expand", {
            nodes: event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-collapse',
        title: 'Collapse',
        selector: 'node[expanded-collapsed!="collapsed"][sbgnclass="complex"],[expanded-collapsed!="collapsed"][sbgnclass="compartment"]',
        onClickFunction: function (event) {
          cy.undoRedo().do("collapse", {
            nodes: event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-perform-layout',
        title: 'Perform Layout',
        onClickFunction: function () {
          $("#perform-layout").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-biogene-properties',
        title: 'BioGene Properties',
        selector: 'node[sbgnclass="macromolecule"],[sbgnclass="nucleic acid feature"],[sbgnclass="unspecified entity"]',
        onClickFunction: function (event) {
          bioGeneQtip(event.cyTarget);
        }
      }
    ]);

    cy.clipboard({
      clipboardSize: 5, // Size of clipboard. 0 means unlimited. If size is exceeded, first added item in clipboard will be removed.
      shortcuts: {
        enabled: true, // Whether keyboard shortcuts are enabled
        undoable: true // and if undoRedo extension exists
      }
    });

    cy.viewUtilities({
      node: {
        highlighted: {
          'border-width': '10px'
        }, // styles for when nodes are highlighted.
        unhighlighted: {// styles for when nodes are unhighlighted.
          'opacity': function (ele) {
            return ele.css('opacity');
          }
        },
        hidden: {
          "display": "none"
        }
      },
      edge: {
        highlighted: {
          'width': '10px'
        }, // styles for when edges are highlighted.
        unhighlighted: {// styles for when edges are unhighlighted.
          'opacity': function (ele) {
            return ele.css('opacity');
          }
        },
        hidden: {
          "display": "none"
        }
      }
    });

    var panProps = ({
      fitPadding: 10,
      fitSelector: ':visible',
      animateOnFit: function () {
        return sbgnStyleRules['animate-on-drawing-changes'];
      },
      animateOnZoom: function () {
        return sbgnStyleRules['animate-on-drawing-changes'];
      }
    });

    commonAppUtilities.sbgnNetworkContainer.cytoscapePanzoom(panProps);
  }

  function bindCyEvents() {
    cy.on("beforeCollapse", "node", function (event) {
      var node = this;
      //The children info of complex nodes should be shown when they are collapsed
      if (node._private.data.sbgnclass == "complex") {
        //The node is being collapsed store infolabel to use it later
        var infoLabel = getInfoLabel(node);
        node._private.data.infoLabel = infoLabel;
      }

      var edges = cy.edges();
      // remove bend points before collapse
      for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if (edge.hasClass('edgebendediting-hasbendpoints')) {
          edge.removeClass('edgebendediting-hasbendpoints');
          delete edge._private.classes['edgebendediting-hasbendpoints'];
        }
      }

      edges.scratch('cyedgebendeditingWeights', []);
      edges.scratch('cyedgebendeditingDistances', []);
    });

    cy.on("afterCollapse", "node", function (event) {
      var node = this;
      refreshPaddings();

      if (node._private.data.sbgnclass == "complex") {
        node.addClass('changeContent');
      }
    });

    cy.on("beforeExpand", "node", function (event) {
      var node = this;
      node.removeData("infoLabel");
    });

    cy.on("afterExpand", "node", function (event) {
      var node = this;
      cy.nodes().updateCompoundBounds();
      //Don't show children info when the complex node is expanded
      if (node._private.data.sbgnclass == "complex") {
        node.removeStyle('content');
      }
      refreshPaddings();
    });

    cy.on("afterDo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on("afterUndo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on("afterRedo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on('mouseover', 'node', function (event) {
      var node = this;

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
      this.mouseover = false;           //make preset layout to redraw the nodes
      cy.forceRender();
    });

    cy.on('tapend', 'node', function (event) {
      cy.style().update();
    });

    cy.on('tap', function (event) {
      $('input').blur();
    });

    cy.on('tap', 'node', function (event) {
      var node = this;

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


},{"../../src/utilities/sbgn-element-utilities":10,"./common-app-utilities":4,"./undo-redo-action-functions":5}],2:[function(_dereq_,module,exports){
// Handle sbgnviz menu functions which are to be triggered on events
module.exports = function () {
  var BackboneViews = _dereq_('./backbone-views');
  var commonAppUtilities = _dereq_('./common-app-utilities');
  var sbgnmlToJson = _dereq_('../../src/utilities/sbgnml-to-json-converter');
  var jsonToSbgnml = _dereq_('../../src/utilities/json-to-sbgnml-converter');
  var sbgnElementUtilities = _dereq_('../../src/utilities/sbgn-element-utilities');
  var dialogUtilities = _dereq_('../../src/utilities/dialog-utilities');
  
  var setFileContent = commonAppUtilities.setFileContent.bind(commonAppUtilities);
  var startSpinner = commonAppUtilities.startSpinner.bind(commonAppUtilities);
  var endSpinner = commonAppUtilities.endSpinner.bind(commonAppUtilities);
  var beforePerformLayout = commonAppUtilities.beforePerformLayout.bind(commonAppUtilities);
  var sbgnvizUpdate = commonAppUtilities.sbgnvizUpdate.bind(commonAppUtilities);
  var dynamicResize = commonAppUtilities.dynamicResize.bind(commonAppUtilities);
  var sbgnStyleRules = commonAppUtilities.sbgnStyleRules;
  
  var sbgnLayoutProp, sbgnProperties, pathsBetweenQuery;

  $(document).ready(function ()
  {
    console.log('init the sbgnviz template/page');

    sbgnLayoutProp = commonAppUtilities.sbgnLayoutProp = new BackboneViews.SBGNLayout({el: '#sbgn-layout-table'});
    sbgnProperties = commonAppUtilities.sbgnProperties = new BackboneViews.SBGNProperties({el: '#sbgn-properties-table'});
    pathsBetweenQuery = commonAppUtilities.pathsBetweenQuery = new BackboneViews.PathsBetweenQuery({el: '#query-pathsbetween-table'});

    toolbarButtonsAndMenu();

    loadSample('neuronal_muscle_signalling.xml');

    $(window).on('resize', dynamicResize);
    dynamicResize();

  });

  function expandSelected() {
    var nodes = cy.nodes(":selected").filter("[expanded-collapsed='collapsed']");
    if (nodes.expandableNodes().length == 0) {
      return;
    }
    cy.undoRedo().do("expand", {
      nodes: nodes,
    });
  }

  function hideSelected() {
    var selectedEles = cy.$(":selected");
    if (selectedEles.length === 0) {
      return;
    }
    cy.undoRedo().do("hide", selectedEles);
  }

  function showSelected() {
    if (cy.elements(":selected").length === cy.elements(':visible').length) {
      return;
    }
    cy.undoRedo().do("show", cy.elements(":selected"));
  }

  function collapseSelected() {
    var nodes = cy.nodes(":selected");
    if (nodes.collapsibleNodes().length == 0) {
      return;
    }
    cy.undoRedo().do("collapse", {
      nodes: nodes
    });
  }

  function toolbarButtonsAndMenu() {

    $("#load-file, #load-file-icon").click(function () {
      $("#file-input").trigger('click');
    });

    $("#file-input").change(function () {
      if ($(this).val() != "") {
        var file = this.files[0];
        loadSBGNMLFile(file);
        $(this).val("");
      }
    });

    $("#node-legend").click(function (e) {
      e.preventDefault();
      dialogUtilities.openFancybox($("#node-legend-template"), {
        'autoDimensions': false,
        'width': 504,
        'height': 325
      });
    });

    $("#edge-legend").click(function (e) {
      e.preventDefault();
      dialogUtilities.openFancybox($("#edge-legend-template"), {
        'autoDimensions': false,
        'width': 325,
        'height': 285
      });
    });

    $("#quick-help").click(function (e) {
      e.preventDefault();
      dialogUtilities.openFancybox($("#quick-help-template"), {
        'autoDimensions': false,
        'width': 420,
        'height': "auto"
      });
    });

    $("#about").click(function (e) {
      e.preventDefault();
      dialogUtilities.openFancybox($("#about-template"), {
        'autoDimensions': false,
        'width': 300,
        'height': 320
      });
    });

    $("#load-sample1").click(function (e) {
      loadSample('neuronal_muscle_signalling.xml');
    });

    $("#load-sample2").click(function (e) {
      loadSample('CaM-CaMK_dependent_signaling_to_the_nucleus.xml');
    });

    $("#load-sample3").click(function (e) {
      loadSample('activated_stat1alpha_induction_of_the_irf1_gene.xml');
    });

    $("#load-sample4").click(function (e) {
      loadSample('glycolysis.xml');
    });

    $("#load-sample5").click(function (e) {
      loadSample('mapk_cascade.xml');
    });

    $("#load-sample6").click(function (e) {
      loadSample('polyq_proteins_interference.xml');
    });

    $("#load-sample7").click(function (e) {
      loadSample('insulin-like_growth_factor_signaling.xml');
    });

    $("#load-sample8").click(function (e) {
      loadSample('atm_mediated_phosphorylation_of_repair_proteins.xml');
    });

    $("#load-sample9").click(function (e) {
      loadSample('vitamins_b6_activation_to_pyridoxal_phosphate.xml');
    });

    $("#hide-selected, #hide-selected-icon").click(hideSelected);

    $("#show-selected, #show-selected-icon").click(showSelected); //TODO: remove weird feature (or fix)?

    $("#show-all").click(function (e) {
      if (cy.elements().length === cy.elements(':visible').length) {
        return;
      }
      cy.undoRedo().do("show", cy.elements());
    });

    $("#delete-selected-smart, #delete-selected-smart-icon").click(function (e) {
      var sel = cy.$(":selected");
      if (sel.length == 0) {
        return;
      }
      cy.undoRedo().do("deleteElesSmart", {
        firstTime: true,
        eles: sel
      });
    });

    $("#neighbors-of-selected, #highlight-neighbors-of-selected-icon").click(function (e) {
      var elesToHighlight = sbgnElementUtilities.getNeighboursOfSelected();
      if (elesToHighlight.length === 0) {
        return;
      }
      var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
      var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);
      if (elesToHighlight.same(highlightedEles)) {
        return;
      }
      cy.undoRedo().do("highlight", elesToHighlight);
    });

    $("#search-by-label-icon").click(function (e) {
      var text = $("#search-by-label-text-box").val().toLowerCase();
      if (text.length == 0) {
        return;
      }
      cy.nodes().unselect();

      var nodesToSelect = cy.nodes(":visible").filter(function (i, ele) {
        if (ele.data("sbgnlabel") && ele.data("sbgnlabel").toLowerCase().indexOf(text) >= 0) {
          return true;
        }
        return false;
      });

      if (nodesToSelect.length == 0) {
        return;
      }
      nodesToSelect.select();

      var nodesToHighlight = sbgnElementUtilities.getProcessesOfSelected();
      cy.undoRedo().do("highlight", nodesToHighlight);
    });

    $("#search-by-label-text-box").keydown(function (e) {
      if (e.which === 13) {
        $("#search-by-label-icon").trigger('click');
      }
    });

    $("#highlight-search-menu-item").click(function (e) {
      $("#search-by-label-text-box").focus();
    });

    $("#processes-of-selected").click(function (e) {
      var elesToHighlight = sbgnElementUtilities.getProcessesOfSelected();
      if (elesToHighlight.length === 0) {
        return;
      }
      var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
      var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);
      if (elesToHighlight.same(highlightedEles)) {
        return;
      }
      cy.undoRedo().do("highlight", elesToHighlight);
    });

    $("#remove-highlights, #remove-highlights-icon").click(function (e) {
      if (sbgnElementUtilities.noneIsNotHighlighted()) {
        return;
      }
      cy.undoRedo().do("removeHighlights");
    });

    $("#layout-properties").click(function (e) {
      sbgnLayoutProp.render();
    });

    $("#layout-properties-icon").click(function (e) {
      $("#layout-properties").trigger('click');
    });

    $("#delete-selected-simple, #delete-selected-simple-icon").click(function (e) {
      var selectedEles = cy.$(":selected");
      if (selectedEles.length == 0) {
        return;
      }
      cy.undoRedo().do("deleteElesSimple", {
        eles: selectedEles
      });
    });

    $("#sbgn-properties, #properties-icon").click(function (e) {
      sbgnProperties.render();
    });

    $("#query-pathsbetween").click(function (e) {
      pathsBetweenQuery.render();
    });

    $("#collapse-selected,#collapse-selected-icon").click(function (e) {
      collapseSelected();
    });

    $("#expand-selected,#expand-selected-icon").click(function (e) {
      expandSelected();
    });

    $("#collapse-complexes").click(function (e) {
      var complexes = cy.nodes("[sbgnclass='complex']");
      if (complexes.collapsibleNodes().length == 0) {
        return;
      }
      cy.undoRedo().do("collapseRecursively", {
        nodes: complexes
      });
    });
    $("#expand-complexes").click(function (e) {
      var nodes = cy.nodes(":selected").filter("[sbgnclass='complex'][expanded-collapsed='collapsed']");
      if (nodes.expandableNodes().length == 0) {
        return;
      }
      cy.undoRedo().do("expandRecursively", {
        nodes: nodes
      });
    });

    $("#collapse-all").click(function (e) {
      var nodes = cy.nodes(':visible');
      if (nodes.collapsibleNodes().length == 0) {
        return;
      }
      cy.undoRedo().do("collapseRecursively", {
        nodes: nodes
      });
    });

    $("#expand-all").click(function (e) {
      var nodes = cy.nodes(':visible').filter("[expanded-collapsed='collapsed']");
      if (nodes.expandableNodes().length == 0) {
        return;
      }
      cy.undoRedo().do("expandRecursively", {
        nodes: nodes
      });
    });

    $("#perform-layout-icon").click(function (e) {
      $("#perform-layout").trigger('click');
    });

    $("#perform-layout").click(function (e) {
      startSpinner("layout-spinner");
      beforePerformLayout();
      var preferences = {
        animate: sbgnStyleRules['animate-on-drawing-changes'] ? 'end' : false
      };
      if (sbgnLayoutProp.currentLayoutProperties.animate == 'during') {
        delete preferences.animate;
      }
      sbgnLayoutProp.applyLayout(preferences);
    });

    $("#undo-last-action, #undo-icon").click(function (e) {
      cy.undoRedo().undo();
    });

    $("#redo-last-action, #redo-icon").click(function (e) {
      cy.undoRedo().redo();
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

    //TODO: could simply keep/store original input SBGN-ML data and use it here instead of converting from JSON
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

    commonAppUtilities.sbgnNetworkContainer.on("click", ".biogene-info .expandable", function (evt) {
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
  }

  function setFileContent(fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
      span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
  }

  function loadSample(filename) {
    startSpinner("load-spinner");
    var xmlObject = loadXMLDoc('sample-app/samples/' + filename);
    setFileContent(filename.replace('xml', 'sbgnml'));
    setTimeout(function () {
      sbgnvizUpdate(sbgnmlToJson.convert(xmlObject));
      endSpinner("load-spinner");
    }, 0);
  }

  function loadSBGNMLFile(file) {
    startSpinner("load-file-spinner");
    $("#load-file-spinner").ready(function () {
      var textType = /text.*/;

      var reader = new FileReader();

      reader.onload = function (e) {
        var text = this.result;

        setTimeout(function () {
          sbgnvizUpdate(sbgnmlToJson.convert(textToXmlObject(text)));
          endSpinner("load-file-spinner");
        }, 0);
      };

      reader.readAsText(file);
      setFileContent(file.name);
    });
  }
  
  function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
    }
    else {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", filename, false);
    xhttp.send();
    return xhttp.responseXML;
  }

  function textToXmlObject(text) {
    if (window.ActiveXObject) {
      var doc = new ActiveXObject('Microsoft.XMLDOM');
      doc.async = 'false';
      doc.loadXML(text);
    } else {
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
  }

//Handle keyboard events
  $(document).keydown(function (e) {
    if (e.ctrlKey && e.target.nodeName === 'BODY') {
      if (e.which === 90) { // ctrl + z
        cy.undoRedo().undo();
      }
      else if (e.which === 89) { // ctrl + y
        cy.undoRedo().redo();
      }
    }
  });
};
},{"../../src/utilities/dialog-utilities":8,"../../src/utilities/json-to-sbgnml-converter":9,"../../src/utilities/sbgn-element-utilities":10,"../../src/utilities/sbgnml-to-json-converter":11,"./backbone-views":3,"./common-app-utilities":4}],3:[function(_dereq_,module,exports){
var commonAppUtilities = _dereq_('./common-app-utilities');
var sbgnmlToJson = _dereq_('../../src/utilities/sbgnml-to-json-converter');
var dialogUtilities = _dereq_('../../src/utilities/dialog-utilities');

var setFileContent = commonAppUtilities.setFileContent.bind(commonAppUtilities);
var startSpinner = commonAppUtilities.startSpinner.bind(commonAppUtilities);
var endSpinner = commonAppUtilities.endSpinner.bind(commonAppUtilities);
var sbgnvizUpdate = commonAppUtilities.sbgnvizUpdate.bind(commonAppUtilities);
var calculatePaddings = commonAppUtilities.calculatePaddings.bind(commonAppUtilities);
var sbgnStyleRules = commonAppUtilities.sbgnStyleRules;
var defaultSbgnStyleRules = commonAppUtilities.defaultSbgnStyleRules;
var refreshPaddings = commonAppUtilities.refreshPaddings.bind(commonAppUtilities);

/**
 * Backbone view for the BioGene information.
 */
var BioGeneView = Backbone.View.extend({
  /*
   * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
   *
   * This file is part of PCViz.
   *
   * PCViz is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Lesser General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * PCViz is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   * GNU Lesser General Public License for more details.
   *
   * You should have received a copy of the GNU Lesser General Public License
   * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
   */

  render: function () {
    // pass variables in using Underscore.js template
    var variables = {
      geneDescription: this.model.geneDescription,
      geneAliases: this.parseDelimitedInfo(this.model.geneAliases, ":", ",", null),
      geneDesignations: this.parseDelimitedInfo(this.model.geneDesignations, ":", ",", null),
      geneLocation: this.model.geneLocation,
      geneMim: this.model.geneMim,
      geneId: this.model.geneId,
      geneUniprotId: this.extractFirstUniprotId(this.model.geneUniprotMapping),
      geneUniprotLinks: this.generateUniprotLinks(this.model.geneUniprotMapping),
      geneSummary: this.model.geneSummary
    };

    // compile the template using underscore
    var template = _.template($("#biogene-template").html());
    template = template(variables);

    // load the compiled HTML into the Backbone "el"
    this.$el.html(template);

    // format after loading
    this.format(this.model);

    return this;
  },
  format: function ()
  {
    // hide rows with undefined data
    if (this.model.geneDescription == undefined)
      this.$el.find(".biogene-description").hide();

    if (this.model.geneAliases == undefined)
      this.$el.find(".biogene-aliases").hide();

    if (this.model.geneDesignations == undefined)
      this.$el.find(".biogene-designations").hide();

    if (this.model.geneChromosome == undefined)
      this.$el.find(".biogene-chromosome").hide();

    if (this.model.geneLocation == undefined)
      this.$el.find(".biogene-location").hide();

    if (this.model.geneMim == undefined)
      this.$el.find(".biogene-mim").hide();

    if (this.model.geneId == undefined)
      this.$el.find(".biogene-id").hide();

    if (this.model.geneUniprotMapping == undefined)
      this.$el.find(".biogene-uniprot-links").hide();

    if (this.model.geneSummary == undefined)
      this.$el.find(".node-details-summary").hide();

    var expanderOpts = {slicePoint: 150,
      expandPrefix: ' ',
      expandText: ' (...)',
      userCollapseText: ' (show less)',
      moreClass: 'expander-read-more',
      lessClass: 'expander-read-less',
      detailClass: 'expander-details',
      // do not use default effects
      // (see https://github.com/kswedberg/jquery-expander/issues/46)
      expandEffect: 'fadeIn',
      collapseEffect: 'fadeOut'};

    $(".biogene-info .expandable").expander(expanderOpts);

    expanderOpts.slicePoint = 2; // show comma and the space
    expanderOpts.widow = 0; // hide everything else in any case
  },
  generateUniprotLinks: function (mapping) {
    var formatter = function (id) {
      return _.template($("#uniprot-link-template").html(), {id: id});
    };

    if (mapping == undefined || mapping == null)
    {
      return "";
    }

    // remove first id (assuming it is already processed)
    if (mapping.indexOf(':') < 0)
    {
      return "";
    }
    else
    {
      mapping = mapping.substring(mapping.indexOf(':') + 1);
      return ', ' + this.parseDelimitedInfo(mapping, ':', ',', formatter);
    }
  },
  extractFirstUniprotId: function (mapping) {
    if (mapping == undefined || mapping == null)
    {
      return "";
    }

    var parts = mapping.split(":");

    if (parts.length > 0)
    {
      return parts[0];
    }

    return "";
  },
  parseDelimitedInfo: function (info, delimiter, separator, formatter) {
    // do not process undefined or null values
    if (info == undefined || info == null)
    {
      return info;
    }

    var text = "";
    var parts = info.split(delimiter);

    if (parts.length > 0)
    {
      if (formatter)
      {
        text = formatter(parts[0]);
      }
      else
      {
        text = parts[0];
      }
    }

    for (var i = 1; i < parts.length; i++)
    {
      text += separator + " ";

      if (formatter)
      {
        text += formatter(parts[i]);
      }
      else
      {
        text += parts[i];
      }
    }

    return text;
  }
});

/**
 * SBGN Layout view for the Sample Application.
 */
var SBGNLayout = Backbone.View.extend({
  defaultLayoutProperties: {
    name: 'cose-bilkent',
    nodeRepulsion: 4500,
    idealEdgeLength: 50,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.25,
    numIter: 2500,
    tile: true,
    animationEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
    animate: 'end',
    animationDuration: 1000,
    randomize: true,
    tilingPaddingVertical: function () {
      return calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10));
    },
    tilingPaddingHorizontal: function () {
      return calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));
    },
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    gravityRange: 3.8,
    stop: function () {
      endSpinner('layout-spinner');
    }
  },
  currentLayoutProperties: null,
  initialize: function () {
    var self = this;
    self.copyProperties();

    var templateProperties = _.clone(self.currentLayoutProperties);
    templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
    templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

    self.template = _.template($("#layout-settings-template").html());
    self.template = self.template(templateProperties);
  },
  copyProperties: function () {
    this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
  },
  applyLayout: function (preferences, undoable) {
    if (preferences === undefined) {
      preferences = {};
    }
    var options = $.extend({}, this.currentLayoutProperties, preferences);
    if (undoable === false) {
      cy.elements().filter(':visible').layout(options);
    }
    else {
      cy.undoRedo().do("layout", {
        options: options,
        eles: cy.elements().filter(':visible')
      });
    }
  },
  render: function () {
    var self = this;

    var templateProperties = _.clone(self.currentLayoutProperties);
    templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
    templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

    self.template = _.template($("#layout-settings-template").html());
    self.template = self.template(templateProperties);
    $(self.el).html(self.template);

    dialogUtilities.openDialog(self.el);

    $(document).off("click", "#save-layout").on("click", "#save-layout", function (evt) {
      self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
      self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
      self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
      self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
      self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
      self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
      self.currentLayoutProperties.tile = document.getElementById("tile").checked;
      self.currentLayoutProperties.animate = document.getElementById("animate").checked ? 'during' : 'end';
      self.currentLayoutProperties.randomize = !document.getElementById("incremental").checked;
      self.currentLayoutProperties.gravityRangeCompound = Number(document.getElementById("gravity-range-compound").value);
      self.currentLayoutProperties.gravityCompound = Number(document.getElementById("gravity-compound").value);
      self.currentLayoutProperties.gravityRange = Number(document.getElementById("gravity-range").value);

      sbgnStyleRules['tiling-padding-vertical'] = Number(document.getElementById("tiling-padding-vertical").value);
      sbgnStyleRules['tiling-padding-horizontal'] = Number(document.getElementById("tiling-padding-horizontal").value);
    });

    $(document).off("click", "#default-layout").on("click", "#default-layout", function (evt) {
      self.copyProperties();

      sbgnStyleRules['tiling-padding-vertical'] = defaultSbgnStyleRules['tiling-padding-vertical'];
      sbgnStyleRules['tiling-padding-horizontal'] = defaultSbgnStyleRules['tiling-padding-horizontal'];

      var templateProperties = _.clone(self.currentLayoutProperties);
      templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
      templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

      self.template = _.template($("#layout-settings-template").html());
      self.template = self.template(templateProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});

/**
 * SBGN Properties view for the Sample Application.
 */
var SBGNProperties = Backbone.View.extend({
  defaultSBGNProperties: {
    compoundPadding: parseInt(sbgnStyleRules['compound-padding'], 10),
    dynamicLabelSize: sbgnStyleRules['dynamic-label-size'],
    fitLabelsToNodes: sbgnStyleRules['fit-labels-to-nodes'],
    rearrangeAfterExpandCollapse: sbgnStyleRules['rearrange-after-expand-collapse'],
    animateOnDrawingChanges: sbgnStyleRules['animate-on-drawing-changes']
  },
  currentSBGNProperties: null,
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#sbgn-properties-template").html());
    self.template = self.template(self.currentSBGNProperties);
  },
  copyProperties: function () {
    this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
  },
  render: function () {
    var self = this;
    self.template = _.template($("#sbgn-properties-template").html());
    self.template = self.template(self.currentSBGNProperties);
    $(self.el).html(self.template);

    dialogUtilities.openDialog(self.el);

    $(document).off("click", "#save-sbgn").on("click", "#save-sbgn", function (evt) {

      var param = {};
      param.firstTime = true;
      param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

      self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
      self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
      self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
      self.currentSBGNProperties.rearrangeAfterExpandCollapse =
              document.getElementById("rearrange-after-expand-collapse").checked;
      self.currentSBGNProperties.animateOnDrawingChanges =
              document.getElementById("animate-on-drawing-changes").checked;

      //Refresh paddings if needed
      if (sbgnStyleRules['compound-padding'] != self.currentSBGNProperties.compoundPadding) {
        sbgnStyleRules['compound-padding'] = self.currentSBGNProperties.compoundPadding;
        refreshPaddings();
      }
      //Refresh label size if needed
      if (sbgnStyleRules['dynamic-label-size'] != self.currentSBGNProperties.dynamicLabelSize) {
        sbgnStyleRules['dynamic-label-size'] = '' + self.currentSBGNProperties.dynamicLabelSize;
        cy.nodes().removeClass('changeLabelTextSize');
        cy.nodes().addClass('changeLabelTextSize');
      }
      //Refresh truncations if needed
      if (sbgnStyleRules['fit-labels-to-nodes'] != self.currentSBGNProperties.fitLabelsToNodes) {
        sbgnStyleRules['fit-labels-to-nodes'] = self.currentSBGNProperties.fitLabelsToNodes;
        cy.nodes().removeClass('changeContent');
        cy.nodes().addClass('changeContent');
      }

      sbgnStyleRules['rearrange-after-expand-collapse'] =
              self.currentSBGNProperties.rearrangeAfterExpandCollapse;

      sbgnStyleRules['animate-on-drawing-changes'] =
              self.currentSBGNProperties.animateOnDrawingChanges;
    });

    $(document).off("click", "#default-sbgn").on("click", "#default-sbgn", function (evt) {
      self.copyProperties();
      self.template = _.template($("#sbgn-properties-template").html());
      self.template = self.template(self.currentSBGNProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});

/**
 * Paths Between Query view for the Sample Application.
 */
var PathsBetweenQuery = Backbone.View.extend({
  defaultQueryParameters: {
    geneSymbols: "",
    lengthLimit: 1
  },
  currentQueryParameters: null,
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#query-pathsbetween-template").html());
    self.template = self.template(self.currentQueryParameters);
  },
  copyProperties: function () {
    this.currentQueryParameters = _.clone(this.defaultQueryParameters);
  },
  render: function () {
    var self = this;
    self.template = _.template($("#query-pathsbetween-template").html());
    self.template = self.template(self.currentQueryParameters);
    $(self.el).html(self.template);

    $("#query-pathsbetween-enable-shortest-k-alteration").change(function (e) {
      if (document.getElementById("query-pathsbetween-enable-shortest-k-alteration").checked) {
        $("#query-pathsbetween-shortest-k").prop("disabled", false);
      } else {
        $("#query-pathsbetween-shortest-k").prop("disabled", true);
      }
    });

    dialogUtilities.openDialog(self.el, {width: 'auto'});

    $(document).off("click", "#save-query-pathsbetween").on("click", "#save-query-pathsbetween", function (evt) {

      self.currentQueryParameters.geneSymbols = document.getElementById("query-pathsbetween-gene-symbols").value;
      self.currentQueryParameters.lengthLimit = Number(document.getElementById("query-pathsbetween-length-limit").value);

      var queryURL = "http://www.pathwaycommons.org/pc2/graph?format=SBGN&kind=PATHSBETWEEN&limit="
              + self.currentQueryParameters.lengthLimit;
      var sources = "";
      var filename = "";
      var geneSymbolsArray = self.currentQueryParameters.geneSymbols.replace("\n", " ").replace("\t", " ").split(" ");
      for (var i = 0; i < geneSymbolsArray.length; i++) {
        var currentGeneSymbol = geneSymbolsArray[i];
        if (currentGeneSymbol.length == 0 || currentGeneSymbol == ' '
                || currentGeneSymbol == '\n' || currentGeneSymbol == '\t') {
          continue;
        }
        sources = sources + "&source=" + currentGeneSymbol;
        if (filename == '') {
          filename = currentGeneSymbol;
        } else {
          filename = filename + '_' + currentGeneSymbol;
        }
      }
      filename = filename + '_PATHSBETWEEN.sbgnml';
      setFileContent(filename);

      startSpinner('paths-between-spinner');

      queryURL = queryURL + sources;
      $.ajax({
        url: queryURL,
        type: 'GET',
        success: function (data) {
          sbgnvizUpdate(sbgnmlToJson.convert(data));
          endSpinner('paths-between-spinner');
        }
      });

      $(self.el).dialog('close');
    });

    $(document).off("click", "#cancel-query-pathsbetween").on("click", "#cancel-query-pathsbetween", function (evt) {
      $(self.el).dialog('close');
    });

    return this;
  }
});

module.exports = {
  BioGeneView: BioGeneView,
  SBGNLayout: SBGNLayout,
  SBGNProperties: SBGNProperties,
  PathsBetweenQuery: PathsBetweenQuery
};
},{"../../src/utilities/dialog-utilities":8,"../../src/utilities/sbgnml-to-json-converter":11,"./common-app-utilities":4}],4:[function(_dereq_,module,exports){
var defaultSbgnStyleRules = {
  'compound-padding': 10,
  'dynamic-label-size': 'regular',
  'fit-labels-to-nodes': false,
  'rearrange-after-expand-collapse': true,
  'tiling-padding-vertical': 20,
  'tiling-padding-horizontal': 20,
  'animate-on-drawing-changes': true
};

var commonAppUtilities = commonAppUtilities || {
  sbgnNetworkContainer: undefined,
  sbgnLayoutProp: undefined,
  sbgnProperties: undefined,
  pathsBetweenQuery: undefined,
  defaultSbgnStyleRules: defaultSbgnStyleRules,
  sbgnStyleRules: _.clone(defaultSbgnStyleRules),
  setFileContent: function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
      span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
  },
  triggerIncrementalLayout: function () {
    this.beforePerformLayout();
    var preferences = {
      randomize: false,
      animate: this.sbgnStyleRules['animate-on-drawing-changes'] ? 'end' : false,
      fit: false
    };
    if (this.sbgnLayoutProp.currentLayoutProperties.animate === 'during') {
      delete preferences.animate;
    }

    this.sbgnLayoutProp.applyLayout(preferences, false); // layout must not be undoable
  },
  beforePerformLayout: function() {
    var nodes = cy.nodes();
    var edges = cy.edges();

    nodes.removeData("ports");
    edges.removeData("portsource");
    edges.removeData("porttarget");

    nodes.data("ports", []);
    edges.data("portsource", []);
    edges.data("porttarget", []);

    // TODO do this by using extension API
    cy.$('.edgebendediting-hasbendpoints').removeClass('edgebendediting-hasbendpoints');
    edges.scratch('cyedgebendeditingWeights', []);
    edges.scratch('cyedgebendeditingDistances', []);
  },
  sbgnvizUpdate: function (cyGraph) {
    console.log('cy update called');
    // Reset undo/redo stack and buttons when a new graph is loaded
    cy.undoRedo().reset();
    this.resetUndoRedoButtons();
    cy.startBatch();
    // clear data
    cy.remove('*');
    cy.add(cyGraph);
    cy.nodes().addClass('changeLabelTextSize');
    //add position information to data for preset layout
    var positionMap = {};
    for (var i = 0; i < cyGraph.nodes.length; i++) {
      var xPos = cyGraph.nodes[i].data.sbgnbbox.x;
      var yPos = cyGraph.nodes[i].data.sbgnbbox.y;
      positionMap[cyGraph.nodes[i].data.id] = {'x': xPos, 'y': yPos};
    }
    cy.layout({
      name: 'preset',
      positions: positionMap
    }
    );
    this.refreshPaddings();
    cy.endBatch();
    cy.edgeBendEditing('get').initBendPoints(cy.edges());
  },
  getExpandCollapseOptions: function () {
    var self = this;
    return {
      fisheye: function () {
        return self.sbgnStyleRules['rearrange-after-expand-collapse'];
      },
      animate: function () {
        return self.sbgnStyleRules['animate-on-drawing-changes'];
      },
      layoutBy: function () {
        if (!self.sbgnStyleRules['rearrange-after-expand-collapse']) {
          return;
        }

        self.triggerIncrementalLayout();
      }
    };
  },
  dynamicResize: function () {
    var win = $(window);//$(this); //this = window

    var windowWidth = win.width();
    var windowHeight = win.height();
    var canvasWidth = 1000;
    var canvasHeight = 680;
    if (windowWidth > canvasWidth)
    {
      $("#sbgn-network-container").width(windowWidth * 0.9);
      var w = $("#sbgn-inspector-and-canvas").width();
      $(".nav-menu").width(w);
      $(".navbar").width(w);
      $("#sbgn-toolbar").width(w);
    }

    if (windowHeight > canvasHeight)
    {
      $("#sbgn-network-container").height(windowHeight * 0.85);
      $("#sbgn-inspector").height(windowHeight * 0.85);
    }
  },
  getInfoLabel: function (node) {
    /* Info label of a collapsed node cannot be changed if
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
      var childInfo = this.getInfoLabel(child);
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
  },
  nodeQtipFunction: function (node) {
    /*    * Check the sbgnlabel of the node if it is not valid
     * then check the infolabel if it is also not valid do not show qtip
     */
    var label = node._private.data.sbgnlabel;
    if (label == null || label == "")
      label = this.getInfoLabel(node);
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
            var stateLabel = (variable == null /*|| typeof stateVariable === undefined */) ? value :
                    value + "@" + variable;
            if (stateLabel == null) {
              stateLabel = "";
            }
            contentHtml += "<div style='text-align:center;font-size:14px;'>" + stateLabel + "</div>";
          }
          else if (sbgnstateandinfo.clazz == "unit of information") {
            var stateLabel = sbgnstateandinfo.label.text;
            if (stateLabel == null) {
              stateLabel = "";
            }
            contentHtml += "<div style='text-align:center;font-size:14px;'>" + stateLabel + "</div>";
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
  },
  refreshUndoRedoButtonsStatus: function () {
    var ur = cy.undoRedo();
    if (ur.isUndoStackEmpty()) {
      $("#undo-last-action").parent("li").addClass("disabled");
    }
    else {
      $("#undo-last-action").parent("li").removeClass("disabled");
    }

    if (ur.isRedoStackEmpty()) {
      $("#redo-last-action").parent("li").addClass("disabled");
    }
    else {
      $("#redo-last-action").parent("li").removeClass("disabled");
    }
  },
  resetUndoRedoButtons: function () {
    $("#undo-last-action").parent("li").addClass("disabled");
    $("#redo-last-action").parent("li").addClass("disabled");
  },
  calculatePaddings: function (paddingPercent) {
    //As default use the compound padding value
    if (!paddingPercent) {
      paddingPercent = parseInt(this.sbgnStyleRules['compound-padding'], 10);
    }

    var nodes = cy.nodes();
    var total = 0;
    var numOfSimples = 0;
    for (var i = 0; i < nodes.length; i++) {
      var theNode = nodes[i];
      if (theNode.children() == null || theNode.children().length == 0) {
        total += Number(theNode.width());
        total += Number(theNode.height());
        numOfSimples++;
      }
    }

    var calc_padding = (paddingPercent / 100) * Math.floor(total / (2 * numOfSimples));
    if (calc_padding < 5) {
      calc_padding = 5;
    }

    return calc_padding;
  },
  calculateTilingPaddings: function() {
    return this.calculatePaddings();
  },
  calculateCompoundPaddings: function() {
    return this.calculatePaddings();
  },
  refreshPaddings: function () {
    var calc_padding = this.calculateCompoundPaddings();
    var nodes = cy.nodes();
    nodes.css('padding-left', 0);
    nodes.css('padding-right', 0);
    nodes.css('padding-top', 0);
    nodes.css('padding-bottom', 0);
    var compounds = nodes.filter('$node > node');
    compounds.css('padding-left', calc_padding);
    compounds.css('padding-right', calc_padding);
    compounds.css('padding-top', calc_padding);
    compounds.css('padding-bottom', calc_padding);
  },
  startSpinner: function (id) {

    if ($('.' + id).length === 0) {
      var containerWidth = $('#sbgn-network-container').width();
      var containerHeight = $('#sbgn-network-container').height();
      $('#sbgn-network-container:parent').prepend('<i style="position: absolute; z-index: 9999999; left: ' + containerWidth / 2 + 'px; top: ' + containerHeight / 2 + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw ' + id + '"></i>');
    }
  },
  endSpinner: function (id) {
    if ($('.' + id).length > 0) {
      $('.' + id).remove();
    }
  }
};

module.exports = commonAppUtilities;
},{}],5:[function(_dereq_,module,exports){
var sbgnElementUtilities = _dereq_('../../src/utilities/sbgn-element-utilities');

var undoRedoActionFunctions = {
  // Section Start
  // Add/remove action functions
  deleteElesSimple: function (param) {
    return sbgnElementUtilities.deleteElesSimple(param.eles);
  },
  restoreEles: function (eles) {
    var param = {};
    param.eles = sbgnElementUtilities.restoreEles(eles);
    return param;
  },
  deleteElesSmart: function (param) {
    if (param.firstTime) {
      return sbgnElementUtilities.deleteElesSmart(param.eles);
    }
    return sbgnElementUtilities.deleteElesSimple(param.eles);
  },
  // Section End
  // Add/remove action functions
};

module.exports = undoRedoActionFunctions;
},{"../../src/utilities/sbgn-element-utilities":10}],6:[function(_dereq_,module,exports){
(function(){
  var register = function(libs) {
    if (libs === undefined) {
      libs = {};
    }
    
    // Get cy extension instances
    var cyPanzoom = libs['cytoscape-panzoom'];
    var cyQtip = libs['cytoscape-qtip']; 
    var cyCoseBilkent = libs['cytoscape-cose-bilkent'];
    var cyUndoRedo = libs['cytoscape-undo-redo'];
    var cyClipboard = libs['cytoscape-clipboard'];
    var cyContextMenus = libs['cytoscape-context-menus'];
    var cyExpandCollapse = libs['cytoscape-expand-collapse'];
    var cyEdgeBendEditing = libs['cytoscape-edge-bend-editing'];
    var cyViewUtilities = libs['cytoscape-view-utilities'];
    
    // Register cy extensions
    cyPanzoom( cytoscape, $ );
    cyQtip( cytoscape, $ );
    cyCoseBilkent( cytoscape );
    cyUndoRedo( cytoscape );
    cyClipboard( cytoscape );
    cyContextMenus( cytoscape, $ );
    cyExpandCollapse( cytoscape, $ );
    cyEdgeBendEditing( cytoscape, $ );
    cyViewUtilities( cytoscape, $ );
    
    var sbgnRenderer = _dereq_('./sbgn-extensions/cytoscape.renderer.canvas.sbgn-renderer');
    var appCy = _dereq_('../sample-app/js/app-cy');
    var appMenu = _dereq_('../sample-app/js/app-menu');
    
    sbgnRenderer();
    appCy();
    appMenu();
    
  };
  
  module.exports = register;
})();
},{"../sample-app/js/app-cy":1,"../sample-app/js/app-menu":2,"./sbgn-extensions/cytoscape.renderer.canvas.sbgn-renderer":7}],7:[function(_dereq_,module,exports){
module.exports = function () {
  var $$ = cytoscape;
  var truncateText = _dereq_('../utilities/text-utilities').truncateText;
//  var cyVariables = require('../cy-variables');
  
  var sbgnShapes = $$.sbgnShapes = {
    'source and sink': true,
    'nucleic acid feature': true,
    'complex': true,
    'dissociation': true,
    'macromolecule': true,
    'simple chemical': true,
    'unspecified entity': true,
    'necessary stimulation': true,
    'process': true,
    'uncertain process': true,
    'omitted process': true,
    'association': true
  };

  var totallyOverridenNodeShapes = $$.totallyOverridenNodeShapes = {
    'macromolecule': true,
    'nucleic acid feature': true,
    'simple chemical': true,
    'complex': true,
    'unspecified entity': true,
    'process': true,
    'uncertain process': true,
    'omitted process': true,
    'dissociation': true,
    'association': true
  };

  $$.sbgn = {
  };

  $$.sbgn.cardinalityProperties = function () {
    return {
      boxLength: 13,
      distanceToNode: 25,
    };
  };

  $$.sbgn.drawCardinalityText = function (context, textProp) {
    textProp.color = "#0f0f0f";
    textProp.font = "9px Arial";
    $$.sbgn.drawText(context, textProp, false);
  };

  $$.sbgn.addPortReplacementIfAny = function (node, edgePort) {
    var posX = node.position().x;
    var posY = node.position().y;
    if (typeof node._private.data.ports != 'undefined') {
      for (var i = 0; i < node._private.data.ports.length; i++) {
        var port = node._private.data.ports[i];
        if (port.id == edgePort) {
          posX = posX + port.x * node.width() / 100;
          posY = posY + port.y * node.height() / 100;
          break;
        }
      }
    }
    return {'x': posX, 'y': posY};
  }
  ;

  $$.sbgn.drawPortsToPolygonShape = function (context, node, points) {
    var width = node.width();
    var height = node.height();
    var centerX = node._private.position.x;
    var centerY = node._private.position.y;
    var padding = parseInt(node.css('border-width')) / 2;

    for (var i = 0; i < node._private.data.ports.length; i++) {
      var port = node._private.data.ports[i];
      var portX = port.x * width / 100 + centerX;
      var portY = port.y * height / 100 + centerY;
      var closestPoint = cyVariables.cyMath.polygonIntersectLine(portX, portY,
              points, centerX, centerY, width / 2, height / 2, padding);
      context.beginPath();
      context.moveTo(portX, portY);
      context.lineTo(closestPoint[0], closestPoint[1]);
      context.stroke();
      context.closePath();


      //add a little black circle to ports
      var oldStyle = context.fillStyle;
      context.fillStyle = $$.sbgn.colors.port;
      $$.sbgn.drawEllipse(context, portX, portY, 2, 2);
      context.fillStyle = oldStyle;
      context.stroke();
    }
  };

  $$.sbgn.drawQuadraticLineCardinality = function (context, edge, pts, type) {
    context.moveTo(pts[0], pts[1]);
    context.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]);

    //if cardinality is zero, return here.
    var cardinality = edge._private.data.sbgncardinality;
    if (cardinality == 0 || cardinality == null)
      return;

    var carProp = $$.sbgn.cardinalityProperties();

    var totalLength = qBezierLength(pts);

    var startLength = totalLength - 25;

    var startPortion = startLength / totalLength;

    if (type === "consumption") {
      startPortion = carProp.distanceToSource / totalLength;
    } else {
      startPortion = (totalLength - carProp.distanceToTarget) / totalLength;
    }

    var t = startPortion;
    var x1 = (1 - t) * (1 - t) * pts[0] + 2 * (1 - t) * t * pts[2] + t * t * pts[4];
    var y1 = (1 - t) * (1 - t) * pts[1] + 2 * (1 - t) * t * pts[3] + t * t * pts[5];

    //get a short line to determine tanget line
    t = startPortion + 0.01;
    var x2 = (1 - t) * (1 - t) * pts[0] + 2 * (1 - t) * t * pts[2] + t * t * pts[4];
    var y2 = (1 - t) * (1 - t) * pts[1] + 2 * (1 - t) * t * pts[3] + t * t * pts[5];

    var dispX = x1 - x2;
    var dispY = y1 - y2;

    var angle = Math.asin(dispY / (Math.sqrt(dispX * dispX + dispY * dispY)));

    if (dispX < 0) {
      angle = angle + Math.PI / 2;
    } else {
      angle = -(Math.PI / 2 + angle);
    }


    context.translate(x1, y1);
    context.rotate(-angle);

    context.rect(0, -13 / 2, 13, 13);

    context.rotate(-Math.PI / 2);

    var textProp = {'centerX': 0, 'centerY': 13 / 2,
      'opacity': edge.css('text-opacity') * edge.css('opacity'),
      'width': 13, 'label': cardinality};
    $$.sbgn.drawCardinalityText(context, textProp);

    context.rotate(Math.PI / 2);

    context.rotate(angle);
    context.translate(-x1, -y1);

  };

  $$.sbgn.drawStraightLineCardinality = function (context, edge, pts, type) {
    context.moveTo(pts[0], pts[1]);
    context.lineTo(pts[2], pts[3]);

    //if cardinality is zero, return here.
    var cardinality = edge._private.data.sbgncardinality;
    if (cardinality <= 0 || cardinality == null)
      return;

    var carProp = $$.sbgn.cardinalityProperties();

    var length = (Math.sqrt((pts[2] - pts[0]) * (pts[2] - pts[0]) +
            (pts[3] - pts[1]) * (pts[3] - pts[1])));

    var dispX, dispY, startX, startY;

    //TODO : you may need to change here
    if (type === "consumption") {
      startX = edge._private.rscratch.arrowStartX;
      startY = edge._private.rscratch.arrowStartY;
    } else {
      startX = edge._private.rscratch.arrowEndX;
      startY = edge._private.rscratch.arrowEndY;
    }
    var srcPos = (type === "consumption") ? edge.source().position() : edge.target().position();
    //var srcPos = edge.source().position();
    dispX = startX - srcPos.x;
    dispY = startY - srcPos.y;

    var angle = Math.asin(dispY / (Math.sqrt(dispX * dispX + dispY * dispY)));

    if (dispX < 0) {
      angle = angle + Math.PI / 2;
    } else {
      angle = -(Math.PI / 2 + angle);
    }

    context.translate(startX, startY);
    context.rotate(-angle);

    if (length > carProp.distanceToNode) {
      context.rect(0, -carProp.distanceToNode, carProp.boxLength, carProp.boxLength);

      context.rotate(Math.PI / 2);

      var textProp = {'centerX': -carProp.distanceToNode + carProp.boxLength / 2, 'centerY': -carProp.boxLength / 2,
        'opacity': edge.css('text-opacity') * edge.css('opacity'),
        'width': carProp.boxLength, 'label': cardinality};
      $$.sbgn.drawCardinalityText(context, textProp);

      context.rotate(-Math.PI / 2);
    }

    context.rotate(angle);
    context.translate(-startX, -startY);
  }
  ;

  var unitOfInfoRadius = 4;
  var stateVarRadius = 15;
  $$.sbgn.drawComplexStateAndInfo = function (context, node, stateAndInfos,
          centerX, centerY, width, height) {

    //This is a temporary workaround
    $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);

    var upWidth = 0, downWidth = 0;
    var boxPadding = 10, betweenBoxPadding = 5;
    var beginPosY = height / 2, beginPosX = width / 2;

    stateAndInfos.sort($$.sbgn.compareStates);

    for (var i = 0; i < stateAndInfos.length; i++) {
      var state = stateAndInfos[i];
      var stateWidth = state.bbox.w;
      var stateHeight = state.bbox.h;
//      var stateLabel = state.state.value;
      var relativeYPos = state.bbox.y;
      var stateCenterX, stateCenterY;

      if (relativeYPos < 0) {
        if (upWidth + stateWidth < width) {
          stateCenterX = centerX - beginPosX + boxPadding + upWidth + stateWidth / 2;
          stateCenterY = centerY - beginPosY;

          var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
            'opacity': node.css('text-opacity') * node.css('opacity'),
            'width': stateWidth, 'height': stateHeight};

          if (state.clazz == "state variable") {//draw ellipse
            cyVariables.cyRenderer.drawRoundRectanglePath(context,
                    stateCenterX, stateCenterY,
                    stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));
            context.fill();

            textProp.state = state.state;
            $$.sbgn.drawStateText(context, textProp);
          } else if (state.clazz == "unit of information") {//draw rectangle
            cyVariables.cyRenderer.drawRoundRectanglePath(context,
                    stateCenterX, stateCenterY,
                    stateWidth, stateHeight,
                    Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));
            context.fill();

            textProp.label = state.label.text;
            $$.sbgn.drawInfoText(context, textProp);
          }
        }
        upWidth = upWidth + width + boxPadding;
      } else if (relativeYPos > 0) {
        if (downWidth + stateWidth < width) {
          stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth / 2;
          stateCenterY = centerY + beginPosY;

          var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
            'opacity': node.css('text-opacity') * node.css('opacity'),
            'width': stateWidth, 'height': stateHeight};

          if (state.clazz == "state variable") {//draw ellipse
            cyVariables.cyRenderer.drawRoundRectanglePath(context,
                    stateCenterX, stateCenterY,
                    stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));
            context.fill();

            textProp.state = state.state;
            $$.sbgn.drawStateText(context, textProp);
          } else if (state.clazz == "unit of information") {//draw rectangle
            cyVariables.cyRenderer.drawRoundRectanglePath(context,
                    stateCenterX, stateCenterY,
                    stateWidth, stateHeight,
                    Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));
            context.fill();

            textProp.label = state.label.text;
            $$.sbgn.drawInfoText(context, textProp);
          }
        }
        downWidth = downWidth + width + boxPadding;
      }
      context.stroke();

      //This is a temporary workaround
      $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);

      //update new state and info position(relative to node center)
      state.bbox.x = (stateCenterX - centerX) * 100 / node.width();
      state.bbox.y = (stateCenterY - centerY) * 100 / node.height();
    }
  };

  $$.sbgn.drawStateText = function (context, textProp) {
    var stateValue = textProp.state.value || '';
    var stateVariable = textProp.state.variable || '';

    var stateLabel = stateValue + (stateVariable
            ? "@" + stateVariable
            : "");

    var fontSize = parseInt(textProp.height / 1.5);

    textProp.font = fontSize + "px Arial";
    textProp.label = stateLabel;
    textProp.color = "#0f0f0f";
    $$.sbgn.drawText(context, textProp);
  };

  $$.sbgn.drawInfoText = function (context, textProp) {
    var fontSize = parseInt(textProp.height / 1.5);
    textProp.font = fontSize + "px Arial";
    textProp.color = "#0f0f0f";
    $$.sbgn.drawText(context, textProp);
  };

  $$.sbgn.drawText = function (context, textProp, truncate) {
    var oldFont = context.font;
    context.font = textProp.font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    var oldStyle = context.fillStyle;
    context.fillStyle = textProp.color;
    var oldOpacity = context.globalAlpha;
    context.globalAlpha = textProp.opacity;
    var text;
    
    textProp.label = textProp.label || '';
    
    if (truncate == false) {
      text = textProp.label;
    } else {
      text = truncateText(textProp, context.font);
    }
    
    context.fillText(text, textProp.centerX, textProp.centerY);
    context.fillStyle = oldStyle;
    context.font = oldFont;
    context.globalAlpha = oldOpacity;
    //context.stroke();
  };

  cyVariables.cyMath.calculateDistance = function (point1, point2) {
    var distance = Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2);
    return Math.sqrt(distance);
  };

  $$.sbgn.colors = {
    clone: "#a9a9a9",
    association: "#6B6B6B",
    port: "#6B6B6B"
  };


  $$.sbgn.drawStateAndInfos = function (node, context, centerX, centerY) {
    var stateAndInfos = node._private.data.sbgnstatesandinfos;

    for (var i = 0; i < stateAndInfos.length && i < 4; i++) {
      var state = stateAndInfos[i];
      var stateWidth = state.bbox.w;
      var stateHeight = state.bbox.h;
      var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
      var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

      var textProp = {'centerX': stateCenterX, 'centerY': stateCenterY,
        'opacity': node.css('text-opacity') * node.css('opacity'),
        'width': stateWidth, 'height': stateHeight};

      if (state.clazz == "state variable") {//draw ellipse
        //var stateLabel = state.state.value;
        cyVariables.cyRenderer.drawRoundRectanglePath(context, stateCenterX, stateCenterY,
                stateWidth, stateHeight, Math.min(stateWidth / 2, stateHeight / 2, stateVarRadius));

        context.fill();
        textProp.state = state.state;
        $$.sbgn.drawStateText(context, textProp);

        context.stroke();

      } else if (state.clazz == "unit of information") {//draw rectangle
        cyVariables.cyRenderer.drawRoundRectanglePath(context,
                stateCenterX, stateCenterY,
                stateWidth, stateHeight,
                Math.min(stateWidth / 2, stateHeight / 2, unitOfInfoRadius));

        context.fill();

        textProp.label = state.label.text || '';
        $$.sbgn.drawInfoText(context, textProp);

        context.stroke();
      }
    }
    //This is a temporary workaround
    $$.sbgn.drawEllipse(context, centerX, centerY, 0, 0);
  };

  $$.sbgn.nucleicAcidCheckPoint = function (x, y, centerX, centerY, node, threshold, points, cornerRadius) {
    var width = node.width();
    var height = node.height();
    var padding = parseInt(node.css('border-width')) / 2;

    //check rectangle at top
    if (cyVariables.cyMath.pointInsidePolygon(x, y, points,
            centerX, centerY - cornerRadius / 2, width, height - cornerRadius / 3, [0, -1],
            padding)) {
      return true;
    }

    //check rectangle at bottom
    if (cyVariables.cyMath.pointInsidePolygon(x, y, points,
            centerX, centerY + height / 2 - cornerRadius / 2, width - 2 * cornerRadius, cornerRadius, [0, -1],
            padding)) {
      return true;
    }

    //check ellipses
    var checkInEllipse = function (x, y, centerX, centerY, width, height, padding) {
      x -= centerX;
      y -= centerY;

      x /= (width / 2 + padding);
      y /= (height / 2 + padding);

      return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
    }

    // Check bottom right quarter circle
    if (checkInEllipse(x, y,
            centerX + width / 2 - cornerRadius,
            centerY + height / 2 - cornerRadius,
            cornerRadius * 2, cornerRadius * 2, padding)) {

      return true;
    }

    // Check bottom left quarter circle
    if (checkInEllipse(x, y,
            centerX - width / 2 + cornerRadius,
            centerY + height / 2 - cornerRadius,
            cornerRadius * 2, cornerRadius * 2, padding)) {

      return true;
    }

    return false;
  };

  //we need to force opacity to 1 since we might have state and info boxes.
  //having opaque nodes which have state and info boxes gives unpleasent results.
  $$.sbgn.forceOpacityToOne = function (node, context) {
    var parentOpacity = node.effectiveOpacity();
    if (parentOpacity === 0) {
      return;
    }

    context.fillStyle = "rgba("
            + node._private.style["background-color"].value[0] + ","
            + node._private.style["background-color"].value[1] + ","
            + node._private.style["background-color"].value[2] + ","
            + (1 * node.css('opacity') * parentOpacity) + ")";
  };

  $$.sbgn.drawSimpleChemicalPath = function (
          context, x, y, width, height) {

    var halfWidth = width / 2;
    var halfHeight = height / 2;
    //var cornerRadius = $$.math.getRoundRectangleRadius(width, height);
    var cornerRadius = Math.min(halfWidth, halfHeight);
    context.translate(x, y);

    context.beginPath();

    // Start at top middle
    context.moveTo(0, -halfHeight);
    // Arc from middle top to right side
    context.arcTo(halfWidth, -halfHeight, halfWidth, 0, cornerRadius);
    // Arc from right side to bottom
    context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
    // Arc from bottom to left side
    context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
    // Arc from left side to topBorder
    context.arcTo(-halfWidth, -halfHeight, 0, -halfHeight, cornerRadius);
    // Join line
    context.lineTo(0, -halfHeight);

    context.closePath();

    context.translate(-x, -y);
  };

  $$.sbgn.drawSimpleChemical = function (
          context, x, y, width, height) {
    $$.sbgn.drawSimpleChemicalPath(context, x, y, width, height);
    context.fill();
  };

  function simpleChemicalLeftClone(context, centerX, centerY,
          width, height, cloneMarker, opacity) {
    if (cloneMarker != null) {
      var oldGlobalAlpha = context.globalAlpha;
      context.globalAlpha = opacity;
      var oldStyle = context.fillStyle;
      context.fillStyle = $$.sbgn.colors.clone;

      context.beginPath();
      context.translate(centerX, centerY);
      context.scale(width / 2, height / 2);

      var markerBeginX = -1 * Math.sin(Math.PI / 3);
      var markerBeginY = Math.cos(Math.PI / 3);
      var markerEndX = 0;
      var markerEndY = markerBeginY;

      context.moveTo(markerBeginX, markerBeginY);
      context.lineTo(markerEndX, markerEndY);
      context.arc(0, 0, 1, 3 * Math.PI / 6, 5 * Math.PI / 6);

      context.scale(2 / width, 2 / height);
      context.translate(-centerX, -centerY);
      context.closePath();

      context.fill();
      context.fillStyle = oldStyle;
      context.globalAlpha = oldGlobalAlpha;
    }
  }
  ;

  function simpleChemicalRightClone(context, centerX, centerY,
          width, height, cloneMarker, opacity) {
    if (cloneMarker != null) {
      var oldGlobalAlpha = context.globalAlpha;
      context.globalAlpha = opacity;
      var oldStyle = context.fillStyle;
      context.fillStyle = $$.sbgn.colors.clone;

      context.beginPath();
      context.translate(centerX, centerY);
      context.scale(width / 2, height / 2);

      var markerBeginX = 0;
      var markerBeginY = Math.cos(Math.PI / 3);
      var markerEndX = 1 * Math.sin(Math.PI / 3);
      var markerEndY = markerBeginY;

      context.moveTo(markerBeginX, markerBeginY);
      context.lineTo(markerEndX, markerEndY);
      context.arc(0, 0, 1, Math.PI / 6, 3 * Math.PI / 6);

      context.scale(2 / width, 2 / height);
      context.translate(-centerX, -centerY);
      context.closePath();

      context.fill();
      context.fillStyle = oldStyle;
      context.globalAlpha = oldGlobalAlpha;
    }
  };

  $$.sbgn.drawEllipsePath = function (context, x, y, width, height) {
    cyVariables.cyNodeShapes['ellipse'].drawPath(context, x, y, width, height);
  };

  $$.sbgn.drawNucAcidFeature = function (context, width, height,
          centerX, centerY, cornerRadius) {
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    context.translate(centerX, centerY);
    context.beginPath();

    context.moveTo(-halfWidth, -halfHeight);
    context.lineTo(halfWidth, -halfHeight);
    context.lineTo(halfWidth, 0);
    context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
    context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
    context.lineTo(-halfWidth, -halfHeight);

    context.closePath();
    context.translate(-centerX, -centerY);
    context.fill();
  };

  $$.sbgn.isMultimer = function (node) {
    var sbgnClass = node._private.data.sbgnclass;
    if (sbgnClass && sbgnClass.indexOf("multimer") != -1)
      return true;
    return false;
  };

  //this function is created to have same corner length when
  //complex's width or height is changed
  $$.sbgn.generateComplexShapePoints = function (cornerLength, width, height) {
    //cp stands for corner proportion
    var cpX = cornerLength / width;
    var cpY = cornerLength / height;

    var complexPoints = [-1 + cpX, -1, -1, -1 + cpY, -1, 1 - cpY, -1 + cpX,
      1, 1 - cpX, 1, 1, 1 - cpY, 1, -1 + cpY, 1 - cpX, -1];

    return complexPoints;
  };

  $$.sbgn.drawPortsToEllipseShape = function (context, node) {
    var width = node.width();
    var height = node.height();
    var centerX = node._private.position.x;
    var centerY = node._private.position.y;
    var padding = parseInt(node.css('border-width')) / 2;

    for (var i = 0; i < node._private.data.ports.length; i++) {
      var port = node._private.data.ports[i];
      var portX = port.x * width / 100 + centerX;
      var portY = port.y * height / 100 + centerY;
      var closestPoint = cyVariables.cyMath.intersectLineEllipse(
              portX, portY, centerX, centerY, width / 2, height / 2);
      context.moveTo(portX, portY);
      context.lineTo(closestPoint[0], closestPoint[1]);
      context.stroke();

      //add a little black circle to ports
      var oldStyle = context.fillStyle;
      context.fillStyle = $$.sbgn.colors.port;
      $$.sbgn.drawEllipse(context, portX, portY, 2, 2);
      context.fillStyle = oldStyle;
      context.stroke();
    }
  };

  cyVariables.cyStyfn.types.nodeShape.enums.push('source and sink');
  cyVariables.cyStyfn.types.nodeShape.enums.push('nucleic acid feature');
  cyVariables.cyStyfn.types.nodeShape.enums.push('complex');
  cyVariables.cyStyfn.types.nodeShape.enums.push('dissociation');
  cyVariables.cyStyfn.types.nodeShape.enums.push('macromolecule');
  cyVariables.cyStyfn.types.nodeShape.enums.push('simple chemical');
  cyVariables.cyStyfn.types.nodeShape.enums.push('unspecified entity');
  cyVariables.cyStyfn.types.nodeShape.enums.push('process');
  cyVariables.cyStyfn.types.nodeShape.enums.push('omitted process');
  cyVariables.cyStyfn.types.nodeShape.enums.push('uncertain process');
  cyVariables.cyStyfn.types.nodeShape.enums.push('association');

  cyVariables.cyStyfn.types.lineStyle.enums.push('consumption');
  cyVariables.cyStyfn.types.lineStyle.enums.push('production');

  cyVariables.cyStyfn.types.arrowShape.enums.push('necessary stimulation');

  $$.sbgn.registerSbgnArrowShapes = function () {
    cyVariables.cyArrowShapes['necessary stimulation'] = jQuery.extend({}, cyVariables.cyArrowShapes['triangle-tee']);
    cyVariables.cyArrowShapes['necessary stimulation'].pointsTee = [
      -0.18, -0.43,
      0.18, -0.43
    ];
  };

  $$.sbgn.registerSbgnNodeShapes = function () {
    cyVariables.cyArrowShapes['necessary stimulation'] = cyVariables.cyArrowShapes['triangle-tee'];

    cyVariables.cyNodeShapes['process'] = {
      points: cyVariables.cyMath.generateUnitNgonPointsFitToSquare(4, 0),
      label: '',
      draw: function (context, node) {
        var width = node.width();
        var height = node.height();
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var padding = parseInt(node.css('border-width')) / 2;

        cyVariables.cyRenderer.drawPolygonPath(context,
                centerX, centerY,
                width, height,
                cyVariables.cyNodeShapes['process'].points);
        context.fill();

        context.stroke();

        $$.sbgn.drawPortsToPolygonShape(context, node, this.points);
      },
      intersectLine: function (node, x, y, portId) {
        var nodeX = node._private.position.x;
        var nodeY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        return cyVariables.cyMath.polygonIntersectLine(
                x, y,
                cyVariables.cyNodeShapes['process'].points,
                nodeX,
                nodeY,
                width / 2, height / 2,
                padding);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        return cyVariables.cyMath.pointInsidePolygon(x, y, cyVariables.cyNodeShapes['process'].points,
                centerX, centerY, width, height, [0, -1], padding);
      }
    };

    cyVariables.cyNodeShapes['omitted process'] = jQuery.extend(true, {}, cyVariables.cyNodeShapes['process']);
    cyVariables.cyNodeShapes['omitted process'].label = '\\\\';

    cyVariables.cyNodeShapes['uncertain process'] = jQuery.extend(true, {}, cyVariables.cyNodeShapes['process']);
    cyVariables.cyNodeShapes['uncertain process'].label = '?';

    cyVariables.cyNodeShapes["unspecified entity"] = {
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var sbgnClass = node._private.data.sbgnclass;
        var label = node._private.data.sbgnlabel;
        var cloneMarker = node._private.data.sbgnclonemarker;

        $$.sbgn.drawEllipse(context, centerX, centerY, width, height);

        context.stroke();

        $$.sbgn.cloneMarker.unspecifiedEntity(context, centerX, centerY,
                width, height, cloneMarker,
                node.css('background-opacity'));

        $$.sbgn.forceOpacityToOne(node, context);
        $$.sbgn.drawStateAndInfos(node, context, centerX, centerY);
      },
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
                node, x, y);

        var nodeIntersectLines = cyVariables.cyNodeShapes["ellipse"].intersectLine(centerX, centerY, width,
                height, x, y, padding);

        var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines);
        return $$.sbgn.closestIntersectionPoint([x, y], intersections);

      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var nodeCheckPoint = cyVariables.cyNodeShapes["ellipse"].checkPoint(x, y,
                padding, width, height,
                centerX, centerY);

        var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node,
                threshold);

        return nodeCheckPoint || stateAndInfoCheckPoint;
      }
    };

    cyVariables.cyNodeShapes["simple chemical"] = {
      multimerPadding: 5,
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var multimerPadding = cyVariables.cyNodeShapes["simple chemical"].multimerPadding;
        var label = node._private.data.sbgnlabel;
        var padding = parseInt(node.css('border-width'));
        var cloneMarker = node._private.data.sbgnclonemarker;

        if ($$.sbgn.isMultimer(node)) {
          //add multimer shape
          $$.sbgn.drawSimpleChemical(context, centerX + multimerPadding,
                  centerY + multimerPadding, width, height);

          context.stroke();

          $$.sbgn.cloneMarker.simpleChemical(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width - padding, height - padding, cloneMarker, true,
                  node.css('background-opacity'));

          //context.stroke();
        }

        $$.sbgn.drawSimpleChemical(context,
                centerX, centerY,
                width, height);

        context.stroke();

        $$.sbgn.cloneMarker.simpleChemical(context, centerX, centerY,
                width - padding, height - padding, cloneMarker, false,
                node.css('background-opacity'));

//        var nodeProp = {'label': label, 'centerX': centerX, 'centerY': centerY,
//          'opacity': node._private.style['text-opacity'].value, 'width': node.width(), 'height': node.height()};
//        $$.sbgn.drawDynamicLabelText(context, nodeProp);

        var oldStyle = context.fillStyle;
        $$.sbgn.forceOpacityToOne(node, context);
        $$.sbgn.drawStateAndInfos(node, context, centerX, centerY);
        context.fillStyle = oldStyle;
      },
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width'));
        var multimerPadding = cyVariables.cyNodeShapes["simple chemical"].multimerPadding;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
                node, x, y);

        var nodeIntersectLines = cyVariables.cyNodeShapes["ellipse"].intersectLine(
                centerX, centerY, width, height, x, y, padding);

        //check whether sbgn class includes multimer substring or not
        var multimerIntersectionLines = [];
        if ($$.sbgn.isMultimer(node)) {
          multimerIntersectionLines = cyVariables.cyNodeShapes["ellipse"].intersectLine(
                  centerX + multimerPadding, centerY + multimerPadding, width,
                  height, x, y, padding);
        }

        var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

        return $$.sbgn.closestIntersectionPoint([x, y], intersections);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;
        var multimerPadding = cyVariables.cyNodeShapes["simple chemical"].multimerPadding;

        var nodeCheckPoint = cyVariables.cyNodeShapes["roundrectangle"].checkPoint(x, y,
                padding, width, height,
                centerX, centerY);

        var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node,
                threshold);

        //check whether sbgn class includes multimer substring or not
        var multimerCheckPoint = false;
        if ($$.sbgn.isMultimer(node)) {
          multimerCheckPoint = cyVariables.cyNodeShapes["ellipse"].checkPoint(x, y,
                  padding, width, height,
                  centerX + multimerPadding, centerY + multimerPadding);
        }

        return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
      }
    };

    cyVariables.cyNodeShapes["macromolecule"] = {
      points: cyVariables.cyMath.generateUnitNgonPoints(4, 0),
      multimerPadding: 5,
      draw: function (context, node) {
        var width = node.width();
        var height = node.height();
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var label = node._private.data.sbgnlabel;
        var multimerPadding = cyVariables.cyNodeShapes["macromolecule"].multimerPadding;
        var cloneMarker = node._private.data.sbgnclonemarker;
        var padding = parseInt(node.css('border-width'));

        //check whether sbgn class includes multimer substring or not
        if ($$.sbgn.isMultimer(node)) {
          //add multimer shape
          cyVariables.cyRenderer.drawRoundRectanglePath(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height);

          context.fill();
          context.stroke();

          $$.sbgn.cloneMarker.macromolecule(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height, cloneMarker, true,
                  node.css('background-opacity'));

          //context.stroke();
        }

        cyVariables.cyRenderer.drawRoundRectanglePath(context,
                centerX, centerY,
                width, height);
        context.fill();

        context.stroke();

        $$.sbgn.cloneMarker.macromolecule(context, centerX, centerY,
                width, height, cloneMarker, false,
                node.css('background-opacity'));

        var oldStyle = context.fillStyle;
        $$.sbgn.forceOpacityToOne(node, context);
        $$.sbgn.drawStateAndInfos(node, context, centerX, centerY);
        context.fillStyle = oldStyle;

//        var nodeProp = {'label': label, 'centerX': centerX, 'centerY': centerY,
//          'opacity': node._private.style['text-opacity'].value, 'width': node.width(), 'height': node.height()};
      },
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;
        var multimerPadding = cyVariables.cyNodeShapes["macromolecule"].multimerPadding;
        var cornerRadius = cyVariables.cyMath.getRoundRectangleRadius(width, height);

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
                node, x, y);

        var nodeIntersectLines = $$.sbgn.roundRectangleIntersectLine(
                x, y,
                centerX, centerY,
                centerX, centerY,
                width, height,
                cornerRadius, padding);

        //check whether sbgn class includes multimer substring or not
        var multimerIntersectionLines = [];
        if ($$.sbgn.isMultimer(node)) {
          multimerIntersectionLines = $$.sbgn.roundRectangleIntersectLine(
                  x, y,
                  centerX, centerY,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height,
                  cornerRadius, padding);
        }

        var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

        return $$.sbgn.closestIntersectionPoint([x, y], intersections);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width() + threshold;
        var height = node.height() + threshold;
        var padding = parseInt(node.css('border-width')) / 2;
        var multimerPadding = cyVariables.cyNodeShapes["macromolecule"].multimerPadding;

        var nodeCheckPoint = cyVariables.cyNodeShapes["roundrectangle"].checkPoint(x, y, padding,
                width, height, centerX, centerY);
        var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node,
                threshold);

        //check whether sbgn class includes multimer substring or not
        var multimerCheckPoint = false;
        if ($$.sbgn.isMultimer(node)) {
          multimerCheckPoint = cyVariables.cyNodeShapes["roundrectangle"].checkPoint(x, y, padding,
                  width, height, centerX + multimerPadding, centerY + multimerPadding);
        }

        return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
      }
    };

    cyVariables.cyNodeShapes['association'] = {
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width'));

        cyVariables.cyNodeShapes['ellipse'].draw(context, centerX, centerY, width, height);
        context.fill();
        context.stroke();

        $$.sbgn.drawPortsToEllipseShape(context, node);
      },
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        var intersect = cyVariables.cyMath.intersectLineEllipse(
                x, y,
                centerX,
                centerY,
                width / 2 + padding,
                height / 2 + padding);

        return intersect;
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        x -= centerX;
        y -= centerY;

        x /= (width / 2 + padding);
        y /= (height / 2 + padding);

        return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
      }
    };

    cyVariables.cyNodeShapes["dissociation"] = {
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();

        context.beginPath();
        context.translate(centerX, centerY);
        context.scale(width / 4, height / 4);

        // At origin, radius 1, 0 to 2pi
        context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle

        context.closePath();
        context.scale(4 / width, 4 / height);
        context.translate(-centerX, -centerY);

        $$.sbgn.drawEllipse(context, centerX, centerY, width / 2, height / 2);

        context.stroke();

        $$.sbgn.drawEllipse(context, centerX, centerY, width, height);

        context.stroke();

        context.fill();

        $$.sbgn.drawPortsToEllipseShape(context, node);

      },
      intersectLine: function (node, x, y, portId) {
        var nodeX = node._private.position.x;
        var nodeY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        return cyVariables.cyMath.intersectLineEllipse(
                x, y,
                nodeX,
                nodeY,
                width / 2 + padding,
                height / 2 + padding);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var width = node.width();
        var height = node.height();
        var padding = parseInt(node.css('border-width')) / 2;

        x -= centerX;
        y -= centerY;

        x /= (width / 2 + padding);
        y /= (height / 2 + padding);

        return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
      }
    };

    cyVariables.cyNodeShapes["complex"] = {
      points: [],
      multimerPadding: 5,
      cornerLength: 12,
      draw: function (context, node) {
        var hasChildren = node.children().length > 0;
        var width = hasChildren ? node.outerWidth() : node.width();
        var height = hasChildren ? node.outerHeight() : node.height();
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var stateAndInfos = node._private.data.sbgnstatesandinfos;
        var label = node._private.data.sbgnlabel;
        var cornerLength = cyVariables.cyNodeShapes["complex"].cornerLength;
        var multimerPadding = cyVariables.cyNodeShapes["complex"].multimerPadding;
        var cloneMarker = node._private.data.sbgnclonemarker;

        cyVariables.cyNodeShapes["complex"].points = $$.sbgn.generateComplexShapePoints(cornerLength,
                width, height);

        //check whether sbgn class includes multimer substring or not
        if ($$.sbgn.isMultimer(node)) {
          //add multimer shape
          cyVariables.cyRenderer.drawPolygonPath(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height, cyVariables.cyNodeShapes["complex"].points);
          context.fill();

          context.stroke();

          $$.sbgn.cloneMarker.complex(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height, cornerLength, cloneMarker, true,
                  node.css('background-opacity'));

          //context.stroke();
        }

        cyVariables.cyRenderer.drawPolygonPath(context,
                centerX, centerY,
                width, height, cyVariables.cyNodeShapes["complex"].points);
        context.fill();

        context.stroke();

        $$.sbgn.cloneMarker.complex(context, centerX, centerY,
                width, height, cornerLength, cloneMarker, false,
                node.css('background-opacity'));

        var oldStyle = context.fillStyle;
        $$.sbgn.forceOpacityToOne(node, context);
        $$.sbgn.drawComplexStateAndInfo(context, node, stateAndInfos, centerX, centerY, width, height);
        context.fillStyle = oldStyle;
      },
//      intersectLine: cyVariables.cyNodeShapes["roundrectangle"].intersectLine,
//      checkPoint: cyVariables.cyNodeShapes["roundrectangle"].checkPoint
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var hasChildren = node.children().length > 0;
        var width = hasChildren ? node.outerWidth() : node.width();
        var height = hasChildren ? node.outerHeight() : node.height();
        var padding = parseInt(node.css('border-width')) / 2;
        var multimerPadding = cyVariables.cyNodeShapes["complex"].multimerPadding;
        var cornerLength = cyVariables.cyNodeShapes["complex"].cornerLength;

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        cyVariables.cyNodeShapes["complex"].points = $$.sbgn.generateComplexShapePoints(cornerLength,
                width, height);

        var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
                node, x, y);

        var nodeIntersectLines = cyVariables.cyMath.polygonIntersectLine(
                x, y,
                cyVariables.cyNodeShapes["complex"].points,
                centerX,
                centerY,
                width / 2, height / 2,
                padding);

        //check whether sbgn class includes multimer substring or not
        var multimerIntersectionLines = [];
        if ($$.sbgn.isMultimer(node)) {
          multimerIntersectionLines = cyVariables.cyMath.polygonIntersectLine(
                  x, y,
                  cyVariables.cyNodeShapes["complex"].points,
                  centerX + multimerPadding,
                  centerY + multimerPadding,
                  width / 2, height / 2,
                  padding);
        }

        var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

        return $$.sbgn.closestIntersectionPoint([x, y], intersections);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var hasChildren = node.children().length > 0;
        var width = (hasChildren ? node.outerWidth() : node.width()) + threshold;
        var height = (hasChildren ? node.outerHeight() : node.height()) + threshold;
        var padding = parseInt(node.css('border-width')) / 2;
        var multimerPadding = cyVariables.cyNodeShapes["complex"].multimerPadding;
        var cornerLength = cyVariables.cyNodeShapes["complex"].cornerLength;

        cyVariables.cyNodeShapes["complex"].points = $$.sbgn.generateComplexShapePoints(cornerLength,
                width, height);

        var nodeCheckPoint = cyVariables.cyMath.pointInsidePolygon(x, y, cyVariables.cyNodeShapes["complex"].points,
                centerX, centerY, width, height, [0, -1], padding);

        var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node,
                threshold);

        //check whether sbgn class includes multimer substring or not
        var multimerCheckPoint = false;
        if ($$.sbgn.isMultimer(node)) {
          multimerCheckPoint = cyVariables.cyMath.pointInsidePolygon(x, y,
                  cyVariables.cyNodeShapes["complex"].points,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height, [0, -1], padding);

        }

        return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
      }
    };

    cyVariables.cyNodeShapes["nucleic acid feature"] = {
      points: cyVariables.cyMath.generateUnitNgonPointsFitToSquare(4, 0),
      multimerPadding: 5,
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        ;
        var width = node.width();
        var height = node.height();
        var label = node._private.data.sbgnlabel;
        var cornerRadius = cyVariables.cyMath.getRoundRectangleRadius(width, height);
        var multimerPadding = cyVariables.cyNodeShapes["nucleic acid feature"].multimerPadding;
        var cloneMarker = node._private.data.sbgnclonemarker;

        //check whether sbgn class includes multimer substring or not
        if ($$.sbgn.isMultimer(node)) {
          //add multimer shape
          $$.sbgn.drawNucAcidFeature(context, width, height,
                  centerX + multimerPadding,
                  centerY + multimerPadding, cornerRadius);

          context.stroke();

          $$.sbgn.cloneMarker.nucleicAcidFeature(context,
                  centerX + multimerPadding, centerY + multimerPadding,
                  width, height, cloneMarker, true,
                  node.css('background-opacity'));

          //context.stroke();
        }

        $$.sbgn.drawNucAcidFeature(context, width, height, centerX,
                centerY, cornerRadius);

        context.stroke();

        $$.sbgn.cloneMarker.nucleicAcidFeature(context, centerX, centerY,
                width, height, cloneMarker, false,
                node.css('background-opacity'));

//        var nodeProp = {'label': label, 'centerX': centerX, 'centerY': centerY,
//          'opacity': node._private.style['text-opacity'].value, 'width': node.width(), 'height': node.height()};

//        $$.sbgn.drawDynamicLabelText(context, nodeProp);
        var oldStyle = context.fillStyle;
        $$.sbgn.forceOpacityToOne(node, context);
        $$.sbgn.drawStateAndInfos(node, context, centerX, centerY);
        context.fillStyle = oldStyle;
      },
      drawPath: function (context, node) {

      },
      intersectLine: function (node, x, y, portId) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var multimerPadding = cyVariables.cyNodeShapes["nucleic acid feature"].multimerPadding;
        var width = node.width();
        var height = node.height();
        var cornerRadius = cyVariables.cyMath.getRoundRectangleRadius(width, height);

        var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
        if (portIntersection.length > 0) {
          return portIntersection;
        }

        var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
                node, x, y);

        var nodeIntersectLines = $$.sbgn.nucleicAcidIntersectionLine(node,
                x, y, centerX, centerY, cornerRadius);

        //check whether sbgn class includes multimer substring or not
        var multimerIntersectionLines = [];
        if ($$.sbgn.isMultimer(node)) {
          multimerIntersectionLines = $$.sbgn.nucleicAcidIntersectionLine(node,
                  x, y, centerX + multimerPadding, centerY + multimerPadding,
                  cornerRadius);
        }

        var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines,
                multimerIntersectionLines);

        return $$.sbgn.closestIntersectionPoint([x, y], intersections);
      },
      checkPoint: function (x, y, node, threshold) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;
        var multimerPadding = cyVariables.cyNodeShapes["nucleic acid feature"].multimerPadding;
        var width = node.width();
        var height = node.height();
        var cornerRadius = cyVariables.cyMath.getRoundRectangleRadius(width, height);

        var nodeCheckPoint = $$.sbgn.nucleicAcidCheckPoint(x, y, centerX, centerY,
                node, threshold, this.points, cornerRadius);
        var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node,
                threshold);

        //check whether sbgn class includes multimer substring or not
        var multimerCheckPoint = false;
        if ($$.sbgn.isMultimer(node)) {
          multimerCheckPoint = $$.sbgn.nucleicAcidCheckPoint(x, y,
                  centerX + multimerPadding, centerY + multimerPadding,
                  node, threshold, this.points, cornerRadius);
        }

        return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
      }
    };
    cyVariables.cyNodeShapes["source and sink"] = {
      points: cyVariables.cyMath.generateUnitNgonPoints(4, 0),
      draw: function (context, node) {
        var centerX = node._private.position.x;
        var centerY = node._private.position.y;

        var width = node.width();
        var height = node.height();
        var label = node._private.data.sbgnlabel;
        var pts = cyVariables.cyNodeShapes["source and sink"].points;
        var cloneMarker = node._private.data.sbgnclonemarker;

        $$.sbgn.drawEllipse(context, centerX, centerY,
                width, height);

        context.stroke();

        context.beginPath();
        context.translate(centerX, centerY);
        context.scale(width * Math.sqrt(2) / 2, height * Math.sqrt(2) / 2);

        context.moveTo(pts[2], pts[3]);
        context.lineTo(pts[6], pts[7]);
        context.closePath();

        context.scale(2 / (width * Math.sqrt(2)), 2 / (height * Math.sqrt(2)));
        context.translate(-centerX, -centerY);

        context.stroke();

        $$.sbgn.cloneMarker.sourceAndSink(context, centerX, centerY,
                width, height, cloneMarker,
                node.css('background-opacity'));

      },
      intersectLine: cyVariables.cyNodeShapes["ellipse"].intersectLine,
      checkPoint: cyVariables.cyNodeShapes["ellipse"].checkPoint
    };
  };

  $$.sbgn.drawEllipse = function (context, x, y, width, height) {
    //$$.sbgn.drawEllipsePath(context, x, y, width, height);
    //context.fill();
    cyVariables.cyNodeShapes['ellipse'].draw(context, x, y, width, height);
  };

  $$.sbgn.cloneMarker = {
    unspecifiedEntity: function (context, centerX, centerY,
            width, height, cloneMarker, opacity) {
      if (cloneMarker != null) {
        var oldGlobalAlpha = context.globalAlpha;
        context.globalAlpha = opacity;
        var oldStyle = context.fillStyle;
        context.fillStyle = $$.sbgn.colors.clone;

        context.beginPath();
        context.translate(centerX, centerY);
        context.scale(width / 2, height / 2);

        var markerBeginX = -1 * Math.sin(Math.PI / 3);
        var markerBeginY = Math.cos(Math.PI / 3);
        var markerEndX = 1 * Math.sin(Math.PI / 3);
        var markerEndY = markerBeginY;

        context.moveTo(markerBeginX, markerBeginY);
        context.lineTo(markerEndX, markerEndY);
        context.arc(0, 0, 1, Math.PI / 6, 5 * Math.PI / 6);

        context.scale(2 / width, 2 / height);
        context.translate(-centerX, -centerY);
        context.closePath();

        context.fill();
        context.fillStyle = oldStyle;
        context.globalAlpha = oldGlobalAlpha;
      }
    },
    sourceAndSink: function (context, centerX, centerY,
            width, height, cloneMarker, opacity) {
      $$.sbgn.cloneMarker.unspecifiedEntity(context, centerX, centerY,
              width, height, cloneMarker, opacity);
    },
    simpleChemical: function (context, centerX, centerY,
            width, height, cloneMarker, isMultimer, opacity) {
      if (cloneMarker != null) {
        var cornerRadius = Math.min(width / 2, height / 2);

        var firstCircleCenterX = centerX - width / 2 + cornerRadius;
        var firstCircleCenterY = centerY;
        var secondCircleCenterX = centerX + width / 2 - cornerRadius;
        var secondCircleCenterY = centerY;

        simpleChemicalLeftClone(context, firstCircleCenterX, firstCircleCenterY,
                2 * cornerRadius, 2 * cornerRadius, cloneMarker, opacity);

        simpleChemicalRightClone(context, secondCircleCenterX, secondCircleCenterY,
                2 * cornerRadius, 2 * cornerRadius, cloneMarker, opacity);

        var oldStyle = context.fillStyle;
        context.fillStyle = $$.sbgn.colors.clone;
        var oldGlobalAlpha = context.globalAlpha;
        context.globalAlpha = opacity;

        var recPoints = cyVariables.cyMath.generateUnitNgonPointsFitToSquare(4, 0);
        var cloneX = centerX;
        var cloneY = centerY + 3 / 4 * cornerRadius;
        var cloneWidth = width - 2 * cornerRadius;
        var cloneHeight = cornerRadius / 2;

        cyVariables.cyRenderer.drawPolygonPath(context, cloneX, cloneY, cloneWidth, cloneHeight, recPoints);
        context.fill();
        context.fillStyle = oldStyle;
        context.globalAlpha = oldGlobalAlpha;
      }
    },
    perturbingAgent: function (context, centerX, centerY,
            width, height, cloneMarker, opacity) {
      if (cloneMarker != null) {
        var cloneWidth = width;
        var cloneHeight = height / 4;
        var cloneX = centerX;
        var cloneY = centerY + height / 2 - height / 8;

        var markerPoints = [-5 / 6, -1, 5 / 6, -1, 1, 1, -1, 1];

        var oldStyle = context.fillStyle;
        context.fillStyle = $$.sbgn.colors.clone;
        var oldGlobalAlpha = context.globalAlpha;
        context.globalAlpha = opacity;

        renderer.drawPolygon(context,
                cloneX, cloneY,
                cloneWidth, cloneHeight, markerPoints);

        context.fill();

        context.fillStyle = oldStyle;
        context.globalAlpha = oldGlobalAlpha;
        //context.stroke();
      }
    },
    nucleicAcidFeature: function (context, centerX, centerY,
            width, height, cloneMarker, isMultimer, opacity) {
      if (cloneMarker != null) {
        var cloneWidth = width;
        var cloneHeight = height / 4;
        var cloneX = centerX;
        var cloneY = centerY + 3 * height / 8;

        var oldStyle = context.fillStyle;
        context.fillStyle = $$.sbgn.colors.clone;
        var oldGlobalAlpha = context.globalAlpha;
        context.globalAlpha = opacity;

        var cornerRadius = cyVariables.cyMath.getRoundRectangleRadius(width, height);

        $$.sbgn.drawNucAcidFeature(context, cloneWidth, cloneHeight,
                cloneX, cloneY, cornerRadius, opacity);

        context.fillStyle = oldStyle;
        context.globalAlpha = oldGlobalAlpha;
        //context.stroke();
      }
    },
    macromolecule: function (context, centerX, centerY,
            width, height, cloneMarker, isMultimer, opacity) {
      $$.sbgn.cloneMarker.nucleicAcidFeature(context, centerX, centerY,
              width, height, cloneMarker, isMultimer, opacity);
    },
    complex: function (context, centerX, centerY,
            width, height, cornerLength, cloneMarker, isMultimer, opacity) {
      if (cloneMarker != null) {
        var cpX = cornerLength / width;
        var cpY = cornerLength / height;
        var cloneWidth = width;
        var cloneHeight = height * cpY / 2;
        var cloneX = centerX;
        var cloneY = centerY + height / 2 - cloneHeight / 2;

        var markerPoints = [-1, -1, 1, -1, 1 - cpX, 1, -1 + cpX, 1];

        var oldStyle = context.fillStyle;
        context.fillStyle = $$.sbgn.colors.clone;
        var oldGlobalAlpha = context.globalAlpha;
        context.globalAlpha = opacity;

        cyVariables.cyRenderer.drawPolygonPath(context,
                cloneX, cloneY,
                cloneWidth, cloneHeight, markerPoints);
        context.fill();

        context.fillStyle = oldStyle;
        context.globalAlpha = oldGlobalAlpha;

//                context.stroke();
      }
    }
  };

  $$.sbgn.intersectLinePorts = function (node, x, y, portId) {
    var ports = node._private.data.ports;
    if (ports.length < 0)
      return [];

    var nodeX = node._private.position.x;
    var nodeY = node._private.position.y;
    var width = node.width();
    var height = node.height();
    var padding = parseInt(node.css('border-width')) / 2;

    for (var i = 0; i < node._private.data.ports.length; i++) {
      var port = node._private.data.ports[i];
      if (portId == port.id) {
        return cyVariables.cyMath.intersectLineEllipse(
                x, y, port.x * width / 100 + nodeX, port.y * height / 100 + nodeY, 1, 1);
      }
    }
    return [];
  };

  $$.sbgn.closestIntersectionPoint = function (point, intersections) {
    if (intersections.length <= 0)
      return [];

    var closestIntersection = [];
    var minDistance = Number.MAX_VALUE;

    for (var i = 0; i < intersections.length; i = i + 2) {
      var checkPoint = [intersections[i], intersections[i + 1]];
      var distance = cyVariables.cyMath.calculateDistance(point, checkPoint);

      if (distance < minDistance) {
        minDistance = distance;
        closestIntersection = checkPoint;
      }
    }

    return closestIntersection;
  };

  $$.sbgn.nucleicAcidIntersectionLine = function (node, x, y, nodeX, nodeY, cornerRadius) {
    var nodeX = node._private.position.x;
    var nodeY = node._private.position.y;
    var width = node.width();
    var height = node.height();
    var padding = parseInt(node.css('border-width')) / 2;

    var halfWidth = width / 2;
    var halfHeight = height / 2;

    var straightLineIntersections;

    // Top segment, left to right
    {
      var topStartX = nodeX - halfWidth - padding;
      var topStartY = nodeY - halfHeight - padding;
      var topEndX = nodeX + halfWidth + padding;
      var topEndY = topStartY;

      straightLineIntersections = cyVariables.cyMath.finiteLinesIntersect(
              x, y, nodeX, nodeY, topStartX, topStartY, topEndX, topEndY, false);

      if (straightLineIntersections.length > 0) {
        return straightLineIntersections;
      }
    }

    // Right segment, top to bottom
    {
      var rightStartX = nodeX + halfWidth + padding;
      var rightStartY = nodeY - halfHeight - padding;
      var rightEndX = rightStartX;
      var rightEndY = nodeY + halfHeight - cornerRadius + padding;

      straightLineIntersections = cyVariables.cyMath.finiteLinesIntersect(
              x, y, nodeX, nodeY, rightStartX, rightStartY, rightEndX, rightEndY, false);

      if (straightLineIntersections.length > 0) {
        return straightLineIntersections;
      }
    }

    // Bottom segment, left to right
    {
      var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
      var bottomStartY = nodeY + halfHeight + padding;
      var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
      var bottomEndY = bottomStartY;

      straightLineIntersections = cyVariables.cyMath.finiteLinesIntersect(
              x, y, nodeX, nodeY, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);

      if (straightLineIntersections.length > 0) {
        return straightLineIntersections;
      }
    }

    // Left segment, top to bottom
    {
      var leftStartX = nodeX - halfWidth - padding;
      var leftStartY = nodeY - halfHeight - padding;
      var leftEndX = leftStartX;
      var leftEndY = nodeY + halfHeight - cornerRadius + padding;

      straightLineIntersections = cyVariables.cyMath.finiteLinesIntersect(
              x, y, nodeX, nodeY, leftStartX, leftStartY, leftEndX, leftEndY, false);

      if (straightLineIntersections.length > 0) {
        return straightLineIntersections;
      }
    }

    // Check intersections with arc segments, we have only two arcs for
    //nucleic acid features
    var arcIntersections;

    // Bottom Right
    {
      var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
      var bottomRightCenterY = nodeY + halfHeight - cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x, y, nodeX, nodeY,
              bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] >= bottomRightCenterX
              && arcIntersections[1] >= bottomRightCenterY) {
        return [arcIntersections[0], arcIntersections[1]];
      }
    }

    // Bottom Left
    {
      var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
      var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x, y, nodeX, nodeY,
              bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] <= bottomLeftCenterX
              && arcIntersections[1] >= bottomLeftCenterY) {
        return [arcIntersections[0], arcIntersections[1]];
      }
    }
    return []; // if nothing
  };

  //this function gives the intersections of any line with a round rectangle 
  $$.sbgn.roundRectangleIntersectLine = function (
          x1, y1, x2, y2, nodeX, nodeY, width, height, cornerRadius, padding) {

    var halfWidth = width / 2;
    var halfHeight = height / 2;

    // Check intersections with straight line segments
    var straightLineIntersections = [];

    // Top segment, left to right
    {
      var topStartX = nodeX - halfWidth + cornerRadius - padding;
      var topStartY = nodeY - halfHeight - padding;
      var topEndX = nodeX + halfWidth - cornerRadius + padding;
      var topEndY = topStartY;

      var intersection = cyVariables.cyMath.finiteLinesIntersect(
              x1, y1, x2, y2, topStartX, topStartY, topEndX, topEndY, false);

      if (intersection.length > 0) {
        straightLineIntersections = straightLineIntersections.concat(intersection);
      }
    }

    // Right segment, top to bottom
    {
      var rightStartX = nodeX + halfWidth + padding;
      var rightStartY = nodeY - halfHeight + cornerRadius - padding;
      var rightEndX = rightStartX;
      var rightEndY = nodeY + halfHeight - cornerRadius + padding;

      var intersection = cyVariables.cyMath.finiteLinesIntersect(
              x1, y1, x2, y2, rightStartX, rightStartY, rightEndX, rightEndY, false);

      if (intersection.length > 0) {
        straightLineIntersections = straightLineIntersections.concat(intersection);
      }
    }

    // Bottom segment, left to right
    {
      var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
      var bottomStartY = nodeY + halfHeight + padding;
      var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
      var bottomEndY = bottomStartY;

      var intersection = cyVariables.cyMath.finiteLinesIntersect(
              x1, y1, x2, y2, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);

      if (intersection.length > 0) {
        straightLineIntersections = straightLineIntersections.concat(intersection);
      }
    }

    // Left segment, top to bottom
    {
      var leftStartX = nodeX - halfWidth - padding;
      var leftStartY = nodeY - halfHeight + cornerRadius - padding;
      var leftEndX = leftStartX;
      var leftEndY = nodeY + halfHeight - cornerRadius + padding;

      var intersection = cyVariables.cyMath.finiteLinesIntersect(
              x1, y1, x2, y2, leftStartX, leftStartY, leftEndX, leftEndY, false);

      if (intersection.length > 0) {
        straightLineIntersections = straightLineIntersections.concat(intersection);
      }
    }

    // Check intersections with arc segments
    var arcIntersections;

    // Top Left
    {
      var topLeftCenterX = nodeX - halfWidth + cornerRadius;
      var topLeftCenterY = nodeY - halfHeight + cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x1, y1, x2, y2,
              topLeftCenterX, topLeftCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] <= topLeftCenterX
              && arcIntersections[1] <= topLeftCenterY) {
        straightLineIntersections = straightLineIntersections.concat(arcIntersections);
      }
    }

    // Top Right
    {
      var topRightCenterX = nodeX + halfWidth - cornerRadius;
      var topRightCenterY = nodeY - halfHeight + cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x1, y1, x2, y2,
              topRightCenterX, topRightCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] >= topRightCenterX
              && arcIntersections[1] <= topRightCenterY) {
        straightLineIntersections = straightLineIntersections.concat(arcIntersections);
      }
    }

    // Bottom Right
    {
      var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
      var bottomRightCenterY = nodeY + halfHeight - cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x1, y1, x2, y2,
              bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] >= bottomRightCenterX
              && arcIntersections[1] >= bottomRightCenterY) {
        straightLineIntersections = straightLineIntersections.concat(arcIntersections);
      }
    }

    // Bottom Left
    {
      var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
      var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
      arcIntersections = cyVariables.cyMath.intersectLineCircle(
              x1, y1, x2, y2,
              bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);

      // Ensure the intersection is on the desired quarter of the circle
      if (arcIntersections.length > 0
              && arcIntersections[0] <= bottomLeftCenterX
              && arcIntersections[1] >= bottomLeftCenterY) {
        straightLineIntersections = straightLineIntersections.concat(arcIntersections);
      }
    }

    if (straightLineIntersections.length > 0)
      return straightLineIntersections;
    return []; // if nothing
  };

  $$.sbgn.intersectLineEllipse = function (
          x1, y1, x2, y2, centerX, centerY, width, height, padding) {

    var w = width / 2 + padding;
    var h = height / 2 + padding;
    var an = centerX;
    var bn = centerY;

    var d = [x2 - x1, y2 - y1];

    var m = d[1] / d[0];
    var n = -1 * m * x2 + y2;
    var a = h * h + w * w * m * m;
    var b = -2 * an * h * h + 2 * m * n * w * w - 2 * bn * m * w * w;
    var c = an * an * h * h + n * n * w * w - 2 * bn * w * w * n +
            bn * bn * w * w - h * h * w * w;

    var discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return [];
    }

    var t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    var t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    var xMin = Math.min(t1, t2);
    var xMax = Math.max(t1, t2);

    var yMin = m * xMin - m * x2 + y2;
    var yMax = m * xMax - m * x2 + y2;

    return [xMin, yMin, xMax, yMax];
  };

  $$.sbgn.intersectLineStateAndInfoBoxes = function (node, x, y) {
    var centerX = node._private.position.x;
    var centerY = node._private.position.y;
    var padding = parseInt(node.css('border-width')) / 2;

    var stateAndInfos = node._private.data.sbgnstatesandinfos;

    var stateCount = 0, infoCount = 0;

    var intersections = [];

    for (var i = 0; i < stateAndInfos.length; i++) {
      var state = stateAndInfos[i];
      var stateWidth = state.bbox.w;
      var stateHeight = state.bbox.h;
      var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
      var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

      if (state.clazz == "state variable" && stateCount < 2) {//draw ellipse
        var stateIntersectLines = $$.sbgn.intersectLineEllipse(x, y, centerX, centerY,
                stateCenterX, stateCenterY, stateWidth, stateHeight, padding);

        if (stateIntersectLines.length > 0)
          intersections = intersections.concat(stateIntersectLines);

        stateCount++;
      } else if (state.clazz == "unit of information" && infoCount < 2) {//draw rectangle
        var infoIntersectLines = $$.sbgn.roundRectangleIntersectLine(x, y, centerX, centerY,
                stateCenterX, stateCenterY, stateWidth, stateHeight, 5, padding);

        if (infoIntersectLines.length > 0)
          intersections = intersections.concat(infoIntersectLines);

        infoCount++;
      }

    }
    if (intersections.length > 0)
      return intersections;
    return [];
  };

  $$.sbgn.checkPointStateAndInfoBoxes = function (x, y, node, threshold) {
    var centerX = node._private.position.x;
    var centerY = node._private.position.y;
    var padding =parseInt(node.css('border-width')) / 2;
    var stateAndInfos = node._private.data.sbgnstatesandinfos;

    var stateCount = 0, infoCount = 0;
//    threshold = parseFloat(threshold);

    for (var i = 0; i < stateAndInfos.length; i++) {
      var state = stateAndInfos[i];
      var stateWidth = parseFloat(state.bbox.w) + threshold;
      var stateHeight = parseFloat(state.bbox.h) + threshold;
      var stateCenterX = state.bbox.x * node.width() / 100 + centerX;
      var stateCenterY = state.bbox.y * node.height() / 100 + centerY;

      if (state.clazz == "state variable" && stateCount < 2) {//draw ellipse
        var stateCheckPoint = cyVariables.cyNodeShapes["ellipse"].checkPoint(
                x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

        if (stateCheckPoint == true)
          return true;

        stateCount++;
      } else if (state.clazz == "unit of information" && infoCount < 2) {//draw rectangle
        var infoCheckPoint = cyVariables.cyNodeShapes["roundrectangle"].checkPoint(
                x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

        if (infoCheckPoint == true)
          return true;

        infoCount++;
      }

    }
    return false;
  };

//  $$.sbgn.intersetLineSelection = function (render, node, x, y, portId) {
//    //TODO: do it for all classes in sbgn, create a sbgn class array to check
//    if (tempSbgnShapes[render.getNodeShape(node)]) {
//      return cyVariables.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//          node, x, y, portId);
//    }
//    else {
//      return cyVariables.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//          node._private.position.x,
//          node._private.position.y,
//          node.outerWidth(),
//          node.outerHeight(),
//          x, //halfPointX,
//          y, //halfPointY
//          node._private.style["border-width"].pxValue / 2
//          );
//    }
//  };

  $$.sbgn.isNodeShapeTotallyOverriden = function (render, node) {
    if (totallyOverridenNodeShapes[render.getNodeShape(node)]) {
      return true;
    }

    return false;
  };
};

},{"../utilities/text-utilities":12}],8:[function(_dereq_,module,exports){
var dialogUtilities = {
  openDialog: function (el, options) {
    $(el).dialog(
        $.extend( {}, {
          modal: true,
          open: function () {
            var tapstartFcn, cxttapFcn, zoomFcn, panFcn;
            $('.ui-widget-overlay').bind('click', function () {
              $(el).dialog('close');
            });

            cy.ready(function () {
              cy.on('tapstart', tapstartFcn = function () {
                $(el).data('tapstartFcn', tapstartFcn);
                $(el).dialog('close');
              });

              cy.on('cxttap', cxttapFcn = function () {
                $(el).data('cxttapFcn', cxttapFcn);
                $(el).dialog('close');
              });
              
              cy.on('zoom', zoomFcn = function () {
                $(el).data('zoomFcn', zoomFcn);
                $(el).dialog('close');
              });
              
              cy.on('pan', panFcn = function () {
                $(el).data('panFcn', panFcn);
                $(el).dialog('close');
              });
            });
          },
          close: function () {
            cy.ready(function () {
              if($(el).data('tapstartFcn')) {
                cy.off('tapstart', $(el).data('tapstartFcn'));
              }
              
              if($(el).data('cxttapFcn')) {
                cy.off('cxttap', $(el).data('cxttapFcn'));
              }
              
              if($(el).data('zoomFcn')) {
                cy.off('zoom', $(el).data('zoomFcn'));
              }
              
              if($(el).data('panFcn')) {
                cy.off('pan', $(el).data('panFcn'));
              }
            });
          }
        }, options )
    );
  },
  openFancybox: function($template, options) {
    $.fancybox(
        _.template($template.html(), {}),
        $.extend( {}, {
          'autoDimensions': true,
          'transitionIn': 'none',
          'transitionOut': 'none',
          'onStart': function() {
            var zoomFcn, panFcn;
            cy.ready(function () {
              cy.on('zoom', zoomFcn = function () {
                $template.data('zoomFcn', zoomFcn);
                $.fancybox.close();
              });

              cy.on('pan', panFcn = function () {
                $template.data('panFcn', panFcn);
                $.fancybox.close();
              });
            });
          },
          'onClosed': function() {
            cy.ready(function () {
              if ($template.data('zoomFcn')) {
                cy.off('zoom', $template.data('zoomFcn'));
              }

              if ($template.data('panFcn')) {
                cy.off('pan', $template.data('panFcn'));
              }
            });
          }
        }, options) );
  }
};

module.exports = dialogUtilities;



},{}],9:[function(_dereq_,module,exports){
var jsonToSbgnml = {
    createSbgnml : function(){
        var self = this;
        var sbgnmlText = "";

        //add headers
        sbgnmlText = sbgnmlText + "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\n";
        sbgnmlText = sbgnmlText + "<sbgn xmlns='http://sbgn.org/libsbgn/0.2'>\n";
        sbgnmlText = sbgnmlText + "<map language='process description'>\n";

        //adding glyph sbgnml
        cy.nodes(":visible").each(function(){
            if(!this.isChild())
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
        });

        //adding arc sbgnml
        cy.edges(":visible").each(function(){
            sbgnmlText = sbgnmlText + self.getArcSbgnml(this);
        });

        sbgnmlText = sbgnmlText + "</map>\n";
        sbgnmlText = sbgnmlText + "</sbgn>\n";

        return sbgnmlText;
    },

    getGlyphSbgnml : function(node){
        var self = this;
        var sbgnmlText = "";

        if(node._private.data.sbgnclass === "compartment"){
            sbgnmlText = sbgnmlText +
                "<glyph id='" + node._private.data.id + "' class='compartment' ";

            if(node.parent().isParent()){
                var parent = node.parent();
                sbgnmlText = sbgnmlText + " compartmentRef='" + node._private.data.parent + "'";
            }

            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + this.addCommonGlyphProperties(node);

            sbgnmlText = sbgnmlText + "</glyph>\n";

            node.children().each(function(){
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
            });
        }
        else if(node._private.data.sbgnclass === "complex" || node._private.data.sbgnclass === "submap"){
            sbgnmlText = sbgnmlText +
                "<glyph id='" + node._private.data.id + "' class='" + node._private.data.sbgnclass + "' ";

            if(node.parent().isParent()){
                var parent = node.parent()[0];
                if(parent._private.data.sbgnclass == "compartment")
                    sbgnmlText = sbgnmlText + " compartmentRef='" + parent._private.data.id + "'";
            }
            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + self.addCommonGlyphProperties(node);

            node.children().each(function(){
                sbgnmlText = sbgnmlText + self.getGlyphSbgnml(this);
            });

            sbgnmlText = sbgnmlText + "</glyph>\n";
        }
        else{//it is a simple node
            sbgnmlText = sbgnmlText +
                "<glyph id='" + node._private.data.id + "' class='" + node._private.data.sbgnclass + "'";

            if(node.parent().isParent()){
                var parent = node.parent()[0];
                if(parent._private.data.sbgnclass == "compartment")
                    sbgnmlText = sbgnmlText + " compartmentRef='" + parent._private.data.id + "'";
            }

            sbgnmlText = sbgnmlText + " >\n";

            sbgnmlText = sbgnmlText + self.addCommonGlyphProperties(node);

            sbgnmlText = sbgnmlText + "</glyph>\n";
        }

        return  sbgnmlText;
    },

    addCommonGlyphProperties : function(node){
        var sbgnmlText = "";

        //add label information
        sbgnmlText = sbgnmlText + this.addLabel(node);
        //add bbox information
        sbgnmlText = sbgnmlText + this.addGlyphBbox(node);
        //add clone information
        sbgnmlText = sbgnmlText + this.addClone(node);
        //add port information
        sbgnmlText = sbgnmlText + this.addPort(node);
        //add state and info box information
        sbgnmlText = sbgnmlText + this.getStateAndInfoSbgnml(node);

        return sbgnmlText;
    },

    addClone : function(node){
        var sbgnmlText = "";
        if(typeof node._private.data.sbgnclonemarker != 'undefined')
            sbgnmlText = sbgnmlText + "<clone/>\n";
        return sbgnmlText;
    },

    getStateAndInfoSbgnml : function(node){
        var sbgnmlText = "";

        for(var i = 0 ; i < node._private.data.sbgnstatesandinfos.length ; i++){
            var boxGlyph = node._private.data.sbgnstatesandinfos[i];
            if(boxGlyph.clazz === "state variable"){
                sbgnmlText = sbgnmlText + this.addStateBoxGlyph(boxGlyph, node);
            }
            else if(boxGlyph.clazz === "unit of information"){
                sbgnmlText = sbgnmlText + this.addInfoBoxGlyph(boxGlyph, node);
            }
        }
        return sbgnmlText;
    },

    getArcSbgnml : function(edge){
        var sbgnmlText = "";

        //Temporary hack to resolve "undefined" arc source and targets
        var arcTarget = edge._private.data.porttarget;
        var arcSource = edge._private.data.portsource;

        if (arcSource == null || arcSource.length === 0)
            arcSource = edge._private.data.source;

        if (arcTarget == null || arcTarget.length === 0)
            arcTarget = edge._private.data.target;

        var arcId = arcSource + "-" + arcTarget;

        sbgnmlText = sbgnmlText + "<arc id='" + arcId +
            "' target='" + arcTarget +
            "' source='" + arcSource + "' class='" +
            edge._private.data.sbgnclass + "'>\n";

        sbgnmlText = sbgnmlText + "<start y='" + edge._private.rscratch.startY + "' x='" +
            edge._private.rscratch.startX + "'/>\n";

        var segpts = cy.edgeBendEditing('get').getSegmentPoints(edge);
        if(segpts){
          for(var i = 0; segpts && i < segpts.length; i = i + 2){
            var bendX = segpts[i];
            var bendY = segpts[i + 1];

            sbgnmlText = sbgnmlText + "<next y='" + bendY + "' x='" + bendX + "'/>\n";
          }
        }

        sbgnmlText = sbgnmlText + "<end y='" + edge._private.rscratch.endY + "' x='" +
            edge._private.rscratch.endX + "'/>\n";

        sbgnmlText = sbgnmlText + "</arc>\n";

        return sbgnmlText;
    },

    addGlyphBbox : function(node){
        var width = node.width();
        var height = node.height();
        var x = node._private.position.x - width/2;
        var y = node._private.position.y - height/2;
        return "<bbox y='" + y + "' x='" + x +
            "' w='" + width + "' h='" + height + "' />\n";
    },

    addStateAndInfoBbox : function(node, boxGlyph){
        boxBbox = boxGlyph.bbox;

        var x = boxBbox.x / 100 * node.width();
        var y = boxBbox.y / 100 * node.height();

        x = node._private.position.x + (x - boxBbox.w/2);
        y = node._private.position.y + (y - boxBbox.h/2);
        return "<bbox y='" + y + "' x='" + x +
            "' w='" + boxBbox.w + "' h='" + boxBbox.h + "' />\n";
    },

    addPort : function(node){
        var sbgnmlText = "";

        var ports = node._private.data.ports;
        for(var i = 0 ; i < ports.length ; i++){
            var x = node._private.position.x + ports[i].x * node.width() / 100;
            var y = node._private.position.y + ports[i].y * node.height() / 100;

            sbgnmlText = sbgnmlText + "<port id='" + ports[i].id +
                "' y='" + y + "' x='" + x + "' />\n";
        }
        return sbgnmlText;
    },

    addLabel : function(node){
        var label = node._private.data.sbgnlabel;

        if(typeof label != 'undefined')
            return "<label text='" + label + "' />\n";
        return "";
    },

    addStateBoxGlyph : function(node, mainGlyph){
        var sbgnmlText = "";

        sbgnmlText = sbgnmlText + "<glyph id='" + node.id + "' class='state variable'>\n";
        sbgnmlText = sbgnmlText + "<state ";

        if(typeof node.state.value != 'undefined')
            sbgnmlText = sbgnmlText + "value='" + node.state.value + "' ";
        if(typeof node.state.variable != 'undefined')
            sbgnmlText = sbgnmlText + "variable='" + node.state.variable + "' ";
        sbgnmlText = sbgnmlText + "/>\n";

        sbgnmlText = sbgnmlText + this.addStateAndInfoBbox(mainGlyph, node);
        sbgnmlText = sbgnmlText + "</glyph>\n";

        return sbgnmlText;
    },

    addInfoBoxGlyph : function(node, mainGlyph){
        var sbgnmlText = "";

        sbgnmlText = sbgnmlText + "<glyph id='" + node.id + "' class='unit of information'>\n";
        sbgnmlText = sbgnmlText + "<label ";

        if(typeof node.label.text != 'undefined')
            sbgnmlText = sbgnmlText + "text='" + node.label.text + "' ";
        sbgnmlText = sbgnmlText + "/>\n";

        sbgnmlText = sbgnmlText + this.addStateAndInfoBbox(mainGlyph, node);
        sbgnmlText = sbgnmlText + "</glyph>\n";

        return sbgnmlText;
    }
};

module.exports = jsonToSbgnml;

},{}],10:[function(_dereq_,module,exports){
var truncateText = _dereq_('./text-utilities').truncateText;
var sbgnStyleRules = _dereq_('../../sample-app/js/common-app-utilities').sbgnStyleRules;

var sbgnElementUtilities = {
    //the list of the element classes handled by the tool
    handledElements: {
        'unspecified entity': true,
        'simple chemical': true,
        'macromolecule': true,
        'nucleic acid feature': true,
        'perturbing agent': true,
        'source and sink': true,
        'complex': true,
        'process': true,
        'omitted process': true,
        'uncertain process': true,
        'association': true,
        'dissociation': true,
        'phenotype': true,
        'tag': true,
        'consumption': true,
        'production': true,
        'modulation': true,
        'stimulation': true,
        'catalysis': true,
        'inhibition': true,
        'necessary stimulation': true,
        'logic arc': true,
        'equivalence arc': true,
        'and operator': true,
        'or operator': true,
        'not operator': true,
        'and': true,
        'or': true,
        'not': true,
        'nucleic acid feature multimer': true,
        'macromolecule multimer': true,
        'simple chemical multimer': true,
        'complex multimer': true,
        'compartment': true
    },
    //the following were moved here from what used to be utilities/sbgn-filtering.js
    processTypes : ['process', 'omitted process', 'uncertain process',
        'association', 'dissociation', 'phenotype'],
      
    // Section Start
    // General Element Utilities

    //this method returns the nodes non of whose ancestors is not in given nodes
    getTopMostNodes: function (nodes) {
        var nodesMap = {};
        for (var i = 0; i < nodes.length; i++) {
            nodesMap[nodes[i].id()] = true;
        }
        var roots = nodes.filter(function (i, ele) {
            var parent = ele.parent()[0];
            while(parent != null){
              if(nodesMap[parent.id()]){
                return false;
              }
              parent = parent.parent()[0];
            }
            return true;
        });

        return roots;
    },
    //This method checks if all of the given nodes have the same parent assuming that the size 
    //of  nodes is not 0
    allHaveTheSameParent: function (nodes) {
        if (nodes.length == 0) {
            return true;
        }
        var parent = nodes[0].data("parent");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.data("parent") != parent) {
                return false;
            }
        }
        return true;
    },
    moveNodes: function(positionDiff, nodes, notCalcTopMostNodes) {
      var topMostNodes = notCalcTopMostNodes ? nodes : this.getTopMostNodes(nodes);
      for (var i = 0; i < topMostNodes.length; i++) {
        var node = topMostNodes[i];
        var oldX = node.position("x");
        var oldY = node.position("y");
        node.position({
          x: oldX + positionDiff.x,
          y: oldY + positionDiff.y
        });
        var children = node.children();
        this.moveNodes(positionDiff, children, true);
      }
    },
    convertToModelPosition: function (renderedPosition) {
      var pan = cy.pan();
      var zoom = cy.zoom();

      var x = (renderedPosition.x - pan.x) / zoom;
      var y = (renderedPosition.y - pan.y) / zoom;

      return {
        x: x,
        y: y
      };
    },
    
    // Section End
    // General Element Utilities

    // Section Start
    // Element Filtering Utilities
    
    getProcessesOfSelected: function(){
        var selectedEles = cy.elements(":selected");
        selectedEles = this.extendNodeList(selectedEles);
        return selectedEles;
    },
    getNeighboursOfSelected: function(){
        var selectedEles = cy.elements(":selected");
        selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
        selectedEles = selectedEles.add(selectedEles.descendants());
        var neighborhoodEles = selectedEles.neighborhood();
        var elesToHighlight = selectedEles.add(neighborhoodEles);
        elesToHighlight = elesToHighlight.add(elesToHighlight.descendants());
        return elesToHighlight;
    },
    extendNodeList: function(nodesToShow){
        var self = this;
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());
        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.parents());
        //add complex children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        // var processes = nodesToShow.nodes("node[sbgnclass='process']");
        // var nonProcesses = nodesToShow.nodes("node[sbgnclass!='process']");
        // var neighborProcesses = nonProcesses.neighborhood("node[sbgnclass='process']");

        var processes = nodesToShow.filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });
        var nonProcesses = nodesToShow.filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) === -1;
        });
        var neighborProcesses = nonProcesses.neighborhood().filter(function(){
            return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });

        nodesToShow = nodesToShow.add(processes.neighborhood());
        nodesToShow = nodesToShow.add(neighborProcesses);
        nodesToShow = nodesToShow.add(neighborProcesses.neighborhood());

        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.nodes().parents());
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        return nodesToShow;
    },
    extendRemainingNodes : function(nodesToFilter, allNodes){
        nodesToFilter = this.extendNodeList(nodesToFilter);
        var nodesToShow = allNodes.not(nodesToFilter);
        nodesToShow = this.extendNodeList(nodesToShow);
        return nodesToShow;
    },
    noneIsNotHighlighted: function(){
        var notHighlightedNodes = cy.nodes(":visible").nodes(".unhighlighted");
        var notHighlightedEdges = cy.edges(":visible").edges(".unhighlighted");

        return notHighlightedNodes.length + notHighlightedEdges.length === 0;
    },
    
    // Section End
    // Element Filtering Utilities

    // Section Start
    // Add remove utilities

    
    restoreEles: function (eles) {
        eles.restore();
        return eles;
    },
    deleteElesSimple: function (eles) {
      cy.elements().unselect();
      return eles.remove();
    },
    deleteElesSmart: function (eles) {
      var allNodes = cy.nodes();
      cy.elements().unselect();
      var nodesToKeep = this.extendRemainingNodes(eles, allNodes);
      var nodesNotToKeep = allNodes.not(nodesToKeep);
      return nodesNotToKeep.remove();
    },
    
    // Section End
    // Add remove utilities

    // Section Start
    // Common element properties
    
    isEPNClass: function(sbgnclass) {
        return (sbgnclass == 'unspecified entity'
        || sbgnclass == 'simple chemical'
        || sbgnclass == 'macromolecule'
        || sbgnclass == 'nucleic acid feature'
        || sbgnclass == 'complex');
    },
    
    // Section End
    // Common element properties

    // Section Start
    // Stylesheet helpers
    
    getCyShape: function(ele) {
        var shape = ele.data('sbgnclass');
        if (shape.endsWith(' multimer')) {
            shape = shape.replace(' multimer', '');
        }

        if (shape == 'compartment') {
            return 'roundrectangle';
        }
        if (shape == 'phenotype') {
            return 'hexagon';
        }
        if (shape == 'perturbing agent' || shape == 'tag') {
            return 'polygon';
        }
        if (shape == 'source and sink' || shape == 'nucleic acid feature' || shape == 'dissociation'
            || shape == 'macromolecule' || shape == 'simple chemical' || shape == 'complex'
            || shape == 'unspecified entity' || shape == 'process' || shape == 'omitted process'
            || shape == 'uncertain process' || shape == 'association') {
            return shape;
        }
        return 'ellipse';
    },
    getCyArrowShape: function(ele) {
        var sbgnclass = ele.data('sbgnclass');
        if (sbgnclass == 'necessary stimulation') {
            return 'necessary stimulation';
        }
        if (sbgnclass == 'inhibition') {
            return 'tee';
        }
        if (sbgnclass == 'catalysis') {
            return 'circle';
        }
        if (sbgnclass == 'stimulation' || sbgnclass == 'production') {
            return 'triangle';
        }
        if (sbgnclass == 'modulation') {
            return 'diamond';
        }
        return 'none';
    },
    getElementContent: function(ele) {
        var sbgnclass = ele.data('sbgnclass');

        if (sbgnclass.endsWith(' multimer')) {
            sbgnclass = sbgnclass.replace(' multimer', '');
        }

        var content = "";
        if (sbgnclass == 'macromolecule' || sbgnclass == 'simple chemical'
            || sbgnclass == 'phenotype'
            || sbgnclass == 'unspecified entity' || sbgnclass == 'nucleic acid feature'
            || sbgnclass == 'perturbing agent' || sbgnclass == 'tag') {
            content = ele.data('sbgnlabel') ? ele.data('sbgnlabel') : "";
        }
        else if(sbgnclass == 'compartment'){
            content = ele.data('sbgnlabel') ? ele.data('sbgnlabel') : "";
        }
        else if(sbgnclass == 'complex'){
            if(ele.children().length == 0){
                if(ele.data('sbgnlabel')){
                    content = ele.data('sbgnlabel');
                }
                else if(ele.data('infoLabel')){
                    content = ele.data('infoLabel');
                }
                else{
                    content = '';
                }
            }
            else{
                content = '';
            }
        }
        else if (sbgnclass == 'and') {
            content = 'AND';
        }
        else if (sbgnclass == 'or') {
            content = 'OR';
        }
        else if (sbgnclass == 'not') {
            content = 'NOT';
        }
        else if (sbgnclass == 'omitted process') {
            content = '\\\\';
        }
        else if (sbgnclass == 'uncertain process') {
            content = '?';
        }
        else if (sbgnclass == 'dissociation') {
            content = 'O';
        }

        var textWidth = ele.css('width') ? parseFloat(ele.css('width')) : ele.data('sbgnbbox').w;

        var textProp = {
            label: content,
            width: ( sbgnclass==('complex') || sbgnclass==('compartment') )?textWidth * 2:textWidth
        };

        var font = this.getLabelTextSize(ele) + "px Arial";
        return truncateText(textProp, font); //func. in the cytoscape.renderer.canvas.sbgn-renderer.js
    },
    getLabelTextSize: function (ele) {
      var sbgnclass = ele.data('sbgnclass');

      // These types of nodes cannot have label but this is statement is needed as a workaround
      if (sbgnclass === 'association' || sbgnclass === 'dissociation') {
        return 20;
      }

      if (sbgnclass === 'and' || sbgnclass === 'or' || sbgnclass === 'not') {
        return this.getDynamicLabelTextSize(ele, 1);
      }

      if (sbgnclass.endsWith('process')) {
        return this.getDynamicLabelTextSize(ele, 1.5);
      }

      if (sbgnclass === 'complex' || sbgnclass === 'compartment') {
        return 16;
      }

      return this.getDynamicLabelTextSize(ele);
    },
    getDynamicLabelTextSize: function (ele, dynamicLabelSizeCoefficient) {
      var dynamicLabelSize = sbgnStyleRules['dynamic-label-size'];

      if (dynamicLabelSizeCoefficient === undefined) {
        if (dynamicLabelSize == 'small') {
          dynamicLabelSizeCoefficient = 0.75;
        }
        else if (dynamicLabelSize == 'regular') {
          dynamicLabelSizeCoefficient = 1;
        }
        else if (dynamicLabelSize == 'large') {
          dynamicLabelSizeCoefficient = 1.25;
        }
      }
      
      var h = ele.height();
      var textHeight = parseInt(h / 2.45) * dynamicLabelSizeCoefficient;

      return textHeight;
    },
    getCardinalityDistance: function (ele) {
        var srcPos = ele.source().position();
        var tgtPos = ele.target().position();

        var distance = Math.sqrt(Math.pow((srcPos.x - tgtPos.x), 2) + Math.pow((srcPos.y - tgtPos.y), 2));
        return distance * 0.15;
    }
    
    // Section End
    // Stylesheet helpers
};

module.exports = sbgnElementUtilities;

},{"../../sample-app/js/common-app-utilities":4,"./text-utilities":12}],11:[function(_dereq_,module,exports){
var sbgnElementUtilities = _dereq_('./sbgn-element-utilities');

var sbgnmlToJson = {
  insertedNodes: {},
  getAllCompartments: function (xmlObject) {
    var compartments = [];
    $(xmlObject).find("glyph[class='compartment']").each(function () {
      compartments.push({
        'x': parseFloat($(this).children('bbox').attr('x')),
        'y': parseFloat($(this).children('bbox').attr('y')),
        'w': parseFloat($(this).children('bbox').attr('w')),
        'h': parseFloat($(this).children('bbox').attr('h')),
        'id': $(this).attr('id')
      });
    });

    compartments.sort(function (c1, c2) {
      if (c1.h * c1.w < c2.h * c2.w)
        return -1;
      if (c1.h * c1.w > c2.h * c2.w)
        return 1;
      return 0;
    });

    return compartments;
  },
  isInBoundingBox: function (bbox1, bbox2) {
    if (bbox1.x > bbox2.x &&
        bbox1.y > bbox2.y &&
        bbox1.x + bbox1.w < bbox2.x + bbox2.w &&
        bbox1.y + bbox1.h < bbox2.y + bbox2.h)
      return true;
    return false;
  },
  bboxProp: function (ele) {
    var sbgnbbox = new Object();

    sbgnbbox.x = $(ele).find('bbox').attr('x');
    sbgnbbox.y = $(ele).find('bbox').attr('y');
    sbgnbbox.w = $(ele).find('bbox').attr('w');
    sbgnbbox.h = $(ele).find('bbox').attr('h');

    //set positions as center
    sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w) / 2;
    sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h) / 2;

    return sbgnbbox;
  },
  stateAndInfoBboxProp: function (ele, parentBbox) {
    var xPos = parseFloat(parentBbox.x);
    var yPos = parseFloat(parentBbox.y);

    var sbgnbbox = new Object();

    sbgnbbox.x = $(ele).find('bbox').attr('x');
    sbgnbbox.y = $(ele).find('bbox').attr('y');
    sbgnbbox.w = $(ele).find('bbox').attr('w');
    sbgnbbox.h = $(ele).find('bbox').attr('h');

    //set positions as center
    sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w) / 2 - xPos;
    sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h) / 2 - yPos;

    sbgnbbox.x = sbgnbbox.x / parseFloat(parentBbox.w) * 100;
    sbgnbbox.y = sbgnbbox.y / parseFloat(parentBbox.h) * 100;

    return sbgnbbox;
  },
  stateAndInfoProp: function (ele, parentBbox) {
    var self = this;
    var stateAndInfoArray = new Array();

    $(ele).children('glyph').each(function () {
      var obj = new Object();
      if ($(this).attr('class') === 'unit of information') {
        obj.id = $(this).attr('id');
        obj.clazz = $(this).attr('class');
        obj.label = {'text': $(this).find('label').attr('text')};
        obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
        stateAndInfoArray.push(obj);
      }
      else if ($(this).attr('class') === 'state variable') {
        obj.id = $(this).attr('id');
        obj.clazz = $(this).attr('class');
        obj.state = {'value': $(this).find('state').attr('value'),
          'variable': $(this).find('state').attr('variable')};
        obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
        stateAndInfoArray.push(obj);
      }
    });

    return stateAndInfoArray;
  },
  addParentInfoToNode: function (ele, nodeObj, parent, compartments) {
    var self = this;
    //there is no complex parent
    if (parent == "") {
      //no compartment reference
      if (typeof $(ele).attr('compartmentRef') === 'undefined') {
        nodeObj.parent = "";

        //add compartment according to geometry
        for (var i = 0; i < compartments.length; i++) {
          var bbox = {
            'x': parseFloat($(ele).children('bbox').attr('x')),
            'y': parseFloat($(ele).children('bbox').attr('y')),
            'w': parseFloat($(ele).children('bbox').attr('w')),
            'h': parseFloat($(ele).children('bbox').attr('h')),
            'id': $(ele).attr('id')
          }
          if (self.isInBoundingBox(bbox, compartments[i])) {
            nodeObj.parent = compartments[i].id;
            break;
          }
        }
      }
      //there is compartment reference
      else {
        nodeObj.parent = $(ele).attr('compartmentRef');
      }
    }
    //there is complex parent
    else {
      nodeObj.parent = parent;
    }
  },
  addCytoscapeJsNode: function (ele, jsonArray, parent, compartments) {
    var self = this;
    var nodeObj = new Object();

    //add id information
    nodeObj.id = $(ele).attr('id');
    //add node bounding box information
    nodeObj.sbgnbbox = self.bboxProp(ele);
    //add class information
    nodeObj.sbgnclass = $(ele).attr('class');
    //add label information
    nodeObj.sbgnlabel = $(ele).children('label').attr('text');
    //add state and info box information
    nodeObj.sbgnstatesandinfos = self.stateAndInfoProp(ele, nodeObj.sbgnbbox);
    //adding parent information
    self.addParentInfoToNode(ele, nodeObj, parent, compartments);

    //add clone information
    if ($(ele).children('clone').length > 0)
      nodeObj.sbgnclonemarker = true;
    else
      nodeObj.sbgnclonemarker = undefined;

    //add port information
    var ports = [];
    $(ele).find('port').each(function () {
      var id = $(this).attr('id');
      var relativeXPos = parseFloat($(this).attr('x')) - nodeObj.sbgnbbox.x;
      var relativeYPos = parseFloat($(this).attr('y')) - nodeObj.sbgnbbox.y;
      
      relativeXPos = relativeXPos / parseFloat(nodeObj.sbgnbbox.w) * 100;
      relativeYPos = relativeYPos / parseFloat(nodeObj.sbgnbbox.h) * 100;
      
      ports.push({
        id: $(this).attr('id'),
        x: relativeXPos,
        y: relativeYPos
      });
    });

    nodeObj.ports = ports;

    var cytoscapeJsNode = {data: nodeObj};
    jsonArray.push(cytoscapeJsNode);
  },
  traverseNodes: function (ele, jsonArray, parent, compartments) {
    if (!sbgnElementUtilities.handledElements[$(ele).attr('class')]) {
      return;
    }
    this.insertedNodes[$(ele).attr('id')] = true;
    var self = this;
    //add complex nodes here
    if ($(ele).attr('class') === 'complex' || $(ele).attr('class') === 'submap') {
      self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);

      $(ele).children('glyph').each(function () {
        if ($(this).attr('class') != 'state variable' &&
            $(this).attr('class') != 'unit of information') {
          self.traverseNodes(this, jsonArray, $(ele).attr('id'), compartments);
        }
      });
    }
    else {
      self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);
    }
  },
  getArcSourceAndTarget: function (arc, xmlObject) {
    //source and target can be inside of a port
    var source = $(arc).attr('source');
    var target = $(arc).attr('target');
    var sourceNodeId, targetNodeId;

    $(xmlObject).find('glyph').each(function () {
      if ($(this).attr('id') == source) {
        sourceNodeId = source;
      }
      if ($(this).attr('id') == target) {
        targetNodeId = target;
      }
    });

    if (typeof sourceNodeId === 'undefined') {
      $(xmlObject).find("port").each(function () {
        if ($(this).attr('id') == source) {
          sourceNodeId = $(this).parent().attr('id');
        }
      });
    }

    if (typeof targetNodeId === 'undefined') {
      $(xmlObject).find("port").each(function () {
        if ($(this).attr('id') == target) {
          targetNodeId = $(this).parent().attr('id');
        }
      });
    }

    return {'source': sourceNodeId, 'target': targetNodeId};
  },
  getArcBendPointPositions: function (ele) {
    var bendPointPositions = [];
    
//    $(ele).children('start, next, end').each(function () {
    $(ele).children('next').each(function () {
      var posX = $(this).attr('x');
      var posY = $(this).attr('y');
      
      var pos = {
        x: posX,
        y: posY
      };
      
      bendPointPositions.push(pos);
    });
    
    return bendPointPositions;
  },
  addCytoscapeJsEdge: function (ele, jsonArray, xmlObject) {
    if (!sbgnElementUtilities.handledElements[$(ele).attr('class')]) {
      return;
    }

    var self = this;
    var sourceAndTarget = self.getArcSourceAndTarget(ele, xmlObject);
    
    if (!this.insertedNodes[sourceAndTarget.source] || !this.insertedNodes[sourceAndTarget.target]) {
      return;
    }
    
    var edgeObj = new Object();
    var bendPointPositions = self.getArcBendPointPositions(ele);

    edgeObj.id = $(ele).attr('id');
    edgeObj.sbgnclass = $(ele).attr('class');
    edgeObj.bendPointPositions = bendPointPositions;

    if ($(ele).find('glyph').length <= 0) {
      edgeObj.sbgncardinality = 0;
    }
    else {
      $(ele).children('glyph').each(function () {
        if ($(this).attr('class') == 'cardinality') {
          edgeObj.sbgncardinality = $(this).find('label').attr('text');
        }
      });
    }

    edgeObj.source = sourceAndTarget.source;
    edgeObj.target = sourceAndTarget.target;

    edgeObj.portsource = $(ele).attr("source");
    edgeObj.porttarget = $(ele).attr("target");

    var cytoscapeJsEdge = {data: edgeObj};
    jsonArray.push(cytoscapeJsEdge);
  },
  convert: function (xmlObject) {
    var self = this;
    var cytoscapeJsNodes = [];
    var cytoscapeJsEdges = [];

    var compartments = self.getAllCompartments(xmlObject);

    $(xmlObject).find("map").children('glyph').each(function () {
      self.traverseNodes(this, cytoscapeJsNodes, "", compartments);
    });

    $(xmlObject).find("map").children('arc').each(function () {
      self.addCytoscapeJsEdge(this, cytoscapeJsEdges, xmlObject);
    });

    var cytoscapeJsGraph = new Object();
    cytoscapeJsGraph.nodes = cytoscapeJsNodes;
    cytoscapeJsGraph.edges = cytoscapeJsEdges;

    this.insertedNodes = {};

    return cytoscapeJsGraph;
  }
};

module.exports = sbgnmlToJson;
},{"./sbgn-element-utilities":10}],12:[function(_dereq_,module,exports){
var commonAppUtilities = _dereq_('../../sample-app/js/common-app-utilities');
var sbgnStyleRules = commonAppUtilities.sbgnStyleRules;

var textUtilities = {
  //TODO: use CSS's "text-overflow:ellipsis" style instead of function below?
  truncateText: function (textProp, font) {
    var context = document.createElement('canvas').getContext("2d");
    context.font = font;
    var fitLabelsToNodes = sbgnStyleRules['fit-labels-to-nodes'];
    var text = textProp.label || "";
    //If fit labels to nodes is false do not truncate
    if (fitLabelsToNodes == false) {
      return text;
    }
    var width;
    var len = text.length;
    var ellipsis = "..";
    var textWidth = (textProp.width > 30) ? textProp.width - 10 : textProp.width;
    while ((width = context.measureText(text).width) > textWidth) {
      --len;
      text = text.substring(0, len) + ellipsis;
    }
    return text;
  }
};

module.exports = textUtilities;
},{"../../sample-app/js/common-app-utilities":4}]},{},[6])(6)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
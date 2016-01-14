var sbgnBendPointUtilities = {
  //Get the clipping point of the node if it has an edge between another node centered on (x, y) point
  getClippingPoint: function (node, x, y) {
    //Get the intersectLine function of this shape
    var intersectLineFcn = window.cyNodeShapes[node.css('shape')].intersectLine;
    var intersect;//The return value of intersectLine function

    //Determine the parameters according to the possible number of parameters
    if (intersectLineFcn.length == 4) {
      intersect = intersectLineFcn(node, x, y);
    }
    else {
      intersect = intersectLineFcn(
          node._private.position.x,
          node._private.position.y,
          node.width(),
          node.height(),
          x, //halfPointX,
          y, //halfPointY
          node._private.style["border-width"].pxValue / 2);
    }

    return intersect;
  },
  convertToRelativeBendPosition: function (edge) {
    
  },
  convertToRealBendPosition: function (edge) {

  }
};
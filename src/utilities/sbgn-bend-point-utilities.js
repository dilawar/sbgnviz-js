var sbgnBendPointUtilities = {
  //Get the clipping point of the node if it has an edge between another node centered on (x, y) point
  getClippingPoint: function (node, x, y) {
    var intersect;//The return value of intersectLine function

    //Determine the parameters according to the possible number of parameters
    if (window.cyNodeShapes[node.css('shape')].intersectLine.length == 4) {
      intersect = window.cyNodeShapes[node.css('shape')].intersectLine(node, x, y);
    }
    else {
      intersect = window.cyNodeShapes[node.css('shape')].intersectLine(
          node._private.position.x,
          node._private.position.y,
          node.width(),
          node.height(),
          x, //halfPointX,
          y, //halfPointY
          node._private.style["border-width"].pfValue / 2);
    }

    return {
      x: intersect[0],
      y: intersect[1]
    };
  },
  getClippingPointsAndTangents: function (edge) {
    var sourceNode = edge.source();
    var targetNode = edge.target();
    var srcClippingPoint = this.getClippingPoint(sourceNode, targetNode.position('x')
        , targetNode.position('y'));
    var tgtClippingPoint = this.getClippingPoint(targetNode, sourceNode.position('x')
        , sourceNode.position('y'));

    var m1 = (tgtClippingPoint.y - srcClippingPoint.y) / (tgtClippingPoint.x - srcClippingPoint.x);
    var m2 = -1 / m1;

    return {
      m1: m1,
      m2: m2,
      srcClippingPoint: srcClippingPoint,
      tgtClippingPoint: tgtClippingPoint
    };
  },
  convertToRelativeBendPosition: function (edge, bendPoint, clippingPointsAndTangents) {
    if (clippingPointsAndTangents === undefined) {
      clippingPointsAndTangents = this.getClippingPointsAndTangents(edge);
    }

    var srcClippingPoint = clippingPointsAndTangents.srcClippingPoint;
    var tgtClippingPoint = clippingPointsAndTangents.tgtClippingPoint;
    var m1 = clippingPointsAndTangents.m1;
    var m2 = clippingPointsAndTangents.m2;

    var a1 = srcClippingPoint.y - m1 * srcClippingPoint.x;
    var a2 = bendPoint.y - m2 * bendPoint.x;

    var intersectX = (a2 - a1) / (m1 - m2);
    var intersectY = m1 * srcClippingPoint.x + a1;

    var weight = (intersectX - srcClippingPoint.x) / (tgtClippingPoint.x - srcClippingPoint.x);
    var distance = Math.sqrt(Math.pow((intersectY - bendPoint.y), 2)
        + Math.pow((intersectX - bendPoint.x), 2));

    return {
      weight: weight,
      distance: distance
    };
  },
  convertToRelativeBendPositions: function (edge) {
    var clippingPointsAndTangents = this.getClippingPointsAndTangents(edge);
    var bendPoints = edge.data('bendPointPositions');
    //output variables
    var weights = [];
    var distances = [];
    
    for(var i = 0; i < bendPoints.length; i++){
      var bendPoint = bendPoints[i];
      var relativeBendPosition = this.convertToRelativeBendPosition(edge, bendPoint, clippingPointsAndTangents);
      
      weights.push(relativeBendPosition.weight);
      distances.push(relativeBendPosition.distance);
    }
    
    return {
      weights: weights,
      distances: distances
    };
  }
};
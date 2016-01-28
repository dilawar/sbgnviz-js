var sbgnBendPointUtilities = {
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
  //Get the clipping point of the node if it has an edge between another node centered on (x, y) point
  getClippingPoint: function (node, x, y, portid) {
    var intersect;//The return value of intersectLine function
    var shape = node.css('shape');//get the node shape
    
    if(shape === 'polygon'){
        var points = node._private.style['shape-polygon-points'].value;
        shape = window.cyNodeShapes.makePolygon( points ).name;
    }
   
    //Determine the parameters according to the possible number of parameters
    if (window.cyNodeShapes[shape].intersectLine.length == 4) {
      intersect = window.cyNodeShapes[shape].intersectLine(node, x, y, portid);
    }
    else {
      intersect = window.cyNodeShapes[shape].intersectLine(
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
    
    var tgtPosition = cytoscape.sbgn.addPortReplacementIfAny(targetNode, edge._private.data.porttarget);
    var srcPosition = cytoscape.sbgn.addPortReplacementIfAny(sourceNode, edge._private.data.portsource);
    
    var srcClippingPoint = this.getClippingPoint(sourceNode, tgtPosition.x, tgtPosition.y, edge._private.data.portsource);
    var tgtClippingPoint = this.getClippingPoint(targetNode, srcPosition.x, srcPosition.y, edge._private.data.porttarget);

//    var startPoint = edge.data('startPosition');
//    var endPoint = edge.data('endPosition');
//    
//    if(startPoint.x != srcClippingPoint.x){
//      console.log('different start point x');
//    }
//    
//    if(startPoint.y != srcClippingPoint.y){
//      console.log('different start point y');
//    }
//    
//    if(endPoint.x != tgtClippingPoint.x){
//      console.log('different end point x');
//    }
//    
//    if(endPoint.y != tgtClippingPoint.y){
//      console.log('different end point y');
//    }

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

    var intersectX;
    var intersectY;

    if(m1 == Infinity || m1 == -Infinity){
      intersectX = srcClippingPoint.x;
      intersectY = bendPoint.y;
    }
    else if(m1 == 0){
      intersectX = bendPoint.x;
      intersectY = srcClippingPoint.y;
    }
    else {
      var a1 = srcClippingPoint.y - m1 * srcClippingPoint.x;
      var a2 = bendPoint.y - m2 * bendPoint.x;

      intersectX = (a2 - a1) / (m1 - m2);
      intersectY = m1 * intersectX + a1;
    }

    //Intersection point is the intersection of the lines passing through the nodes and
    //passing through the bend point and perpendicular to the other line
    var intersectionPoint = {
      x: intersectX,
      y: intersectY
    };

    var weight = intersectX == srcClippingPoint.x?0:(intersectX - srcClippingPoint.x) / (tgtClippingPoint.x - srcClippingPoint.x);
    var distance = Math.sqrt(Math.pow((intersectY - bendPoint.y), 2)
        + Math.pow((intersectX - bendPoint.x), 2));
    
    //Get the direction of the line form source clipping point to target clipping point
    var direction1 = this.getLineDirection(srcClippingPoint, tgtClippingPoint);
    //Get the direction of the line from intesection point to bend point
    var direction2 = this.getLineDirection(intersectionPoint, bendPoint);
    
    //If the difference is not -2 and not 6 then the direction of the distance is negative
    if(direction1 - direction2 != -2 && direction1 - direction2 != 6){
      distance = -distance;
    }
    
//    if(weight < 0.001) weight = 0.00001;
//    if(weight > 0.999) weight = 0.99999;
    
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

    for (var i = 0; i < bendPoints.length; i++) {
      var bendPoint = bendPoints[i];
      var relativeBendPosition = this.convertToRelativeBendPosition(edge, bendPoint, clippingPointsAndTangents);

      weights.push(relativeBendPosition.weight);
      distances.push(relativeBendPosition.distance);
    }
//    weights = [0.2, 0.9];
//    distances = [0, 0];
    return {
      weights: weights,
      distances: distances
    };
  },
  getSegmentDistancesString: function (edge) {
    var str = "";

    var distances = edge.data('distances');
    for (var i = 0; i < distances.length; i++) {
      str = str + " " + distances[i];
    }
    
    return str;
  },
  getSegmentWeightsString: function (edge) {
    var str = "";

    var weights = edge.data('weights');
    for (var i = 0; i < weights.length; i++) {
      str = str + " " + weights[i];
    }
    
    return str;
  }
};
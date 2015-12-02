(function ($$) {
    var sbgnShapes = $$.sbgnShapes = {
        'source and sink': true
    };
    $$.sbgn = {
        
    };

    window.cyStyfn.types.nodeShape.enums.push('source and sink');

    window.cyNodeShapes["source and sink"] = {
        points: window.cyMath.generateUnitNgonPoints(4, 0),
        draw: function (context, node) {
            var centerX = node._private.position.x;
            var centerY = node._private.position.y;
            ;
            var width = node.width();
            var height = node.height();
            var label = node._private.data.sbgnlabel;
            var pts = nodeShapes["source and sink"].points;
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
                    node._private.style['background-opacity'].value);

        },
        drawPath: function (context, node) {
        },
        intersectLine: function (node, x, y, portId) {
            var centerX = node._private.position.x;
            var centerY = node._private.position.y;
            var width = node.width();
            var height = node.height();
            var padding = node._private.style["border-width"].pxValue / 2;

            var portIntersection = $$.sbgn.intersectLinePorts(node, x, y, portId);
            if (portIntersection.length > 0) {
                return portIntersection;
            }

            return nodeShapes["ellipse"].intersectLine(centerX, centerY, width,
                    height, x, y, padding);

        },
        intersectBox: function (x1, y1, x2, y2, node) {
            var centerX = node._private.position.x;
            var centerY = node._private.position.y;
            var width = node.width();
            var height = node.height();
            var padding = node._private.style["border-width"].pxValue / 2;

            return nodeShapes["ellipse"].intersectBox(x1, y1, x2, y2, width, height,
                    centerX, centerY, padding);

        },
        checkPoint: function (x, y, node, threshold) {
            var centerX = node._private.position.x;
            var centerY = node._private.position.y;
            var width = node.width();
            var height = node.height();
            var padding = node._private.style["border-width"].pxValue / 2;

            return nodeShapes["ellipse"].checkPoint(x, y, padding, width,
                    height, centerX, centerY)

        }
    };
})(cytoscape);
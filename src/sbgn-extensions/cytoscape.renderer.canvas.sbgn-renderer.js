(function ($$) {
    var sbgnShapes = $$.sbgnShapes = {
        'source and sink': true
    };

    $$.sbgn = {
    };

    window.cyStyfn.types.nodeShape.enums.push('source and sink');

    $$.sbgn.registerSbgnShapes = function () {
        window.cyNodeShapes["source and sink"] = {
            points: window.cyMath.generateUnitNgonPoints(4, 0),
            draw: function (context, node) {
                var centerX = node._private.position.x;
                var centerY = node._private.position.y;

                var width = node.width();
                var height = node.height();
                var label = node._private.data.sbgnlabel;
                var pts = window.cyNodeShapes["source and sink"].points;
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
            intersectLine: window.cyNodeShapes["ellipse"].intersectLine,
            intersectBox: window.cyNodeShapes["ellipse"].intersectBox,
            checkPoint: window.cyNodeShapes["ellipse"].checkPoint
        };
    };

    $$.sbgn.drawEllipse = function (context, x, y, width, height) {
        //$$.sbgn.drawEllipsePath(context, x, y, width, height);
        //context.fill();
        window.cyNodeShapes['ellipse'].draw(context, x, y, width, height);
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

                var recPoints = $$.math.generateUnitNgonPointsFitToSquare(4, 0);
                var cloneX = centerX;
                var cloneY = centerY + 3 / 4 * cornerRadius;
                var cloneWidth = width - 2 * cornerRadius;
                var cloneHeight = cornerRadius / 2;

                renderer.drawPolygon(context, cloneX, cloneY, cloneWidth, cloneHeight, recPoints);
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

                var cornerRadius = $$.math.getRoundRectangleRadius(width, height);

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

                renderer.drawPolygon(context,
                        cloneX, cloneY,
                        cloneWidth, cloneHeight, markerPoints);

                context.fillStyle = oldStyle;
                context.globalAlpha = oldGlobalAlpha;
                //context.stroke();
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
        var padding = node._private.style['border-width'].pxValue / 2;

        for (var i = 0; i < node._private.data.ports.length; i++) {
            var port = node._private.data.ports[i];
            if (portId == port.id) {
                return $$.math.intersectLineEllipse(
                        x, y, port.x + nodeX, port.y + nodeY, 1, 1);
            }
        }
        return [];
    };

//    $$.sbgn.intersetLineSelection = function (render, node, x, y, portId) {
//        //TODO: do it for all classes in sbgn, create a sbgn class array to check
//        if (sbgnShapes[render.getNodeShape(node)]) {
//            return window.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//                    node, x, y, portId);
//        }
//        else {
//            return window.cyNodeShapes[render.getNodeShape(node)].intersectLine(
//                    node._private.position.x,
//                    node._private.position.y,
//                    node.outerWidth(),
//                    node.outerHeight(),
//                    x, //halfPointX,
//                    y, //halfPointY
//                    node._private.style["border-width"].pxValue / 2
//                    );
//        }
//    };


})(cytoscape);
/**
 * Created by jm96 on 14-9-15.
 */
(function () {
    if (!window["svgUtility"]) window["svgUtility"] = {};

    window["svgUtility"]["hasSvg"] = function () {
        return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
            || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.0");
    };
})();
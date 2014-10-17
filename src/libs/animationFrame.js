/**
 * Created by jm96 on 14-10-17.
 */
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (a, b) {
        window.setTimeout(a, 1000 / 60);
    };
})();
window.cancelRequestAnimationFrame = (function () {
    return window.cancelAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || clearTimeout;
})();
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
})();/**
 * Created by jm96 on 14-10-17.
 */
if(!Object.extend){
    Object.extend=function(origion,target){
        for(var p in target){
            origion[p]=target[p];
        }
    }
}/**
 * Created by jm96 on 14-10-17.
 */
if (!String.format) {
    String.format = function (str, params) {
        var i;
        var result = str;
        if (params instanceof Array) {
            for(i=0;i<params.length;i++) {
                result = result.replace(new RegExp("\\{" + (i) + "\\}", "g"), params[i]);
            }
        }
        else {
            for (i = 1; i < arguments.length; i++) {
                result = result.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
            }
        }

        return result;
    };
}
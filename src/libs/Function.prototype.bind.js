/**
 * Created by jm96 on 14-10-17.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNop = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNop && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        fNop.prototype = this.prototype;
        fBound.prototype = new fNop();
        return fBound;
    };
}
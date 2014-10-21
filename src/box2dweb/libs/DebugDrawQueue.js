/**
 * Created by jm96 on 14-10-21.
 */
function DebugDrawQueue(ctx) {
    this.draw = [];
    this.ctx = ctx;
}
DebugDrawQueue.prototype = {
    add: function (fn) {
        this.draw.push(fn);
    },
    run: function () {
        for (var i = 0; i < this.draw.length; i++) {
            this.draw[i]();
        }
        this.draw = [];
    }
};

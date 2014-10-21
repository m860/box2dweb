/**
 * Created by jm96 on 14-10-21.
 */
function Camera(ctx) {
    this.ctx = ctx;
    this.x = 0;
    this.y = 0;
    this.events = {};
}
Camera.prototype = {
    moveTo: function (x, y) {
        this.x += x;
        this.y += y;
        if (this.events["move"] && this.events["move"].length > 0) {
            for (var i = 0; i < this.events["move"].length; i++) {
                this.events["move"][i].bind(this)(x, y);
            }
        }
        this.ctx.translate(x, y);
    },
    on: function (name, fn) {
        if (!this.events[name]) this.events[name] = [];
        this.events[name].push(fn);
    },
    getOffsetOrigin: function () {
        return new Box2D.Common.Math.b2Vec2(this.x * -1, this.y * -1);
    },
    lookAt: function (thing) {
        var o = this.getOffsetOrigin();
        var pos = thing.getPositionOfCanvas();
        var dur = pos.x - o.x - 150;
        if (dur > 0) {
            this.moveTo(dur * -1, 0);
        }
    }
};

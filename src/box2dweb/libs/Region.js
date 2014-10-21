/**
 * Created by jm96 on 14-10-21.
 */
function Region(camera, minx, maxx, miny, maxy) {
    this.camera = camera;
    this.minx = minx;
    this.maxx = maxx;
    this.miny = miny;
    this.maxy = maxy;
    this.camera.on("move", function (x, y) {
        this.minx -= x;
        this.maxx -= x;
        this.miny -= y;
        this.maxy -= y;
        messageManager.append(String.format("region : minx={0},max={1},miny={2},maxy={3}", this.minx, this.maxx, this.miny, this.maxy));
    }.bind(this));
}
Region.prototype = {
    isOutside: function (body) {
        var pos = body.GetPosition().Copy();
        pos.x = pos.x * scale;
        pos.y = pos.y * scale;
        if (pos.x > this.maxx || pos.x < this.minx) return true;
        if (pos.y > this.maxy || pos.y < this.miny) return true;
        return false;
    }
};
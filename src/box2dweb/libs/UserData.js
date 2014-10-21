/**
 * Created by jm96 on 14-10-21.
 */
function UserData() {
    this.type = -1;
    this.destroy = false;
    this.filter = 0x0000;
}
UserData.filter = {
    redPlane: 0x0001,
    redBullet: 0x0010,
    bluePlane: 0x0100,
    blueBullet: 0x1000,
    other: 0x1111,
    shouldCollide: function (result) {
        console.info("shoule collide");
        console.info(String.format("result={0},result=0x0101:{1}",result.toString(16),result===0x0101));
        if (result === 0x0101
            || result === 0x1001
            || result === 0x0110) {
            return true
        }
        return false;
    },
    destroy: function (ua, ub) {
        var result = ua.filter | ub.filter;
        console.info("destroy");
        console.info(String.format("result={0},result=0x0101:{1}",result.toString(16),result===0x0101));
        if (result === 0x0110
            || result === 0x1001
            || result === 0x0101) {
            console.info("asd");
            ua.destroy = true;
            ub.destroy = true;
        }
    }
};
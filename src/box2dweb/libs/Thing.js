/**
 * Created by jm96 on 14-10-21.
 */
function Thing(world) {
    this.world = world;
    this.bodyDef = new Box2D.Dynamics.b2BodyDef();
    this.bodyDef.userData = new UserData();
    this.fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    this.fixtureDef.density = 1.0;
    this.fixtureDef.restitution = 0.2;
    this.fixtureDef.friction = 0.5;
    this.scale = scale;
    this.body = null;
    this.fixture = null;
}
Thing.prototype = {
    create: function () {
        this.body = this.world.CreateBody(this.bodyDef);
        this.fixture = this.body.CreateFixture(this.fixtureDef);
        delete this.bodyDef;
        delete this.fixtureDef;
        return this.body;
    },
    setPosition: function (x, y) {
        if (this.body) this.body.SetPosition(x / this.scale, y / this.scale);
        else this.bodyDef.position.Set(x / this.scale, y / this.scale);
    },
    getPosition: function () {
        if (this.body) {
            return this.body.GetPosition().Copy();
        }
        return new Box2D.Common.Math.b2Vec2(0, 0);
    },
    setPositionOfCanvas: function (x, y) {
        if (this.body) {
            this.body.SetPosition(x / this.scale, y / this.scale);
        }
    },
    getPositionOfCanvas: function () {
        if (this.body) {
            var p = this.body.GetPosition().Copy();
            p.x *= this.scale;
            p.y *= this.scale;
            return p;
        }
        return new Box2D.Common.Math.b2Vec2(0, 0);
    },
    setUserData: function (userData) {
        this.bodyDef.userData = userData;
    },
    getUserData: function () {
        if (this.body) return this.body.GetUserData();
        return null;
    },
    setAsRect: function (hx, hy) {
        this.fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        this.fixtureDef.shape.SetAsBox(hx / this.scale, hy / this.scale);
    },
    setAsCircle: function (r) {
        this.fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape(r / this.scale);
    },
    setType: function (type) {
        this.bodyDef.type = type;
    },
    setFilter: function (filter) {
        this.bodyDef.userData.filter = filter;
    },
    extendBodyDef: function (cfg) {
        Object.extend(this.bodyDef, cfg);
    },
    extendFixtureDef: function (cfg) {
        Object.extend(this.fixtureDef, cfg);
    },
    extendUserData: function (cfg) {
        Object.extend(this.bodyDef.userData, cfg);
    }
};

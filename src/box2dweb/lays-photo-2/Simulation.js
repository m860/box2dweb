/**
 * Created by Jeanma on 2015/1/6.
 * 2015/1/15
 *      game loop use setTimeout without requestAnimationFrame;
 *      add game status , 0:stop,1:running,2:pause.
 *      change game status use start(),pause(),stop() without run()
 *
 *      fixed bug :Object.extend()
 */
//javascript extend

//requestAnimationFrame
//window.requestAnimationFrame = (function () {
//    return window.requestAnimationFrame
//        || window.webkitRequestAnimationFrame
//        || window.mozRequestAnimationFrame
//        || window.oRequestAnimationFrame
//        || window.msRequestAnimationFrame
//        || function (a, b) {
//            window.setTimeout(a, 1000 / 60);
//        };
//})();
//window.cancelRequestAnimationFrame = (function () {
//    return window.cancelAnimationFrame
//        || window.webkitCancelRequestAnimationFrame
//        || window.mozCancelRequestAnimationFrame
//        || window.oCancelRequestAnimationFrame
//        || window.msCancelRequestAnimationFrame
//        || clearTimeout;
//})();

//String.format
String.format = function (str, params) {
    var i;
    var result = str;
    if (params instanceof Array) {
        for (i = 0; i < params.length; i++) {
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


//Object.extend
Object.extend = function (origion, target) {
    for (var p in target) {
        if (origion[p] instanceof Object) {
            Object.extend(origion[p], target[p]);
        }
        else {
            origion[p] = target[p];
        }
    }
}
//Object.clone
//Object.clone=function(obj){
//
//};

//Array each
Array.each = function (arr, fn) {
    var i = 0, len = arr.length;
    for (; i < len; i += 1) {
        fn.bind(arr[i])();
    }
};
//Number.random(min,max)
Number.random = function (min, max) {
    return Math.random() * (max - min) + min;
};

//box2d short class name
window["b2Vec2"] = Box2D.Common.Math.b2Vec2;
window["b2Body"] = Box2D.Dynamics.b2Body;
//window["b2BodyDef"] = Box2D.Dynamics.b2BodyDef;
//window["b2FixtureDef"] = Box2D.Dynamics.b2FixtureDef;
window["b2PolygonShape"] = Box2D.Collision.Shapes.b2PolygonShape;
window["b2CircleShape"] = Box2D.Collision.Shapes.b2CircleShape;
//window["b2ContactFilter"] = Box2D.Dynamics.b2ContactFilter;
window["b2Math"] = Box2D.Common.Math.b2Math;
//window["b2World"] = Box2D.Dynamics.b2World;

//event interface
function IEvent() {
    this._events = {};
}
IEvent.prototype = {
    on: function (name, fn) {
        this._events[name] = fn;
        return this;
    },
    trigger:function(name,params){
        if(this._events[name]){
            this._events[name].apply(null,params);
        }
    }
};

/*
 * Simulation
 * event:ShouldCollide,BeginContact
 * */
function Simulation(cfg) {
    var me = this;
    if (!cfg.ctx) throw "cfg.ctx is not defined";
    if (!cfg.gravity) cfg.gravity = new b2Vec2(0, 10);//default
    if (typeof(cfg.allowSleep) === "undefined") cfg.allowSleep = true;//default
    if (!cfg.step) cfg.step = 1 / 60;//default 60 fps
    if (!cfg.velocityIterations) cfg.velocityIterations = 10;//default
    if (!cfg.positionIterations) cfg.positionIterations = 8;//default
    //if(!cfg.setting.onRunning) cfg.setting.onRunning=function(){};
    this.setting = cfg;

    //events
    //this._events = {};
    IEvent.call(this);

    this._timer = null;
    //this.world = new b2World(this.setting.gravity, this.setting.allowSleep);
    this.world = new Box2D.Dynamics.b2World(this.setting.gravity, this.setting.allowSleep);
    //console.log(String.format("allow sleep :{0}",this.setting.allowSleep));

    //contact filter
    var contactFilter = new Box2D.Dynamics.b2ContactFilter();
    contactFilter.ShouldCollide = function (fixA, fixB) {
        if (me._events["ShouldCollide"]) return me.trigger("ShouldCollide",[fixA, fixB]);
        else return true;
    };
    this.world.SetContactFilter(contactFilter);

    //contact listener
    var contactListener = new Box2D.Dynamics.b2ContactListener();
    contactListener.BeginContact = function (contact) {
        me.trigger("BeginContact",[contact]);
        //if (me._events["BeginContact"]) return me._events["BeginContact"](contact);
    };
    this.world.SetContactListener(contactListener);

    this.camera = null;

    //start time
    this.startTime = null;

    //debugger
    this.debugger = null;
}
Simulation.prototype = {
    run: function () {

        //start time
        if (!this.startTime) {
            this.startTime = Date.now();
        }

        //on running
        //if (this._events["running"]) this._events["running"]();
        this.trigger("running",[]);

        this.world.Step(this.setting.step, this.setting.velocityIterations, this.setting.positionIterations);

        //clear canvas by camera
        var cx, cy;
        if (this.camera) {
            cx = this.camera.x;
            cy = this.camera.y;
        }
        else {
            cx = 0, cy = 0;
        }
        this.setting.ctx.clearRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);

        //debug render
        if (this.debugger) {
            this.debugger.clearRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);
            this.world.DrawDebugData();
            //draw title
            this.debugger.fillText("Debugger", 0, 10);
        }


        //debug
        //draw clear rect
        this.setting.ctx.save();
        this.setting.ctx.globalAlpha=0.3;
        this.setting.ctx.strokeStyle="red";
        this.setting.ctx.strokeRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);
        this.setting.ctx.restore();

        //render event
        //if (this._events["rendering"]) this._events["rendering"](this.setting.ctx);
        this.trigger("rendering",[this.setting.ctx]);
        //render body
        var body = this.world.GetBodyList();
        var userData;
        while (body) {
            userData = body.GetUserData();
            if (userData) {
                //userData.render(this.setting.ctx, body);
                //if(userData._events["update"]) userData._events["update"](this.setting.ctx, body);
                userData.trigger("update",[this.setting.ctx, body]);
                userData.trigger("render",[this.setting.ctx, body]);
            }
            body = body.GetNext();
        }

        //clear all force
        this.world.ClearForces();

        //loop
        //this._timer = window.requestAnimationFrame(this.run.bind(this));
        if (this.status === 0 || this.status == 2) {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            //stop , pause event
            //if (this._events["stoped"]) this._events["stoped"](this.setting.ctx);
            this.trigger("stoped",[this.setting.ctx]);
            return;
        }
        else {
            this._timer = setTimeout(this.run.bind(this), 1000 * this.setting.step);
        }
    },
    start: function () {
        this.status = 1;
        this.run();
    },
    pause: function () {
        this.status = 2;
    },
    stop: function () {
        this.status = 0;
    },
    createThing: function (thing) {
        //create body
        thing.body = this.world.CreateBody(thing.bodyDef);
        //create fixture
        Array.each(thing.fixtureDef, function () {
            thing.body.CreateFixture(this);
        });

        delete thing.bodyDef;
        delete thing.fixtureDef;
    },
    //on: function (name, fn) {
    //    this._events[name] = fn;
    //    return this;
    //},
    setCamera: function (camera) {
        //
        camera.ctx = this.setting.ctx;
        this.camera = camera;
    },
    getRunDuration: function () {
        return Date.now() - this.startTime;
    },
    getBodyAtMouse: function (mouseX, mouseY) {
        mouseX /= Simulation.SCALE;
        mouseY /= Simulation.SCALE;
        var mouseVec = new b2Vec2(mouseX, mouseY);

        var aabb = new Box2D.Collision.b2AABB();
        aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
        aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

        var body;

        function query(fixture) {
            var shape = fixture.GetShape();
            var result = shape.TestPoint(fixture.GetBody().GetTransform(), mouseVec);
            if (result) {
                body = fixture.GetBody();
                return false;
            }
            return true;
        }

        this.world.QueryAABB(query, aabb);

        return body;
    },
    setDebugger: function (debuggerCtx) {
        this.debugger = debuggerCtx;
        //debug draw
        var debugDraw = new Box2D.Dynamics.b2DebugDraw();
        debugDraw.SetSprite(debuggerCtx);
        debugDraw.SetAlpha(0.5);
        debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit);//| Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit
        debugDraw.SetDrawScale(Simulation.SCALE);
        this.world.SetDebugDraw(debugDraw);
    }
};
//apply IEvent.prototype
Object.extend(Simulation.prototype, IEvent.prototype);

//default is 30
Simulation.SCALE = 30;
//Camera
//camera size is same to canvas's size
function Camera() {
    this.y = 0;//center.y
    this.x = 0;//center.x
    this.ctx = null;
    this.maxX = -1;
    this.minX = -1;
    this.maxY = -1;
    this.minY = -1;
}
Object.extend(Camera.prototype, IEvent.prototype);
Camera.prototype.follow = function (body, minx, maxx, miny, maxy) {
    this.maxX = maxx;
    this.minX = minx;
    this.maxY = maxy;
    this.minY = miny;

    //TODO optimize calculate
    var pos = body.GetPosition().Copy();
    //pos.Multiply(Simulation.SCALE);
    var x = pos.x * Simulation.SCALE;

    var realX, dx, realY, dy;
    if (minx >= 0) {
        realX = this.x + minx;
        if (x < realX) {
            dx = realX - x;
            this.ctx.translate(dx, 0);
            this.x -= dx;
        }
    }
    if (maxx >= 0) {
        realX = this.x + maxx;
        if (x > realX) {
            dx = x - realX;
            this.ctx.translate(-dx, 0);
            this.x += dx;
        }
    }
    var y = pos.y * Simulation.SCALE;
    if (miny >= 0) {
        realY = this.y + miny;
        if (y < realY) {
            dy = realY - y;
            this.ctx.translate(0, dy);
            this.y -= dy;
        }
    }
    if (maxy >= 0) {
        realY = this.y + maxy;
        if (y > realY) {
            dy = y - realY;
            this.ctx.translate(0, -dy);
            this.y += dy;
        }
    }
};

//Thing
//bodyDef:#b2BodyDef
function Thing(bodyDef) {
    if (!bodyDef) throw "missing argument : bodyDef ";
    var me = this;
    this.bodyDef = Thing.newBodyDef();
    if (bodyDef) Object.extend(this.bodyDef, bodyDef);

    this.bodyDef.position.Multiply(1 / Simulation.SCALE);

    this.fixtureDef = [];

    this.body = null;
    return this;
}
Thing.prototype = {
    addFixtureDef: function (fixtureDef) {
        var def = Thing.newFixtureDef();
        Object.extend(def, fixtureDef);

        var shape = fixtureDef.shape;
        if (shape instanceof b2CircleShape) {
            var radius = shape.GetRadius() / Simulation.SCALE;
            shape.SetRadius(radius);
        }
        if (shape instanceof b2PolygonShape) {
            var localVertices = shape.GetVertices();
            Array.each(localVertices, function () {
                this.Multiply(1 / Simulation.SCALE);
            });
        }

        this.fixtureDef.push(def);
    },
    on:function(name,fn){
        this.bodyDef.userData.on(name,fn);
    }
};
Thing.newBodyDef = function () {
    var def = new Box2D.Dynamics.b2BodyDef();
    def.userData = new BodyUserData();
    return def;
};
Thing.newFixtureDef = function () {
    var def = new Box2D.Dynamics.b2FixtureDef();
    def.density = 1.0;
    def.restitution = 0.2;//0.2
    def.friction = 0.5;//0.5
    def.userData = new FixtureUserData();
    return def;
};

function ImageThing(bodyDef,image){
    Thing.call(this,bodyDef);
    if(!image) throw "image is not defined";
    this.on("render",this.render.bind(this));
    this.image=image;
    this.hw=image.width/2;
    this.hh=image.height/2;
}
ImageThing.prototype=new Thing({});
ImageThing.prototype.render=function(ctx,body){
    var pos = body.GetPosition().Copy();
    pos.Multiply(Simulation.SCALE);
    var angle=body.GetAngle();

    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.translate(-pos.x,-pos.y);
    ctx.drawImage(this.image,pos.x-this.hw,pos.y-this.hh);
    ctx.restore();
};
ImageThing.prototype.setDefaultBox=function(def){
    var shape=new b2PolygonShape();
    shape.SetAsBox(this.hw,this.hh);
    if(def)def=Object.extend({shape:shape},def);
    else def={shape:shape};
    this.addFixtureDef(def);
};

//Input
function Input() {
    this.keys = new Array(255);
    window.addEventListener("keydown", this._onKeyDown.bind(this), false);
    window.addEventListener("keyup", this._onKeyUp.bind(this), false);
    this.clear();
}
Input.prototype = {
    clear: function () {
        for (var i = 0; i < 255; i++) {
            this.keys[i] = false;
        }
    },
    isKeyDown: function (keycode) {
        return this.keys[keycode];
    },
    _onKeyDown: function (evt) {
        this.keys[evt.keyCode] = true;
    },
    _onKeyUp: function (evt) {
        this.keys[evt.keyCode] = false;
    }
};

Input.w = 87;
Input.s = 83;
Input.a = 65;
Input.d = 68;
Input.j = 74;
Input.k = 75;

//UserData
function UserData() {
}
UserData.prototype = {};
//body user data
//events:update
function BodyUserData() {
    UserData.call(this);
    IEvent.call(this);
    //if true then destroy the body
    this.destroy = false;
}
BodyUserData.prototype = new UserData();
Object.extend(BodyUserData.prototype, IEvent.prototype);
//BodyUserData.prototype.render = function (ctx, body) {
////    console.log("render body");
//};

//fixture user data
//if the fixture have same layer and same type then do collision
function FixtureUserData() {
    UserData.call(this);
    this.layer = 0;
    this.type = 0x00000000;//8 bit
}
FixtureUserData.prototype = new UserData();
FixtureUserData.prototype.setLayer = function (l) {
    this.layer = l;
};
FixtureUserData.prototype.setType = function (t) {
    this.type = t;
};


//resource
function Resource() {
}

/*
 * res={
 *   images{Array{String}}
 *   audioes{Array{String}}
 * }
 * complete{Function}
 * [adjust]{Boolean}
 * [canvasSize]={
 *   width{Number}
 *   height{Number}
 * }
 * [targetSize]={
 *   width{Number}
 *   height{Number}
 * }
 * [processing]{Function}
 *
 * */
Resource.scale = {x: 1, y: 1};
Resource.load = function (res, complete, adjust, canvasSize, targetSize, processing) {
    var len = 0;
    var index = 0;
    var result = {};

    function adjustRatio() {
        if (typeof(canvasSize) === "undefined") throw "canvasSize is not defined";
        if (typeof(targetSize) === "undefined") throw "targetSize is not defined";
        var canvas, ctx;
        var sx = canvasSize.width / targetSize.width;
        var sy = canvasSize.height / targetSize.height;

        Resource.scale = {x: sx, y: sy};

        var i = 0, len = result.images.length, img;
        for (; i < len; i++) {
            img = result.images[i];
            canvas = document.createElement("canvas");
            canvas.width = img.width * sx;
            canvas.height = img.height * sy;
            ctx = canvas.getContext("2d");

            ctx.save();
            ctx.scale(sx, sy);
            ctx.drawImage(img, 0, 0);
            ctx.restore();

            result.images[i] = canvas;
        }
    }

    function imgLoaded() {
        this.removeEventListener("load", imgLoaded);
        index++;
        if (processing) processing(index, len);
        //console.log("img loaded");
        if (index === len && complete) {
            if (adjust) {
                adjustRatio();
            }
            complete(result);
        }
    }

    function audioLoaded() {
        this.removeEventListener("canplay", audioLoaded);
        index++;
        if (processing) processing(index, len);
        //console.log("audio loaded");
        if (index === len && complete) complete(result);
    }

    if (res.images) {
        len += res.images.length;
        result.images = [];
        var img;
        Array.each(res.images, function () {
            img = document.createElement("img");
            img.addEventListener("load", imgLoaded);
            img.src = this;
            result.images.push(img);
        });
    }
    if (res.audioes) {
        len += res.audioes.length;
        result.audioes = [];
        var audio;
        Array.each(res.audioes, function () {
            audio = document.createElement("audio");
            audio.addEventListener("canplay", audioLoaded);
            audio.src = this;
            result.audioes.push(audio);
        });
    }
};
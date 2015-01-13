/**
 * Created by Jeanma on 2015/1/6.
 */
//javascript extend

//requestAnimationFrame
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
        origion[p] = target[p];
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

//box2d short class name
var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2ContactFilter = Box2D.Dynamics.b2ContactFilter,
    b2Math=Box2D.Common.Math.b2Math,
    b2World = Box2D.Dynamics.b2World;

//event interface
function IEvent(){
    this._events={};
}
IEvent.prototype={
    on:function(name,fn){
        this._events[name]=fn;
        return this;
    }
};

//Simulation
function Simulation(cfg) {
    var me = this;
    if (!cfg.ctx) throw "cfg.ctx is not defined";
    if (!cfg.gravity) cfg.gravity = new b2Vec2(0, 10);//default
    if (typeof(cfg.allowSleep)==="undefined") cfg.allowSleep = true;//default
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
    this.world = new b2World(this.setting.gravity, this.setting.allowSleep);
    //console.log(String.format("allow sleep :{0}",this.setting.allowSleep));

    //contact filter
    var contactFilter = new b2ContactFilter();
    contactFilter.ShouldCollide = function (fixA, fixB) {
        if (me._events["shouldcollide"]) return me._events["shouldcollide"](fixA, fixB);
        else {
            var ua = fixA.GetUserData();
            var ub = fixB.GetUserData();
            if (!ua || !ub) return true;
            if (ua.layer === ub.layer && ua.type === ub.type) return true;
            else return false;
        }
    };
    this.world.SetContactFilter(contactFilter);

    //debug draw
    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite(this.setting.ctx);
    debugDraw.SetAlpha(0.5);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit);//| Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit
    debugDraw.SetDrawScale(Simulation.SCALE);
    this.world.SetDebugDraw(debugDraw);

    this.camera=null;
}
Simulation.prototype = {
    run: function () {

        //on running
        if (this._events["running"]) this._events["running"]();

        this.world.Step(this.setting.step, this.setting.velocityIterations, this.setting.positionIterations);

        //debug render
        this.world.DrawDebugData();

        //clear canvas
        var cx,cy;
        if(this.camera){
            cx=this.camera.x;
            cy=this.camera.y;
        }
        else{
            cx=0,cy=0;
        }
        //this.setting.ctx.clearRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);

        //debug
        //draw clear rect
        this.setting.ctx.save();
        this.setting.ctx.globalAlpha=0.3;
        this.setting.ctx.strokeStyle="red";
        this.setting.ctx.strokeRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);
        this.setting.ctx.restore();

        //render event
        if (this._events["rendering"]) this._events["rendering"](this.setting.ctx);

        //render body
        var body = this.world.GetBodyList();
        var userData;
        while (body) {
            userData = body.GetUserData();
            if (userData) {
                userData.render(this.setting.ctx, body);
            }
            body = body.GetNext();
        }

        //clear all force
        this.world.ClearForces();

        //loop
        this._timer = window.requestAnimationFrame(this.run.bind(this));
    },
    pause: function () {
        window.cancelRequestAnimationFrame(this._timer);
        this._timer = null;
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
    setCamera:function(camera){
        //
        camera.ctx=this.setting.ctx;
        this.camera=camera;
    }
};
//apply IEvent.prototype
Object.extend(Simulation.prototype,IEvent.prototype);

//default is 30
Simulation.SCALE = 30;
//Camera
//camera size is same to canvas's size
function Camera() {
    this.y=0;//center.y
    this.x=0;//center.x
    this.ctx=null;
    this.maxX=-1;
    this.minX=-1;
    this.maxY=-1;
    this.minY=-1;
}
Object.extend(Camera.prototype,IEvent.prototype);
//Camera.prototype.moveTo=function(x,y){
    //if(this._events["moving"]) this._events["moving"]();
    //this.y=y;
    //this.x=x;
    ////translate by x,y
    ////calculate left,top
    //var left=this.x-this.ctx.canvas.width/2;
    //var top=this.y-this.ctx.canvas.height/2;
    //this.ctx.translate(left,top);
    //if(this._events["moved"]) this._events["moved"]();
//};
Camera.prototype.lookAt=function(body,ignoreX,ignoreY){
    var pos=body.GetPosition();
    var x=pos.x*Simulation.SCALE;
    //var y=pos.y*Simulation.SCALE;
    this.ctx.translate(this.x-x,0);
    this.x=x;
};

Camera.prototype.follow=function(body,minx,maxx,miny,maxy){
    this.maxX=maxx;
    this.minX=minx;
    this.maxY=maxy;
    this.minY=miny;

    //TODO optimize calculate
    var pos=body.GetPosition().Copy();
    //pos.Multiply(Simulation.SCALE);
    var x=pos.x*Simulation.SCALE;

    var realX,dx,realY,dy;
    if(minx>=0){
        realX=this.x+minx;
        if(x<realX){
            dx=realX-x;
            this.ctx.translate(dx,0);
            this.x-=dx;
        }
    }
    if(maxx>=0){
        realX=this.x+maxx;
        if(x>realX){
            dx=x-realX;
            this.ctx.translate(-dx,0);
            this.x+=dx;
        }
    }
    var y=pos.y*Simulation.SCALE;
    if(miny>=0){
        realY=this.y+miny;
        if(y<realY){
            dy=realY-y;
            this.ctx.translate(0,dy);
            this.y-=dy;
        }
    }
    if(maxy>=0){
        realY=this.y+maxy;
        if(y>realY){
            dy=y-realY;
            this.ctx.translate(0,-dy);
            this.y+=dy;
        }
    }
};

//shape type
//var ShapeType = {
//    rect: 0,
//    circle: 1
//};

//Thing
//bodyDef:#b2BodyDef
//fixtureDef:#Array,item:{def:#b2FixtureDef,shapeType:#ShapeType}
//if shapeType==ShapeType.rect ,item{hw:#Number,hh:#Number}
//if shapeType==ShapeType.circle ,item{radius:#Number}
function Thing(bodyDef, fixtureDef) {
    if (!bodyDef) throw "missing argument : bodyDef ";
    //if (!fixtureDef) throw "missing argument : fixtureDef ";
    var me = this;
    this.bodyDef = Thing.newBodyDef();
    if (bodyDef) Object.extend(this.bodyDef, bodyDef);

    //set position
    //this.bodyDef.position.x /= Simulation.SCALE;
    //this.bodyDef.position.y /= Simulation.SCALE;
    this.bodyDef.position.Multiply(1/Simulation.SCALE);

    this.fixtureDef = [];
    //var def;
    //Array.each(fixtureDef, function () {
    //    def = Thing.newFixtureDef();
    //    if (this.def) Object.extend(def, this);
    //
    //    //create shape
    //    //switch (this.shapeType) {
    //    //    case ShapeType.rect:
    //    //        fdef.shape = new b2PolygonShape();
    //    //        fdef.shape.SetAsBox(this.hw / Simulation.SCALE, this.hh / Simulation.SCALE);
    //    //        break;
    //    //    case  ShapeType.circle:
    //    //        fdef.shape = new b2CircleShape(this.radius / Simulation.SCALE);
    //    //        break;
    //    //}
    //
    //    me.fixtureDef.push(def);
    //});

    this.body = null;
    return this;
}
Thing.prototype = {
    //render: function (x, y, angle) {
    //}
    setRender:function(fn){
        this.bodyDef.userData.render=fn;
    },
    addFixtureDef:function(fixtureDef){
        var def=Thing.newFixtureDef();
        Object.extend(def,fixtureDef);

        var shape=fixtureDef.shape;
        if(shape instanceof b2CircleShape){
            var radius=shape.GetRadius()/Simulation.SCALE;
            shape.SetRadius(radius);
        }
        if(shape instanceof b2PolygonShape){
            var localVertices = shape.GetVertices();
            Array.each(localVertices,function(){
                this.Multiply(1/Simulation.SCALE);
            });
        }

        this.fixtureDef.push(def);
    }
};
Thing.newBodyDef = function () {
    var def = new b2BodyDef();
    def.userData = new BodyUserData();
    return def;
};
Thing.newFixtureDef = function () {
    var def = new b2FixtureDef();
    def.density = 1.0;
    def.restitution = 0.2;//0.2
    def.friction = 0.5;//0.5
    def.userData = new FixtureUserData();
    return def;
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
function BodyUserData() {
    UserData.call(this);
    //if true then destroy the body
    this.destroy = false;
}
BodyUserData.prototype = new UserData();
BodyUserData.prototype.render = function (ctx, body) {
    console.log("render body");
};

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
//load image
//images{Array{string}}
//complete{function},fire when loaded
//Resource.loadImage = function (images, complete) {
//    var len = images.length;
//    var arrImg = [];
//    var img;
//    var index = 0;
//
//    function imgloaded() {
//        this.removeEventListener("load", imgloaded);
//        index++;
//        if (index === len && complete) complete(arrImg);
//    }
//
//    Array.each(images, function () {
//        img = document.createElement("img");
//        img.addEventListener("load", imgloaded);
//        img.src = this;
//        arrImg.push(img);
//    });
//};
Resource.load=function(res,complete){
    var len=0;
    var index=0;
    var result={};

    function imgLoaded(){
        this.removeEventListener("load",imgLoaded);
        index++;
        console.log("img loaded");
        if (index === len && complete) complete(result);
    }
    function audioLoaded(){
        this.removeEventListener("load",audioLoaded);
        index++;
        console.log("audio loaded");
        if (index === len && complete) complete(result);
    }

    if(res.images) {
        len+=res.images.length;
        result.images=[];
        var img;
        Array.each(res.images,function(){
            img=document.createElement("img");
            img.addEventListener("load",imgLoaded);
            img.src=this;
            result.images.push(img);
        });
    }
    if(res.audioes){
        len+=res.audioes.length;
        result.audioes=[];
        var audio;
        Array.each(res.audioes,function(){
            audio=document.createElement("audio");
            audio.addEventListener("canplay",audioLoaded);
            audio.src=this;
            result.audioes.push(audio);
        });
    }
};

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
(function () {
    /* javascript extend */
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

    //Array each
    Array.each = function (arr, fn) {
        var i = 0, len = arr.length;
        for (; i < len; i += 1) {
            fn.bind(arr[i])(i);
        }
    };

    //Number.random(min,max)
    Number.random = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    /*box2d short class name*/
    window["b2Vec2"] = Box2D.Common.Math.b2Vec2;
    window["b2Body"] = Box2D.Dynamics.b2Body;
    //window["b2BodyDef"] = Box2D.Dynamics.b2BodyDef;
    //window["b2FixtureDef"] = Box2D.Dynamics.b2FixtureDef;
    window["b2PolygonShape"] = Box2D.Collision.Shapes.b2PolygonShape;
    window["b2CircleShape"] = Box2D.Collision.Shapes.b2CircleShape;
    //window["b2ContactFilter"] = Box2D.Dynamics.b2ContactFilter;
    window["b2Math"] = Box2D.Common.Math.b2Math;
    //window["b2World"] = Box2D.Dynamics.b2World;

    /*event interface*/
    function IEvent() {
        this._events = {};
        this._eachEvts = [];
    }

    IEvent.prototype = {
        on: function (name, fn) {
            this._events[name] = fn;
            return this;
        },
        trigger: function (name, params) {
            if (this._events[name]) {
                this._events[name].apply(null, params);
            }
        },
        has: function (name) {
            if (this._events[name]) return true;
            return false;
        },
        get: function (name) {
            if (this._events[name]) return this._events[name];
            return function () {
            };
        },
        each: function (ms, fn, params) {
            if (!params) params = [];
            //var name=String.format("each_{0}",ms);
            this._eachEvts.push({
                dur: ms,
                start: 0,
                fn: fn,
                arg: params
            });
        },
        triggerEach: function () {
            Array.each(this._eachEvts, function () {
                var escape = Date.now() - this.start;
                if (escape >= this.dur) {
                    this.fn.apply(escape, this.arg);
                    this.start = Date.now();
                }
            });
        }
    };

    /*render interface*/
    function IRender() {
        this.render = [];
    }

    IRender.prototype = {
        addRender: function (fn, effects) {
            if (!effects) effects = [];
            this.render.push({
                f: fn,
                p: effects,
                destroy:false
            });
        },
        removeRender: function (index) {
            this.render.splice(index, 1);
        }
    };
    IRender.render = function (h, ctx, body) {
        var angle, pos,r;
        Array.each(h, function () {
            if(this.destroy) return;
            r=this;
            ctx.save();
            //apply effect
            Array.each(this.p, function () {
                this.run(r);
            });
            //draw
            if (body) {
                //rotate
                pos = body.GetPosition().Copy();
                angle = body.GetAngle();
                pos.Multiply(Simulation.SCALE);
                ctx.translate(pos.x, pos.y);
                ctx.rotate(angle);
                ctx.translate(-pos.x, -pos.y);
                //draw
                this.f.apply(ctx, [pos, angle]);
            }
            else {
                this.f.apply(ctx, []);
            }
            ctx.restore();
        });
    }

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
        if (!cfg.velocityIterations) cfg.velocityIterations = 2;//default
        if (!cfg.positionIterations) cfg.positionIterations = 1;//default
        //if(!cfg.setting.onRunning) cfg.setting.onRunning=function(){};
        this.setting = cfg;

        //events
        //this._events = {};
        IEvent.call(this);
        IRender.call(this);

        this._timer = null;
        //this.world = new b2World(this.setting.gravity, this.setting.allowSleep);
        this.world = new Box2D.Dynamics.b2World(this.setting.gravity, this.setting.allowSleep);
        //console.log(String.format("allow sleep :{0}",this.setting.allowSleep));

        //contact filter
        var contactFilter = new Box2D.Dynamics.b2ContactFilter();
        contactFilter.ShouldCollide = function (fixA, fixB) {
            if (me.has("ShouldCollide")) return me.trigger("ShouldCollide", [fixA, fixB]);
            else return true;
        };
        this.world.SetContactFilter(contactFilter);

        //contact listener
        var contactListener = new Box2D.Dynamics.b2ContactListener();
        contactListener.BeginContact = function (contact) {
            me.trigger("BeginContact", [contact]);
            //if (me._events["BeginContact"]) return me._events["BeginContact"](contact);
        };
        this.world.SetContactListener(contactListener);

        this.camera = null;

        //start time
        this.startTime = null;

        this.frame = 0;

        //dctx
        this.dctx = null;
        this._frameStart=null;
    }
    Simulation.prototype = {
        run: function () {

            this._frameStart=Date.now();

            if (this.status === 0) {
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
                this.trigger("stoped", [this.setting.ctx]);
                return;
            }

            this.frame++;

            //start time
            if (!this.startTime) {
                this.startTime = Date.now();
            }

            //on running
            this.trigger("running", []);
            this.triggerEach();

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
            if (this.dctx) {
                this.dctx.clearRect(cx, cy, this.setting.ctx.canvas.width, this.setting.ctx.canvas.height);
                this.world.DrawDebugData();
                //draw title
                this.dctx.fillText("Debugger", 0, 10);
            }

            //render event
            IRender.render(this.render, this.setting.ctx);

            //render body
            var body = this.world.GetBodyList();
            var userData;
            while (body) {
                userData = body.GetUserData();
                if (userData) {
                    userData.update(this.setting.ctx, body);
                }
                body = body.GetNext();
            }


            //clear all force
            this.world.ClearForces();

            //loop
            this._timer = setTimeout(this.run.bind(this), 1000*this.setting.step-(Date.now()-this._frameStart));
        },
        start: function () {
            this.status = 1;
            this.run();
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
            this.dctx = debuggerCtx;
            //debug draw
            var debugDraw = new Box2D.Dynamics.b2DebugDraw();
            debugDraw.SetSprite(debuggerCtx);
            debugDraw.SetAlpha(0.5);
            debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit);//| Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit
            debugDraw.SetDrawScale(Simulation.SCALE);
            this.world.SetDebugDraw(debugDraw);
        },
        setBackground: function (fn) {
            var c = this.setting.ctx.canvas;
            c.style.background = "-webkit-canvas(canvas-background)";
            var cssCtx = document.getCSSCanvasContext("2d", "canvas-background", c.width, c.height);
            if (fn) fn.apply(cssCtx);
        },
        getFPS: function () {
            var dur = this.getRunDuration() / 1000;
            return this.frame / dur;
        }
    };
    Simulation.getDeviceInfo=function(){
        var agent=navigator.userAgent;
        var result={};
        result.isAndroid=(/Android/).test(agent);
        result.isIphone=(/iPhone/).test(agent);
        result.isWeixin=(/MicroMessenger/).test(agent);
        return result;
    };
    Object.extend(Simulation.prototype, IEvent.prototype);//apply IEvent.prototype
    Object.extend(Simulation.prototype, IRender.prototype);//apply IRender.prototype

    Simulation["SCALE"] = 30;//default is 30
    Simulation["NOOP"] = function () {};
    Simulation["Effect"] = {};


    /*Camera
    camera size is same to canvas's size*/
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

    window["Camera"] = Camera;

    /*Thing
    bodyDef:#b2BodyDef*/
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
        on: function (name, fn) {
            this.bodyDef.userData.on(name, fn);
        },
        each: function (ms, fn, params) {
            this.bodyDef.userData.each(ms, fn, params);
        },
        addRender: function (fn, effects) {
            effects = effects ? effects : [];
            this.bodyDef.userData.addRender(fn, effects);
        },
        //Image,Canvas
        //{width:0,height:0}
        //{hw:0,hh:0}
        setAsBox: function (p, def) {
            var shape = new b2PolygonShape();
            var hw, hh;
            if (typeof(p.width) !== "undefined") {
                hw = p.width / 2;
                hh = p.height / 2;
            }
            else {
                hw /= Simulation.SCALE;
                hh /= Simulation.SCALE;
            }
            shape.SetAsBox(hw, hh);
            if (!def) def = {};
            Object.extend(def, {shape: shape});
            this.addFixtureDef(def);
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
    window["Thing"] = Thing;

    /*UserData*/
    function UserData() {
    }
    UserData.prototype = {};
    //body user data
    //events:update,render,apply
    function BodyUserData() {
        UserData.call(this);
        IEvent.call(this);
        IRender.call(this);
        //if true then destroy the body
        this.destroy = false;
    }
    BodyUserData.prototype = new UserData();
    Object.extend(BodyUserData.prototype, IEvent.prototype);
    Object.extend(BodyUserData.prototype, IRender.prototype);
    BodyUserData.prototype.update = function (ctx, body) {
        var me = this;
        //update
        this.trigger("update", [ctx, body]);
        this.triggerEach();
        IRender.render(this.render, ctx, body);
    };

    /*fixture user data
    //if the fixture have same layer and same type then do collision*/
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


    /*Resource*/
    function Resource() {
    }

    /*
     * res={Array{String}
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
    Resource.loadImage = function (res, complete, adjust, canvasSize, targetSize, processing) {
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

            var i = 0, len = result.length, img;
            for (; i < len; i++) {
                img = result[i];
                canvas = document.createElement("canvas");
                canvas.width = img.width * sx;
                canvas.height = img.height * sy;
                ctx = canvas.getContext("2d");

                ctx.save();
                ctx.scale(sx, sy);
                ctx.drawImage(img, 0, 0);
                ctx.restore();

                result[i] = canvas;
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

        if (res) {
            len += res.length;
            result = [];
            var img;
            Array.each(res, function () {
                img = document.createElement("img");
                img.addEventListener("load", imgLoaded);
                img.src = this;
                result.push(img);
            });
        }
    };

    /*
     * need to include audio.js
     * need to trigger touch activate audio on Android and IOS.in other word,activate audio when first touch
     * */
    Resource.loadAudio = function (res, complete) {
        function activateAudio(ad) {
            Array.each(ad, function () {
                this.pause();
            });
            document.removeEventListener("touchstart", activateAudio, false);
        }

        function append(src) {
            var eleA = document.createElement("audio");
            eleA.preload = "auto";
            var eleS = document.createElement("source");
            eleS.src = src;

            eleA.appendChild(eleS);

            document.body.appendChild(eleA);
        }

        //append
        Array.each(res, function () {
            append(this);
        });

        //create
        audiojs.events.ready(function () {
            var result = audiojs.createAll();
            //hide
            document.querySelector(".audiojs").style.display = "none";

            if (complete) complete(result);
        });
    };

    window["Resource"] = Resource;

    window["Effect"]={};
    /*Effect*/
    function Effect(ctx) {
        IEvent.call(this);
        this.ctx = ctx;
    }

    Effect.prototype = {
        run: Simulation.NOOP
    };
    Object.extend(Effect.prototype,IEvent.prototype);
    window.Effect["Effect"] = Effect;

    /*Fade effect*/
    function FadeEffect(ctx, origin, target, step, reverse) {
        Effect.call(this, ctx);
        this.flag = origin > target ? 1 : 0;//0:up,1:down
        this.alpha = origin;
        this.step = step;
        this.reverse = reverse;
        this.min = Math.min(origin, target);
        this.max = Math.max(origin, target);
    }

    FadeEffect.prototype = new Effect({});
    FadeEffect.prototype.run = function (render) {
        this.ctx.globalAlpha = this.alpha;

        if (this.flag === 0) {
            this.alpha += this.step;
            if (!this.reverse && this.alpha >= this.max) {
                this.alpha = this.max;
                this.trigger("stop",[render]);
            }
        }
        else {
            this.alpha -= this.step;
            if (!this.reverse && this.alpha <= this.min) {
                this.alpha = this.min;
                this.trigger("stop",[render]);
            }
        }
        if (this.reverse) {
            if (this.flag === 0) {
                if (this.alpha >= this.max) {
                    this.alpha = this.max;
                    this.flag = 1;
                }
            }
            else {
                if (this.alpha <= this.min) {
                    this.alpha = this.min;
                    this.flag = 0;
                }
            }
        }
    };

    window.Effect["FadeEffect"]=FadeEffect;

    /*Zoom effect*/
    function ZoomEffect(ctx, center, origin, target, step, reverse) {
        Effect.call(this, ctx);
        this.center = center;
        this.origin = origin;
        this.target = target;
        this.step = step;
        this.scale = origin;
        this.reverse = reverse;
        this.flag = origin > target ? 1 : 0;//0:up,1:down
        this.min = Math.min(origin, target);
        this.max = Math.max(origin, target);
    }

    ZoomEffect.prototype = new Effect({});
    ZoomEffect.prototype.run = function (render) {

        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.center.x, -this.center.y);

        if (this.flag === 0) {
            this.scale += this.step;
            if (!this.reverse && this.scale >= this.max) {
                this.scale = this.max;
                this.trigger("stop",[render]);
            }
        }
        else {
            this.scale -= this.step;
            if (!this.reverse && this.scale <= this.min) {
                this.scale = this.min;
                this.trigger("stop",[render]);
            }
        }


        //reverse
        if (this.reverse) {
            if (this.flag === 0) {
                if (this.scale >= this.max) {
                    this.scale = this.max;
                    this.flag = 1;
                }
            }
            else {
                if (this.scale <= this.min) {
                    this.scale = this.min;
                    this.flag = 0;
                }
            }
        }

    };

    window.Effect["ZoomEffect"] = ZoomEffect;



    window["Simulation"] = Simulation;
})();


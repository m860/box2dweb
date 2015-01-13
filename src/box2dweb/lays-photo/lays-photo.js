/**
 * Created by Jeanma on 2015/1/10.
 */
/*
 * 分数计算:
 *       根据目标的中心点和相框的中心点的距离计算分数
 *       满分 0<=distance<1
 * 相框:
 *       相框设置一定的速度运行,随着关卡的提升,运行速度逐渐变快;
 *       相框的运行范围是一个大的圆;
 *       运行路径就是碰撞反弹的路径
 * 停止相框:
 *       触摸点击停止运行,计算分数
 *  相框的绘制:
 *          比较麻烦.
 *
 * */

//draw center
//function drawCenter(ctx, body) {
//    var pos = body.GetPosition().Copy();
//    pos.Multiply(Simulation.SCALE);
//
//    ctx.save();
//    //ctx.globalAlpha=0.5;
//    ctx.fillStyle = "red";
//    ctx.beginPath();
//    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
//    ctx.fill();
//    ctx.restore();
//}

var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

var hw = canvas.width / 2;
var hh = canvas.height / 2;

//new simulation
var simulation;

var img;
var res;

Resource.load({
    images: ["res/1.jpg",
        "res/2.png",
        "res/3.png",
        "res/4.png",
        "res/5.png",
        "res/6.png",
        "res/7.png",
        "res/8.png",
        "res/9.png",
        "res/10.jpg",
        "res/11.jpg",
        "res/zero.png",//11
        "res/one.png",
        "res/two.png",
        "res/three.png",
        "res/four.png",
        "res/five.png",
        "res/six.png",
        "res/seven.png",
        "res/eight.png",
        "res/nine.png",
        "res/dot.png"//21
    ],
    audioes: ["http://www.w3school.com.cn/i/horse.ogg"]
}, function (result) {
    res = result;

    toStartPage();
});

function drawScore(ctx, left, top, score) {
    var scoreStr = new String(score);
    var i = 0, len = scoreStr.length;
    var index;
    for (; i < len; i++) {
        if (scoreStr[i] === ".") {
            index = 21;
        }
        else {
            index = parseInt(scoreStr[i]) + 11;
        }
        ctx.drawImage(res.images[index], left, top);
        left += 30;
    }
}

function initSimulation() {
    simulation = new Simulation({
        ctx: canvas.getContext("2d"),
        gravity: new b2Vec2(0, 0),
        allowSleep: false,
        step: 1 / 60
    });
    simulation.on("shouldcollide", function (fa, fb) {
        var ua = fa.GetUserData();
        var ub = fb.GetUserData();
        if (ua.layer === ub.layer && ua.type === ub.type) return true;
        return false;
    });
}

function toStartPage() {
    initSimulation();
    //text
    var txt = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, hh)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(res.images[1].width / 2, res.images[1].height / 2);
    txt.addFixtureDef({
        shape: shape
    });
    simulation.createThing(txt);

    var alphaStep = 1 / 30;
    var alpha = 0;
    var direction = 1;
    //rendering
    simulation.on("rendering", function (ctx) {
        ctx.drawImage(res.images[0], 0, 0);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(res.images[1], 180, 600);
        ctx.restore();
        if (alpha <= 0) direction = 1;
        if (alpha >= 1) direction = 0
        if (direction === 1) {
            alpha += alphaStep;
            alpha = alpha > 1 ? 1 : alpha;
        }
        else {
            alpha -= alphaStep;
            alpha = alpha < 0 ? 0 : alpha;
        }
    });

    //run
    simulation.run();

    function tap() {
        canvas.removeEventListener("click", tap);
        simulation.pause();
        toGamePage();
    }

    canvas.addEventListener("click", tap);
}
function toGamePage() {
    initSimulation();
    var V0, F, Vmax, Vstep;
    //V0 从屏幕上方到下方1.5s到达
    //V0=canvas.height/1.5;
    V0 = 100;
    Vmax = canvas.height / 0.5;
    Vstep = (Vmax - V0) / 8 / 60;

    //random v0 & set normalize
    var v0VecRandomUnit = new b2Vec2(Math.random() * 100, Math.random() * 100);
    v0VecRandomUnit.Normalize();

    //set vo value
    var v0Vec = v0VecRandomUnit.Copy();
    v0Vec.Multiply(V0);


    //random photo's position
    function randomPhotoPos() {
        var minX = res.images[2].width / 2;
        var maxX = canvas.width - minX;
        var minY = res.images[2].height / 2;
        var maxY = canvas.height - res.images[10].height - minY;
        return new b2Vec2(Number.random(minX, maxX), Number.random(minY, maxY));
    }

    //region
    var region = new Region(simulation, {
        width: canvas.width,
        height: canvas.height,
        center: {
            x: hw,
            y: hh
        }
    });
    //simulation.createThing(region)

    //button
    var btn = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, canvas.height - res.images[10].height / 2)
    });
    var shape = new b2PolygonShape();
    shape.SetAsBox(hw, res.images[10].height / 2);
    btn.addFixtureDef({
        shape: shape
    });
    btn.bodyDef.userData.id = "photo";
    simulation.createThing(btn);

    //photo
    var photo = new Thing({
        type: b2Body.b2_dynamicBody,
        position: randomPhotoPos(),
        fixedRotation: true
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(res.images[2].width / 2, res.images[2].height / 2);
    photo.addFixtureDef({
        shape: shape,
        restitution: 1,
        friction: 0
    });

    //frame
    var frame = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, (canvas.height - res.images[10].height) / 2)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(res.images[3].width / 2, res.images[3].height / 2);
    frame.addFixtureDef({
        shape: shape
    });
    frame.fixtureDef[0].userData.layer = 1;
    simulation.createThing(frame);
    simulation.createThing(photo);


    //logo
    var photoPos = photo.body.GetPosition().Copy();
    photoPos.Multiply(Simulation.SCALE);
    var logo = new Thing({
        type: b2Body.b2_dynamicBody,
        position: new b2Vec2(photoPos.x, photoPos.y - 50),
        linearVelocity: v0Vec.Copy()
        //fixedRotation:true
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(50, 50);
    logo.addFixtureDef({
        shape: shape
    });
    simulation.createThing(logo);

    //set F
    //var m=logo.body.GetMass()+photo.body.GetMass();
    //var t=8.0/60.0;

    //F=(m*(Vmax-V0))/t;
    //console.log(String.format("F={0}",F));
    //console.log(String.format("logo speed : {0},{1},{2}",logo.body.GetLinearVelocity().x,logo.body.GetLinearVelocity().y,logo.body.GetLinearVelocity().Length()));

    //link photo and logo
    var weldJointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
    weldJointDef.Initialize(photo.body, logo.body, photo.body.GetWorldCenter());
    simulation.world.CreateJoint(weldJointDef);


    var startTime4;

    //running
    simulation.on("running", function () {
        //var vec=logo.body.GetLinearVelocity();
        //var len=vec.Length();
        //var unit=vec.Copy();
        //unit.Normalize();
        //unit.Multiply(F);
        //if(len<Vmax) {
        //    logo.body.ApplyForce(unit, logo.body.GetWorldCenter());
        //}
        //console.log(String.format("x={0},y={1},len={2}",vec.x,vec.y,len));
        //var logoV=logo.body.GetLinearVelocity().Copy();
        //var len=logoV.Length();
        //console.log(String.format("logo current speed length :{0}",len));
        //if(len<Vmax){
        //    len+=Vstep;
        //
        //    logoV=v0unitVec.Copy();
        //    console.log(String.format("logo current speed length2 :{0},logoV={1}",len,logoV.Length()));
        //    logoV.Multiply(len);
        //    //logoV.Multiply(Vstep);
        //    //logoV.Add(v0unitVec);
        //    //logo.body.SetLinearVelocity(logoV);
        //    console.log(String.format("current length : {0}",logoV.Length()));
        //}

        //each 4 second
        var dur = Date.now() - startTime4;
        if (dur >= 4000) {
            startTime4 = Date.now();
            var pos1 = frame.body.GetPosition();
            var pos2 = logo.body.GetPosition();
            var directionVec = new b2Vec2(pos1.x - pos2.x, pos1.y - pos2.y);
            var val = logo.body.GetLinearVelocity().Length();
            directionVec.Normalize();
            directionVec.Multiply(val);

            photo.body.SetLinearVelocity(directionVec);
            logo.body.SetLinearVelocity(directionVec);
        }
    });

    //rendering
    simulation.on("rendering", function (ctx) {
        //draw background
        ctx.drawImage(res.images[9], 0, 0);

        //draw btn
        ctx.drawImage(res.images[10], 0, canvas.height - res.images[10].height);

        //draw photo
        var pos = photo.body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);
        var left = pos.x - res.images[2].width / 2;
        var top = pos.y - res.images[2].height / 2;
        ctx.drawImage(res.images[2], left, top);

        //draw logo
        //pos = logo.body.GetPosition().Copy();
        //pos.Multiply(Simulation.SCALE);
        //ctx.fillRect(pos.x - 25, pos.y - 25, 50, 50);
        //drawCenter(ctx, logo.body);

        //draw frame
        pos = frame.body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);
        ctx.drawImage(res.images[3], pos.x - res.images[3].width / 2, pos.y - res.images[3].height / 2);
        //renderRectangle(ctx,frame.body);
        //drawCenter(ctx, frame.body);
    });

    startTime4 = Date.now();
    //run
    simulation.run();

    var mouseX, mouseY;

    function mouseDown(evt) {
        mouseX = evt.clientX;
        mouseY = evt.clientY;
        //console.log(String.format("mouse position : {0},{1}", mouseX, mouseY));

        //find body
        var mouseBody = simulation.getBodyAtMouse(mouseX, mouseY);
        if (mouseBody) {
            var userData = mouseBody.GetUserData();
            if (userData) {
                var id = userData.id;
                if (id === "photo") {
                    //console.log("-->Action photo");
                    simulation.pause();
                    canvas.removeEventListener("mousedown", mouseDown);
                    //calculate score
                    var logoPos = logo.body.GetPosition().Copy();
                    logoPos.Multiply(Simulation.SCALE);
                    var framePos = frame.body.GetPosition().Copy();
                    framePos.Multiply(Simulation.SCALE);
                    var lenVec = new b2Vec2(framePos.x - logoPos.x, framePos.y - logoPos.y);
                    var len = lenVec.Length();
                    var score = (10000 - len) / 100.00;
                    if (len > 10000) score = 0.00;
                    //console.log(String.format("score:{0},{1}", score, score.toFixed(2)));
                    toStop(score.toFixed(2));
                }
            }
        }
    }

    canvas.addEventListener("mousedown", mouseDown);
}

function toStop(score) {
    initSimulation();
    //share button
    var shareButton = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, score >= 100 ? (416 + res.images[5].height / 2) : (416 + res.images[8].height / 2))
    });
    var shape = new b2PolygonShape();
    if (score >= 100) {
        shape.SetAsBox(res.images[5].width / 2, res.images[5].height / 2);
        shareButton.bodyDef.userData.id = "share_success";
    }
    else {
        shape.SetAsBox(res.images[8].width / 2, res.images[8].height / 2);
        shareButton.bodyDef.userData.id = "share_fail";
    }
    shareButton.addFixtureDef({
        shape: shape
    });

    simulation.createThing(shareButton);

    //again button
    var againButton = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, 486 + res.images[6].height / 2)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(res.images[6].width / 2, res.images[6].height / 2);
    againButton.bodyDef.userData.id = "again";
    againButton.addFixtureDef({
        shape: shape
    });
    simulation.createThing(againButton);

    //buy button
    var buyButton = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(hw, 345 + res.images[7].height / 2)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(res.images[7].width / 2, res.images[7].height / 2);
    buyButton.bodyDef.userData.id = "buy";
    buyButton.addFixtureDef({
        shape: shape
    });

    simulation.createThing(buyButton);

    simulation.on("rendering", function (ctx) {
        //draw background
        ctx.drawImage(res.images[9], 0, 0);
        //draw title
        ctx.drawImage(res.images[4], (canvas.width - res.images[4].width) / 2, 100);
        //TODO draw scroe
        if(score==100){
            drawScore(ctx, 195, 215, 100);
        }
        else{
            drawScore(ctx, 170, 215, score);
        }


        //draw buy button
        if (score < 100) {
            ctx.drawImage(res.images[7], (canvas.width - res.images[7].width) / 2, 345);
        }
        //draw share button
        if (score >= 100) {
            ctx.drawImage(res.images[5], (canvas.width - res.images[5].width) / 2, 416);
        }
        else {
            ctx.drawImage(res.images[8], (canvas.width - res.images[8].width) / 2, 416);
        }
        //draw again button
        ctx.drawImage(res.images[6], (canvas.width - res.images[6].width) / 2, 486);

        //debugger
        //renderRectangle(ctx,shareButton.body);
        //renderRectangle(ctx,againButton.body);
        //renderRectangle(ctx,buyButton.body);
    });

    //run
    simulation.run();

    function mouseDown(evt) {
        mouseX = evt.clientX;
        mouseY = evt.clientY;
        //console.log(String.format("mouse position : {0},{1}", mouseX, mouseY));

        //find body
        var mouseBody = simulation.getBodyAtMouse(mouseX, mouseY);
        if (mouseBody) {
            var userData = mouseBody.GetUserData();
            if (userData) {
                var id = userData.id;
                if (id === "again") {
                    canvas.removeEventListener("mousedown", mouseDown);
                    toGamePage();
                }
                if (id === "share_success") {
                    alert("share success");
                }
                if (id === "share_fail") {
                    alert("share fail");
                }
            }
        }
    }

    canvas.addEventListener("mousedown", mouseDown);
}
//
//function render(ctx, body) {
//    var fixture = body.GetFixtureList();
//    while (fixture) {
//        var shape = fixture.GetShape();
//        if (!shape) return;
//        var radius = shape.GetRadius() * Simulation.SCALE;
//        //ctx.arc(x, y, radius, startAngle, endAngle [, anticlockwise ] )
////        console.log(String.format("radius:{0}",radius));
//        var pos = body.GetPosition().Copy();
////        console.log(String.format("position:{0},{1}",pos.x,pos.y));
//        pos.Multiply(Simulation.SCALE);
////        console.log(String.format("position:{0},{1}",pos.x,pos.y));
//        ctx.beginPath();
//        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
//        ctx.stroke();
//
//        //draw center
//        ctx.beginPath();
//        ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
//        ctx.stroke();
//        fixture = fixture.GetNext();
//    }
//}
//
//function renderFrame(ctx, body) {
//    var fixture = body.GetFixtureList();
//    while (fixture) {
//        var shape = fixture.GetShape();
//        if (!shape) return;
//        var radius = shape.GetRadius() * Simulation.SCALE;
//        //ctx.arc(x, y, radius, startAngle, endAngle [, anticlockwise ] )
////        console.log(String.format("radius:{0}",radius));
//        var pos = body.GetPosition().Copy();
////        console.log(String.format("position:{0},{1}",pos.x,pos.y));
//        pos.Multiply(Simulation.SCALE);
////        console.log(String.format("position:{0},{1}",pos.x,pos.y));
//        ctx.save();
//        ctx.beginPath();
//        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
//        ctx.clip();
//        ctx.drawImage(img, 0, 0);
//        ctx.restore();
//        //draw center
//        ctx.beginPath();
//        ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
//        ctx.stroke();
//        fixture = fixture.GetNext();
//    }
//}


//cfg.width
//cfg.height
//cfg.center
function Region(sim, cfg) {
    this.simulation = sim;
    this.setting = cfg;

    var hw = cfg.width / 2;
    var hh = cfg.height / 2;

    var shape;

    var left = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(cfg.center.x - hw - 5, cfg.center.y)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(5, hh);
    left.addFixtureDef({shape: shape});
    left.bodyDef.userData.render = this.render;
    sim.createThing(left);

    var right = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(cfg.center.x + hw + 5, cfg.center.y)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(5, hh);
    right.addFixtureDef({shape: shape});
    right.bodyDef.userData.render = this.render;
    sim.createThing(right);

    var top = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(cfg.center.x, cfg.center.y - hh - 5)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(hw, 5);
    top.addFixtureDef({shape: shape});
    top.bodyDef.userData.render = this.render;
    sim.createThing(top);

    var bottom = new Thing({
        type: b2Body.b2_staticBody,
        position: new b2Vec2(cfg.center.x, cfg.center.y + hh + 5)
    });
    shape = new b2PolygonShape();
    shape.SetAsBox(hw, 5);
    bottom.addFixtureDef({shape: shape});
    bottom.bodyDef.userData.render = this.render;
    sim.createThing(bottom);
}
Region.prototype = {
    render: function (ctx, body) {
        var xf = body.GetTransform();
        var fixture = body.GetFixtureList();
        while (fixture) {
            var shape = fixture.GetShape();
            if (!shape) return;
            var vertexCount = parseInt(shape.GetVertexCount());
            var localVertices = shape.GetVertices();
            var p;
            var isMove = false;
            ctx.beginPath();
            Array.each(localVertices, function () {
                p = b2Math.MulX(xf, this);
//                    p=body.GetWorldPoint(this);
                if (!isMove) {
                    isMove = true;
                    ctx.moveTo(p.x * Simulation.SCALE, p.y * Simulation.SCALE);
                }
                else {
                    ctx.lineTo(p.x * Simulation.SCALE, p.y * Simulation.SCALE);
                }
            });
            ctx.closePath();
            ctx.stroke();

            fixture = fixture.GetNext();
        }

        //drawCenter(ctx,body);
    }
};

//var region = new Region(simulation, {
//    width: 200,
//    height: 200,
//    center: {x: 200, y: 150}
//});
//
//var goal = new Thing({
//    type: b2Body.b2_staticBody,
//    position: new b2Vec2(200, 150)
//});
//goal.addFixtureDef({shape: new b2CircleShape(5)});
//goal.bodyDef.userData.render = render;
////    var index=100;
//Array.each(goal.fixtureDef, function () {
//    this.userData.type = 0x00000001;
//});
//simulation.createThing(goal);
//
//var frame = new Thing({
//    type: b2Body.b2_dynamicBody,
//    position: new b2Vec2(250, 150)
//    , linearVelocity: new b2Vec2(10, 3)
//});
//frame.addFixtureDef({
//    shape: new b2CircleShape(30),
//    restitution: 1,
//    friction: 0
//});
////    frame.fixtureDef[0].restitution=1;
////    frame.fixtureDef[0].friction=0;
//frame.bodyDef.userData.render = renderFrame;
////    frame.fixtureDef[0].userData.type=0x00000001;
//
//simulation.createThing(frame);
//    frame.body.ApplyForce(new b2Vec2(1,1.1),frame.body.GetPosition());
//input
//var input = new Input();

//on running
//simulation.on("running", function () {
////    var pos = frame.body.GetPosition();
////
////    if (input.isKeyDown(Input.a)) {
////        pos.x -= 1 / Simulation.SCALE;
////    }
////    if (input.isKeyDown(Input.d)) {
////        pos.x += 1 / Simulation.SCALE;
////    }
////    if (input.isKeyDown(Input.w)) {
////        pos.y -= 1 / Simulation.SCALE;
////    }
////    if (input.isKeyDown(Input.s)) {
////        pos.y += 1 / Simulation.SCALE;
////    }
//////        frame.body.SetActive(true);
////    frame.body.SetPosition(pos);
//
////
//}).on("shouldcollide", function (fa, fb) {
////        console.log(String.format("fa type :{0}, fb type:{1}",fa.GetUserData().type,fb.GetUserData().type));
//    var ua = fa.GetUserData();
//    var ub = fb.GetUserData();
//    if (ua.layer === ub.layer && ua.type === ub.type) return true;
//    return false;
//});


//Resource.loadImage(["http://photocdn.sohu.com/20140516/Img399641351.jpg"],
//    function (images) {
//        img = images[0];
//        //draw img
//        simulation.on("rendering", function (ctx) {
//            ctx.save();
//            ctx.globalAlpha = 0.3;
//            ctx.fillStyle = "black";
//            ctx.drawImage(img, 0, 0);
//            ctx.restore();
//        });
//
//        simulation.run();
//    });

//function caculateScore() {
//    simulation.pause();
//
//    var pos1 = goal.body.GetPosition().Copy();
//    pos1.Multiply(Simulation.SCALE);
//    var pos2 = frame.body.GetPosition().Copy();
//    pos2.Multiply(Simulation.SCALE);
//    var distance = Math.sqrt(Math.pow(pos2.y - pos1.y, 2) + Math.pow(pos2.x - pos1.x, 2));
//    console.log(String.format("distance:{0}", distance));
//}
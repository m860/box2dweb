var canvas = document.querySelector("#canvas");
var debugCanvas = document.querySelector("#canvas2");

var ctx = canvas.getContext("2d");
var debugCtx=debugCanvas.getContext("2d");

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
    ]//, audioes: ["res/photo.mp3"]
    //http://fjdx.sc.chinaz.com/Files/DownLoad/sound/huang/cd9/mp3/110.mp3
    //http://www.w3school.com.cn/i/horse.ogg
    //  /android_asset/www/res/photo.ogg
}, function (result) {
    res = result;

    toStartPage();
}, true, {
    width: canvas.width,
    height: canvas.height
}, {
    width: 480,
    height: 800
});

function drawScore(ctx, score) {
    var left, top = 100 + 85;
    var scoreStr = new String(score);
    var i = 0, len = scoreStr.length;
    left = (window.innerWidth - (len * res.images[11].width)) / 2;
    var index;
    for (; i < len; i++) {
        if (scoreStr[i] === ".") {
            index = 21;
        }
        else {
            index = parseInt(scoreStr[i]) + 11;
        }
        ctx.drawImage(res.images[index], left, top);
        left += res.images[11].width;
    }
}

function initSimulation() {
    simulation = new Simulation({
        ctx: ctx,
        gravity: new b2Vec2(0, 0),
        allowSleep: true,
        step: 1 / 16
    });
    simulation.setDebugger(debugCtx);
    simulation.on("ShouldCollide", function (fa, fb) {
        var ua = fa.GetUserData();
        var ub = fb.GetUserData();
        if (ua.layer === ub.layer && ua.type === ub.type) return true;
        return false;
    });
}

function toStartPage() {
    initSimulation();

    //text
//    var txt = new Thing({
//        type: b2Body.b2_staticBody,
//        position: new b2Vec2(hw, hh)
//    });
//    shape = new b2PolygonShape();
//    shape.SetAsBox(res.images[1].width / 2, res.images[1].height / 2);
//    txt.addFixtureDef({
//        shape: shape
//    });
//    simulation.createThing(txt);
//
//    var alphaStep = 1 / 30;
//    var alpha = 0;
//    var direction = 1;
//    //rendering
//    simulation.on("rendering", function (ctx) {
//
//        //draw start image
//        //ctx.save();
//        //ctx.scale(scaleX,scaleY);
//        ctx.drawImage(res.images[0], 0, 0);
//        //ctx.restore();
//
//        ctx.save();
////        ctx.scale(scaleX, scaleY);
//        ctx.globalAlpha = alpha;
//        ctx.drawImage(res.images[1], 180, 600);
//        ctx.restore();
//        if (alpha <= 0) direction = 1;
//        if (alpha >= 1) direction = 0
//        if (direction === 1) {
//            alpha += alphaStep;
//            alpha = alpha > 1 ? 1 : alpha;
//        }
//        else {
//            alpha -= alphaStep;
//            alpha = alpha < 0 ? 0 : alpha;
//        }
//
//    });

    simulation.setBackground(function(){
        //draw background
        this.drawImage(res.images[0],0,0);
    });

    var flickEffect=new FadeEffect(ctx,(1/1)*simulation.setting.step);
    simulation.addRender(function(){
        this.drawImage(res.images[1], canvas.width/2-res.images[1].width/2, 600*Resource.scale.y);
    },[flickEffect]);

    //run
    simulation.start();

    function tap() {
        canvas.removeEventListener("click", tap);
        simulation.stop();
        toGamePage();
    }

    canvas.addEventListener("click", tap);
}
function toGamePage() {
    initSimulation();

    //set vo value
    var v0Vec = new b2Vec2(Math.random() * 10, Math.random() * 10);
    v0Vec.Normalize();
    v0Vec.Multiply(50);


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
        linearVelocity: v0Vec.Copy(),
        angularVelocity: 10
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
    shape.SetAsBox((res.images[3].width / 2) , (res.images[3].height / 2) );
    frame.addFixtureDef({
        shape: shape
    });
    frame.fixtureDef[0].userData.layer = 1;
    simulation.createThing(frame);
    simulation.createThing(photo);

    function getLogoPos() {
        var pos = photo.body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);
        return new b2Vec2(pos.x / Simulation.SCALE, (pos.y - 50) / Simulation.SCALE)
    }


    //logo
    //var photoPos = photo.body.GetPosition().Copy();
    //photoPos.Multiply(Simulation.SCALE);
    //var logo = new Thing({
    //    type: b2Body.b2_dynamicBody,
    //    position: new b2Vec2(photoPos.x, photoPos.y - 50),
    //    linearVelocity: v0Vec.Copy()
    //    //fixedRotation:true
    //});
    //shape = new b2PolygonShape();
    //shape.SetAsBox(50, 50);
    //logo.addFixtureDef({
    //    shape: shape
    //});
    //simulation.createThing(logo);


    //link photo and logo
    //var weldJointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
    //weldJointDef.Initialize(photo.body, logo.body, photo.body.GetWorldCenter());
    //simulation.world.CreateJoint(weldJointDef);


    var startTime4;

    //running
    simulation.on("running", function () {
        //each 4 second
        var dur = Date.now() - startTime4;
        if (dur >= 4000) {
            startTime4 = Date.now();
            var pos1 = frame.body.GetPosition();
            var pos2 = getLogoPos();
            var directionVec = new b2Vec2(pos1.x - pos2.x, pos1.y - pos2.y);
            var val = photo.body.GetLinearVelocity().Length();
            directionVec.Normalize();
            directionVec.Multiply(val);

            photo.body.SetLinearVelocity(directionVec);
        }
    });

    //rendering
    simulation.on("rendering", function (ctx) {
        //draw background
        ctx.drawImage(res.images[9], 0, 0);

        //draw photo
        var pos = photo.body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);
        var left = pos.x - res.images[2].width / 2;
        var top = pos.y - res.images[2].height / 2;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(photo.body.GetAngle());
        ctx.translate(-left, -top);
        ctx.drawImage(res.images[2], left, top);
        ctx.restore();

        //draw mask
        ctx.save();
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.8;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();


        //draw btn
        ctx.drawImage(res.images[10], 0, canvas.height - res.images[10].height);


        //draw frame
        pos = frame.body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);

        //draw photo2
        var clipLeft = pos.x - res.images[3].width / 2;
        var clipTop = pos.y - res.images[3].height / 2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(clipLeft, clipTop);
        ctx.lineTo(clipLeft + res.images[3].width, clipTop);
        ctx.lineTo(clipLeft + res.images[3].width, clipTop + res.images[3].height);
        ctx.lineTo(clipLeft, clipTop + res.images[3].height);
        ctx.closePath();
        ctx.clip();
        ctx.translate(left, top);
        ctx.rotate(photo.body.GetAngle());
        ctx.translate(-left, -top);
        ctx.drawImage(res.images[2], left, top);
        ctx.restore();

        ctx.drawImage(res.images[3], pos.x - res.images[3].width / 2, pos.y - res.images[3].height / 2);

        //ctx.fillRect( pos.x - res.images[3].width / 2, pos.y - res.images[3].height / 2,res.images[3].width,res.images[3].height);

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

                    function calculateScore() {
                        //calculate score
                        var logoPos = getLogoPos();
                        logoPos.Multiply(Simulation.SCALE);
                        var framePos = frame.body.GetPosition().Copy();
                        framePos.Multiply(Simulation.SCALE);
                        var lenVec = new b2Vec2(framePos.x - logoPos.x, framePos.y - logoPos.y);
                        var len = lenVec.Length();

//                        var score = 100 - len;
//                        if (score < 0) score = 0;
//                        else if (score > 99.5) score = 100;

                        var score = (10000 - len) / 100.00;
                        if (len > 10000) score = 0.00;

                        return score.toFixed(2);
                    }

                    //play audio
                    function audioEnd() {
                        res.audioes[0].removeEventListener("ended", audioEnd);
                        //calculate score
                        toStop(calculateScore());
                    }
                    res.audioes[0].addEventListener("ended", audioEnd);
                    res.audioes[0].play();
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
        drawScore(ctx, score);


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
                    simulation.pause();
                    toGamePage();
                }
                if (id === "share_success") {
                    simulation.pause();
                    alert("share success");
                }
                if (id === "share_fail") {
                    simulation.pause();
                    alert("share fail");
                }
            }
        }
    }

    canvas.addEventListener("mousedown", mouseDown);
}


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

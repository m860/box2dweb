/**
 * Created by Jeanma on 2015/1/9.
 */
//render circle shape
function renderCircle(ctx, body) {
    var fixture = body.GetFixtureList();
    var angle=body.GetAngle();
    while (fixture) {
        var shape = fixture.GetShape();
        if (!shape) return;
        var radius = shape.GetRadius() * Simulation.SCALE;
        var pos = body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);

        ctx.save();
        //ctx.translate(pos.x,pos.y);
        //ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.globalAlpha=0.8;
        ctx.strokeStyle="green";
        ctx.stroke();
        ctx.restore();

        //draw center
        //ctx.beginPath();
        //ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
        //ctx.stroke();

        fixture = fixture.GetNext();
    }
}

//render rectangle shape
function renderRectangle(ctx, body) {
    var xf=body.GetTransform();
    var fixture = body.GetFixtureList();
    var angle=body.GetAngle();
    while (fixture) {
        var shape = fixture.GetShape();
        if (!shape) return;
        var localVertices = shape.GetVertices();
        var p;
        var isMove=false;
        var pos = body.GetPosition().Copy();
        pos.Multiply(Simulation.SCALE);
        ctx.save();
        //rotate canvas
        //ctx.translate(pos.x,pos.y);
        //ctx.rotate(angle);
        //ctx.translate(-pos.x,-pos.y);

        ctx.beginPath();
        Array.each(localVertices,function(){
            p=b2Math.MulX(xf, this);
            if(!isMove){
                isMove=true;
                ctx.moveTo(p.x*Simulation.SCALE, p.y*Simulation.SCALE);
            }
            else{
                ctx.lineTo(p.x*Simulation.SCALE, p.y*Simulation.SCALE);
            }
        });
        ctx.closePath();
        ctx.globalAlpha=0.8;
        ctx.strokeStyle="green";
        ctx.stroke();
        ctx.restore();

        fixture = fixture.GetNext();
    }
}
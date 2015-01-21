/**
 * Created by Jeanma on 2015/1/21.
 */

//#include Effect.js

function ZoomEffect(ctx, center, origin, target, step,reverse) {
    Effect.call(this, ctx);
    this.center = center;
    this.origin = origin;
    this.target = target;
    this.step = step;
    this.scale = origin;
    this.reverse=reverse;
    this.flag=origin > target ?1:0;//0:up,1:down
}
ZoomEffect.prototype = new Effect({});
ZoomEffect.prototype.run = function () {

    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(-this.center.x, -this.center.y);

    if(this.flag===0){
        this.scale += this.step;
        if(!this.reverse && this.scale>=this.target){
            this.scale =this.target;
        }
    }
    else{
        this.scale -= this.step;
        if(!this.reverse && this.scale<=this.target){
            this.scale =this.target;
        }
    }


    //reverse
    if(this.reverse){
        if(this.flag===0){
            if(this.scale>=this.target){
                this.scale=this.target;
                this.flag=1;
            }
        }
        else{
            if(this.scale<=this.origin){
                this.scale=this.origin;
                this.flag=0;
            }
        }
    }

};
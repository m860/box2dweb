/**
 * Created by Jeanma on 2015/1/21.
 */
//#include Effect.js
//flicker effect
function FadeEffect(ctx,origin,target, step,reverse) {
    Effect.call(this, ctx);
    this.origin = origin;
    this.target = target;
    this.flag=origin > target ?1:0;//0:up,1:down
    this.alpha = origin;
    this.step = step;
    this.reverse=reverse;
}
FadeEffect.prototype = new Effect({});
FadeEffect.prototype.run = function () {
    this.ctx.globalAlpha = this.alpha;

    if (this.flag === 0) {
        this.alpha += this.step;
        if(!this.reverse && this.alpha>=this.target){
            this.alpha=this.target;
        }
    }
    else {
        this.alpha -= this.step;
        if(!this.reverse && this.alpha<=this.target){
            this.alpha=this.target;
        }
    }
    if(this.reverse){
        if(this.flag===0){
            if(this.alpha>=this.target){
                this.alpha=this.target;
                this.flag=1;
            }
        }
        else{
            if(this.alpha<=this.origin){
                this.alpha=this.origin;
                this.flag=0;
            }
        }
    }
};
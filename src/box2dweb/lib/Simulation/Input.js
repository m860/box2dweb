/**
 * Created by Jeanma on 2015/1/21.
 */

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

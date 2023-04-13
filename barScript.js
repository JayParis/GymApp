var BarScript = pc.createScript('barScript');

var distX = 1;
var distY = 1;

BarScript.prototype.initialize = function(){
    console.log("this script is init");

    var touch = this.app.touch;
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }

    this.on('destroy', function() {
        touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);       
    }, this);
};

BarScript.prototype.update = function(dt){
    if (this.app.keyboard.wasPressed(pc.KEY_LEFT)) {
        console.log('Left Key Pressed');
        this.resizeBar();
    }

    barProgress = pc.math.lerp(barProgress, targetBarProgress, dt * 11.2);
    var progress = (distY * 0.5) + (distY * -barProgress); // 0 to 1
    this.entity.setPosition(0,(distY * 5) + progress,0);
};

UpdateBind.prototype.onTouchStart = function(event){
    this.resizeBar();
}

BarScript.prototype.resizeBar = function(){
    let width = document.getElementById('application').offsetWidth;
    let height = document.getElementById('application').offsetHeight;
    var topLeft = new pc.Vec3(camera.camera.screenToWorld(width,height,3));
    var bottomRight = new pc.Vec3(camera.camera.screenToWorld(0,0,3));

    //let dist = this.entity.getPosition().x - bottomRight.x.x; 
    distX = topLeft.x.x - bottomRight.x.x; 
    distY = topLeft.x.y - bottomRight.x.y; 
    plane.setLocalScale(distX,1,distY * 10);
    console.log(distX);
    console.log(distY);

    //var progress = (distY * 0.5) + (distY * -0.99);

    targetBarProgress += 0.1;

    //uiBox.setPosition(camera.camera.worldToScreen(width,height,3));
    
    uiBox.setPosition(1,1,0);
    text.element.text = window.devicePixelRatio;

    //uiBox.element.setPosition(0,0,0);

};
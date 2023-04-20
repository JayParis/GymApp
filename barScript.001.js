var BarScript = pc.createScript('barScript');

var distX = 1;
var distY = 1;

var unitSpace = 0;

var hasSetupUI = false;


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

    app.assets.loadFromUrl("./9SliceTest_256.png", "textureatlas", function (err, atlasAsset) {
        var spriteAsset = new pc.Asset('sprite asset', 'sprite');
        var atlas = atlasAsset.resource;
        atlas.setFrame('1', {
            rect: new pc.Vec4(0, 0, 256, 256),
            pivot: new pc.Vec2(0.5, 0.5),
            border: new pc.Vec4(35, 35, 35, 35) 
        });
        let sprite = new pc.Sprite(device, {
            renderMode: pc.SPRITE_RENDERMODE_TILED, //SPRITE_RENDERMODE_TILED
            atlas: atlas,
            frameKeys: ['1']
        });
        spriteAsset.resource = sprite;
        spriteAsset.loaded = true;

        uiBox.element.sprite = sprite;
        console.log("Sliced sprite loaded");
    });

    window.addEventListener('resize', () => this.resizeBar());
};

BarScript.prototype.update = function(dt){
    if (this.app.keyboard.wasPressed(pc.KEY_LEFT)) {
        console.log('Left Key Pressed');
        this.resizeBar();
    }

    if(this.app.mouse.wasPressed(pc.MOUSEBUTTON_LEFT)){
        targetBarProgress += 0.1;
        this.resizeBar();
    }

    barProgress = pc.math.lerp(barProgress, targetBarProgress, dt * 11.2);
    var progress = (distY * 0.5) + (distY * -barProgress); // 0 to 1
    this.entity.setPosition(0,(distY * 5) + progress,0);
};

BarScript.prototype.onTouchStart = function(event){
    targetBarProgress += 0.05;
    this.resizeBar();
}
BarScript.prototype.onTouchMove = function(event){
}

BarScript.prototype.setUpInterface = function(){

    uiBox2 = uiBox.clone();
    uiGroup.addChild(uiBox2);
    uiBox2.setLocalPosition(-15,120,0);
    //uiBox2.findComponents("element")[1].text = "+50"; //"+50"
    //console.log("GN " + uiBox2.findComponents("element")[1].text);

    //document.documentElement.requestFullScreen = document.documentElement.requestFullScreen || 
    //document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullScreen;
    //document.documentElement.requestFullscreen();

    device.fullscreen = true;

    hasSetupUI = true;
}

BarScript.prototype.resizeBar = function(){
    app.resizeCanvas();

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


    //var worldPos = this.entity.getPosition();
    var worldPos_C = camera.getPosition().add(new pc.Vec3(0,0,0));
    var screenPos_C = new pc.Vec3();
    camera.camera.worldToScreen(worldPos_C, screenPos_C);

    var pixelRatio = device.maxPixelRatio;
    screenPos_C.x *= pixelRatio;
    screenPos_C.y *= pixelRatio;

    var centerScreenPos = new pc.Vec3(
        ((screenPos_C.x / device.width) * 2) - 1, 
        ((1 - (screenPos_C.y / device.height)) * 2) - 1, 
        0);

    var worldPos_U = camera.getPosition().add(new pc.Vec3(0,1,0));
    var screenPos_U = new pc.Vec3();
    camera.camera.worldToScreen(worldPos_U, screenPos_U);

    screenPos_U.x *= pixelRatio;
    screenPos_U.y *= pixelRatio;

    var upperScreenPos = new pc.Vec3(
        ((screenPos_U.x / device.width) * 2) - 1, 
        ((1 - (screenPos_U.y / device.height)) * 2) - 1, 
        0);

    unitSpace = upperScreenPos.y - centerScreenPos.y;

    //let UBPos = new pc.Vec3(camera.camera.screenToWorld(width,height,3));
    //uiBox.setPosition(UBPos);
    //console.log(UBPos);
    //uiBox.element.anchor = new pc.Vec4(1.0, 0.15, 0.75, 0.0);
    //uiBox.element.margin = new pc.Vec4(0.0, 0.0, 0.0, 0.0);
    uiBox.setLocalPosition(-15,15,0);

    if(!hasSetupUI){
        this.setUpInterface();
    }

    //uiBox.setPosition(camera.camera.worldToScreen(width,height,3));
    
    //text.element.text = unitSpace;

    text.element.text = device.height;
    uiBox2.findComponents("element")[1].text = document.getElementById('application').offsetHeight;

    mat.color.set(0.16,0,0.95);
    mat.update();
    console.log("Colour set: " + mat.color);
    

};
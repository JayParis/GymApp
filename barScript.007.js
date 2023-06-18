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

    this.time = 0;
    var count = 0;
    appAssets.forEach(function (assetToLoad) {
        assetToLoad.ready(function (asset) {
            count++;
            app.assets.add(asset);
            if (count === appAssets.length) {
                // done
                console.log("ALL THE ASSETS HAVE LOADED");
            }
        });
        app.assets.load(assetToLoad);
    });

    window.addEventListener('resize', () => this.resizeBar());

    if(localStorage.getItem('kcal_value') === null){
        localStorage.setItem('kcal_value', 0);
    }else{
        //localStorage.setItem('kcal_value', 0);
        currentKcal = parseInt(localStorage.getItem('kcal_value'));
    }

    if(localStorage.getItem('kcal_targetvalue') === null){
        localStorage.setItem('kcal_targetvalue', 3000);
    }else{
        //localStorage.setItem('kcal_value', 0);
        targetKcal = parseInt(localStorage.getItem('kcal_targetvalue'));
    }
};

BarScript.prototype.update = function(dt){
    if (this.app.keyboard.wasPressed(pc.KEY_LEFT)) {
        console.log('Left Key Pressed');
        this.resizeBar();
    }

    if(this.app.mouse.wasPressed(pc.MOUSEBUTTON_LEFT)){
        this.resizeBar();
    }

    targetBarProgress = pc.math.clamp(currentKcal / targetKcal, 0.001, 1);
    barProgress = pc.math.lerp(barProgress, targetBarProgress, dt * 11.2);
    var progress = (distY * 0.5) + (distY * -barProgress); // 0 to 1
    this.entity.setPosition(0,(distY * 5) + progress,0);

    if(hasSetupUI){
        this.time += dt;
            
        // Bounce value of t 0->1->0
        var t = (this.time * 0.1); // % 2
        if (t > 0) {
            t = 1 - (t - 1);
        }

        // Update the time value in the material
        this.material.setParameter('uTime', t);
    }
};

BarScript.prototype.onTouchStart = function(event){
    this.resizeBar();
}
BarScript.prototype.onTouchMove = function(event){
}

BarScript.prototype.setUpInterface = function(){
    var self = this;

    uiBox2 = uiBox.clone();
    uiBox3 = uiBox.clone();
    uiBoxCustomSub = uiBoxCustomAdd.clone();
    //uiBoxCustomAdd = uiBox.clone();

    uiGroup.addChild(uiBox2);
    uiGroup.addChild(uiBox3);
    uiGroup.addChild(uiBoxCustomAdd);
    uiGroup.addChild(uiBoxCustomSub);

    uiBox2.setLocalPosition(-15,145,0);
    uiBox3.setLocalPosition(-15,245,0);
    uiBoxCustomAdd.setLocalPosition(-20,350,0);
    uiBoxCustomAdd.element.texture = app.assets.find("addtex","texture").resource; //customaddtex

    app.assets.loadFromUrl("./ui-input-field.js", "script", function (err, asset) {
        uiBoxCustomAdd.addComponent("script");
        uiBoxCustomAdd.script.create("uiInputField",{
            attributes: {
                addSub: true,
            }
        });
    });

    uiBoxCustomSub.setLocalPosition(-102,350,0);
    uiBoxCustomSub.element.texture = app.assets.find("subtex","texture").resource; //customaddtex

    app.assets.loadFromUrl("./ui-input-field.js", "script", function (err, asset) {
        uiBoxCustomSub.addComponent("script");
        uiBoxCustomSub.script.create("uiInputField",{
            attributes: {
                addSub: false,
            }
        });
    });

    hiddenReset.setLocalPosition(0,-105,0);
    hiddenReset.addComponent('button', {
        imageEntity: hiddenReset,
        hoverTint: [0,0,0,0],
        pressedTint: [0,0,0,0],
        inactiveTint: [0,0,0,0],
    });
    hiddenReset.button.on('click', function(evt){
        currentKcal = 0;
        self.resizeBar();
    });
    //uiBox2.findComponents("element")[1].text = "+50"; //"+50"
    //console.log("GN " + uiBox2.findComponents("element")[1].text);

    //document.documentElement.requestFullScreen = document.documentElement.requestFullScreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullScreen;
    //document.documentElement.requestFullScreen();
    //iframe.requestFullScreen();
    //device.fullscreen = true;

    //const event = new Event("click");
    //console.log("FSCR_" + window.document.getElementById('fullscreen'));
    //window.goFullscreen();
    // SHADER CODE
    
    var vertexShader = app.assets.find("vertshader","shader").resource;
    var fragmentShader = "precision " + device.precision + " float;\n";
    fragmentShader = fragmentShader + app.assets.find("fragshader","shader").resource;
    var noiseTex = app.assets.find("noisetex","texture").resource;
    var foodTex = app.assets.find("foodtex","texture").resource;

    var shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        },
        vshader: vertexShader,
        fshader: fragmentShader
    };

    this.shader = new pc.Shader(device, shaderDefinition);
    this.material = new pc.Material();
    this.material.shader = this.shader;

    this.material.setParameter('uTime', 0);
    this.material.setParameter('uDiffuseMap', foodTex);
    this.material.setParameter('uHeightMap', noiseTex);

    var renders = this.entity.findComponents('render');
    console.log("RENDERS: " + renders);

    for (var i = 0; i < renders.length; ++i) {
        var meshInstances = renders[i].meshInstances;
        for (var j = 0; j < meshInstances.length; j++) {
            meshInstances[j].material = this.material;
        }
    }
    

    console.log("Parent " + parent.document.getElementById('fullscreen'));

    const addButton = new pc.Entity('addButton');
    addButton.addComponent('element', {
        type: pc.ELEMENTTYPE_IMAGE,
        anchor: new pc.Vec4(1.0, 0.5, 1.0, 0.5),
        width: 55,
        height: 55,
        //margin: new pc.Vec4(0.0, 0.0, 0.0, 0.0),
        pivot: new pc.Vec2(0.5, 0.5), 
        useInput: true,
        texture: app.assets.find("addtex").resource,
    });
    topText.addChild(addButton);
    addButton.setLocalPosition(45,0,0);


    const subButton = new pc.Entity('subButton');
    subButton.addComponent('element', {
        type: pc.ELEMENTTYPE_IMAGE,
        anchor: new pc.Vec4(0.0, 0.5, 0.0, 0.5),
        width: 55,
        height: 55,
        //margin: new pc.Vec4(0.0, 0.0, 0.0, 0.0),
        pivot: new pc.Vec2(0.5, 0.5), 
        useInput: true,
        texture: app.assets.find("subtex").resource,
    });
    topText.addChild(subButton);
    subButton.setLocalPosition(-45,0,0);//85

    addButton.addComponent('button', {
        imageEntity: addButton,
    });
    subButton.addComponent('button', {
        imageEntity: subButton,
    });
    /*
    uiBoxCustomAdd.addComponent('button', {
        imageEntity: uiBoxCustomAdd,
    });
    */

    uiBox.button.on('click', function(evt){
        //targetBarProgress += 0.1;
        currentKcal += 100;
        self.resizeBar();
    });
    uiBox2.button.on('click', function(evt){
        //targetBarProgress += 0.05;
        currentKcal += 50;
        self.resizeBar();
    });
    uiBox3.button.on('click', function(evt){
        //targetBarProgress += 0.05;
        currentKcal += 25;
        self.resizeBar();
    });

    addButton.button.on('click', function(evt){
        targetKcal += 50;
        self.resizeBar();
    });
    subButton.button.on('click', function(evt){
        targetKcal -= 50;
        self.resizeBar();
    });
    /*
    uiBoxCustomAdd.button.on('click', function(evt){
        console.log("Custom button clicked");
    });
    */
    //FULLSCREEN BUTTON
    /*
    uiBox.button.on('click', function(evt){
        console.log(evt);
        console.log("Button Clicked");
        const goFullEvent = new Event("gofull");
        parent.document.getElementById('fullscreen').dispatchEvent(goFullEvent);
    });
    */
    hasSetupUI = true;
}

BarScript.prototype.resizeBar = function() {
    app.resizeCanvas();
    currentKcal = pc.math.clamp(currentKcal, 0, targetKcal);

    let width = document.getElementById('application').offsetWidth;
    let height = document.getElementById('application').offsetHeight;
    var topLeft = new pc.Vec3(camera.camera.screenToWorld(width,height,3));
    var bottomRight = new pc.Vec3(camera.camera.screenToWorld(0,0,3));

    //let dist = this.entity.getPosition().x - bottomRight.x.x; 
    distX = topLeft.x.x - bottomRight.x.x; 
    distY = topLeft.x.y - bottomRight.x.y; 
    plane.setLocalScale(distX,1,distY * 10);

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
    uiBox.setLocalPosition(-15,45,0);

    if(!hasSetupUI){
        this.setUpInterface();
    }

    //uiBox.setPosition(camera.camera.worldToScreen(width,height,3));
    
    //text.element.text = unitSpace;

    text.element.text = "+100"; // device.height + "v"
    uiBox2.findComponents("element")[1].text = "+50"; // document.getElementById('application').offsetHeight + "v2"
    uiBox3.findComponents("element")[1].text = "+25"; // document.getElementById('application').offsetHeight + "v2"

    topText.setLocalPosition(0,-105,0); //-45
    subText.setLocalPosition(0,-15,0);
    topText.element.text = targetKcal + " kcal";
    subText.element.text = currentKcal + " kcal";

    localStorage.setItem('kcal_value', currentKcal);
    localStorage.setItem('kcal_targetvalue', targetKcal);
    
    //mat.color.set(0.9882,0.83921,0.2196);
    //mat.update();
    //console.log("Colour set: " + mat.color);
    
};

function CustomValueEntered(val, addOrSub) {
    let finalVal = parseInt(val);
    if(isNaN(finalVal) || finalVal == null)
        return;

    currentKcal += (finalVal * (addOrSub ? 1 : -1));
    BarScript.prototype.resizeBar();
    console.log("Custom value: " + val + " AddSub: " + addOrSub);
}
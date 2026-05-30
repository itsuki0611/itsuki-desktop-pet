/**
 * PixiJS Application 初始化
 * 建立透明背景的 PixiJS 畫布
 */

var _pixiApp = null;

async function createPixiApp(canvas, width, height) {
  if (!width) width = window.innerWidth;
  if (!height) height = window.innerHeight - 50; // 留空間給網址列

  _pixiApp = new PIXI.Application({
    view: canvas,
    width: width,
    height: height,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  _pixiApp.renderer.background.color = 'transparent';

  // 視窗大小改變時自動調整
  window.addEventListener('resize', () => {
    _pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
  });

  return _pixiApp;
}

function getPixiApp() {
  return _pixiApp;
}

/** 建立 PixiJS 容器層級結構 */
function createLayers() {
  var layers = {
    back: new PIXI.Container(),
    body: new PIXI.Container(),
    head: new PIXI.Container(),
    face: new PIXI.Container(),
    hair: new PIXI.Container(),
    front: new PIXI.Container(),
  };

  _pixiApp.stage.addChild(layers.back);
  _pixiApp.stage.addChild(layers.body);
  _pixiApp.stage.addChild(layers.head);
  _pixiApp.stage.addChild(layers.hair);
  _pixiApp.stage.addChild(layers.face);
  _pixiApp.stage.addChild(layers.front);

  return layers;
}

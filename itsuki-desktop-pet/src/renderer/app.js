/**
 * 中野五月 桌面夥伴 — 主程式
 * Phase 3: 語音對話系統
 */

// Debug helper
function debug(msg) {
  console.log(msg);
  const el = document.getElementById('debug-log');
  if (el) el.innerHTML += msg + '<br>';
}

let app, character, idleController;
let conversation, chatOverlay, inputBar;
let ttsManager, sttManager, voicePipeline, lipSync;
let visionPipeline;
let musicPlayer;

// === 五月角色建立 ===
function createItsuki() {
  const root = new PIXI.Container();
  const cx = 210, cy = 350;

  root._eyeOpen = 1;
  root._breathScale = 1;
  root._bounceOffset = 0;
  root._lookOffset = 0;

  const backLayer = new PIXI.Container();
  const bodyLayer = new PIXI.Container();
  const headLayer = new PIXI.Container();
  const frontHairLayer = new PIXI.Container();
  root.addChild(backLayer, bodyLayer, headLayer, frontHairLayer);

  // --- 後髮 ---
  const backHair = new PIXI.Graphics();
  backHair.beginFill(0x7A5230);
  backHair.drawRoundedRect(cx - 22, cy + 15, 18, 150, 10);
  backHair.drawRoundedRect(cx + 4, cy + 15, 18, 150, 10);
  backHair.endFill();
  backLayer.addChild(backHair);

  // --- 身體 ---
  const body = new PIXI.Graphics();
  body.beginFill(0xF5F0E8);
  body.drawRoundedRect(cx - 45, cy + 25, 90, 100, 15);
  body.endFill();
  body.beginFill(0xCC4444);
  body.drawEllipse(cx, cy + 35, 12, 8);
  body.endFill();
  body.beginFill(0x3C5A8A);
  body.moveTo(cx - 48, cy + 105);
  body.lineTo(cx - 55, cy + 135);
  body.lineTo(cx + 55, cy + 135);
  body.lineTo(cx + 48, cy + 105);
  body.closePath();
  body.endFill();
  bodyLayer.addChild(body);
  root._bodyGraphics = body;

  // --- 臉 ---
  const face = new PIXI.Graphics();
  face.beginFill(0xFFF5E6);
  face.drawEllipse(cx, cy - 55, 70, 80);
  face.endFill();
  headLayer.addChild(face);

  // --- 腮紅 ---
  const blushGraphics = new PIXI.Graphics();
  headLayer.addChild(blushGraphics);
  root._blushGraphics = blushGraphics;
  function drawBlush(alpha) {
    blushGraphics.clear();
    blushGraphics.beginFill(0xFFB6C1, alpha);
    blushGraphics.drawEllipse(cx - 42, cy - 50, 14, 9);
    blushGraphics.drawEllipse(cx + 42, cy - 50, 14, 9);
    blushGraphics.endFill();
  }
  drawBlush(0.35);

  // --- 眼睛 ---
  const eyesGraphics = new PIXI.Graphics();
  headLayer.addChild(eyesGraphics);
  root._eyesGraphics = eyesGraphics;
  function drawEyes(openAmount) {
    eyesGraphics.clear();
    const eyeY = cy - 70;
    if (openAmount > 0.9) {
      eyesGraphics.beginFill(0x5B3A29);
      eyesGraphics.drawEllipse(cx - 25, eyeY, 12, 16);
      eyesGraphics.drawEllipse(cx + 25, eyeY, 12, 16);
      eyesGraphics.endFill();
      eyesGraphics.beginFill(0xFFFFFF);
      eyesGraphics.drawCircle(cx - 21, eyeY - 5, 4);
      eyesGraphics.drawCircle(cx + 29, eyeY - 5, 4);
      eyesGraphics.endFill();
    } else if (openAmount > 0.1) {
      const h = 16 * openAmount;
      eyesGraphics.beginFill(0x5B3A29);
      eyesGraphics.drawEllipse(cx - 25, eyeY, 12, h);
      eyesGraphics.drawEllipse(cx + 25, eyeY, 12, h);
      eyesGraphics.endFill();
    }
  }
  drawEyes(1);

  // --- 眉毛 ---
  const browsGraphics = new PIXI.Graphics();
  headLayer.addChild(browsGraphics);
  root._browsGraphics = browsGraphics;
  function drawBrows(style) {
    browsGraphics.clear();
    browsGraphics.lineStyle(2.5, 0x5B3A29);
    if (style === 'angry') {
      browsGraphics.moveTo(cx - 35, cy - 93);
      browsGraphics.lineTo(cx - 15, cy - 88);
      browsGraphics.moveTo(cx + 35, cy - 93);
      browsGraphics.lineTo(cx + 15, cy - 88);
    } else {
      browsGraphics.moveTo(cx - 37, cy - 90);
      browsGraphics.quadraticCurveTo(cx - 25, cy - 94, cx - 13, cy - 90);
      browsGraphics.moveTo(cx + 37, cy - 90);
      browsGraphics.quadraticCurveTo(cx + 25, cy - 94, cx + 13, cy - 90);
    }
  }
  drawBrows('normal');

  // --- 嘴巴 ---
  const mouthGraphics = new PIXI.Graphics();
  headLayer.addChild(mouthGraphics);
  root._mouthGraphics = mouthGraphics;
  function drawMouth(shape) {
    mouthGraphics.clear();
    if (shape === 'surprised') {
      mouthGraphics.beginFill(0xE88B8B);
      mouthGraphics.drawEllipse(cx, cy - 32, 8, 10);
      mouthGraphics.endFill();
    } else if (shape === 'sad') {
      mouthGraphics.lineStyle(2, 0xE88B8B);
      mouthGraphics.moveTo(cx - 10, cy - 28);
      mouthGraphics.quadraticCurveTo(cx, cy - 35, cx + 10, cy - 28);
    } else if (shape === 'happy') {
      mouthGraphics.lineStyle(2, 0xE88B8B);
      mouthGraphics.arc(cx, cy - 38, 10, 0.2, Math.PI - 0.2);
    } else {
      mouthGraphics.lineStyle(2, 0xE88B8B);
      mouthGraphics.moveTo(cx - 10, cy - 35);
      mouthGraphics.quadraticCurveTo(cx, cy - 28, cx + 10, cy - 35);
    }
  }
  drawMouth('default');

  // --- 前髮 ---
  const frontHair = new PIXI.Graphics();
  frontHair.beginFill(0x8B5E3C);
  frontHair.moveTo(cx - 80, cy - 95);
  frontHair.quadraticCurveTo(cx - 30, cy - 125, cx, cy - 128);
  frontHair.quadraticCurveTo(cx + 30, cy - 125, cx + 80, cy - 95);
  frontHair.lineTo(cx + 75, cy - 75);
  frontHair.quadraticCurveTo(cx, cy - 88, cx - 75, cy - 75);
  frontHair.closePath();
  frontHair.moveTo(cx - 85, cy - 70);
  frontHair.quadraticCurveTo(cx - 105, cy + 10, cx - 75, cy + 80);
  frontHair.lineTo(cx - 70, cy - 40);
  frontHair.closePath();
  frontHair.moveTo(cx + 85, cy - 70);
  frontHair.quadraticCurveTo(cx + 105, cy + 10, cx + 75, cy + 80);
  frontHair.lineTo(cx + 70, cy - 40);
  frontHair.closePath();
  frontHair.endFill();
  frontHairLayer.addChild(frontHair);

  // --- 呆毛 ---
  const ahogeGraphics = new PIXI.Graphics();
  const starPts = [];
  const starX = cx - 2, starY = cy - 200;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const r = i % 2 === 0 ? 10 : 4;
    starPts.push(starX + Math.cos(angle) * r, starY + Math.sin(angle) * r);
  }
  ahogeGraphics.beginFill(0xD4956B);
  ahogeGraphics.drawPolygon(starPts);
  ahogeGraphics.endFill();
  ahogeGraphics.lineStyle(2, 0x8B4513);
  ahogeGraphics.moveTo(cx - 2, cy - 188);
  ahogeGraphics.lineTo(cx - 2, cy - 195);
  frontHairLayer.addChild(ahogeGraphics);
  root._ahogeGraphics = ahogeGraphics;

  // === Methods ===
  root.setEyesOpen = (v) => { root._eyeOpen = v; drawEyes(v); };
  root.setMouth = (s) => drawMouth(s);
  root.setBreath = (s) => root.scale.set(s, s);
  root.setHeadTilt = (a) => { headLayer.rotation = a; frontHairLayer.rotation = a; };
  root.setBlush = (a) => drawBlush(a);
  root.setBrows = (s) => drawBrows(s);

  // 眼睛追蹤（遊標位置 → 瞳孔偏移）
  root._eyeOffsetX = 0; root._eyeOffsetY = 0;
  root.setEyeOffset = function (ox, oy) {
    this._eyeOffsetX = ox;
    this._eyeOffsetY = oy;
    // 重畫眼睛時加入偏移
    drawEyesWithOffset(this._eyeOpen, ox, oy);
  };

  function drawEyesWithOffset(openAmount, ox, oy) {
    eyesGraphics.clear();
    const eyeY = cy - 70;
    const maxOffset = 3;
    const dx = ox * maxOffset;
    const dy = oy * maxOffset;
    if (openAmount > 0.9) {
      eyesGraphics.beginFill(0x5B3A29);
      eyesGraphics.drawEllipse(cx - 25 + dx, eyeY + dy, 12, 16);
      eyesGraphics.drawEllipse(cx + 25 + dx, eyeY + dy, 12, 16);
      eyesGraphics.endFill();
      eyesGraphics.beginFill(0xFFFFFF);
      eyesGraphics.drawCircle(cx - 21 + dx, eyeY - 5 + dy, 4);
      eyesGraphics.drawCircle(cx + 29 + dx, eyeY - 5 + dy, 4);
      eyesGraphics.endFill();
    } else if (openAmount > 0.1) {
      const h = 16 * openAmount;
      eyesGraphics.beginFill(0x5B3A29);
      eyesGraphics.drawEllipse(cx - 25 + dx, eyeY + dy, 12, h);
      eyesGraphics.drawEllipse(cx + 25 + dx, eyeY + dy, 12, h);
      eyesGraphics.endFill();
    }
  }

  // 覆蓋 drawEyes
  const origDrawEyes = drawEyes;
  drawEyes = (oa) => drawEyesWithOffset(oa, root._eyeOffsetX, root._eyeOffsetY);

  root.setExpression = function (expr) {
    switch (expr) {
      case 'smile': this.setMouth('happy'); this.setBrows('normal'); break;
      case 'surprised': this.setMouth('surprised'); this.setBrows('normal'); break;
      case 'sad': this.setMouth('sad'); this.setBrows('normal'); break;
      case 'shy': this.setMouth('default'); this.setBlush(0.7); break;
      case 'angry': this.setMouth('default'); this.setBrows('angry'); break;
      default: this.setMouth('default'); this.setBrows('normal'); this.setBlush(0.35); break;
    }
  };

  root.playIdleAction = function (action) {
    switch (action) {
      case 'tiltHead': this._idleHeadTiltTime = 400; this._idleHeadTiltDir = Math.random() > 0.5 ? 1 : -1; break;
      case 'bounce': this._idleBounceTime = 600; break;
      case 'lookAround': this._idleLookTime = 800; break;
      case 'hairFluff': this._idleAhogeTime = 500; break;
    }
  };

  root._idleHeadTiltTime = 0; root._idleHeadTiltDir = 0;
  root._idleBounceTime = 0; root._idleLookTime = 0; root._idleAhogeTime = 0;

  root.tick = function (delta) {
    const dt = delta * 16.6;
    if (this._idleHeadTiltTime > 0) {
      this._idleHeadTiltTime -= dt;
      const a = Math.sin((1 - this._idleHeadTiltTime / 400) * Math.PI) * 0.12 * this._idleHeadTiltDir;
      this.setHeadTilt(a);
      if (this._idleHeadTiltTime <= 0) this.setHeadTilt(0);
    }
    if (this._idleBounceTime > 0) {
      this._idleBounceTime -= dt;
      this._bounceOffset = Math.abs(Math.sin((1 - this._idleBounceTime / 600) * Math.PI * 2)) * 8;
      if (this._idleBounceTime <= 0) this._bounceOffset = 0;
    }
    if (this._idleLookTime > 0) {
      this._idleLookTime -= dt;
      this._lookOffset = Math.sin((1 - this._idleLookTime / 800) * Math.PI * 2) * 12;
      if (this._idleLookTime <= 0) this._lookOffset = 0;
    }
    if (this._idleAhogeTime > 0) {
      this._idleAhogeTime -= dt;
      ahogeGraphics.skew.x = Math.sin((1 - this._idleAhogeTime / 500) * Math.PI * 4) * 0.3;
      if (this._idleAhogeTime <= 0) ahogeGraphics.skew.x = 0;
    }
    if (this._idleAhogeTime <= 0) {
      ahogeGraphics.skew.x = Math.sin(Date.now() * 0.005) * 0.05;
    }
  };

  root.onClick = function () {
    this.playIdleAction('bounce');
    this.setMouth('surprised');
    setTimeout(() => this.setExpression('neutral'), 800);
    inputBar?.show();
  };

  return root;
}

// === AI 對話系統 ===
function setupChat() {
  conversation = new ConversationManager(ITSUKI_PERSONALITY, 20);
  chatOverlay = new ChatOverlay();

  inputBar = new InputBar(async (text) => {
    // 使用者發送訊息
    conversation.addUserMessage(text);
    chatOverlay.showUserMessage(text);
    chatOverlay.showStatus('thinking');

    // 呼叫 Claude API
    const messages = conversation.getMessagesForAPI();
    const result = await window.petAPI.claudeChat(messages);

    if (result.error) {
      chatOverlay.showStatus('error');
      chatOverlay.showCharacterMessage('啊…抱歉，出了點問題：' + result.error);
      return;
    }
  });

  // 監聽串流回應
  window.petAPI.onClaudeChunk((data) => {
    chatOverlay.showCharacterMessage(data.full, true);
    chatOverlay.showStatus('speaking');
  });

  // 監聽回應完成
  window.petAPI.onClaudeComplete((data) => {
    const parsed = parseResponse(data.text);
    conversation.addAssistantMessage(data.text);

    // 更新角色表情和動作（Live2D 模型有內建表情系統）
    if (!character.internalModel) {
      character.setExpression(parsed.expression);
      if (parsed.motion) {
        character.playIdleAction(parsed.motion);
      }
    }

    chatOverlay.showCharacterMessage(parsed.cleanText);
    chatOverlay.showStatus('idle');

    // 語音播放（如果處於語音模式）
    if (voicePipeline && voicePipeline.mode !== 'text') {
      voicePipeline.speakResponse(parsed.cleanText);
    }
  });

  // 監聽錯誤
  window.petAPI.onClaudeError((data) => {
    chatOverlay.showStatus('error');
    chatOverlay.showCharacterMessage('ごめん…好像連不上：' + data.error);
  });

  // === 語音系統 ===
  ttsManager = new TTSManager();
  window._ttsManager = ttsManager; // 供輸入框指令使用
  sttManager = new STTManager();
  lipSync = new LipSync(character);

  // 給 character 加上 lip sync 方法
  character.startLipSync = () => lipSync.start();
  character.stopLipSync = () => lipSync.stop();
  character.lipSyncPulse = () => lipSync.pulse();

  voicePipeline = new VoicePipeline({
    tts: ttsManager,
    stt: sttManager,
    chatOverlay,
    conversation,
    character,
    onSendToAI: async (text) => {
      conversation.addUserMessage(text);
      const messages = conversation.getMessagesForAPI();
      const result = await window.petAPI.claudeChat(messages);
      if (result.error) {
        chatOverlay.showCharacterMessage('あれ…出了點問題：' + result.error);
      }
    },
  });

  // 預設混合模式（文字輸入 + 語音輸出）
  voicePipeline.setMode('mixed');

  // 快捷鍵切換語音模式
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      // F2: 開始/停止語音聆聽
      if (voicePipeline.isActive) {
        voicePipeline.stopListening();
      } else {
        voicePipeline.startListening();
      }
    } else if (e.key === 'F3') {
      // F3: 切換語音/文字模式
      const mode = voicePipeline.toggleMode();
      chatOverlay.showStatus(mode === 'voice' ? '語音模式' : '文字模式');
    }
  });
}

// === 設定檢查 ===
async function checkApiKey() {
  const key = await window.petAPI.getApiKey();
  if (!key) {
    chatOverlay?.showCharacterMessage('請先設定 Anthropic API Key 才能聊天喔！\n雙擊我輸入、或在設定中設定～');
    chatOverlay?.showStatus('idle');
  }
}

// === 初始化 ===
async function init() {
  debug('🚀 init() started');
  debug('PIXI: ' + (typeof PIXI !== 'undefined' ? 'loaded ✓' : 'NOT FOUND ✗'));

  const canvas = document.getElementById('character-canvas');
  debug('Canvas: ' + (canvas ? 'found ✓' : 'NOT FOUND ✗'));

  try {
    app = await createPixiApp(canvas);
    debug('PixiJS app created ✓');

    // === 載入 Live2D 模型 ===
    try {
      debug('PIXI.live2d = ' + (typeof PIXI.live2d));
      if (PIXI.live2d) {
        var keys = Object.keys(PIXI.live2d);
        debug('PIXI.live2d keys: ' + keys.join(', '));
        // 遍歷所有屬性
        for (var k of keys) debug('  .' + k + ' = ' + (typeof PIXI.live2d[k]));
      }
      const modelPath = '/assets/models/shizuku/shizuku.model.json';
      debug('Loading: ' + modelPath);
      character = await PIXI.live2d.Live2DModel.from(modelPath);
      debug('✅ Live2D 模型載入成功！');

      // 角色放在畫面下半部
      character.anchor.set(0.5, 1); // 錨點在腳底
      character.x = app.screen.width / 2;
      character.y = app.screen.height - 20; // 貼近底部
      // 自動計算縮放（縮小一點讓頭部不會頂到網址列）
      const mw = character.internalModel?.width || character.width || 1000;
      const mh = character.internalModel?.height || character.height || 1000;
      if (mw && mh && mw < 10000) {
        const scale = Math.min(app.screen.width / mw, (app.screen.height - 300) / mh) * 0.7;
        character.scale.set(scale, scale);
      } else {
        character.scale.set(0.1, 0.1);
      }
      debug('Scale: ' + character.scale.x.toFixed(3));

      // Live2D 互動
      character.interactive = true;
      character.buttonMode = true;
      character.on('click', () => {
        if (!dragState.wasDragged && inputBar) inputBar.show();
        dragState.wasDragged = false;
      });

      app.stage.addChild(character);
      debug('Live2D character ready ✓');
    } catch (e) {
      debug('❌ Live2D ERROR: ' + (e.message || e) + ' — stack: ' + (e.stack || 'none').substring(0, 200));
      console.error('Live2D load error:', e);
      // 載入失敗用佔位圖
      character = createItsuki();
      character.x = 0; character.y = 10;
      app.stage.addChild(character);
    }
  } catch(e) {
    debug('PixiJS ERROR: ' + e.message);
    return;
  }

  // 移除 createLayers（Live2D 不需要分層）
  // const layers = createLayers();

  if (!character.internalModel) {
    idleController = new IdleController(character);
  }

  // 設定 AI 對話
  setupChat();

  // 檢查 API key
  setTimeout(() => checkApiKey(), 2000);

  // === Ticker ===
  let globalTime = 0;

  app.ticker.add((delta) => {
    globalTime += delta * 0.03;

    if (character && character.internalModel) {
      // Live2D 模型：內建物理 + 呼吸，只需更新
      character.update(delta);
    } else if (!character.internalModel) {
      // 佔位角色：手動動畫
      if (character.tick) character.tick(delta);
      if (idleController) idleController.update(delta);
      character.y = 10 + (character._bounceOffset || 0) + Math.sin(globalTime * 0.5) * 2;
      character.x = character._lookOffset || 0;
    }
  });

  // === 拖曳 ===
  setupDrag(canvas);

  // === 點擊互動（摸頭檢測） ===
  canvas.addEventListener('click', (e) => {
    if (dragState.wasDragged) { dragState.wasDragged = false; return; }
    dragState.wasDragged = false;

    // 判斷是否點到頭部
    const rect = canvas.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    if (relY < 220) {
      if (!character.internalModel) headPatReaction();
    } else {
      if (character.internalModel) {
        inputBar?.show();
      } else {
        character.onClick();
      }
    }
  });
  canvas.style.pointerEvents = 'auto';

  // === 滑鼠追蹤（眼睛跟隨，僅佔位角色） ===
  window.addEventListener('mousemove', (e) => {
    if (character && !character.internalModel) {
      const rect = canvas.getBoundingClientRect();
      const cx_c = rect.left + rect.width / 2;
      const cy_c = rect.top + 130;
      const dx = (e.clientX - cx_c) / 200;
      const dy = (e.clientY - cy_c) / 200;
      character.setEyeOffset(
        Math.max(-1, Math.min(1, dx)),
        Math.max(-1, Math.min(1, dy))
      );
    }
  });

  // === 時間感知 + 主動打招呼 ===
  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 6) greeting = '這麼晚了還不睡…要我陪你嗎？';
  else if (hour < 12) greeting = 'おはよう！今天也要好好加油喔！';
  else if (hour < 14) greeting = '中午了…你吃了嗎？我、我才不是在關心你有沒有吃飯呢！';
  else if (hour < 18) greeting = '午後的時光，要不要一起喝個下午茶？';
  else if (hour < 21) greeting = '晚上好～今天過得怎麼樣？';
  else greeting = '這麼晚了還在忙嗎…別太勉強自己喔。';

  setTimeout(() => {
    if (chatOverlay && character) {
      chatOverlay.showCharacterMessage(greeting);
      character.playIdleAction('bounce');
      // 語音打招呼
      if (voicePipeline && voicePipeline.mode !== 'text') {
        setTimeout(() => ttsManager?.speak(greeting), 500);
      }
    }
  }, 3000);

  // === 手勢追蹤（Phase 5）===
  visionPipeline = new VisionPipeline({
    character,
    chatOverlay,
    ttsManager,
    gestureDebounceMs: 500,
    cooldownMs: 2500,
  });

  // F4: 啟動/停止手勢追蹤
  window.addEventListener('keydown', async (e) => {
    if (e.key === 'F4') {
      if (visionPipeline.isRunning) {
        visionPipeline.stop();
        chatOverlay.showStatus('手勢追蹤已停止');
      } else {
        const ok = await visionPipeline.start();
        if (!ok) {
          chatOverlay.showCharacterMessage(
            '手勢追蹤需要下載 hand_landmarker.task 模型檔～\n請從 Google MediaPipe 下載後放到 assets/lib/mediapipe/'
          );
        }
      }
    }
  });

  // === 音樂播放器 ===
  musicPlayer = new MusicPlayer();
  console.log('🎀 中野五月 — 音樂播放器就緒！');
}

// === 摸頭反應（僅佔位角色） ===
let headPatCooldown = false;
function headPatReaction() {
  if (character && character.internalModel) return; // Live2D 跳過
  if (headPatCooldown) return;
  headPatCooldown = true;

  character.setExpression('shy');
  character.playIdleAction('hairFluff');
  chatOverlay.showCharacterMessage('もう…不要摸我的頭啦！///');
  ttsManager?.speak('もう、やめてよ…');

  setTimeout(() => {
    character.setExpression('neutral');
    headPatCooldown = false;
  }, 3000);
}

// === 拖曳狀態 ===
const dragState = { dragging: false, startX: 0, startY: 0, moved: 0, wasDragged: false };

function setupDrag(canvas) {
  canvas.addEventListener('mousedown', (e) => {
    dragState.dragging = true;
    dragState.startX = e.screenX;
    dragState.startY = e.screenY;
    dragState.moved = 0;
    dragState.wasDragged = false;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragState.dragging) return;
    const dx = e.screenX - dragState.startX;
    const dy = e.screenY - dragState.startY;
    dragState.moved = Math.abs(dx) + Math.abs(dy);
    if (dragState.moved > 5) dragState.wasDragged = true;
    window.petAPI?.moveWindow(dx, dy);
    dragState.startX = e.screenX;
    dragState.startY = e.screenY;
  });

  window.addEventListener('mouseup', () => {
    dragState.dragging = false;
    canvas.style.cursor = 'pointer';
  });
}

window.addEventListener('DOMContentLoaded', init);

/**
 * Vision Pipeline — 手勢追蹤主循環
 * MediaPipe Hands + 手勢分類 + 角色反應觸發
 */

class VisionPipeline {
  constructor({ character, chatOverlay, ttsManager, gestureDebounceMs = 800, cooldownMs = 3000 }) {
    this.character = character;
    this.chatOverlay = chatOverlay;
    this.ttsManager = ttsManager;
    this.gestureDebounceMs = gestureDebounceMs;
    this.cooldownMs = cooldownMs;

    this.camera = new CameraManager();
    this.handLandmarker = null;
    this.waveDetector = new WaveDetector();
    this.isRunning = false;
    this.animFrameId = null;

    // 去抖動狀態
    this.currentGesture = null;
    this.gestureStartTime = 0;
    this.lastTriggerTime = 0;
    this.lastTriggeredGesture = null;

    // 回呼
    this.onGesture = null;
  }

  async start() {
    if (this.isRunning) return;

    // 啟動攝影機
    const video = await this.camera.start();
    if (!video) {
      console.warn('無法啟動攝影機');
      return false;
    }

    // 動態載入 MediaPipe
    try {
      const mpPath = '../../assets/lib/mediapipe/vision_bundle.mjs';
      const module = await import(mpPath);
      const { HandLandmarker, FilesetResolver } = module;

      const wasmPath = '../../assets/lib/mediapipe/';
      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: wasmPath + 'hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

    } catch (e) {
      console.warn('MediaPipe 載入失敗（可能需要手動下載 hand_landmarker.task）:', e.message);
      // 降級：使用簡單的手勢模擬（基於滑鼠）
      return false;
    }

    this.isRunning = true;
    this._loop(video);
    this.chatOverlay?.showStatus('手勢追蹤已啟動 ✋');
    return true;
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.camera.stop();
    this.handLandmarker = null;
  }

  async _loop(video) {
    if (!this.isRunning) return;

    if (this.handLandmarker && video.readyState >= 2) {
      try {
        const timestamp = performance.now();
        const result = this.handLandmarker.detectForVideo(video, timestamp);

        if (result.landmarks && result.landmarks.length > 0) {
          this._processLandmarks(result.landmarks);
        } else {
          // 沒有手 → 重置
          this._resetGesture();
        }
      } catch (e) {
        // 靜默處理
      }
    }

    this.animFrameId = requestAnimationFrame(() => this._loop(video));
  }

  _processLandmarks(allLandmarks) {
    for (const landmarks of allLandmarks) {
      // 分類手勢
      const gesture = classifyGesture(landmarks);

      // 檢查揮手
      const wrist = landmarks[0];
      const isWaving = this.waveDetector.update(wrist.x);

      const detectedGesture = isWaving ? 'waving' : gesture;

      if (detectedGesture) {
        this._onGestureDetected(detectedGesture);
      } else {
        this._resetGesture();
      }
    }
  }

  _onGestureDetected(gesture) {
    const now = Date.now();

    // 手勢變化 → 重新計時
    if (gesture !== this.currentGesture) {
      this.currentGesture = gesture;
      this.gestureStartTime = now;
      return;
    }

    // 去抖動：手勢需維持一段時間
    if (now - this.gestureStartTime < this.gestureDebounceMs) return;

    // 冷卻：同手勢不重複觸發
    if (gesture === this.lastTriggeredGesture && now - this.lastTriggerTime < this.cooldownMs) return;

    // 觸發！
    this.lastTriggerTime = now;
    this.lastTriggeredGesture = gesture;

    const reaction = getGestureReaction(gesture);
    if (!reaction) return;

    // 角色反應
    if (this.character) {
      this.character.setExpression(reaction.expression);
      if (reaction.motion) this.character.playIdleAction(reaction.motion);
    }

    // 對話氣泡
    if (reaction.message && this.chatOverlay) {
      this.chatOverlay.showCharacterMessage(reaction.message);
    }

    // TTS
    if (reaction.tts && this.ttsManager && reaction.message) {
      this.ttsManager.speak(reaction.message);
    }

    // 回呼
    if (this.onGesture) this.onGesture(gesture, reaction);
  }

  _resetGesture() {
    this.currentGesture = null;
    this.gestureStartTime = 0;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisionPipeline;
}

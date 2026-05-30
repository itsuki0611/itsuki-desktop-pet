/**
 * Idle Controller — 角色待機動畫系統
 * 處理：眨眼、呼吸、隨機待機動作
 */

class IdleController {
  constructor(character) {
    this.character = character;
    this.time = 0;
    this.blinkTimer = 0;
    this.blinkInterval = 3000 + Math.random() * 4000; // 3-7秒眨眼
    this.isBlinking = false;
    this.blinkDuration = 0;
    this.idleTimer = 0;
    this.idleInterval = 8000 + Math.random() * 15000; // 8-23秒待機動作
    this.breathPhase = 0;
  }

  update(delta) {
    const dt = delta * 16.6; // 轉換為毫秒（PixiJS delta 是幀數比）
    this.time += dt;
    this.breathPhase += dt * 0.002;

    // === 眨眼 ===
    this.blinkTimer += dt;
    if (!this.isBlinking && this.blinkTimer > this.blinkInterval) {
      this.startBlink();
    }
    if (this.isBlinking) {
      this.blinkDuration -= dt;
      const progress = Math.min(1, 1 - (this.blinkDuration / 150));
      // 眨眼曲線：快速閉眼 → 短暫閉合 → 快速睜眼
      let eyeOpen;
      if (progress < 0.15) {
        eyeOpen = 1 - (progress / 0.15); // 閉眼
      } else if (progress < 0.3) {
        eyeOpen = 0; // 閉合
      } else {
        eyeOpen = (progress - 0.3) / 0.7; // 睜眼
      }
      this.character.setEyesOpen(Math.max(0, Math.min(1, eyeOpen)));
      if (this.blinkDuration <= 0) {
        this.isBlinking = false;
        this.character.setEyesOpen(1);
        this.blinkTimer = 0;
        this.blinkInterval = 2500 + Math.random() * 5000;
      }
    }

    // === 呼吸 ===
    const breathScale = 1 + Math.sin(this.breathPhase) * 0.015;
    this.character.setBreath(breathScale);

    // === 隨機待機動作 ===
    this.idleTimer += dt;
    if (this.idleTimer > this.idleInterval) {
      this.playRandomIdle();
      this.idleTimer = 0;
      this.idleInterval = 8000 + Math.random() * 15000;
    }
  }

  startBlink() {
    this.isBlinking = true;
    this.blinkDuration = 150; // 眨眼總時長 150ms
  }

  playRandomIdle() {
    const actions = ['tiltHead', 'bounce', 'hairFluff', 'lookAround'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    this.character.playIdleAction(action);
  }
}

// Export for script-tag loading
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IdleController;
}

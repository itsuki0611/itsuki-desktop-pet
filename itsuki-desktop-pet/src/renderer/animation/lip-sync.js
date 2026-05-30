/**
 * Lip Sync — TTS 嘴形同步
 * 在 TTS 播放期間控制角色嘴巴開合
 */

class LipSync {
  constructor(character) {
    this.character = character;
    this.isActive = false;
    this.timer = null;
    this.mouthOpen = false;
  }

  start() {
    this.isActive = true;
    this._pulse();
  }

  stop() {
    this.isActive = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 恢復預設嘴形
    if (this.character.setMouth) {
      this.character.setMouth('default');
    }
  }

  /** 每個音節觸發一次開合 */
  pulse() {
    if (!this.isActive || !this.character.setMouth) return;
    this.character.setMouth('surprised'); // 張嘴
    setTimeout(() => {
      if (this.isActive && this.character.setMouth) {
        this.character.setMouth('default'); // 閉嘴
      }
    }, 80);
  }

  /** 持續脈衝模式（無 boundary 事件時使用） */
  _pulse() {
    if (!this.isActive) return;
    this.pulse();
    this.timer = setTimeout(() => this._pulse(), 150);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LipSync;
}

/**
 * TTS Manager — 使用 Web Speech API（Chromium 內建）
 * Windows 11 內建中文語音：Microsoft Kangkang, Microsoft Yaoyao, Microsoft Xiaoxiao 等
 */

class TTSManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.speaking = false;
    this.onStart = null;
    this.onEnd = null;
    this.onBoundary = null;

    // 初始化語音
    this._initVoice();
  }

  _initVoice() {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (voices.length === 0) return;

      // 列出所有語音到 console
      console.log('=== 可用語音 ===');
      voices.forEach(v => console.log(v.name, '|', v.lang));

      // 預設：中文女聲
      const preferred = ['Xiaoxiao', 'Yaoyao', 'Kangkang'];
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('zh'));
        if (v) { this.voice = v; return; }
      }
      const zh = voices.find(v => v.lang.startsWith('zh-CN'));
      if (zh) { this.voice = zh; return; }
      if (voices.length > 0) this.voice = voices[0];
    };

    loadVoices();
    this.synth.onvoiceschanged = loadVoices;
  }

  /** 列出所有可用語音 */
  listVoices() {
    return this.synth.getVoices();
  }

  /** 切換語音 */
  setVoice(nameOrLang) {
    const voices = this.synth.getVoices();
    const v = voices.find(v =>
      v.name.includes(nameOrLang) || v.lang.includes(nameOrLang)
    );
    if (v) {
      this.voice = v;
      return v.name + ' (' + v.lang + ')';
    }
    return null;
  }

  /** 切換語速 */
  setRate(rate) {
    this._rate = rate;
  }

  /** 切換音調 */
  setPitch(pitch) {
    this._pitch = pitch;
  }

  speak(text) {
    if (!this.synth) return;

    // 取消當前播放
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.lang = 'zh-CN';
    utterance.rate = this._rate || 0.95;
    utterance.pitch = this._pitch || 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.speaking = true;
      if (this.onStart) this.onStart();
    };

    utterance.onend = () => {
      this.speaking = false;
      if (this.onEnd) this.onEnd();
    };

    utterance.onerror = (e) => {
      this.speaking = false;
      console.log('TTS error:', e.error);
      if (this.onEnd) this.onEnd();
    };

    // 取得單字邊界（用於 Lip Sync）
    utterance.onboundary = (e) => {
      if (this.onBoundary && e.name === 'word') {
        this.onBoundary(e.charIndex, e.charLength);
      }
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.speaking = false;
    }
  }

  isSpeaking() {
    return this.speaking;
  }

  getVoices() {
    return this.synth ? this.synth.getVoices() : [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSManager;
}

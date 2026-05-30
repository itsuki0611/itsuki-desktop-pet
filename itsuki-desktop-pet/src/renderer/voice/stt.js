/**
 * STT Manager — 使用 Web Speech API SpeechRecognition（Chromium 內建）
 * Windows 11 內建中文語音辨識
 */

class STTManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onInterim = null;
    this.onEnd = null;
    this.onError = null;
    this._init();
  }

  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition 不支援此環境');
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.interimResults = true;  // 即時結果
    this.recognition.continuous = false;     // 單次辨識（一句話）
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final && this.onResult) {
        this.onResult(final);
      }
      if (interim && this.onInterim) {
        this.onInterim(interim);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onerror = (event) => {
      console.log('STT error:', event.error);
      this.isListening = false;
      if (event.error === 'no-speech') {
        // 沒偵測到語音，不算錯誤
        if (this.onEnd) this.onEnd();
      } else if (this.onError) {
        this.onError(event.error);
      }
    };
  }

  start() {
    if (!this.recognition) return false;
    if (this.isListening) return true;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.log('STT start error:', e.message);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // 可能已經停止
      }
      this.isListening = false;
    }
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STTManager;
}

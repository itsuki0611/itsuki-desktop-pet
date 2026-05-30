/**
 * Voice Pipeline — 語音對話主循環
 * 聽 → 辨識 → AI → 說
 */

class VoicePipeline {
  constructor({ tts, stt, chatOverlay, conversation, character, onSendToAI }) {
    this.tts = tts;
    this.stt = stt;
    this.chatOverlay = chatOverlay;
    this.conversation = conversation;
    this.character = character;
    this.onSendToAI = onSendToAI;
    this.mode = 'text'; // 'text' | 'voice' | 'mixed'
    this.isActive = false;
  }

  /** 開始語音聆聽 */
  startListening() {
    if (this.isActive) return;
    if (!this.stt.isSupported()) {
      this.chatOverlay.showCharacterMessage('語音辨識不支援…請用打字跟我聊天吧！');
      return;
    }

    this.isActive = true;
    this.chatOverlay.showStatus('listening');

    this.stt.onResult = (text) => {
      this.chatOverlay.showUserMessage(text);
      this.chatOverlay.showStatus('thinking');
      this._processUserInput(text);
    };

    this.stt.onInterim = (text) => {
      this.chatOverlay.showUserMessage(text + '…');
    };

    this.stt.onEnd = () => {
      this.isActive = false;
    };

    this.stt.onError = (err) => {
      this.isActive = false;
      this.chatOverlay.showStatus('error');
    };

    const ok = this.stt.start();
    if (!ok) {
      this.chatOverlay.showStatus('error');
      this.isActive = false;
    }
  }

  /** 停止聆聽 */
  stopListening() {
    this.stt.stop();
    this.isActive = false;
  }

  /** 處理使用者輸入（來自語音或文字） */
  async _processUserInput(text) {
    // 交給外部處理（呼叫 Claude API）
    if (this.onSendToAI) {
      await this.onSendToAI(text);
    }
  }

  /** AI 回應後播放語音 */
  speakResponse(text) {
    if (this.mode === 'text') return;

    this.tts.onStart = () => {
      this.chatOverlay.showStatus('speaking');
      // 唇形同步（如果有）
      if (this.character && this.character.startLipSync) {
        this.character.startLipSync();
      }
    };

    this.tts.onEnd = () => {
      this.chatOverlay.showStatus('idle');
      if (this.character && this.character.stopLipSync) {
        this.character.stopLipSync();
      }
    };

    this.tts.onBoundary = (charIndex, charLength) => {
      if (this.character && this.character.lipSyncPulse) {
        this.character.lipSyncPulse();
      }
    };

    this.tts.speak(text);
  }

  setMode(mode) {
    this.mode = mode;
  }

  toggleMode() {
    this.mode = this.mode === 'voice' ? 'text' : 'voice';
    return this.mode;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoicePipeline;
}

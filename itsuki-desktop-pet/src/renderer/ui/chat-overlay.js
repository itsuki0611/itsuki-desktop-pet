/**
 * Chat Overlay — 對話氣泡 + 輸入框 UI
 */

class ChatOverlay {
  constructor() {
    this.bubble = document.getElementById('speech-bubble');
    this.bubbleText = document.getElementById('speech-text');
    this.statusIndicator = document.getElementById('status-indicator');
    this.statusText = document.getElementById('status-text');
    this.hideTimeout = null;
  }

  /** 顯示角色訊息（逐字更新） */
  showCharacterMessage(text, streaming = false) {
    this.bubbleText.textContent = text;
    this.bubble.classList.remove('hidden');
    this.bubble.classList.add('bouncing');

    // 清除自動隱藏
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    // 對話氣泡保持顯示，不自動隱藏

    setTimeout(() => this.bubble.classList.remove('bouncing'), 400);
  }

  /** 顯示使用者訊息 */
  showUserMessage(text) {
    this.bubbleText.textContent = text;
    this.bubble.classList.remove('hidden');
    // 使用者訊息用不同色調？這裡先保持同樣樣式
  }

  /** 隱藏氣泡 */
  hide() {
    this.bubble.classList.add('hidden');
  }

  /** 顯示狀態（聆聽中、思考中） */
  showStatus(status) {
    const statusMap = {
      listening: '👂 聆聽中…',
      thinking: '🤔 思考中…',
      speaking: '💬 說話中…',
      idle: '',
      error: '⚠️ 出了點問題',
    };
    const text = statusMap[status] || status;
    this.statusText.textContent = text;
    if (text) {
      this.statusIndicator.classList.remove('hidden');
    } else {
      this.statusIndicator.classList.add('hidden');
    }
    if (this.hideStatusTimeout) clearTimeout(this.hideStatusTimeout);
    if (status === 'idle') {
      this.hideStatusTimeout = setTimeout(() => this.statusIndicator.classList.add('hidden'), 2000);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatOverlay;
}

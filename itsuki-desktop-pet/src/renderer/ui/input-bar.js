/**
 * Input Bar — 文字輸入框（隱藏式，點擊角色或按快捷鍵顯示）
 */

class InputBar {
  constructor(onSend) {
    this.onSend = onSend;
    this.input = null;
    this.isVisible = false;
    this._create();
  }

  _create() {
    // 建立輸入框
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.id = 'chat-input';
    this.input.placeholder = '和五月說話…';
    this.input.style.cssText = `
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: 260px;
      padding: 10px 14px;
      border: 2px solid #E8B4B8;
      border-radius: 20px;
      background: rgba(255,255,255,0.9);
      font-size: 14px;
      font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
      color: #333;
      outline: none;
      z-index: 20;
      display: none;
      -webkit-app-region: no-drag;
    `;

    this.input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        const text = this.input.value.trim();
        this.input.value = '';

        // 特殊指令：設定 API key
        if (text.startsWith('api:') || text.startsWith('sk-ant')) {
          const key = text.startsWith('api:') ? text.slice(4).trim() : text.trim();
          const ok = await window.petAPI?.setApiKey(key);
          if (ok) {
            this.input.placeholder = 'API Key 已儲存！';
            setTimeout(() => { this.input.placeholder = '和五月說話…'; }, 3000);
          }
          this.hide();
          if (this.onSend) this.onSend('[系統] API Key 已設定');
          return;
        }

        // 特殊指令：列出語音
        if (text === '語音列表' || text === 'voice') {
          if (window._ttsManager) {
            const voices = window._ttsManager.listVoices();
            const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
            const list = zhVoices.map(v => v.name).join('\n');
            this.input.placeholder = '輸入語音名稱來切換';
            this.input.value = '';
            if (this.onSend) this.onSend('可用的中文語音：\n' + (list || '無'));
          }
          return;
        }

        // 特殊指令：切換語音
        if (text.startsWith('語音:') || text.startsWith('voice:')) {
          const name = text.includes(':') ? text.split(':')[1].trim() : '';
          if (window._ttsManager) {
            const result = window._ttsManager.setVoice(name);
            if (result) {
              this.input.placeholder = '已切換到 ' + result;
              if (this.onSend) this.onSend('[系統] 語音切換為 ' + result);
            } else {
              this.input.placeholder = '找不到此語音，輸入「語音列表」查看';
            }
          }
          this.hide();
          return;
        }

        this.hide();
        if (this.onSend) this.onSend(text);
      } else if (e.key === 'Escape') {
        this.hide();
      }
    });

    document.body.appendChild(this.input);

    // 點擊或雙擊角色區域顯示輸入框
    const canvas = document.getElementById('character-canvas');
    if (canvas) {
      canvas.addEventListener('dblclick', () => this.show());
      canvas.addEventListener('click', () => {
        // 單擊也顯示（方便初次使用）
        if (!this.isVisible) this.show();
      });
    }

    // 點擊頁面任何地方也可以觸發（備用）
    document.body.addEventListener('click', (e) => {
      if (e.target === document.body || e.target.id === 'character-container') {
        if (!this.isVisible) this.show();
      }
    });
  }

  show() {
    this.input.style.display = 'block';
    this.input.focus();
    this.isVisible = true;
  }

  hide() {
    this.input.style.display = 'none';
    this.input.value = '';
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) this.hide();
    else this.show();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputBar;
}

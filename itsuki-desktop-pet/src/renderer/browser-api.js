/**
 * 瀏覽器 API 橋接層 — 取代 Electron preload
 * 提供與 preload.js 相同的 petAPI 介面
 */

window.petAPI = {
  // 設定
  getApiKey: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      return data.apiKey || '';
    } catch (e) { return ''; }
  },

  setApiKey: async (key) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      return true;
    } catch (e) { return false; }
  },

  // Claude 對話
  claudeChat: async (messages) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error };
      }

      // 讀取 SSE 串流
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      async function readStream() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.done) {
                  // 用最後的 full text 觸發 complete
                  setTimeout(() => {
                    window._dispatchEvent('claude:complete', { text: fullText });
                  }, 10);
                } else {
                  fullText = data.full;
                  window._dispatchEvent('claude:chunk', { text: data.text, full: data.full });
                }
              } catch (e) {}
            }
          }
        }
      }

      readStream().catch(e => {
        window._dispatchEvent('claude:error', { error: e.message });
      });

      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // 事件系統（模擬 Electron IPC）
  onClaudeChunk: (cb) => { window._claudeChunkCb = cb; },
  onClaudeComplete: (cb) => { window._claudeCompleteCb = cb; },
  onClaudeError: (cb) => { window._claudeErrorCb = cb; },
  onOpenSettings: () => {},

  // 視窗控制（瀏覽器無作用）
  minimize: () => {},
  hide: () => {},
  show: () => {},
  moveWindow: () => {},
};

// 事件分派
window._dispatchEvent = function (name, data) {
  if (name === 'claude:chunk' && window._claudeChunkCb) window._claudeChunkCb(data);
  if (name === 'claude:complete' && window._claudeCompleteCb) window._claudeCompleteCb(data);
  if (name === 'claude:error' && window._claudeErrorCb) window._claudeErrorCb(data);
};

// 顯示設定提示 + 自動跳出輸入框
setTimeout(async () => {
  const key = await window.petAPI.getApiKey();
  if (!key) {
    const bar = document.getElementById('setup-bar');
    if (bar) {
      bar.style.display = 'block';
      bar.textContent = '🔑 請輸入 Anthropic API Key（格式：api:sk-ant-...）— 直接打字即可';
      bar.style.cursor = 'pointer';
      bar.onclick = () => {
        const input = document.getElementById('chat-input');
        if (input) {
          input.style.display = 'block';
          input.focus();
          input.placeholder = '請輸入 api:sk-ant-api03-你的key';
        }
      };
    }
    // 自動跳出輸入框
    const input = document.getElementById('chat-input');
    if (input) {
      setTimeout(() => {
        input.style.display = 'block';
        input.focus();
        input.placeholder = '請輸入 api:sk-ant-api03-你的key';
      }, 2000);
    }
  }
}, 1500);

/**
 * Music Player — B站音樂播放器（使用嵌入播放器）
 */

class MusicPlayer {
  constructor() {
    this.iframe = null;
    this.isPlaying = false;
    this._createUI();
  }

  _createUI() {
    this.btn = document.createElement('button');
    this.btn.textContent = '🎵';
    this.btn.title = '開啟音樂播放器';
    this.btn.style.cssText = `
      position: fixed; bottom: 16px; right: 16px;
      width: 40px; height: 40px; border-radius: 50%;
      border: none; background: rgba(0,0,0,0.7); color: #fff;
      font-size: 20px; cursor: pointer; z-index: 30;
      -webkit-app-region: no-drag;
    `;
    this.btn.onclick = () => this._togglePanel();
    document.body.appendChild(this.btn);

    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed; bottom: 64px; right: 16px;
      width: 300px; padding: 16px;
      background: rgba(0,0,0,0.85); color: #fff;
      border-radius: 12px; font-family: "Microsoft YaHei", sans-serif;
      font-size: 14px; z-index: 30; display: none;
      -webkit-app-region: no-drag;
    `;
    this.panel.innerHTML = `
      <div style="margin-bottom:8px;font-weight:bold;">🎵 音樂播放器</div>
      <div style="margin-bottom:8px;font-size:12px;color:#aaa;">西安交響樂團《訣別書》</div>
      <button id="mu-play" style="padding:6px 16px;border-radius:6px;border:none;background:#FB7299;color:#fff;cursor:pointer;">▶ 播放</button>
      <button id="mu-pause" style="padding:6px 16px;border-radius:6px;border:none;background:#666;color:#fff;cursor:pointer;margin-left:8px;">⏸ 暫停</button>
      <button id="mu-stop" style="padding:6px 16px;border-radius:6px;border:none;background:#444;color:#fff;cursor:pointer;margin-left:8px;">⏹ 停止</button>
      <div id="mu-status" style="margin-top:8px;font-size:12px;color:#aaa;">準備播放…</div>
    `;
    document.body.appendChild(this.panel);

    document.getElementById('mu-play').onclick = () => this._play();
    document.getElementById('mu-pause').onclick = () => this._pause();
    document.getElementById('mu-stop').onclick = () => this._stop();
  }

  _togglePanel() {
    this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
  }

  _play() {
    const status = document.getElementById('mu-status');
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
      this.iframe.src = 'https://player.bilibili.com/player.html?bvid=BV1cCdUBCEcU&autoplay=1&muted=0&danmaku=0';
      this.iframe.allow = 'autoplay';
      document.body.appendChild(this.iframe);
      this.isPlaying = true;
      this.btn.textContent = '🎶';
      status.textContent = '🎶 播放中…';
    } else {
      // 重新載入
      this.iframe.src = 'https://player.bilibili.com/player.html?bvid=BV1cCdUBCEcU&autoplay=1&muted=0&danmaku=0';
      this.isPlaying = true;
      this.btn.textContent = '🎶';
      status.textContent = '🎶 播放中…';
    }
  }

  _pause() {
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage({ type: 'pause' }, '*');
      this.isPlaying = false;
      this.btn.textContent = '🎵';
      document.getElementById('mu-status').textContent = '⏸ 已暫停';
    }
  }

  _stop() {
    if (this.iframe) {
      this.iframe.src = '';
      this.iframe.remove();
      this.iframe = null;
    }
    this.isPlaying = false;
    this.btn.textContent = '🎵';
    document.getElementById('mu-status').textContent = '⏹ 已停止';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicPlayer;
}

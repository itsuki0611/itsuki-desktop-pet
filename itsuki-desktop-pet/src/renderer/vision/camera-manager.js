/**
 * Camera Manager — 攝影機存取
 */

class CameraManager {
  constructor() {
    this.stream = null;
    this.video = null;
    this.isActive = false;
  }

  async start() {
    if (this.isActive) return this.video;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.playsInline = true;
      await this.video.play();
      this.isActive = true;
      return this.video;
    } catch (e) {
      console.error('攝影機存取失敗:', e.message);
      return null;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }
    this.isActive = false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CameraManager;
}

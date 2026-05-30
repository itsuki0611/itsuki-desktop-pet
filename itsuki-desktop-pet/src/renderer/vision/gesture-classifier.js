/**
 * Gesture Classifier — 手勢分類（基於 MediaPipe 21 點手部關鍵點）
 * 使用啟發式規則判斷手勢，無需額外訓練模型
 */

const GESTURE_RULES = {
  // ✋ 張開手掌：五指指尖在 PIP 關節上方
  open_palm: (lm) => {
    const tips = [4, 8, 12, 16, 20];
    const pips = [3, 6, 10, 14, 18];
    let extended = 0;
    for (let i = 0; i < 5; i++) {
      if (lm[tips[i]].y < lm[pips[i]].y) extended++;
    }
    return extended >= 4;
  },

  // ✊ 握拳：五指指尖彎曲靠近掌心
  fist: (lm) => {
    const tips = [4, 8, 12, 16, 20];
    const mcps = [2, 5, 9, 13, 17];
    let curled = 0;
    for (let i = 0; i < 5; i++) {
      if (lm[tips[i]].y > lm[mcps[i]].y) curled++;
    }
    return curled >= 4;
  },

  // 👍 比讚：拇指朝上，其餘彎曲
  thumb_up: (lm) => {
    const thumbTip = lm[4];
    const thumbIp = lm[3];
    const wrist = lm[0];
    const otherCurled = lm[8].y > lm[5].y && lm[12].y > lm[9].y
                     && lm[16].y > lm[13].y && lm[20].y > lm[17].y;
    return thumbTip.y < wrist.y && thumbTip.y < thumbIp.y && otherCurled;
  },

  // ✌️ 勝利/和平：食指+中指伸直，其餘彎曲
  peace: (lm) => {
    const indexExt = lm[8].y < lm[6].y;
    const middleExt = lm[12].y < lm[10].y;
    const ringCurl = lm[16].y > lm[13].y;
    const pinkyCurl = lm[20].y > lm[17].y;
    return indexExt && middleExt && ringCurl && pinkyCurl;
  },

  // 👈 指向：食指伸直，其餘彎曲
  pointing: (lm) => {
    const indexExt = lm[8].y < lm[6].y;
    const othersCurl = lm[12].y > lm[9].y && lm[16].y > lm[13].y
                    && lm[20].y > lm[17].y && lm[4].y > lm[3].y;
    return indexExt && othersCurl;
  },

  // 🫶 手指愛心：拇指尖與食指尖距離很近
  finger_heart: (lm) => {
    const dx = lm[4].x - lm[8].x;
    const dy = lm[4].y - lm[8].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 0.06; // 正常化座標距離
  },
};

function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  for (const [name, rule] of Object.entries(GESTURE_RULES)) {
    if (rule(landmarks)) {
      return name;
    }
  }
  return null;
}

/** 簡化版揮手偵測（基於歷史位置） */
class WaveDetector {
  constructor() {
    this.positions = [];
    this.maxHistory = 15;
  }

  update(handCenterX) {
    this.positions.push(handCenterX);
    if (this.positions.length > this.maxHistory) {
      this.positions.shift();
    }
    if (this.positions.length < 5) return false;

    // 偵測方向變化
    let directionChanges = 0;
    let lastDir = 0;
    for (let i = 1; i < this.positions.length; i++) {
      const dir = this.positions[i] - this.positions[i - 1];
      if (Math.abs(dir) > 0.01 && lastDir !== 0 && Math.sign(dir) !== Math.sign(lastDir)) {
        directionChanges++;
      }
      if (Math.abs(dir) > 0.01) lastDir = dir;
    }
    return directionChanges >= 2;
  }

  reset() {
    this.positions = [];
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { classifyGesture, WaveDetector, GESTURE_RULES };
}

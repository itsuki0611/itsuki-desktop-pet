/**
 * Gesture → Character Reaction 映射表
 */

const GESTURE_REACTIONS = {
  open_palm: {
    expression: 'surprised',
    motion: 'bounce',
    message: '哇，你在跟我揮手嗎？',
    tts: true,
  },
  fist: {
    expression: 'surprised',
    motion: 'tiltHead',
    message: 'えっと…握拳頭要做什麼？',
    tts: false,
  },
  thumb_up: {
    expression: 'smile',
    motion: 'bounce',
    message: 'えへへ，被稱讚了！',
    tts: true,
  },
  peace: {
    expression: 'smile',
    motion: 'hairFluff',
    message: '耶～',
    tts: false,
  },
  pointing: {
    expression: 'surprised',
    motion: 'lookAround',
    message: '那邊有什麼嗎？',
    tts: false,
  },
  finger_heart: {
    expression: 'shy',
    motion: 'hairFluff',
    message: '/// バカ…這樣太害羞了啦！',
    tts: true,
  },
  waving: {
    expression: 'smile',
    motion: 'bounce',
    message: 'こんにちは～',
    tts: true,
  },
};

/** 肢體反應 */
const POSE_REACTIONS = {
  hands_up: {
    expression: 'surprised',
    motion: 'bounce',
    message: '哇！發生什麼事了！？',
  },
  leaning: {
    motion: 'tiltHead',
  },
};

function getGestureReaction(gestureName) {
  return GESTURE_REACTIONS[gestureName] || null;
}

function getPoseReaction(poseName) {
  return POSE_REACTIONS[poseName] || null;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getGestureReaction, getPoseReaction, GESTURE_REACTIONS, POSE_REACTIONS };
}

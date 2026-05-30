/**
 * Response Parser — 解析 Claude 回應中的情緒標籤
 * 格式：[happy] 實際回應文字
 */

const EMOTION_MAP = {
  'happy':      { expression: 'smile',    motion: 'bounce' },
  'excited':    { expression: 'surprised', motion: 'bounce' },
  'surprised':  { expression: 'surprised', motion: 'bounce' },
  'angry':      { expression: 'angry',    motion: 'tiltHead' },
  'sad':        { expression: 'sad',      motion: null },
  'blush':      { expression: 'shy',      motion: 'tiltHead' },
  'shy':        { expression: 'shy',      motion: 'tiltHead' },
  'thinking':   { expression: 'neutral',  motion: 'lookAround' },
  'hungry':     { expression: 'surprised', motion: 'bounce' },
  'determined': { expression: 'neutral',  motion: null },
  'worried':    { expression: 'sad',      motion: null },
  'neutral':    { expression: 'neutral',  motion: null },
};

function parseResponse(rawText) {
  const tagRegex = /^\[(\w+)\]\s*/;
  const match = rawText.match(tagRegex);

  let emotion = 'neutral';
  let cleanText = rawText;

  if (match) {
    const tag = match[1].toLowerCase();
    if (EMOTION_MAP[tag]) {
      emotion = tag;
    }
    cleanText = rawText.slice(match[0].length);
  }

  const reaction = EMOTION_MAP[emotion] || EMOTION_MAP['neutral'];

  return {
    emotion,
    cleanText,
    expression: reaction.expression,
    motion: reaction.motion,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseResponse, EMOTION_MAP };
}

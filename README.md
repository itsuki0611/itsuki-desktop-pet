# 🎀 中野五月 — AI 桌面夥伴

《五等分の花嫁》的中野五月，現在活在你的桌面上！

## 功能

| 功能 | 說明 | 快捷鍵 |
|------|------|--------|
| 💬 AI 聊天 | Claude API 驅動，五月人設對話 | 雙擊角色打字 |
| 🎤 語音辨識 | Web Speech API，講話五月聽 | `F2` 開始聆聽 |
| 🔊 語音回應 | TTS 語音輸出 + 嘴形同步 | `F3` 切換語音模式 |
| 😊 角色動畫 | 眨眼、呼吸、待機動作 | 自動 |
| 🖱️ 眼睛追蹤 | 眼睛跟隨滑鼠移動 | 自動 |
| 🤚 摸頭反應 | 點擊頭部 → 五月害羞 | 點擊頭部 |
| ✋ 手勢互動 | 攝影機手勢辨識 | `F4` 開關 |
| 🕐 時間感知 | 早上/晚上不同問候語 | 自動 |
| 🖱️ 拖曳移動 | 拖曳五月到任意位置 | 拖曳角色 |

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Claude API Key

第一次啟動時，雙擊五月 → 在輸入框中輸入你的 API Key：

```
sk-ant-api03-xxxxxxxxxxxxx
```

或輸入 `api:sk-ant-...` 格式。API Key 會安全儲存在本機。

> 取得 API Key: https://console.anthropic.com/

### 3. 啟動五月

```bash
npm start
```

五月會出現在桌面右下角！

### 4. （可選）手勢追蹤

手勢追蹤需要 MediaPipe 模型檔。請下載：

```
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
```

放到 `assets/lib/mediapipe/hand_landmarker.task`，然後按 `F4` 啟用手勢追蹤。

支援手勢：
- ✋ 張開手掌 → 五月驚訝
- 👍 比讚 → 五月開心
- ✌️ 勝利手勢 → 五月微笑
- 🫶 手指愛心 → 五月臉紅害羞
- 👋 揮手 → 五月打招呼

## 快捷鍵總覽

| 按鍵 | 功能 |
|------|------|
| 雙擊角色 | 打開文字輸入 |
| 拖曳角色 | 移動視窗位置 |
| 點擊頭部 | 摸頭反應 |
| `F2` | 開始/停止語音聆聽 |
| `F3` | 切換語音/文字模式 |
| `F4` | 開關手勢追蹤 |
| `Esc` | 關閉輸入框 |

## 專案結構

```
d:\ai\
├── main.js              # Electron 主程序
├── preload.js           # 安全橋接層
├── src/renderer/
│   ├── index.html       # 主畫面
│   ├── app.js           # 主程式
│   ├── core/            # PixiJS 渲染
│   ├── ai/              # Claude AI + 五月人設
│   ├── voice/           # TTS + STT
│   ├── vision/          # 手勢追蹤
│   ├── animation/       # 待機動畫 + 嘴形同步
│   └── ui/              # 對話氣泡 + 輸入框
├── assets/
│   ├── lib/             # PixiJS, MediaPipe
│   └── models/          # Live2D 模型（後續）
└── package.json
```

## 技術棧

- **桌面框架**: Electron 33
- **渲染引擎**: PixiJS 7 (WebGL)
- **AI**: Claude API (Anthropic SDK)
- **語音合成**: Web Speech API (Chromium 內建)
- **語音辨識**: Web Speech API SpeechRecognition
- **手勢追蹤**: MediaPipe Hands (可選)
- **角色模型**: 佔位 PixiJS Graphics → 後續換 Live2D

## 未來計劃

- [ ] Live2D 五月模型替換
- [ ] Porcupine 喚醒詞（「嘿五月」）
- [ ] 更精細的肢體追蹤（身體同步）
- [ ] 多姊妹模式（一花、二乃、三玖、四葉）
- [ ] 桌面小工具（時鐘、提醒、天氣）

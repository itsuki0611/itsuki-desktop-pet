# 🎀 中野五月 AI 桌面夥伴

一個基於 **Live2D + Claude AI + Web Speech API** 的互動式桌面角色引擎。支援文字/語音對話、Live2D 角色動畫、攝影機手勢追蹤。

![demo](https://img.shields.io/badge/status-v0.1-green)
![tech](https://img.shields.io/badge/tech-PixiJS%20%7C%20Claude%20API%20%7C%20Live2D-blue)

## ✨ 功能

- 🎭 **Live2D 角色渲染** — 支援 Cubism 2/3/4 模型，自動物理模擬與待機動畫
- 🧠 **AI 對話** — Claude API 驅動，可自訂角色人設（System Prompt）
- 🎤 **語音互動** — Web Speech API 文字轉語音 + 語音辨識
- 🖐️ **手勢追蹤** — MediaPipe 即時手部關鍵點追蹤（可選）
- 🪟 **桌面浮窗模式** — 透過 Edge App 模式無邊框置頂顯示

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Claude API Key

複製 `config.example.json` 為 `config.json`，填入你的 API Key：

```json
{
  "apiKey": "sk-ant-api03-你的key"
}
```

> 🔑 取得 Key：[Anthropic Console](https://console.anthropic.com/)

### 3. 準備 Live2D 模型

將 Live2D 模型檔放入 `assets/models/你的模型/`，包含：
- `.moc3` 或 `.moc`（模型骨架）
- `.model3.json` 或 `.model.json`（模型設定）
- `textures/`（貼圖）
- `motions/`（動作，可選）

> 💡 可從 [Live2D 官網](https://www.live2d.com/download/sample-data/) 下載免費樣本模型（需註冊）

然後修改 `src/renderer/app.js` 中的模型路徑：

```js
const modelPath = '/assets/models/你的模型/模型.model3.json';
```

### 4. 啟動

```bash
npm start
```

瀏覽器打開 `http://localhost:22222`，或使用桌面浮窗模式：

```bash
start msedge --app=http://localhost:22222 --window-size=420,750
```

雙擊 `start.bat` 一鍵啟動。

## 🎮 操作指南

| 操作 | 功能 |
|------|------|
| 雙擊角色 | 打開文字輸入框 |
| `F2` | 開始/停止語音聆聽 |
| `F3` | 切換語音/文字模式 |
| `F4` | 啟動手勢追蹤（需攝影機 + MediaPipe 模型） |
| 輸入 `語音列表` | 查看可選 TTS 語音 |
| 輸入 `語音:名稱` | 切換語音 |
| 右下角 🎵 | 音樂播放器 |

## 🛠️ 技術架構

```
瀏覽器前端 (PixiJS + Live2D)
    ↕ HTTP/SSE
Node.js 後端 (server.js)
    ↕
Claude API (Anthropic)
```

| 層 | 技術 | 說明 |
|----|------|------|
| 角色渲染 | PixiJS 7 + pixi-live2d-display | WebGL 渲染 Live2D 模型 |
| AI 引擎 | Claude API (Anthropic SDK) | 串流對話 + 角色人設注入 |
| 語音合成 | Web Speech API | 內建中文 TTS，支援多語音 |
| 語音辨識 | Web Speech API | 即時語音轉文字 |
| 手勢追蹤 | MediaPipe Hands | 21 點手部關鍵點即時偵測 |
| 後端 | Node.js HTTP | API 代理 + 靜態服務 |

## 📁 專案結構

```
├── server.js              # 後端伺服器（API 代理 + 靜態檔案）
├── src/
│   └── renderer/
│       ├── index.html     # 主頁面
│       ├── app.js         # 主程式（角色初始化、互動邏輯）
│       ├── core/          # PixiJS 渲染引擎
│       ├── ai/            # AI 對話（人設、歷史管理）
│       ├── voice/         # TTS + STT 語音模組
│       ├── vision/        # MediaPipe 手勢追蹤
│       ├── animation/     # 待機動畫 + 唇形同步
│       └── ui/            # 對話氣泡、輸入框、音樂播放器
├── assets/
│   ├── lib/               # 第三方 JS 庫
│   └── models/            # Live2D 模型（自行放入）
├── config.example.json    # API Key 設定範本
└── start.bat              # Windows 一鍵啟動
```

## ⚠️ 注意事項

- `config.json` 已加入 `.gitignore`，**請勿將 API Key 上傳至公開倉庫**
- Live2D 模型檔案有版權，本倉庫不包含任何模型
- 手勢追蹤需另外下載 [MediaPipe Hand Landmarker 模型](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task) 放入 `assets/lib/mediapipe/`

## 📝 License

MIT

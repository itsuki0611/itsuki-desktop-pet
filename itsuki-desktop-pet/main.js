// Electron 桌面浮窗 — 載入本地伺服器的 Live2D 角色
const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 750,
    frame: false,         // 無邊框
    transparent: true,    // 透明背景
    alwaysOnTop: true,    // 置頂
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 載入本地伺服器的網頁
  mainWindow.loadURL('http://localhost:22222');

  // 開發用：打開 DevTools
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
});

app.on('window-all-closed', () => app.quit());

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  // 視窗控制
  minimize: () => ipcRenderer.invoke('window:minimize'),
  hide: () => ipcRenderer.invoke('window:hide'),
  show: () => ipcRenderer.invoke('window:show'),
  moveWindow: (dx, dy) => ipcRenderer.send('window:move', dx, dy),

  // Claude AI 對話
  claudeChat: (messages) => ipcRenderer.invoke('claude:chat', messages),
  onClaudeChunk: (callback) => {
    ipcRenderer.on('claude:chunk', (event, data) => callback(data));
  },
  onClaudeComplete: (callback) => {
    ipcRenderer.on('claude:complete', (event, data) => callback(data));
  },
  onClaudeError: (callback) => {
    ipcRenderer.on('claude:error', (event, data) => callback(data));
  },

  // 設定
  getApiKey: () => ipcRenderer.invoke('settings:getApiKey'),
  setApiKey: (key) => ipcRenderer.invoke('settings:setApiKey', key),

  // 事件
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
});

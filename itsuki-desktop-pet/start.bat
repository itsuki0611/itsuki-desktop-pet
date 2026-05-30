@echo off
start "五月伺服器" /min cmd /c "node server.js"
timeout /t 2 /nobreak >nul
start msedge --app=http://localhost:22222 --window-size=420,750
echo 🎀 中野五月 已啟動！

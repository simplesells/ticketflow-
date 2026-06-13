@echo off
echo === 构建前端 ===
cd /d d:\WZ_work1\frontend
call npm run build
echo === 构建后端 ===
cd /d d:\WZ_work1\backend
rmdir /s /q dist 2>nul
call npx tsc
echo === 启动服务 ===
start "TicketFlow Server" node dist/main.js
timeout /t 3 >nul
echo === 启动隧道 ===
start "Cloudflare Tunnel" cloudflared.exe tunnel --url http://localhost:5680
echo.
echo ========================================
echo  部署完成! 打开第二个窗口看公网地址
echo ========================================
pause

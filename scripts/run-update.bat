@echo off
REM ============================================================
REM 装机大师 · 每日自动更新 包装脚本
REM 由 Windows 任务计划程序(schtasks) 每日 02:17 调用
REM 实际抓价/比对/推送逻辑见 scripts/scheduled-update.js
REM ============================================================
setlocal
REM 本机沙箱代理（中国出口 IP）。若代理不存在，zol-fetch.js 会自动回退直连 ZOL。
set HTTPS_PROXY=http://127.0.0.1:54465
set https_proxy=http://127.0.0.1:54465

set NODE_BIN=C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-3\node.exe
set SCRIPT=C:\Users\Administrator\WorkBuddy\2026-09-18-11-20-24\pc-build\scripts\scheduled-update.js
set LOGDIR=C:\Users\Administrator\WorkBuddy\2026-09-18-11-20-24\pc-build\logs

if not exist "%LOGDIR%" mkdir "%LOGDIR%"

echo [%date% %time%] ===== 开始自动更新 ===== >> "%LOGDIR%\autoupdate.log"
"%NODE_BIN%" "%SCRIPT%" >> "%LOGDIR%\autoupdate.log" 2>&1
echo [%date% %time%] ===== 结束(EXIT=%ERRORLEVEL%) ===== >> "%LOGDIR%\autoupdate.log"
endlocal

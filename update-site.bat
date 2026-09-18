@echo off
chcp 65001 >nul
setlocal
title 电脑装机配件站 · 一键更新

:: 切到本脚本所在目录（即仓库根）
cd /d "%~dp0"

:: 检测 Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org （勾选 "Add to PATH"）
  pause
  exit /b 1
)

echo 开始一键更新（抓价 + 打包 + 同步 Gitee）...
echo.
node scripts/update-site.js
echo.
pause

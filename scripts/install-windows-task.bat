@echo off
REM ============================================================
REM 安装「装机大师 每日价格自动更新」Windows 任务计划
REM 用法：右键“以管理员身份运行”本文件即可创建/覆盖任务
REM 任务每天 02:17 执行 scripts/run-update.bat（抓价+推送，Netlify 自动部署）
REM ============================================================
setlocal
set BAT=C:\Users\Administrator\WorkBuddy\2026-09-18-11-20-24\pc-build\scripts\run-update.bat

schtasks /create /tn "PCBuild-DailyPriceUpdate" /tr "%BAT%" /sc daily /st 02:17 /rl HIGHEST /f

echo.
echo 任务已创建/更新。管理命令：
echo   查看：  schtasks /query /tn "PCBuild-DailyPriceUpdate"
echo   删除：  schtasks /delete /tn "PCBuild-DailyPriceUpdate" /f
echo   立即跑一次（测试）： schtasks /run /tn "PCBuild-DailyPriceUpdate"
endlocal

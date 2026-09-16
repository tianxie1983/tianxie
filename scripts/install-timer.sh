#!/bin/bash
# 在 Linux 服务器安装每日定时价格更新（systemd timer）
# 用法：sudo bash scripts/install-timer.sh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
SERVICE=/etc/systemd/system/pc-build-update.service
TIMER=/etc/systemd/system/pc-build-update.timer

cat > "$SERVICE" <<EOF
[Unit]
Description=PC Build 配件价格定时更新

[Service]
Type=oneshot
WorkingDirectory=$ROOT
ExecStart=$HERE/pipeline.sh
EOF

cat > "$TIMER" <<EOF
[Unit]
Description=每日更新 PC Build 配件价格

[Timer]
OnCalendar=*-*-* 02:17:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now pc-build-update.timer
echo "已安装 systemd 定时器（每日 02:17 执行）。查看：systemctl list-timers pc-build-update"
echo "无 systemd 时可用 crontab：17 2 * * * $HERE/pipeline.sh >> /var/log/pc-build.log 2>&1"

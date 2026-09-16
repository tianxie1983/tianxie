#!/bin/bash
# 抓取价格并提交推送到 Git 仓库
# 配合 Vercel / Netlify / GitHub Pages 的 Git 集成，push 即自动重新部署
set -e
cd "$(dirname "$0")/.."

echo "[$(date '+%F %T')] 抓取最新价格..."
node scripts/price-fetch.js

if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git remote -v | grep -q .; then
  git add web/data.js
  if git diff --cached --quiet; then
    echo "价格无变化，跳过提交"
  else
    git -c user.name="${GIT_NAME:-price-bot}" -c user.email="${GIT_EMAIL:-bot@workbuddy.local}" \
      commit -m "chore: 自动更新配件价格 $(date +%F)"
    git push
    echo "已推送，平台将自动重新部署"
  fi
else
  echo "当前不在含 remote 的 git 仓库中，仅更新本地 web/data.js"
fi

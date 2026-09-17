#!/bin/bash
# 价格更新流水线：抓取 -> 重新部署
# 部署目标自动选择：
#   - 在含 git remote 的仓库中  -> git push（真托管：Vercel/Netlify/Pages 自动部署）
#   - 在 WorkBuddy 沙箱中       -> 重新发布到沙箱链接（临时，每次换新端口刷新网关缓存）
#   - 其他                     -> 仅更新本地 web/data.js
cd "$(dirname "$0")/.."
echo "[$(date '+%F %T')] 开始抓取配件价格"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git remote -v | grep -q .; then
  echo "检测到 git remote，使用 git push 部署"
  node scripts/price-fetch.js
  bash "$(dirname "$0")/deploy-git.sh"
elif [ -n "$AGENTOS_RUNTIME_ID" ] && [ -f /root/.codebuddy/skills/发布为应用/scripts/publish.js ]; then
  echo "检测到沙箱环境，重新发布到沙箱链接（换新端口强制刷新网关缓存）"
  node scripts/price-fetch.js --publish
else
  echo "未检测到 git remote 或沙箱发布环境，仅更新本地 web/data.js"
  node scripts/price-fetch.js
fi

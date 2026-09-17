#!/usr/bin/env bash
# deploy-gitee.sh —— 在 price-fetch.js 更新 web/data.js 之后，自动提交并触发 Gitee Pages 重建
#
# 设计：仅当 web/data.js 真有变化才 commit + push；随后调用 Gitee OpenAPI 触发 Pages 重建。
# 无变化 → 不提交、不推送、不重建，天然避免「提交→触发→再提交」死循环。
#
# 环境变量（由 Gitee Go 的「变量与密钥」注入，或本地 export 提供）：
#   GITEE_TOKEN   私人令牌（projects 权限）
#   GITEE_OWNER   仓库所有者（用户名 / 组织名）
#   GITEE_REPO    仓库名
#   GITEE_EMAIL / GITEE_USER   提交身份（可选，默认 WorkBuddy Bot）
#
# 用法:
#   bash scripts/deploy-gitee.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")" && pwd)/.."

echo "[$(date '+%F %T')] 检查 web/data.js 变更..."

# 把所有可能改动加入暂存（Gitee Go 工作区干净，通常只有 web/data.js 变化）
git add -A

# 无变化则整段跳过，避免空提交
if git diff --cached --quiet; then
  echo "✔ web/data.js 无变化，跳过提交与部署。"
  exit 0
fi

echo "检测到价格变化，提交并推送..."
git config user.email "${GITEE_EMAIL:-bot@workbuddy.local}"
git config user.name "${GITEE_USER:-WorkBuddy Bot}"
git commit -m "auto: 更新配件价格 $(date '+%F %T')"

# 组装带令牌的推送地址；无令牌则回退到 origin
REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo "")"
PUSH_URL="$REMOTE_URL"
if [ -n "${GITEE_TOKEN:-}" ] && [[ "$REMOTE_URL" == https://* ]]; then
  PUSH_URL="$(echo "$REMOTE_URL" | sed -E "s#https://#https://oauth2:${GITEE_TOKEN}@#")"
fi
git push "${PUSH_URL:-origin}" HEAD:main
echo "✔ 已推送至 Gitee。"

# 触发 Gitee Pages 重建（POST /v5/repos/{owner}/{repo}/pages/builds）
if [ -n "${GITEE_TOKEN:-}" ] && [ -n "${GITEE_OWNER:-}" ] && [ -n "${GITEE_REPO:-}" ]; then
  echo "触发 Gitee Pages 重建..."
  curl -sS -X POST \
    "https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}/pages/builds?access_token=${GITEE_TOKEN}" \
    || echo "（Pages 重建请求已发出；若失败，请回 Gitee Pages 面板手动点「更新」）"
else
  echo "未设置 GITEE_TOKEN / GITEE_OWNER / GITEE_REPO，跳过 Pages 自动重建。"
  echo "请回到 Gitee 仓库 → 服务 → Gitee Pages → 点「更新」手动重建。"
fi

#!/usr/bin/env bash
# setup-gitee.sh —— 一键把「装机大师」接入 Gitee Pages 免费部署
#
# 适用: 已安装 git 的环境（沙箱可直连 gitee.com，本地亦可）
# 用法:
#   bash setup-gitee.sh <Gitee仓库URL> [Gitee私人令牌] [分支]
# 示例:
#   bash setup-gitee.sh https://gitee.com/your/pc-build.git
#   bash setup-gitee.sh https://gitee.com/your/pc-build.git gitee_xxxx_token
#
# 说明: 推送 main(或指定分支) 后，去仓库「服务 → Gitee Pages」选对应分支、
#       部署目录填 /web，启用即可得到 https://<用户名>.gitee.io/<仓库>/ 的免费站点。
# 详见 GITEE_SETUP.md。

set -euo pipefail

REPO_URL="${1:-}"
TOKEN="${2:-}"
BRANCH="${3:-main}"

if [ -z "$REPO_URL" ]; then
  echo "用法: bash setup-gitee.sh <Gitee仓库URL> [令牌] [分支]"
  echo "示例: bash setup-gitee.sh https://gitee.com/your/pc-build.git"
  exit 1
fi

command -v git >/dev/null 2>&1 || { echo "❌ 未检测到 git，请先安装: https://git-scm.com"; exit 1; }

# 若有令牌，注入 URL 做 HTTPS 鉴权（Gitee 私人令牌当作密码）
PUSH_URL="$REPO_URL"
if [ -n "$TOKEN" ]; then
  PUSH_URL="$(echo "$REPO_URL" | sed -E 's#https://#https://oauth2:'"$TOKEN"'@#')"
fi

# 切到仓库根（脚本位于 scripts/ 下）
cd "$(cd "$(dirname "$0")" && pwd)/.."

# 未提交的改动不会进入推送；如有需要请先 git add/commit
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ 检测到未提交的改动，这些改动不会被推送。如需一并上线请先："
  echo "   git add -A && git commit -m \"update\""
fi

echo "==> 关联 Gitee 远程"
git remote remove gitee 2>/dev/null || true
git remote add gitee "$PUSH_URL"

echo "==> 推送 $BRANCH 到 Gitee"
git push -u gitee "$BRANCH"

echo
echo "✅ 代码已推送到 Gitee。最后一步请在 Gitee 网页端完成："
echo "   仓库 → 服务 → Gitee Pages → 部署分支选 $BRANCH、部署目录填 /web → 启用"
echo "   启用后得到站点: https://<你的Gitee用户名>.gitee.io/<仓库名>/"
echo "   注意: Gitee Pages 在每次 push 后不会自动重建，需回到 Pages 面板点「更新」"
echo "         若要全自动(每日抓价后自动重建)，详见 GITEE_SETUP.md 的 Gitee Go 方案。"

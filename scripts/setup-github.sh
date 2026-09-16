#!/usr/bin/env bash
# setup-github.sh —— 一键把「装机大师」接入 GitHub 自动部署（定时抓价 → 自动重新部署）
#
# 适用: macOS / Linux / WSL / Git Bash（需已安装 git）
# 用法:
#   bash setup-github.sh <你的GitHub仓库URL> [本地目录] [分支]
# 示例:
#   bash setup-github.sh https://github.com/yourname/pc-build.git
#
# 本脚本只负责 git 侧 3 步（还原离线仓库 → 关联远程 → 推送）。
# 推送后还需在网页端把仓库连到 Vercel/Netlify（或开 Pages），自动部署即生效。
# 详见 GITHUB_SETUP.md。

set -euo pipefail

REPO_URL="${1:-}"
TARGET_DIR="${2:-pc-build}"
BRANCH="${3:-main}"
BUNDLE="pc-build-github.bundle"

if [ -z "$REPO_URL" ]; then
  echo "用法: bash setup-github.sh <GitHub仓库URL> [本地目录] [分支]"
  echo "示例: bash setup-github.sh https://github.com/yourname/pc-build.git"
  exit 1
fi

command -v git >/dev/null 2>&1 || { echo "❌ 未检测到 git，请先安装: https://git-scm.com"; exit 1; }

# 定位离线 bundle（优先脚本同目录，其次当前目录，便于沙箱/本地复用）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUNDLE_PATH=""
for cand in "$SCRIPT_DIR/$BUNDLE" "./$BUNDLE" "/workspace/$BUNDLE"; do
  [ -f "$cand" ] && BUNDLE_PATH="$cand" && break
done
if [ -z "$BUNDLE_PATH" ]; then
  echo "❌ 找不到 $BUNDLE，请把它和本脚本放在同一目录后重试。"
  exit 1
fi

echo "==> 1/3 从离线包还原仓库到 $TARGET_DIR"
rm -rf "$TARGET_DIR"
git clone "$BUNDLE_PATH" "$TARGET_DIR"
cd "$TARGET_DIR"

# 统一分支名
CUR_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CUR_BRANCH" != "$BRANCH" ]; then
  git checkout -B "$BRANCH"
fi

echo "==> 2/3 关联远程: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "==> 3/3 推送到 $BRANCH"
git push -u origin "$BRANCH"

echo
echo "✅ 代码已推送。最后两步请在 GitHub / 部署平台网页端完成："
echo "   A. 导入该仓库到 Vercel 或 Netlify（导入即自动部署；或开 GitHub Pages）"
echo "      Vercel: https://vercel.com/new    Netlify: https://app.netlify.com/drop"
echo "   B. 仓库 Settings → Actions → General → Workflow permissions 设为 Read and write"
echo "      之后每日 UTC 18:17 自动抓取中关村在线行情价并重新部署，无需手动操作。"
if command -v gh >/dev/null 2>&1; then
  echo "   可选: 已检测到 gh，可运行  gh repo edit <owner>/<repo> --enable-actions  确保开启。"
fi

#!/usr/bin/env node
/**
 * scheduled-update.js —— 方案 C 的本地定时抓价编排脚本（替代 GitHub Actions 的 price-update）。
 *
 * 背景：GitHub Actions 的美国机房 IP 会被 ZOL 限流(403/429/503)，且本仓库没有可用的中国出口代理，
 *       因此“抓价”这一步无法在 CI 里可靠完成。改为在本机（中国出口 + 已验证可用的 SSH 推 GitHub）
 *       定时运行本脚本：抓取 27 款 ZOL 参考价 → 仅在价格有“实质变化”时才提交并推送到 GitHub/Gitee
 *       → Netlify 监听 main 自动部署。
 *
 * 设计要点：
 *  - 全程用 Node 调用绝对路径的 git.exe / node.exe，不依赖 shell 的 grep/ls 等（本机 PATH 残缺）。
 *  - git 推送走 SSH（GIT_SSH_COMMAND 指向 Git 自带的 ssh.exe），避免 HTTPS 出站被代理 502 挡死。
 *  - ZOL 抓取走本机代理隧道（HTTPS_PROXY），拿到中国出口 IP 的 200。
 *  - 价格比对时忽略 meta.updatedAt 时间戳行，仅当“真实价格/数量”变化时才提交，避免每天产生空提交。
 *
 * 环境变量（均可选，均有默认值）：
 *   REPO_ROOT    仓库根目录（默认取本脚本上级目录）
 *   GIT_BIN      git 可执行文件路径
 *   GIT_SSH_BIN  ssh 可执行文件路径（供 GIT_SSH_COMMAND）
 *   NODE_BIN     node 可执行文件（默认 process.execPath）
 *   HTTPS_PROXY  抓 ZOL 用的代理（默认本机 127.0.0.1:54465）
 *   FORCE=1      无视价格比对，强制提交+推送一次（仅用于首次联调测试）
 *   DRY_RUN=1    跑完抓价与比对后不实际提交/推送（安全验证用）
 *
 * 用法：
 *   node scripts/scheduled-update.js            # 正常定时任务
 *   FORCE=1 node scripts/scheduled-update.js    # 强制推一次（联调）
 *   DRY_RUN=1 node scripts/scheduled-update.js  # 只验证抓价+比对，不推送
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.REPO_ROOT || path.resolve(__dirname, '..');
const GIT = process.env.GIT_BIN || 'C:/Program Files/Git/bin/git.exe';
const SSH = process.env.GIT_SSH_BIN || 'C:/Program Files/Git/usr/bin/ssh.exe';
const NODE = process.env.NODE_BIN || process.execPath;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:54465';

const FORCE = process.env.FORCE === '1';
const DRY_RUN = process.env.DRY_RUN === '1';

// 子进程统一环境：注入 SSH 与代理
const childEnv = {
  ...process.env,
  GIT_SSH_COMMAND: `"${SSH}"`,
  HTTPS_PROXY: PROXY,
  https_proxy: PROXY,
};

function runGit(args, opts = {}) {
  return execFileSync(GIT, args, { cwd: ROOT, env: childEnv, encoding: 'utf8', ...opts });
}

function runNode(scriptRel, opts = {}) {
  return execFileSync(NODE, [path.join(ROOT, scriptRel)], { cwd: ROOT, env: childEnv, ...opts });
}

// 去掉 meta.updatedAt 行，用于判断“真实价格内容”是否变化
function stripTimestamp(src) {
  return src
    .split('\n')
    .filter((l) => !/"updatedAt"/.test(l))
    .join('\n');
}

function main() {
  console.log(`[scheduled-update] 仓库根: ${ROOT}`);
  console.log(`[scheduled-update] 代理: ${PROXY}  FORCE=${FORCE}  DRY_RUN=${DRY_RUN}`);

  // 1) 抓取 ZOL 价格并重新生成 web/data.js
  console.log('\n=== 1) 抓取 ZOL 价格 ===');
  try {
    runNode('scripts/price-fetch.js', { stdio: 'inherit' });
  } catch (e) {
    console.error('[scheduled-update] price-fetch 执行失败:', e.message);
    process.exit(2);
  }

  // 2) 比对：忽略时间戳，判断是否有实质价格变化
  const dataPath = path.join(ROOT, 'web', 'data.js');
  const newData = fs.readFileSync(dataPath, 'utf8');
  let oldData = '';
  try {
    oldData = runGit(['show', 'HEAD:web/data.js']);
  } catch (e) {
    console.warn('[scheduled-update] 无法读取 HEAD 的 data.js（首次？），视为有变化');
    oldData = '';
  }
  const realChanged = stripTimestamp(newData) !== stripTimestamp(oldData);

  // 3) 健康检查（顺带，不阻塞主流程）
  console.log('\n=== 2) ZOL 链接健康检查 ===');
  let health = '';
  try {
    health = runNode('scripts/check-zol-links.js', { encoding: 'utf8' });
    console.log(health);
  } catch (e) {
    health = '[健康检查异常] ' + e.message;
    console.warn(health);
  }

  if (!realChanged && !FORCE) {
    console.log('\n[scheduled-update] 价格无实质变化，跳过提交与推送。');
    return;
  }
  if (DRY_RUN) {
    console.log('\n[scheduled-update] DRY_RUN 模式：跳过提交与推送（验证完毕）。');
    return;
  }

  // 4) 刷新静态资源版本号 + 提交
  console.log('\n=== 3) 提交并推送 ===');
  try {
    runNode('scripts/versionize.js', { stdio: 'inherit' });
  } catch (e) {
    console.warn('[scheduled-update] versionize 跳过:', e.message);
  }
  runGit(['config', 'user.name', 'price-bot']);
  runGit(['config', 'user.email', 'bot@workbuddy.local']);
  runGit(['add', 'web/data.js', 'web/index.html']);
  const dateStr = new Date().toISOString().slice(0, 10);
  runGit(['commit', '-m', `chore: 自动更新配件价格 ${dateStr}`]);

  // 5) 推 GitHub（主部署源）
  console.log('--- 推送 GitHub ---');
  try {
    runGit(['push', 'git@github.com:tianxie1983/tianxie.git', 'HEAD:refs/heads/main']);
    console.log('GitHub 推送成功');
  } catch (e) {
    console.error('[scheduled-update] GitHub 推送失败:', e.message);
    process.exit(3);
  }

  // 6) 推 Gitee（镜像，失败不阻断）
  console.log('--- 推送 Gitee（镜像） ---');
  try {
    runGit(['push', 'git@gitee.com:shishui_nianhua/tianxie.git', 'HEAD:refs/heads/main']);
    console.log('Gitee 推送成功');
  } catch (e) {
    console.warn('[scheduled-update] Gitee 推送失败（不影响主部署）:', e.message);
  }

  console.log('\n[scheduled-update] 完成：已推送新价格，Netlify 将自动重新部署。');
}

try {
  main();
} catch (e) {
  console.error('[scheduled-update] 未预期错误:', e);
  process.exit(1);
}

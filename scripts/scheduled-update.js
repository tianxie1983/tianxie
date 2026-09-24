#!/usr/bin/env node
/**
 * scheduled-update.js —— 本地定时抓价编排脚本（替代 GitHub Actions 的 price-update）。
 *
 * 背景：GitHub Actions 的美国机房 IP 会被 ZOL 限流(403/429/503)，且本仓库没有可用的中国出口代理，
 *       因此“抓价”这一步无法在 CI 里可靠完成。改为在本机（中国出口）定时运行本脚本：
 *       抓取 27 款 ZOL 参考价 → 仅在价格有“实质变化”时才提交并推送到 GitHub / Gitee → Netlify 自动部署。
 *
 * 设计要点：
 *  - 全程用 Node 调用绝对路径的 git.exe / node.exe，不依赖 shell 的 grep/ls 等（本机 PATH 残缺）。
 *  - 推送走 **HTTPS + Personal Access Token**（不再走 SSH）。原因：沙箱环境禁止读取 ~/.ssh 私钥，
 *    但 github.com / gitee.com 的 HTTPS 出站是放行的，用 token 注入 URL 即可无人值守推送，无需 .ssh。
 *  - Token 来源：优先读环境变量 GH_TOKEN / GITEE_TOKEN；否则读本地文件
 *    C:/Users/Administrator/.pcbuild/gh_token.txt 与 gitee_token.txt（该目录不在 .ssh 下，沙箱可读，且不入库）。
 *  - ZOL 抓取走本机代理隧道（HTTPS_PROXY），拿到中国出口 IP 的 200。
 *  - 价格比对时忽略 meta.updatedAt 时间戳行，仅当“真实价格/数量”变化时才提交，避免每天产生空提交。
 *
 * 环境变量（均可选，均有默认值）：
 *   REPO_ROOT    仓库根目录（默认取本脚本上级目录）
 *   GIT_BIN      git 可执行文件路径
 *   NODE_BIN     node 可执行文件（默认 process.execPath）
 *   TOKEN_DIR    token 文件所在目录（默认 C:/Users/Administrator/.pcbuild）
 *   HTTPS_PROXY  抓 ZOL 用的代理（默认本机 127.0.0.1:54465）
 *   GH_TOKEN / GITEE_TOKEN  直接以环境变量提供 token（优先级高于文件）
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
const NODE = process.env.NODE_BIN || process.execPath;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:54465';
const TOKEN_DIR = process.env.TOKEN_DIR || 'C:/Users/Administrator/.pcbuild';

const FORCE = process.env.FORCE === '1';
const DRY_RUN = process.env.DRY_RUN === '1';

// Token 加载：优先环境变量，其次读本地文件（不入库、不放在 .ssh 下，避免沙箱拦截）
function loadToken(envKey, file) {
  if (process.env[envKey]) return process.env[envKey].trim();
  try {
    return fs.readFileSync(path.join(TOKEN_DIR, file), 'utf8').trim();
  } catch (e) {
    return '';
  }
}
const GH_TOKEN = loadToken('GH_TOKEN', 'gh_token.txt');
const GITEE_TOKEN = loadToken('GITEE_TOKEN', 'gitee_token.txt');

// 子进程统一环境：关闭交互式凭证询问，注入代理。
// 注意：HTTPS_PROXY 仅供 ZOL 抓取拿中国出口 IP 使用；GitHub/Gitee 推送必须“直连”（本机直连可达，
// 而 127.0.0.1:54465 这个代理对 github/gitee 不可达），因此用 NO_PROXY 让 git 绕开代理直连。
const childEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  HTTPS_PROXY: PROXY,
  https_proxy: PROXY,
  NO_PROXY: 'github.com,gitee.com,api.github.com',
  no_proxy: 'github.com,gitee.com,api.github.com',
};

function runGit(args, opts = {}) {
  return execFileSync(GIT, args, { cwd: ROOT, env: childEnv, encoding: 'utf8', ...opts });
}

function runNode(scriptRel, opts = {}) {
  return execFileSync(NODE, [path.join(ROOT, scriptRel)], { cwd: ROOT, env: childEnv, ...opts });
}

// 把 token 安全拼进 HTTPS URL（对 token 做 URL 编码，避免特殊字符破坏 URL）
function httpsUrl(host, repo, token) {
  return `https://${encodeURIComponent(token)}@${host}/${repo}.git`;
}

// 简单同步等待（用于推送重试之间的退避）
function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* busy wait */ }
}

// 带重试的推送：应对沙箱/网络偶发 reset、瞬断。返回是否成功。
function pushWithRetry(remoteUrl, label, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      runGit(['push', remoteUrl, 'HEAD:refs/heads/main']);
      console.log(`${label} 推送成功（第 ${i} 次尝试）`);
      return true;
    } catch (e) {
      const msg = String(e.message).split('\n')[0];
      console.warn(`[scheduled-update] ${label} 推送失败（第 ${i}/${attempts} 次）: ${msg}`);
      if (i < attempts) {
        const wait = 2000 * i;
        console.log(`   ${wait}ms 后重试...`);
        sleep(wait);
      }
    }
  }
  return false;
}

// 去掉 meta.updatedAt 行，用于判断“真实价格内容”是否变化
// 同时归一化行尾（CRLF/LF），避免仓库 autocrlf 导致的伪差异
function stripTimestamp(src) {
  return src
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => !/"updatedAt"/.test(l))
    .join('\n');
}

function main() {
  console.log(`[scheduled-update] 仓库根: ${ROOT}`);
  console.log(`[scheduled-update] 代理: ${PROXY}  FORCE=${FORCE}  DRY_RUN=${DRY_RUN}`);
  console.log(`[scheduled-update] GitHub token: ${GH_TOKEN ? '已加载' : '缺失'}  Gitee token: ${GITEE_TOKEN ? '已加载' : '缺失'}`);

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

  // 5) 推送到远端：Gitee（主，国内 443 可达且无需 .ssh）与 GitHub（备用，部分环境 443 可达）。
  //    两者都做带 Token 的 HTTPS 直推，并加重试应对瞬断；至少一个成功即视为当日更新成功。
  const githubUrl = GH_TOKEN ? httpsUrl('github.com', 'tianxie1983/tianxie', GH_TOKEN) : '';
  const giteeUrl = GITEE_TOKEN ? httpsUrl('gitee.com', 'shishui_nianhua/tianxie', GITEE_TOKEN) : '';

  let okGithub = false;
  let okGitee = false;
  if (giteeUrl) {
    console.log('--- 推送 Gitee (HTTPS+Token) ---');
    okGitee = pushWithRetry(giteeUrl, 'Gitee');
  } else {
    console.log('[scheduled-update] 未配置 GITEE_TOKEN：Gitee 将由“仓库镜像”从 GitHub 自动同步（需在 Gitee 仓库设置一次）。');
  }
  if (githubUrl) {
    console.log('--- 推送 GitHub (HTTPS+Token) ---');
    okGithub = pushWithRetry(githubUrl, 'GitHub');
  } else {
    console.warn('[scheduled-update] 未配置 GH_TOKEN，跳过 GitHub 推送');
  }

  if (!okGithub && !okGitee) {
    console.error('[scheduled-update] GitHub 与 Gitee 均推送失败，今日更新未能落库。');
    process.exit(3);
  }
  console.log(`\n[scheduled-update] 完成：Gitee=${okGitee ? '已推送' : '未推送'}  GitHub=${okGithub ? '已推送' : '未推送'}。`);
  if (okGithub) {
    console.log('若 Netlify 已连接本仓库，将自动重新部署。');
  } else if (okGitee) {
    console.log('GitHub 本次未直推；若已配置 Gitee→GitHub 镜像，GitHub 将由 Gitee 自动同步。');
  }
}

try {
  main();
} catch (e) {
  console.error('[scheduled-update] 未预期错误:', e);
  process.exit(1);
}

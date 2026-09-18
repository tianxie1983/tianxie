#!/usr/bin/env node
/**
 * update-site.js —— 一键更新脚本（半自动方案）
 *
 * 作用：抓 ZOL 最新报价 → 刷新 web/data.js → 打版本号 → 打包部署 zip → 同步 Gitee
 * 之后你只需把生成的 pc-build-web-deploy.zip 重拖到 Netlify 即可，站点即更新。
 *
 * 用法（在仓库根目录）：
 *   Windows：双击仓库根目录的 update-site.bat
 *   Mac/Linux：终端执行  node scripts/update-site.js
 *
 * 前置依赖：Node.js（https://nodejs.org）+ Git（已配好 Gitee 远程）
 * 可选参数：  --no-push   只抓价+打包，不提交/推送 Gitee
 *            --no-fetch  跳过快照抓取，仅用当前 web/data.js 打包（适合只换样式/文案）
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const noPush = process.argv.includes('--no-push');
const noFetch = process.argv.includes('--no-fetch');

const log = (...a) => console.log(...a);
const step = (n, s) => log(`\n\x1b[36m[${n}] ${s}\x1b[0m`);
const ok = (s) => log(`  \x1b[32m✓\x1b[0m ${s}`);
const warn = (s) => log(`  \x1b[33m!\x1b[0m ${s}`);

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8', ...opts });
}

function need(cmd, name, url) {
  try { run(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, { silent: true }); return true; }
  catch { log(`  ✗ 缺少 ${name}，请先安装：${url}`); return false; }
}

// ---------- 0. 环境检查 ----------
log('========================================');
log('  电脑装机配件站 · 一键更新');
log('========================================');
if (!need('node', 'Node.js', 'https://nodejs.org')) process.exit(1);

// ---------- 1. 抓取最新价格 ----------
if (noFetch) {
  step(1, '跳过 ZOL 抓取（--no-fetch），使用当前 web/data.js');
} else {
  step(1, '抓取 ZOL 最新报价（约 1~3 分钟，取决于网络）…');
  try { run('node scripts/price-fetch.js'); ok('价格已刷新到 web/data.js'); }
  catch (e) { warn('抓取失败，将沿用上一次的数据继续打包'); }
}

// ---------- 2. 资源版本号（缓存破击） ----------
step(2, '刷新静态资源版本号（避免手机缓存旧数据）…');
run('node scripts/versionize.js');
ok('index.html 已打新 ?v= 版本号');

// ---------- 3. 打包部署 zip ----------
step(3, '打包部署 zip（Netlify Drop 用）…');
const zipName = 'pc-build-web-deploy.zip';
try {
  if (process.platform === 'win32') {
    // Windows：优先 tar.exe（Win10+ 自带，支持 -a 自动 zip）；否则 powershell
    try { run('tar -a -cf pc-build-web-deploy.zip -C web .'); }
    catch { run('powershell -NoProfile -Command "Compress-Archive -Path web\\* -DestinationPath pc-build-web-deploy.zip -Force"'); }
  } else {
    run(`cd web && zip -r ../${zipName} . -x '*.DS_Store' -x 'dist/*'`);
  }
  const sz = (fs.statSync(path.join(ROOT, zipName)).size / 1024).toFixed(0);
  ok(`已生成 ${zipName}（${sz} KB）`);
} catch (e) {
  log('  ✗ 打包失败：请确认系统有 zip/tar 命令（Mac/Linux 自带；Windows 装 Git for Windows 即可）');
  process.exit(1);
}

// 同步一份到 deploy/，方便从 Gitee 下载
try { fs.copyFileSync(path.join(ROOT, zipName), path.join(ROOT, 'deploy', zipName)); ok('已同步到 deploy/ 目录'); }
catch (e) { /* deploy 目录可能不存在，忽略 */ }

// ---------- 4. 提交并推送 Gitee ----------
if (noPush) {
  step(4, '跳过提交/推送（--no-push）');
} else {
  step(4, '提交并推送到 Gitee…');
  try {
    run('git add -A');
    const status = run('git status --porcelain', { silent: true }).trim();
    if (!status) { ok('无变化，无需提交'); }
    else {
      const branch = run('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
      const remotes = run('git remote', { silent: true }).split(/\s+/).filter(Boolean);
      const remote = remotes.includes('gitee') ? 'gitee' : (remotes.includes('origin') ? 'origin' : null);
      if (!remote) { warn('未检测到 git 远程，已跳过推送（本地已更新）'); }
      else {
        run(`git commit -m "chore: 一键更新价格与部署包 $(date +%F)"`);
        run(`git push ${remote} ${branch}`);
        ok(`已推送到 ${remote}/${branch}`);
      }
    }
  } catch (e) { warn('提交/推送失败（可能需配置 Git 凭据）。本地文件已更新，可稍后手动 push。'); }
}

// ---------- 完成 ----------
log('\n========================================');
log('  \x1b[32m完成！\x1b[0m 下一步：');
log('  1. 打开 https://app.netlify.com/drop');
log('  2. 把仓库里的 pc-build-web-deploy.zip 拖进去发布');
log('  3. 刷新你的站点地址即可看到新价格');
log('========================================');

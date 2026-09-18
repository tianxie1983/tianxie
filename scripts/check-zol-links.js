#!/usr/bin/env node
// check-zol-links.js —— 只读自检 scripts/zol-links.json 中每条 ZOL 链接是否存活 + 能否解析参考价
// 设计：纯读取，绝不写入 web/data.js。代理策略：优先走 ZOL_PROXY/HTTPS_PROXY 代理隧道（CI/境外 IP 被 ZOL
//       限流时必须），无代理则 Node 内置 fetch 直连。SKIP_PROXY=1 强制直连（调试用）。
// 重要：ZOL 对境外/非常用 IP 会返回 403/429/503 限流，属环境限制而非链接失效，不报警/不标红。
// 用法:
//   node scripts/check-zol-links.js              # 自动判断代理
//   SKIP_PROXY=1 node scripts/check-zol-links.js # 强制直连
const fs = require('fs');
const path = require('path');
const { fetchZol } = require('./zol-fetch');

const ROOT = process.env.REPO_ROOT || path.resolve(__dirname, '..');

(async () => {
  const links = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/zol-links.json'), 'utf8'));
  const keys = Object.keys(links);
  const results = {};
  const cache = {};
  const proxyEnv = process.env.ZOL_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy ||
                  process.env.HTTP_PROXY || process.env.http_proxy || '';
  const proxyShown = proxyEnv ? proxyEnv.replace(/\/\/[^@]*@/, '//***@') : '无(直连)';
  console.log(`待检查 ${keys.length} 条映射（含共用 URL），代理: ${proxyShown}\n`);
  for (const k of keys) {
    const url = links[k];
    if (cache[url]) { results[k] = { ...cache[url], cached: true }; continue; }
    const r = await fetchZol(url, { timeout: 9000 });
    cache[url] = r;
    results[k] = r;
    let tag;
    if (r.ok) tag = r.price ? `OK 参考价¥${r.price}` : '200但无价';
    else if (r.limited) tag = `LIMITED ${r.status}`;
    else if (r.netErr) tag = `NETERR ${r.err}`;
    else tag = `FAIL ${r.status}`;
    const viaTag = r.via === 'proxy' ? '(代理)' : '';
    console.log(`[${tag}]${viaTag} ${k} -> ${url}`);
  }
  // 真死链：HTTP 非200 且非网络层错误、非限流（限流/网络不可达均不视为链接失效）
  const fail = keys.filter((k) => !results[k].ok && !results[k].netErr && !results[k].limited);
  const neterr = keys.filter((k) => results[k].netErr);                 // 网络层不可达（CI 直连超时/被墙）
  const limited = keys.filter((k) => results[k].limited);               // 疑似限流/临时拒绝（多为 IP 地域限制）
  const noprice = keys.filter((k) => results[k].ok && !results[k].price);
  console.log(`\n==== 汇总 ====`);
  console.log(`存活(200): ${keys.length - fail.length - neterr.length - limited.length}/${keys.length}`);
  console.log(`真死链(HTTP非200且非限流): ${fail.length}  ${fail.join(', ') || '无'}`);
  console.log(`疑似限流/拒绝(403/429/503,不计为死链): ${limited.length}  ${limited.join(', ') || '无'}`);
  console.log(`网络不可达(超时/被墙,不计为死链): ${neterr.length}  ${neterr.join(', ') || '无'}`);
  console.log(`200但无参考价(可能下架/改版): ${noprice.length}  ${noprice.join(', ') || '无'}`);
  if ((neterr.length || limited.length) && fail.length === 0) {
    console.log(`警告: 全部/部分链接网络不可达或遭限流，本次跳过死链判定（多为 CI/境外 IP 被目标站限制，属环境限制而非链接失效）。`);
  }
  // 仅"真死链"才判定失败并触发 issue；网络不可达/限流不报警，避免 CI/地域网络抖动误刷 issue 或误标红
  process.exit(fail.length ? 1 : 0);
})();

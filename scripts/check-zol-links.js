#!/usr/bin/env node
// check-zol-links.js —— 只读自检 scripts/zol-links.json 中每条 ZOL 链接是否存活 + 能否解析参考价
// 设计：纯读取，绝不写入 web/data.js。网络策略：优先直连；若直连失败且环境提供 HTTPS_PROXY，
//       则自动走代理 CONNECT 隧道回退（适配沙箱/企业网）。CI(直连)环境可加 SKIP_PROXY=1 跳过代理。
// 用法:
//   node scripts/check-zol-links.js              # 本地/沙箱，直连失败自动走代理
//   SKIP_PROXY=1 node scripts/check-zol-links.js # CI 直连环境，不尝试代理
const fs = require('fs');
const path = require('path');
const tls = require('tls');
const http = require('http');
const { TextDecoder } = require('util');

const ROOT = process.env.REPO_ROOT || path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const SKIP_PROXY = process.argv.includes('SKIP_PROXY=1') || process.env.SKIP_PROXY === '1';

function proxyFromEnv() {
  const p = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!p) return null;
  try {
    const u = new URL(p);
    return { host: u.hostname, port: parseInt(u.port, 10) || 80 };
  } catch {
    return null;
  }
}
const PROXY = SKIP_PROXY ? null : proxyFromEnv();

// 抓取单个 URL：proxy 为 null 时直连，否则走 CONNECT 隧道
function doFetch(url, proxy) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const TIMEOUT = 9000;
    let socket = null;
    let settled = false;
    const done = (r) => { if (!settled) { settled = true; resolve(r); } };
    const onErr = (msg) => done({ url, via: proxy ? 'proxy' : 'direct', ok: false, netErr: true, err: msg });

    function sendReq(ws) {
      const reqStr =
        `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
        `Host: ${u.hostname}\r\n` +
        `User-Agent: ${UA}\r\n` +
        `Accept: text/html,application/xhtml+xml\r\n` +
        `Accept-Language: zh-CN,zh;q=0.9\r\n` +
        `Connection: close\r\n\r\n`;
      ws.write(reqStr);
      const chunks = [];
      ws.on('data', (d) => chunks.push(d));
      ws.on('end', () => {
        const buf = Buffer.concat(chunks);
        const he = buf.indexOf('\r\n\r\n');
        const header = buf.slice(0, he).toString('latin1');
        const sm = header.match(/HTTP\/1\.[01] (\d+)/);
        const status = sm ? parseInt(sm[1], 10) : 0;
        let price = null;
        try {
          const html = new TextDecoder('gbk').decode(buf.slice(he + 4));
          const m = html.match(/price-type[^>]*>(\d+(?:\.\d+)?)/);
          if (m) price = parseFloat(m[1]);
        } catch (e) {}
        done({ url, via: proxy ? 'proxy' : 'direct', ok: status === 200, status, price });
      });
      ws.on('error', (e) => onErr(e.message));
    }

    if (proxy) {
      const req = http.request({ host: proxy.host, port: proxy.port, method: 'CONNECT', path: `${u.hostname}:443` });
      req.setTimeout(TIMEOUT, () => { req.destroy(); onErr('proxy connect timeout'); });
      req.on('connect', (res, sock) => {
        if (res.statusCode !== 200) { onErr('proxy CONNECT ' + res.statusCode); return; }
        socket = tls.connect({ socket: sock, servername: u.hostname }, () => sendReq(socket));
        socket.setTimeout(TIMEOUT, () => { socket.destroy(); onErr('tls timeout'); });
        socket.on('error', (e) => onErr(e.message));
      });
      req.on('error', (e) => onErr(e.message));
      req.end();
    } else {
      socket = tls.connect({ host: u.hostname, port: 443, servername: u.hostname }, () => sendReq(socket));
      socket.setTimeout(TIMEOUT, () => { socket.destroy(); onErr('direct timeout'); });
      socket.on('error', (e) => onErr(e.message));
    }
  });
}

(async () => {
  const links = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/zol-links.json'), 'utf8'));
  const keys = Object.keys(links);
  const results = {};
  const cache = {};
  console.log(`待检查 ${keys.length} 条映射（含共用 URL），代理: ${PROXY ? PROXY.host + ':' + PROXY.port : '无(直连)'}\n`);
  for (const k of keys) {
    const url = links[k];
    if (cache[url]) { results[k] = { ...cache[url], cached: true }; continue; }
    let r = await doFetch(url, null);
    if (!r.ok && PROXY) r = await doFetch(url, PROXY); // 直连失败且环境有代理 -> 回退
    cache[url] = r;
    results[k] = r;
    const tag = r.ok ? (r.price ? `OK 参考价¥${r.price}` : '200但无价') : `FAIL ${r.status || r.err}`;
    console.log(`[${tag}] ${k} -> ${url}`);
  }
  const fail = keys.filter((k) => !results[k].ok && !results[k].netErr); // 真死链：HTTP 非200 且非网络层错误
  const neterr = keys.filter((k) => results[k].netErr);                 // 网络层不可达（CI 直连超时/被墙）
  const noprice = keys.filter((k) => results[k].ok && !results[k].price);
  console.log(`\n==== 汇总 ====`);
  console.log(`存活(200): ${keys.length - fail.length - neterr.length}/${keys.length}`);
  console.log(`真死链(HTTP非200): ${fail.length}  ${fail.join(', ') || '无'}`);
  console.log(`网络不可达(超时/被墙,不计为死链): ${neterr.length}  ${neterr.join(', ') || '无'}`);
  console.log(`200但无参考价(可能下架/改版): ${noprice.length}  ${noprice.join(', ') || '无'}`);
  if (neterr.length && fail.length === 0) {
    console.log(`警告: 全部/部分链接网络不可达，本次跳过死链判定（可能是 CI 环境无法直连外站，属环境限制而非链接失效）。`);
  }
  // 仅"真死链"才判定失败并触发 issue；网络不可达不报警，避免 CI 网络抖动误刷 issue 或误标红
  process.exit(fail.length ? 1 : 0);
})();

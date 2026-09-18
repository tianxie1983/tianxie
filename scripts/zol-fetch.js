// scripts/zol-fetch.js —— 统一的 ZOL 商品页抓取（代理隧道优先 / 直连回退），被 price-fetch 与 check-zol-links 共用
// 关键点：GitHub Actions 的美国机房 IP 会被 ZOL 限流（返 403/429/503），因此 CI 必须走「中国出口 HTTP 代理」
//         才能拿到 200。代理取自环境变量 ZOL_PROXY / HTTPS_PROXY（前者优先）；SKIP_PROXY=1 强制直连（调试用）。
const http = require('http');
const tls = require('tls');
const { TextDecoder } = require('util');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function getProxy() {
  if (process.env.SKIP_PROXY === '1') return null;
  const p = process.env.ZOL_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy ||
            process.env.HTTP_PROXY || process.env.http_proxy;
  if (!p) return null;
  try {
    const u = new URL(p);
    const auth = (u.username || u.password) ? `${u.username}:${u.password}` : null;
    return { host: u.hostname, port: parseInt(u.port, 10) || 80, auth };
  } catch {
    return null;
  }
}

function extractPrice(html) {
  const m = html.match(/price-type[^>]*>(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

// 经 HTTP CONNECT 隧道走代理抓取（支持代理 Basic 认证），返回完整结果对象
function tunnelGet(url, proxy, timeout) {
  return new Promise((resolve) => {
    const u = new URL(url);
    let settled = false;
    const done = (r) => { if (!settled) { settled = true; resolve(r); } };
    const onErr = (msg) => done({ ok: false, status: 0, limited: false, netErr: true, price: null, html: '', via: 'proxy', err: msg });
    const headers = proxy.auth ? { 'Proxy-Authorization': 'Basic ' + Buffer.from(proxy.auth).toString('base64') } : {};
    const req = http.request({ host: proxy.host, port: proxy.port, method: 'CONNECT', path: `${u.hostname}:443`, headers });
    req.setTimeout(timeout, () => { req.destroy(); onErr('proxy connect timeout'); });
    req.on('connect', (res, sock) => {
      if (res.statusCode !== 200) { onErr('proxy CONNECT ' + res.statusCode); return; }
      const sock2 = tls.connect({ socket: sock, servername: u.hostname }, () => {
        const reqStr =
          `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
          `Host: ${u.hostname}\r\n` +
          `User-Agent: ${UA}\r\n` +
          `Accept: text/html,application/xhtml+xml\r\n` +
          `Accept-Language: zh-CN,zh;q=0.9\r\n` +
          `Connection: close\r\n\r\n`;
        sock2.write(reqStr);
        const chunks = [];
        sock2.on('data', (d) => chunks.push(d));
        sock2.on('end', () => {
          const buf = Buffer.concat(chunks);
          const he = buf.indexOf('\r\n\r\n');
          const header = buf.slice(0, he).toString('latin1');
          const sm = header.match(/HTTP\/1\.[01] (\d+)/);
          const status = sm ? parseInt(sm[1], 10) : 0;
          const body = he >= 0 ? buf.slice(he + 4) : buf;
          let html = '';
          try { html = new TextDecoder('gbk').decode(body); } catch (e) {}
          const limited = [403, 429, 503].includes(status);
          done({ ok: status === 200, status, limited, netErr: false, price: extractPrice(html), html, via: 'proxy' });
        });
        sock2.on('error', (e) => onErr(e.message));
      });
      sock2.setTimeout(timeout, () => { sock2.destroy(); onErr('tls timeout'); });
    });
    req.on('error', (e) => onErr(e.message));
    req.end();
  });
}

// Node 内置 fetch 直连（无代理环境）。CI 直连 ZOL 会被限流，故仅作为无代理时的回退
async function directGet(url, timeout) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9', 'Accept': 'text/html,application/xhtml+xml' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    const buf = Buffer.from(await res.arrayBuffer());
    let html = '';
    try { html = new TextDecoder('gbk').decode(buf); } catch (e) {}
    const limited = [403, 429, 503].includes(res.status);
    return { ok: res.ok, status: res.status, limited, netErr: false, price: extractPrice(html), html, via: 'direct' };
  } catch (e) {
    return { ok: false, status: 0, limited: false, netErr: true, price: null, html: '', via: 'direct', err: e.message };
  }
}

async function fetchZol(url, { timeout = 15000 } = {}) {
  const proxy = getProxy();
  if (proxy) {
    const r = await tunnelGet(url, proxy, timeout);
    // 代理本身不可达（netErr）时回退直连：真实机器上代理可能不存在，
    // 而中国 IP 直连 ZOL 通常也能拿到 200，借此提升任务计划版的可用性。
    // 注意：若代理可达但 ZOL 返 403/429/503（限流），则 limited=true、netErr=false，
    // 不回退（直连更不可能过），直接返回该结果。
    if (r.netErr) {
      const d = await directGet(url, timeout);
      d.via = 'proxy-unreachable→direct';
      return d;
    }
    return r;
  }
  return await directGet(url, timeout);
}

module.exports = { getProxy, fetchZol, extractPrice };

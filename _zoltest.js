const u = 'https://www.zol.com.cn/';
const ctrl = new AbortController();
const t = setTimeout(() => ctrl.abort(), 10000);
fetch(u, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
  .then(r => { clearTimeout(t); console.log('STATUS', r.status); process.exit(0); })
  .catch(e => { clearTimeout(t); console.log('ERR', e.message); process.exit(2); });

#!/usr/bin/env node
// price-fetch.js —— 按 scripts/zol-links.json 指定的 ZOL 商品页精确抓取参考价，重新生成 web/data.js
// 设计：data/parts.js 为唯一数据源；本脚本只负责把「有精确链接」的配件价格刷新为 ZOL 实时参考价，
//       其余配件保留 data/parts.js 中的手动价。生成结果可被前端 app.js 的「ZOL 参考报价 / 详情页跳转」功能消费。
// 代理：优先走 ZOL_PROXY/HTTPS_PROXY 代理隧道（CI/境外 IP 被 ZOL 限流时必须），无代理回退直连。SKIP_PROXY=1 强制直连。
// 用法: node scripts/price-fetch.js
const fs = require('fs');
const path = require('path');
const { fetchZol } = require('./zol-fetch');

// ROOT：优先环境变量，否则用脚本所在目录的上一级（本地与 GitHub Actions 通用）
const ROOT = process.env.REPO_ROOT || path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const data = require(path.join(ROOT, 'data/parts.js'));
const util = require(path.join(ROOT, 'utils/format.js'));

// 读取精确链接映射：{ partId: zolUrl }
let zolLinks = {};
try {
  zolLinks = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/zol-links.json'), 'utf8'));
} catch (e) {
  console.warn('[warn] 读取 scripts/zol-links.json 失败，将全部保留手动价:', e.message);
}

// 抓取单个 ZOL 商品页参考价（price-type 锚点）。统一由 scripts/zol-fetch.js 处理代理隧道、GBK 解码与限流识别。
async function fetchZolPrice(url) {
  try {
    const r = await fetchZol(url, { timeout: 15000 });
    if (!r.ok) {
      console.warn('  [fetch] 响应异常:', r.status || (r.netErr ? '网络错误:' + r.err : ''), url);
      return null;
    }
    if (r.price == null) {
      console.warn('  [fetch] 未解析到参考价:', url);
      return null;
    }
    return r.price;
  } catch (e) {
    console.warn('  [fetch] 请求失败:', url, e.message);
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const updated = data.parts.map((p) => ({ ...p }));
  let autoCount = 0;
  let manualCount = 0;
  let expectedAuto = 0; // 应抓取（有 ZOL 链接）的配件数，用于判断抓取是否被限流
  const report = [];
  const cache = {}; // url -> price（同链接多配件只抓一次，省请求）

  for (const part of updated) {
    const url = zolLinks[part.id];
    if (!url) {
      part.priceSource = 'manual';
      manualCount++;
      report.push(`[手动] ${part.name} -> 保留 ¥${part.price}`);
      continue;
    }
    expectedAuto++; // 有 ZOL 链接，应被自动抓取
    let price = cache[url];
    if (price === undefined) {
      price = await fetchZolPrice(url);
      cache[url] = price; // 可能为 null（抓取失败）
      await sleep(800);
    }
    if (price && price > 0) {
      part.price = price;
      part.priceSource = 'zol';
      part.url = url;
      autoCount++;
      report.push(`[ZOL ] ${part.name} -> ¥${price}  (${url})`);
    } else {
      part.priceSource = 'manual';
      manualCount++;
      report.push(`[手动] ${part.name} -> 保留 ¥${part.price}  (抓取失败)`);
    }
  }

  // 防覆盖保护：若成功抓取比例过低（疑似被 ZOL 限流或网络异常），
  // 则不覆盖 web/data.js，保留上次的完整数据，避免残缺/旧价污染站点。
  const ratio = expectedAuto > 0 ? autoCount / expectedAuto : 1;
  if (ratio < 0.5) {
    console.error(`\n[price-fetch] ⚠️ 仅成功抓取 ${autoCount}/${expectedAuto} 款（比例 ${ratio.toFixed(2)} < 0.5）`);
    console.error('[price-fetch] 疑似被 ZOL 限流或网络异常；为保留上次完整数据，本次不覆盖 web/data.js。');
    process.exit(1);
  }

  const meta = {
    updatedAt: new Date().toISOString(),
    source: '中关村在线(ZOL)公开参考价',
    autoCount,
    manualCount,
    total: updated.length,
    note: '价格随行情波动，仅供参考；未匹配到公开报价的配件保留原价。',
  };

  // 生成 web/data.js（复用 utils/format.js 的函数，注入更新后的 parts 与 meta）
  let evSrc = util.evaluateBuild.toString().replace(/data\./g, '');
  let fmSrc = util.formatMoney.toString();
  let rwSrc = util.roundWatt.toString();
  const out = `// 本文件由 scripts/price-fetch.js 自动生成（复用 data/parts.js 与 utils/format.js）
window.PC = (function () {
  const categories = ${JSON.stringify(data.categories, null, 2)};
  const parts = ${JSON.stringify(updated, null, 2)};
  const presets = ${JSON.stringify(data.presets, null, 2)};
  const meta = ${JSON.stringify(meta, null, 2)};

  function categoryOf(key) { return categories.find(c => c.key === key); }
  function partsOfCategory(key) { return parts.filter(p => p.category === key); }
  function partById(id) { return parts.find(p => p.id === id); }

  ${fmSrc}
  ${rwSrc}
  ${evSrc}

  return { categories, parts, presets, meta, categoryOf, partsOfCategory, partById, formatMoney, roundWatt, evaluateBuild };
})();
`;
  const dest = path.join(ROOT, 'web', 'data.js');
  fs.writeFileSync(dest, out, 'utf8');
  console.log(`\n写入 ${dest}`);
  console.log(`更新统计: 自动(ZOL) ${autoCount} 款, 手动保留 ${manualCount} 款, 共 ${updated.length} 款`);
  console.log('--- 明细 ---');
  console.log(report.join('\n'));
})();

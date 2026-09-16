#!/usr/bin/env node
// price-fetch.js —— 定时抓取中关村在线(ZOL)公开报价，更新网页版配件价格
// 用法: node scripts/price-fetch.js            // 仅更新本地 web/data.js
//       node scripts/price-fetch.js --publish  // 更新并自动重新发布到线上
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { TextDecoder } = require('util');

// ROOT：优先环境变量，否则用脚本所在目录的上一级（沙箱 /workspace 与 GitHub Actions 通用）
const ROOT = process.env.REPO_ROOT || path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const ZOL_BASE = 'https://detail.zol.com.cn';
// 品类(我的 category 名) -> ZOL 列表页 slug（ssd 暂不可用，跳过）
const ZOL_SLUG = { cpu:'cpu', motherboard:'motherboard', memory:'memory', gpu:'vga', psu:'power', chassis:'case', cooler:'fan' };
const PUBLISH = process.argv.includes('--publish');

const data = require(path.join(ROOT, 'data/parts.js'));
const util = require(path.join(ROOT, 'utils/format.js'));

// 品牌/通用词（归一化时去除，避免干扰型号匹配）；保留 ryzen/core 等系列词
const BRAND_WORDS = ['nvidia','geforce','amd','intel','msi','gigabyte','技嘉','asus','华硕','zotac','索泰','colorful','七彩虹','galax','影驰','sapphire','蓝宝石','kingston','金士顿','corsair','海盗船','western digital','wd','西部数据','samsung','三星','seagate','希捷','crucial','英睿达','lexar','雷克沙','teamgroup','芝奇','gskill','asrock','华擎','evga','thermaltake','曜越','cooler master','酷冷至尊','deepcool','九州风神','lianli','联力','antec','安钛克','great wall','长城','huntkey','航嘉','segotep','耕升','xfx','盈通','maxsun','铭瑄','gainward','映众','palit','昂达','梅捷'];
// 分词：转小写 -> 去品牌/通用词 -> 去中文标点 -> 含数字的型号词；并对每个词内连写型号(如 rtx4070)再提取子片段
const GENERIC = new Set(['ddr4','ddr5','rgb','argb','m2','atx','matx','itx','eatx','pcie','oc','plus','sata','nvme','3d','v2','v3','wifi','bt','tdp','lhr']);
function tokenize(name){
  let s = (name||'').toLowerCase();
  for (const w of BRAND_WORDS) s = s.split(w).join(' ');
  s = s.replace(/ryzen\s*([0-9])/gi, 'r$1');   // 统一“锐龙 7”->“r7”，对齐 ZOL 命名
  s = s.replace(/[^a-z0-9 ]+/g, ' ');
  const toks = new Set();
  for (const w of s.split(/\s+/)) {
    if (w.length < 2) continue;
    toks.add(w);
    const re = /[a-z]*\d[\w\+]*/g; let m;
    while ((m = re.exec(w))) if (m[0].length >= 2) toks.add(m[0]);
  }
  return [...toks].filter(w => /\d/.test(w)).sort((a,b) => b.length - a.length);
}
// 主型号候选：完整 + 逐步去掉末尾字母后缀（rtx4070ti -> rtx4070t -> rtx4070），用于对齐 ZOL 连写/不同后缀写法
function truncMain(main){
  const arr = [main]; let x = main;
  while (x.length > 3 && /[a-z]/i.test(x[x.length-1])) { x = x.slice(0,-1); arr.push(x); }
  return arr;
}
async function fetchZOL(slug, pages = 3){
  const items = [];
  const seen = new Set();
  for (let pg = 1; pg <= pages; pg++) {
    const url = `${ZOL_BASE}/${slug}/` + (pg > 1 ? `?page=${pg}` : '');
    const tmp = `/tmp/zol_${slug}_${pg}.html`;
    try {
      execSync(`curl -sL --compressed -m 20 -A "${UA}" -o "${tmp}" "${url}"`, {stdio:'ignore'});
      const buf = fs.readFileSync(tmp);
      const html = new TextDecoder('gbk').decode(buf);
      for (const it of parseZOL(html)) {
        if (!seen.has(it.name)) { seen.add(it.name); items.push(it); }
      }
    } catch(e){ console.error('  [warn] ZOL 抓取失败', slug, pg, e.message); }
    if (pg < pages) await sleep(1500);
  }
  return items;
}
function parseZOL(html){
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/g; let m;
  while ((m = liRe.exec(html))) {
    const block = m[1];
    const t = block.match(/<h3><a[^>]*title="([^"]+)"/);
    const p = block.match(/price-type">(\d+(?:\.\d+)?)/);
    if (t && p) {
      const name = t[1].trim();
      items.push({ name, price: parseFloat(p[1]) });
    }
  }
  return items;
}
function matchPart(part, zolItems){
  const toks = tokenize(part.name);
  if (!toks.length) return null;
  const main = toks[0], others = toks.slice(1);
  const mains = truncMain(main);
  const hits = zolItems.filter(z => {
    if (!z.name || z.name.length < 3) return false;
    const zt = tokenize(z.name);
    if (!zt.some(zk => mains.includes(zk))) return false;   // 主型号：截断候选全等匹配（兼容 ZOL 连写/后缀差异）
    for (const t of others) { if (GENERIC.has(t)) continue; if (!zt.includes(t)) return false; }
    return true;
  });
  if (hits.length) {
    const prices = hits.map(h => h.price).sort((a,b) => a-b);
    const mid = prices[Math.floor(prices.length/2)];
    return { price: mid, count: hits.length, range: [prices[0], prices[prices.length-1]] };
  }
  return null;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const updated = data.parts.map(p => ({...p}));
  let autoCount = 0, manualCount = 0;
  const report = [];
  for (const cat of Object.keys(ZOL_SLUG)) {
    const slug = ZOL_SLUG[cat];
    process.stdout.write(`抓取 ${cat} (${slug}) ... `);
    const zol = await fetchZOL(slug);
    console.log(`得到 ${zol.length} 条报价`);
    for (const part of updated.filter(p => p.category === cat)) {
      const r = matchPart(part, zol);
      if (r && r.price > 0) {
        part.price = r.price;
        part.priceSource = 'zol';
        part.priceRange = r.range;
        part.priceMatched = r.token;
        autoCount++;
        report.push(`[ZOL ] ${part.name}  ->  ¥${part.price}  (区间¥${r.range[0]}~¥${r.range[1]}, 命中${r.count})`);
      } else {
        part.priceSource = 'manual';
        manualCount++;
        report.push(`[手动] ${part.name}  ->  保留 ¥${part.price}`);
      }
    }
    await sleep(1500);
  }
  // 无 slug 的品类（如 ssd）保持手动
  updated.filter(p => !ZOL_SLUG[p.category]).forEach(p => { p.priceSource = 'manual'; manualCount++; });

  const meta = {
    updatedAt: new Date().toISOString(),
    source: '中关村在线(ZOL)公开参考价',
    autoCount, manualCount, total: updated.length,
    note: '价格随行情波动，仅供参考；未匹配到公开报价的配件保留原价。'
  };

  // 生成 web/data.js（复用 gen_web_data 的模板，注入更新后的 parts 与 meta）
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

  if (PUBLISH) {
    // 固定用 8080 端口发布：网关对首发的 3000 端口产物有顽固缓存，
    // 换端口会创建指向新内容的新 release，否则线上会卡在旧的 8/28 快照。
    console.log('\n发布到线上 (端口 8080)...');
    execSync(`node /root/.codebuddy/skills/发布为应用/scripts/publish.js --dir ${ROOT}/web --language static --port 8080`, {stdio:'inherit'});
  }
})();

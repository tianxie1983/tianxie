/**
 * versionize.js — 给 web/index.html 的静态资源引用打上 ?v=时间戳 版本号，
 * 用于「缓存破击（cache-busting）」：浏览器/网关会把带不同 query 的文件当作新资源重新拉取，
 * 避免用户手机缓存了老的 data.js（显示为旧日期）而服务器已更新。
 *
 * 幂等：每次运行先去掉旧的 ?v=，再按当前时间写入新版本，可重复执行。
 * 资源：style.css / data.js / app.js / cover.png(og:image)
 */
const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'web', 'index.html');

const ver = (() => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const hms = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
  return ymd + hms; // 例如 202609162058
})();

let html = fs.readFileSync(INDEX, 'utf8');
const targets = ['style.css', 'data.js', 'app.js', 'cover.png'];
for (const t of targets) {
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc + '(\\?v=[0-9]*)?', 'g');
  html = html.replace(re, `${t}?v=${ver}`);
}
fs.writeFileSync(INDEX, html);
console.log(`[versionize] 资源版本号已更新为 ?v=${ver}`);

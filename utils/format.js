// utils/format.js
const data = require('../data/parts.js');

// 千分位金额
function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US');
}

// 取整到 50W
function roundWatt(w) {
  return Math.ceil(w / 50) * 50;
}

/**
 * 评估一套配置
 * @param {Object} selection 形如 { cpu: partId, motherboard: partId, ... }
 * @returns {Object} { items, total, totalPower, recommendedPsu, complete, issues }
 */
function evaluateBuild(selection) {
  const items = {};
  let total = 0;
  let totalPower = 0;

  data.categories.forEach(cat => {
    const id = selection[cat.key];
    if (id) {
      const part = data.partById(id);
      if (part) {
        items[cat.key] = part;
        total += part.price || 0;
        totalPower += part.power || 0;
      }
    }
  });

  // 基础功耗：风扇/外设/余量
  totalPower += 30;

  const recommendedPsu = roundWatt(totalPower * 1.3);

  const issues = [];
  const cpu = items.cpu;
  const mb = items.motherboard;
  const mem = items.memory;
  const psu = items.psu;

  if (cpu && mb && cpu.socket && mb.socket && cpu.socket !== mb.socket) {
    issues.push({ level: 'bad', text: `处理器（${cpu.socket}）与主板（${mb.socket}）插槽不匹配` });
  }
  if (mb && mem && mb.memType && mem.memType && mb.memType !== mem.memType) {
    issues.push({ level: 'bad', text: `主板（${mb.memType}）与内存（${mem.memType}）类型不匹配` });
  }
  if (psu && psu.watt) {
    if (psu.watt < totalPower * 1.15) {
      issues.push({ level: 'bad', text: `电源 ${psu.watt}W 不足，建议 ≥ ${recommendedPsu}W（估算功耗 ${totalPower}W）` });
    } else if (psu.watt < recommendedPsu) {
      issues.push({ level: 'warn', text: `电源余量偏小，建议 ≥ ${recommendedPsu}W（估算功耗 ${totalPower}W）` });
    } else {
      issues.push({ level: 'ok', text: `电源 ${psu.watt}W 满足需求（估算功耗 ${totalPower}W）` });
    }
  }

  const complete = data.categories.every(cat => items[cat.key]);

  return { items, total, totalPower, recommendedPsu, complete, issues };
}

module.exports = {
  formatMoney,
  roundWatt,
  evaluateBuild
};

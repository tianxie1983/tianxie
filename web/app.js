/* 装机大师 · 网页版 SPA 逻辑 */
(function () {
  const PC = window.PC;
  const $ = (s, r) => (r || document).querySelector(s);
  const view = $('#view');
  const tabbar = $('#tabbar');
  const sheet = $('#sheet');
  const sheetList = $('#sheet-list');
  const sheetTitle = $('#sheet-title');
  const toastEl = $('#toast');
  const editor = $('#editor');
  const editorTitle = $('#editor-title');
  const editorBody = $('#editor-body');

  const DRAFT_KEY = 'pc_draft';
  const BUILDS_KEY = 'pc_builds';
  const OVR_KEY = 'pc_overrides';

  // ---------- 手动维护价（用户本机覆盖） ----------
  function getOverrides() {
    try { return JSON.parse(localStorage.getItem(OVR_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function setOverrides(o) { localStorage.setItem(OVR_KEY, JSON.stringify(o)); }
  function getOverride(id) { return getOverrides()[id] || null; }
  function setOverride(id, price, note) {
    const o = getOverrides();
    o[id] = { price: Number(price) || 0, note: (note || '').trim(), at: new Date().toISOString() };
    setOverrides(o);
  }
  function clearOverride(id) {
    const o = getOverrides();
    delete o[id];
    setOverrides(o);
  }
  function withOverride(p) {
    if (!p) return p;
    const o = getOverride(p.id);
    if (o && o.price != null) {
      return Object.assign({}, p, { price: Number(o.price), overridden: true, overrideNote: o.note || '', overrideAt: o.at || '' });
    }
    return p;
  }
  // 让所有读取配件的地方（列表/详情/装机单/算价）都自动应用维护价
  (function wrapPC() {
    const _partById = PC.partById.bind(PC);
    PC.baseById = _partById;
    PC.partById = id => withOverride(_partById(id));
    const _partsOfCategory = PC.partsOfCategory.bind(PC);
    PC.partsOfCategory = key => _partsOfCategory(key).map(withOverride);
  })();

  // ---------- 持久化 ----------
  function getDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); }
    catch (e) { return null; }
  }
  function setDraft(d) { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); }
  function getBuilds() {
    try { return JSON.parse(localStorage.getItem(BUILDS_KEY)) || []; }
    catch (e) { return []; }
  }
  function setBuilds(a) { localStorage.setItem(BUILDS_KEY, JSON.stringify(a)); }

  let draft = getDraft();
  if (!draft || !draft.selection) { draft = { name: '我的装机单', selection: {} }; setDraft(draft); }

  // ---------- 状态 / 路由 ----------
  const state = {
    tab: 'home',       // home | build | mine
    view: 'home',      // home | category | detail | build | mine
    cat: null,
    partId: null,
    sort: 'default',
    stack: []          // 子页面返回栈
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso), p = n => ('0' + n).slice(-2);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  // 价格来源标记：ZOL 自动抓取价 vs 手动维护价 vs 我的维护价
  function srcTag(p) {
    if (p.overridden) return `<span class="src-tag mine">我维护</span>`;
    if (p.priceSource === 'zol') {
      const rng = (p.priceRange && p.priceRange[0] !== p.priceRange[1])
        ? ` ¥${p.priceRange[0]}~${p.priceRange[1]}` : '';
      return `<span class="src-tag zol">ZOL参考${rng}</span>`;
    }
    return `<span class="src-tag manual">手动</span>`;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.add('hidden'), 1400);
  }

  function render() {
    if (state.view === 'home') renderHome();
    else if (state.view === 'category') renderCategory();
    else if (state.view === 'detail') renderDetail();
    else if (state.view === 'build') renderBuild();
    else if (state.view === 'mine') renderMine();
    tabbar.style.display = (state.view === 'category' || state.view === 'detail') ? 'none' : 'flex';
    // 装机单底部有汇总条，额外留出空间避免遮挡
    view.style.paddingBottom = (state.view === 'build') ? '140px' : '';
    updateTabActive();
    window.scrollTo(0, 0);
  }

  function updateTabActive() {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.action === 'tab:' + state.tab);
    });
  }

  function goHome() { state.tab = 'home'; state.view = 'home'; render(); }
  function goBuild() { state.tab = 'build'; state.view = 'build'; render(); }
  function goMine() { state.tab = 'mine'; state.view = 'mine'; render(); }

  function push(view, extra) {
    state.stack.push({ view: state.view, cat: state.cat, partId: state.partId, tab: state.tab });
    state.view = view;
    if (extra) Object.assign(state, extra);
    render();
  }
  function back() {
    const prev = state.stack.pop();
    if (prev) { Object.assign(state, prev); render(); }
    else goHome();
  }

  // ---------- 首页 ----------
  function renderHome() {
    const hot = PC.parts.map(withOverride).filter(p => p.hot).map(p => {
      const c = PC.categoryOf(p.category);
      return { ...p, catName: c.name, catIcon: c.icon };
    });
    const cats = PC.categories.map(c =>
      `<div class="cat-item" data-action="cat:${c.key}">
        <div class="cat-icon">${c.icon}</div><div class="cat-name">${c.name}</div></div>`).join('');
    const presets = PC.presets.map(p =>
      `<div class="preset card" data-action="preset:${p.id}">
        <div><div class="preset-name">${esc(p.name)}</div><div class="preset-desc">${esc(p.desc)}</div></div>
        <div class="preset-go">使用 ›</div></div>`).join('');
    const hots = hot.map(p =>
      `<div class="hot card" data-action="detail:${p.id}">
        <div class="hot-icon">${p.catIcon}</div>
        <div class="hot-body"><div class="hot-name">${esc(p.name)}</div><div class="hot-cat">${p.catName} · ${esc(p.brand)}</div></div>
        <div class="price"><span class="price-symbol">¥</span>${p.price}<span class="price-unit"> 起</span></div></div>`).join('');

    view.innerHTML = `
      <div class="data-bar">数据更新于 ${fmtTime(PC.meta && PC.meta.updatedAt)} · 来源 ${esc((PC.meta && PC.meta.source) || '参考报价')} · 自动 ${PC.meta ? PC.meta.autoCount : 0} / 手动 ${PC.meta ? PC.meta.manualCount : 0}</div>
      <div class="hero">
        <div class="hero-title">装机大师</div>
        <div class="hero-sub">配件报价 · 智能装机 · 一键算价</div>
        <div class="hero-cta" data-action="tab:build">开始装机 →</div>
      </div>
      <div class="section-title">配件分类</div>
      <div class="cat-grid">${cats}</div>
      <div class="section-title">预算套餐</div>
      <div class="preset-list">${presets}</div>
      <div class="section-title">热门推荐</div>
      <div class="hot-list">${hots}</div>
      <div class="footer">价格为参考报价，以实际购买渠道为准</div>`;
  }

  // ---------- 分类 ----------
  function renderCategory() {
    const cat = PC.categoryOf(state.cat);
    let list = PC.partsOfCategory(state.cat).slice();
    if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    list = list.map(p => ({
      ...p,
      specText: (p.specs || []).slice(0, 2).map(s => s.value).join(' · ')
    }));
    const items = list.map(p =>
      `<div class="part card">
        <div class="part-main" data-action="detail:${p.id}">
          <div class="part-name">${esc(p.name)}</div>
          <div class="part-spec">${esc(p.specText)}</div>
          <div class="part-brand">${esc(p.brand)}</div>
        </div>
        <div class="part-side">
          <div class="price"><span class="price-symbol">¥</span>${p.price}</div>
          ${srcTag(p)}
          <div class="add-btn" data-action="add:${p.id}">选入</div>
        </div></div>`).join('');

    view.innerHTML = `
      <div class="sub-header">
        <div class="sub-back" data-action="back">‹</div>
        <div class="sub-title">${cat.name}</div>
      </div>
      <div class="cat-head">
        <div class="cat-head-icon">${cat.icon}</div>
        <div><div class="cat-head-name">${cat.name}</div><div class="cat-head-desc">${cat.desc} · 共 ${list.length} 款</div></div>
      </div>
      <div class="sort-bar">
        <div class="sort-item ${state.sort==='default'?'active':''}" data-action="sort:default">综合</div>
        <div class="sort-item ${state.sort==='price-asc'?'active':''}" data-action="sort:price-asc">价格↑</div>
        <div class="sort-item ${state.sort==='price-desc'?'active':''}" data-action="sort:price-desc">价格↓</div>
      </div>
      ${items}`;
  }

  // ---------- 详情 ----------
  function renderDetail() {
    const p = PC.partById(state.partId);
    if (!p) { goHome(); return; }
    const cat = PC.categoryOf(p.category);
    const base = PC.baseById(state.partId) || p;
    const srcLabel = p.overridden ? '我的维护价' : (p.priceSource === 'zol' ? 'ZOL 参考报价' : '参考报价');
    const specs = (p.specs || []).map(s =>
      `<div class="spec-row"><div class="spec-label">${esc(s.label)}</div><div class="spec-value">${esc(s.value)}</div></div>`).join('');
    view.innerHTML = `
      <div class="sub-header">
        <div class="sub-back" data-action="back">‹</div>
        <div class="sub-title">${cat.name}</div>
      </div>
      <div class="detail-head card">
        <div class="detail-icon">${cat.icon}</div>
        <div><div class="detail-name">${esc(p.name)}</div><div class="detail-brand">${cat.name} · ${esc(p.brand)}</div></div>
      </div>
      <div class="price-card card">
        <div class="price-label">${srcLabel}</div>
        <div class="price"><span class="price-symbol">¥</span>${p.price}</div>
        ${p.priceSource === 'zol' && p.priceRange ? `<div class="price-range">区间 ¥${p.priceRange[0]} ~ ¥${p.priceRange[1]}</div>` : ''}
        ${p.overridden && p.overrideNote ? `<div class="price-note">备注：${esc(p.overrideNote)}</div>` : ''}
        <div class="price-edit" data-action="manual:${p.id}">✎ ${p.overridden ? '修改我的维护价' : '手动维护价 ›'}</div>
        ${p.priceSource === 'zol' && p.url ? `<a class="price-link" href="${esc(p.url)}" target="_blank" rel="noopener">查看 ZOL 商品页 ›</a>` : ''}
      </div>
      <div class="section-title">规格参数</div>
      <div class="spec card">${specs}</div>
      <div class="detail-actions">
        <button class="btn btn-ghost" data-action="add:${p.id}">选入装机单</button>
        <button class="btn btn-primary" data-action="tab:build">去装机单</button>
      </div>`;
  }

  // ---------- 装机单 ----------
  function renderBuild() {
    draft = getDraft() || { name: '我的装机单', selection: {} };
    const sel = draft.selection || {};
    const rows = PC.categories.map(cat => {
      const id = sel[cat.key];
      const part = id ? PC.partById(id) : null;
      return { cat, part };
    });
    const res = PC.evaluateBuild(sel);
    const liveCount = rows.filter(r => r.part && r.part.priceSource === 'zol').length;
    const rowHtml = rows.map(({ cat, part }) => {
      if (part) {
        return `<div class="row card">
          <div class="row-icon">${cat.icon}</div>
          <div class="row-main" data-action="pick:${cat.key}">
            <div class="row-cat">${cat.name}</div>
            <div class="row-part">${esc(part.name)}</div>
          </div>
          <div class="row-right">
            <div class="price"><span class="price-symbol">¥</span>${part.price}</div>
            <div class="row-del" data-action="remove:${cat.key}">移除</div>
          </div></div>`;
      }
      return `<div class="row card">
        <div class="row-icon">${cat.icon}</div>
        <div class="row-main" data-action="pick:${cat.key}">
          <div class="row-cat">${cat.name}</div>
          <div class="row-empty">点击选择${cat.name} ›</div>
        </div>
        <div class="row-right"><div class="row-add" data-action="pick:${cat.key}">选择</div></div></div>`;
    }).join('');

    const issues = res.issues.map(i =>
      `<div class="issue ${i.level}"><span class="issue-dot">●</span>${esc(i.text)}</div>`).join('');

    view.innerHTML = `
      <div class="name-bar card">
        <input class="name-input" id="buildName" value="${esc(draft.name)}" placeholder="给配置单起个名字" />
        <div class="clear-link" data-action="clear">清空</div>
      </div>
      <div class="rows">${rowHtml}</div>
      <div class="issues">${issues}</div>
      <div class="summary">
        <div class="summary-info">
          <div class="summary-total">合计 <span class="price"><span class="price-symbol">¥</span>${res.total}</span></div>
          <div class="summary-sub">功耗 ${res.totalPower}W · 建议电源 ≥ ${res.recommendedPsu}W · ${liveCount} 款实时价
            ${res.complete ? '<span class="tag ok">配置完整</span>' : '<span class="tag gray">待补全</span>'}</div>
        </div>
        <button class="save-btn" data-action="save">保存配置单</button>
      </div>`;

    const nameInput = $('#buildName');
    if (nameInput) nameInput.addEventListener('input', e => {
      draft.name = e.target.value || '我的装机单';
      setDraft(draft);
    });
  }

  // ---------- 我的配置 ----------
  function renderMine() {
    const raw = getBuilds();
    const builds = raw.map(b => {
      const parts = PC.categories
        .filter(c => b.selection[c.key])
        .map(c => {
          const p = PC.partById(b.selection[c.key]);
          return { cat: c.name, icon: c.icon, name: p ? p.name : '已下架' };
        });
      return { ...b, parts };
    });
    let html;
    if (builds.length) {
      html = builds.map(b => {
        const ps = b.parts.map(pt =>
          `<div class="bp"><span class="bp-icon">${pt.icon}</span><span class="bp-cat">${pt.cat}</span><span class="bp-name">${esc(pt.name)}</span></div>`).join('');
        return `<div class="build-card card">
          <div class="build-head"><div class="build-name">${esc(b.name)}</div><div class="price"><span class="price-symbol">¥</span>${b.total}</div></div>
          <div class="build-time">${esc(b.createdAt)}</div>
          <div class="build-parts">${ps}</div>
          <div class="build-actions">
            <div class="ba ghost" data-action="load:${b.id}">载入编辑</div>
            <div class="ba danger" data-action="del:${b.id}">删除</div>
          </div></div>`;
      }).join('');
    } else {
      html = `<div class="empty">还没有保存的配置单<div class="empty-cta" data-action="tab:build">去装机单 →</div></div>`;
    }
    view.innerHTML = html;
  }

  // ---------- 选件弹层 ----------
  function openSheet(catKey) {
    const cat = PC.categoryOf(catKey);
    const selId = (getDraft().selection || {})[catKey];
    const list = PC.partsOfCategory(catKey).map(p => `
      <div class="pick ${p.id === selId ? 'picked' : ''}" data-action="pickitem:${p.id}">
        <div class="pick-body"><div class="pick-name">${esc(p.name)}</div><div class="pick-brand">${esc(p.brand)}</div></div>
        <div class="pick-side"><div class="price"><span class="price-symbol">¥</span>${p.price}</div>${p.id === selId ? '<div class="pick-check">✓</div>' : ''}</div>
      </div>`).join('');
    sheetTitle.textContent = '选择' + cat.name;
    sheetList.innerHTML = list;
    sheet.dataset.cat = catKey;
    sheet.classList.remove('hidden');
  }
  function closeSheet() { sheet.classList.add('hidden'); }

  // ---------- 手动维护价编辑器 ----------
  function openEditor(id) {
    const base = PC.baseById(id);
    if (!base) return;
    const ov = getOverride(id);
    editorTitle.textContent = '维护价 · ' + base.name;
    editorBody.innerHTML = `
      <div class="editor-row">
        <label>参考报价</label>
        <div class="editor-cur">¥${base.price}${ov ? ` → <b>¥${ov.price}</b>` : ''}</div>
      </div>
      <div class="editor-row">
        <label>我的维护价（¥）</label>
        <input class="editor-input" id="ovPrice" type="number" inputmode="decimal" value="${ov ? ov.price : base.price}" placeholder="输入你看到的实际价格" />
      </div>
      <div class="editor-row">
        <label>备注（可选）</label>
        <input class="editor-input" id="ovNote" type="text" value="${ov ? esc(ov.note) : ''}" placeholder="如：京东自营 / 9月行情" />
      </div>
      <div class="editor-tip">维护价仅保存在本机浏览器，用于覆盖参考报价，不影响其他用户；可被抓取脚本更新时保留。</div>
      <div class="editor-actions">
        ${ov ? `<div class="ba ghost" data-action="editor:clear:${id}">恢复参考价</div>` : ''}
        <div class="ba primary" data-action="editor:save:${id}">保存</div>
      </div>`;
    editor.classList.remove('hidden');
  }
  function closeEditor() { editor.classList.add('hidden'); }
  function saveOverride(id) {
    const priceEl = $('#ovPrice');
    const noteEl = $('#ovNote');
    if (!priceEl) return;
    const price = Number(priceEl.value);
    if (!price || price <= 0) { toast('请输入有效价格'); return; }
    setOverride(id, price, noteEl ? noteEl.value : '');
    closeEditor();
    toast('已保存我的维护价');
    render();
  }
  function resetOverride(id) {
    clearOverride(id);
    closeEditor();
    toast('已恢复参考价');
    render();
  }

  // ---------- 动作处理 ----------
  function handle(action, payload) {
    if (action === 'tab:home') return goHome();
    if (action === 'tab:build') return goBuild();
    if (action === 'tab:mine') return goMine();
    if (action === 'back') return back();
    if (action.startsWith('cat:')) return push('category', { cat: action.slice(4) });
    if (action.startsWith('detail:')) return push('detail', { partId: action.slice(7) });
    if (action.startsWith('preset:')) {
      const p = PC.presets.find(x => x.id === action.slice(7));
      if (!p) return;
      const selection = {};
      PC.categories.forEach(c => { if (p[c.key]) selection[c.key] = p[c.key]; });
      draft = { name: p.name, selection };
      setDraft(draft);
      return goBuild();
    }
    if (action.startsWith('sort:')) { state.sort = action.slice(5); return render(); }
    if (action.startsWith('add:')) {
      const p = PC.partById(action.slice(4));
      if (!p) return;
      draft = getDraft() || { name: '我的装机单', selection: {} };
      draft.selection = draft.selection || {};
      draft.selection[p.category] = p.id;
      setDraft(draft);
      return toast('已选入装机单');
    }
    if (action.startsWith('pick:')) return openSheet(action.slice(5));
    if (action.startsWith('remove:')) {
      draft = getDraft() || { name: '我的装机单', selection: {} };
      delete draft.selection[action.slice(7)];
      setDraft(draft);
      return render();
    }
    if (action === 'sheet:close') return closeSheet();
    if (action.startsWith('manual:')) return openEditor(action.slice(7));
    if (action === 'editor:close') return closeEditor();
    if (action.startsWith('editor:save:')) return saveOverride(action.slice(12));
    if (action.startsWith('editor:clear:')) return resetOverride(action.slice(13));
    if (action.startsWith('pickitem:')) {
      const id = action.slice(9);
      const catKey = sheet.dataset.cat;
      draft = getDraft() || { name: '我的装机单', selection: {} };
      draft.selection = draft.selection || {};
      draft.selection[catKey] = id;
      setDraft(draft);
      closeSheet();
      return render();
    }
    if (action === 'clear') {
      draft = { name: '我的装机单', selection: {} };
      setDraft(draft);
      return render();
    }
    if (action === 'save') return saveBuild();
    if (action.startsWith('load:')) {
      const raw = getBuilds();
      const rec = raw.find(b => b.id === action.slice(5));
      if (rec) { draft = { name: rec.name, selection: rec.selection }; setDraft(draft); goBuild(); }
      return;
    }
    if (action.startsWith('del:')) {
      if (!confirm('确定删除该配置单？')) return;
      setBuilds(getBuilds().filter(b => b.id !== action.slice(4)));
      return render();
    }
  }

  function saveBuild() {
    draft = getDraft() || { name: '我的装机单', selection: {} };
    const sel = draft.selection || {};
    const res = PC.evaluateBuild(sel);
    if (!res.complete) {
      if (!confirm('尚有配件未选择，确定仍要保存？')) return;
    }
    const d = new Date();
    const p2 = n => (n < 10 ? '0' + n : '' + n);
    const created = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
    const builds = getBuilds();
    builds.unshift({ id: 'b_' + Date.now(), name: draft.name || '我的装机单', selection: sel, total: res.total, totalPower: res.totalPower, createdAt: created });
    setBuilds(builds);
    draft = { name: '我的装机单', selection: {} };
    setDraft(draft);
    toast('已保存');
    setTimeout(goMine, 500);
  }

  // ---------- 事件委托 ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    handle(el.dataset.action);
  });
  // 点击弹层遮罩关闭
  sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
  // 点击编辑器遮罩关闭
  editor.addEventListener('click', e => { if (e.target === editor) closeEditor(); });

  // 启动
  render();
})();

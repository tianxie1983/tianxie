# 装机大师 · 配件报价与智能装机（网页版）

手机可直接打开的电脑装机配件报价与智能装机单工具：浏览 8 大类配件、查看规格与行情价、一键生成装机单并自动核算总价、功耗与兼容性（插槽 / 内存类型 / 电源余量），配置单可本地保存。

## 目录结构

```
web/                  网站根目录（可直接部署到任意静态托管）
  index.html          入口页（含 SEO / 分享卡片 OG 标签）
  style.css           移动端样式
  app.js              状态管理与渲染逻辑
  data.js             配件数据（由 scripts 生成，含价格来源与更新时间）
  cover.png           分享封面图
  vercel.json          Vercel 部署配置
  netlify.toml         Netlify 部署配置
  nginx.example.conf   自有 Nginx 示例
  DEPLOY.md            各平台部署步骤
data/parts.js         配件源数据（价格 / 规格 / 功耗 / 插槽 / 内存类型）
utils/format.js       数据生成与校验工具
scripts/
  price-fetch.js      抓取中关村在线(ZOL)公开报价 → 生成 web/data.js
  refresh.sh          通用刷新流水线（沙箱重发 / 含 git remote 则自动 push）
  deploy-git.sh       git 提交+推送封装
  install-timer.sh    Linux systemd 定时器安装
.github/workflows/price-update.yml   GitHub Actions 每日定时抓价并 push
```

## 本地预览

```bash
cd web && python3 -m http.server 8000
# 浏览器打开 http://127.0.0.1:8000
```

## 自动更新价格

```bash
node scripts/price-fetch.js          # 仅更新本地 web/data.js
bash scripts/refresh.sh              # 抓取 + 自动重发/推送
```

## 部署到 GitHub 自动更新

见根目录 **GITHUB_SETUP.md**：把本仓库推送到你自己的 GitHub 后，即可每日自动抓取行情价并重新部署，无需手动操作。

> 当前沙箱隧道链接 `https://a4c91a2a2f665bc60.app.workbuddy.link/` 仅作临时演示，受沙箱生命周期影响，长期公开请走上述静态托管方案。

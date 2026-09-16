# 装机大师 · 静态部署指南

本目录是一个**完全自包含的静态网站**（无任何外链 / CDN 依赖），可直接部署到任意静态托管平台，部署后域名不再依赖任何沙箱，可长期公开访问。

## 包内文件

| 文件 | 作用 |
|------|------|
| `index.html` | 入口页（含 SEO / 微信分享卡片 OG 标签） |
| `app.js` | 前端逻辑：渲染、路由、装机单计算、兼容性校验、本地保存 |
| `style.css` | 移动端样式 |
| `data.js` | 88 款配件数据 + 价格来源标记（由 `scripts/price-fetch.js` 生成） |
| `cover.png` | 分享封面图（1200×630，微信/社交分享卡片用） |
| `vercel.json` | Vercel 部署配置 |
| `netlify.toml` | Netlify 部署配置 |
| `nginx.example.conf` | 自有服务器 Nginx 示例配置 |
| `.nojekyll` | GitHub Pages 跳过 Jekyll 处理 |

> 所有资源均为**相对路径**，可部署到根域名或任意子目录，无需改动。

---

## 方式一：Vercel（最省事，推荐）

1. 注册 [vercel.com](https://vercel.com)（可用 GitHub 登录）。
2. 「Add New → Project」→ 导入包含本目录的 Git 仓库；或直接把本目录拖到 [vercel.com/new](https://vercel.com/new) 的上传区。
3. Framework Preset 选 **Other**，Build Command 留空，Output Directory 填 `.`（本目录已带 `vercel.json`，会自动识别）。
4. 点击 Deploy，几十秒后得到 `https://xxx.vercel.app` 永久链接；可在 Settings → Domains 绑定自己的域名。

## 方式二：Netlify（拖拽即部署）

1. 注册 [netlify.com](https://netlify.com)。
2. 打开 [app.netlify.com/drop](https://app.netlify.com/drop)，把本目录**直接拖进去**。
3. 自动部署完成，得到 `https://xxx.netlify.app`；在 Site settings → Domain management 绑定自定义域名。
4. 本目录已含 `netlify.toml`，缓存策略自动生效。

## 方式三：Cloudflare Pages

1. 注册 [pages.cloudflare.com](https://pages.cloudflare.com)（需 GitHub/Git 连接）。
2. 创建项目 → 连接仓库 → Build command 留空，Build output directory 填 `.`。
3. 部署后默认 `https://<project>.pages.dev`，可在 Custom domains 绑定域名（Cloudflare 免费 SSL）。

## 方式四：GitHub Pages

1. 新建仓库，把本目录内容推上去。
2. 仓库 Settings → Pages → Source 选 `main` 分支 `/ (root)`。
3. 等待约 1 分钟，访问 `https://<用户名>.github.io/<仓库名>/`。
4. 本目录已含 `.nojekyll`，确保文件原样发布、不被 Jekyll 处理。
5. 若要自定义域名，在仓库根放一个 `CNAME` 文件（内容仅一行：你的域名），并在域名 DNS 处做解析。

## 方式五：对象存储 + CDN（阿里云 OSS / 腾讯云 COS / AWS S3）

1. 创建一个**公有读**的存储桶（Bucket）。
2. 把本目录全部文件上传到桶根目录。
3. 开启「静态网站托管」/「Static Website」，默认首页设为 `index.html`。
4. 绑定自定义域名 + 开启 CDN + HTTPS（各厂商控制台均有向导）。

## 方式六：自有服务器 Nginx

1. 把本目录上传到服务器某目录（如 `/var/www/pc-build`）。
2. 参考 `nginx.example.conf` 配置 server 块（改 `server_name` 和 `root` 路径）。
3. `nginx -t` 校验后 `systemctl reload nginx`。
4. 建议配合 Let's Encrypt 申请免费 HTTPS 证书。

---

## 更新价格后重新部署

本站的 `data.js` 是**数据快照**（发布时刻的价格）。要保持价格新鲜：

1. 在本地/服务器环境运行价格抓取：
   ```bash
   node scripts/price-fetch.js        # 重新抓取 ZOL 行情并生成新 data.js
   ```
2. 把更新后的 `data.js` 重新上传 / 重新部署到上述任意平台即可。

> 若不跑抓取脚本，直接部署的也是一份可用的固定价目表，只是不会自动变价。

---

## 自动更新流水线（定时抓取 → 自动重新部署）

项目已内置「抓取 → 部署」流水线，按你的托管方式选一个触发即可。

### 通道 A：GitHub Actions 定时（最推荐，长期可靠）

适合已用 **GitHub Pages / Vercel / Netlify + Git 仓库** 的同学。定时与部署都由平台托管，不依赖任何本地进程、也不依赖沙箱。

1. 确保项目已在你自己的 GitHub 仓库，且仓库已连接 Vercel/Netlify/Pages 自动部署（见上文各方式）。
2. 仓库已包含 `.github/workflows/price-update.yml`（本包已带）。
3. 仓库 **Settings → Actions → General** 中，将 Workflow permissions 设为 **Read and write**（允许工作流推送 `data.js`）。
4. 完成。工作流默认 **每日 UTC 18:17（≈北京时间 02:17）** 自动：
   - 跑 `node scripts/price-fetch.js` 抓取 ZOL 行情 → 生成新 `web/data.js`
   - 价格有变化则 `git commit & push` → 触发平台自动重新部署
   - 也可在 Actions 页面点 **Run workflow** 手动触发一次

> 价格无变化时工作流自动跳过提交，不会空跑。

### 通道 B：自有 Linux 服务器定时（systemd / crontab）

适合把站点放在自己服务器（Nginx / 对象存储）的情况。

```bash
sudo bash scripts/install-timer.sh     # 安装 systemd 定时器，每日 02:17 执行
```

无 systemd 时改用 crontab：

```bash
(crontab -l; echo "17 2 * * * /绝对路径/scripts/pipeline.sh >> /var/log/pc-build.log 2>&1") | crontab -
```

`pipeline.sh`（即 `refresh.sh`）会智能选择部署方式：有 git remote 就 `git push`（平台自动部署），否则（沙箱环境）重发链接。

### 通道 C：沙箱临时链接自动更新

当前这个 `*.app.workbuddy.link` 是沙箱隧道，可作为临时演示：

```bash
bash scripts/refresh.sh      # 抓取 + 重发到沙箱链接
```

> 注意：沙箱回收后定时与链接都会失效，仅作临时用，长期请走通道 A / B。

### 手动立即更新

```bash
bash scripts/pipeline.sh     # 抓取并按环境自动选部署通道
```

| 流水线文件 | 作用 |
|------------|------|
| `scripts/price-fetch.js` | 抓取 ZOL 行情、生成 `web/data.js` |
| `scripts/deploy-git.sh` | git 提交 + 推送（真托管部署通道） |
| `scripts/refresh.sh` | 通用流水线：抓取 + 智能选部署通道 |
| `scripts/install-timer.sh` | 在 Linux 服务器安装 systemd 定时任务 |
| `.github/workflows/price-update.yml` | GitHub 托管定时（最稳，长期） |

---

## 注意事项

- **价格来源**：约 27 款为 ZOL 抓取参考价，其余为手动维护价（见网页内「数据更新时间」条与每款配件的 `ZOL参考` / `手动` 角标）。
- **分享卡片**：`index.html` 已加 Open Graph / Twitter Card 标签，`cover.png` 为封面图；在微信/Telegram 等粘贴链接会显示标题+摘要+封面。
- **无后端**：装机单保存在访客浏览器本地（`localStorage`），不跨设备同步——这是纯前端站点的预期行为。

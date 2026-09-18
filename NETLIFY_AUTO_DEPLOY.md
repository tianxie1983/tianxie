# Netlify + GitHub Actions 全自动部署

> 目标：**每天自动抓取 ZOL 配件价格 → 自动更新站点 → 自动重新部署**，无需任何手动操作。
> 适用：已用 Netlify Drop 上线、现需「全自动」的场景。

## 为什么需要 GitHub
Netlify Drop 是**静态快照**，自身没有定时抓取能力；沙箱会回收、Gitee Pages 已停服，都当不了长期定时器。
因此用 **GitHub Actions 当调度器**（GitHub 免费提供常驻 cron runner），每天跑价格脚本并推回仓库，由 Netlify 监听推送自动部署。

## 架构
```
每日 UTC 18:17 (≈北京 02:17)  ── GitHub Actions 触发
        │
        ├─ node scripts/price-fetch.js   → 抓 ZOL 价，重写 web/data.js
        ├─ node scripts/versionize.js    → 刷新 ?v= 缓存版本号
        └─ git commit & push 到 main
                                        │
                                        ▼
                            Netlify 监听 main 推送 → 自动重新部署
                                        │
                                        ▼
                    手机打开 https://<你的>.netlify.app/ 即见新价
```
沙箱回收、你离线，都不影响这条链路（调度与部署都在云端跑）。

## 你需要做的（一次性，约 10 分钟）

### 1. 建 GitHub 仓库（从 Gitee 导入，最省事）
1. 登录 **https://github.com** → 右上角 **New repository**
2. 仓库名随意（如 `pc-build`）
3. 选 **「Import a repository」**（或在创建页底部找 Import）→ 填入：
   ```
   https://gitee.com/shishui_nianhua/tianxie.git
   ```
   > `tianxie` 已是**公开**仓库，GitHub 可直接拉取，无需 Gitee 凭据。
4. 等待导入完成 → 你的 GitHub 仓库里就有完整代码（含 `.github/workflows/price-update.yml`、`netlify.toml`）。

### 2. 让 Netlify 连 GitHub（域名不变）
1. 打开 Netlify 现有站点 **frolicking-panda-50736e** → **Site settings → Build & deploy → Deploy settings**
2. 点 **Connect to Git provider → GitHub** → 授权并选中刚才的仓库
3. 确认：
   - Branch to deploy：`main`
   - **Publish directory：`web`**（仓库根目录的 `netlify.toml` 已声明，会自动识别；若手动填也填 `web`）
   - Base directory：留空（默认仓库根）
4. 保存 → Netlify 会**立刻自动部署一次**当前 `main` 代码（这就是首次自动部署，验证链路通了）

### 3. 启用 GitHub Actions
1. 进 GitHub 仓库 → **Settings → Actions → General**
2. 确认 **Allow all actions and reusable workflows** 已选（默认即开）
3. 无需额外密钥：工作流用仓库自带的 `GITHUB_TOKEN` 推送。

## 验证全自动是否生效
- **首次**：连 Git 后 Netlify 自动部署一次，打开站点时间应为最新。
- **每日**：GitHub 仓库 **Actions** 标签下能看到每天一次的 `定时更新配件价格` 运行记录。
  - 若当天 ZOL 价格有变 → 工作流 `git push` → Netlify 自动重新部署 → 站点时间更新。
  - 若当天价格无变化 → 工作流日志显示「价格无变化，跳过本次部署」（正常，省一次部署）。
- **手动触发验证**：仓库 **Actions → 定时更新配件价格 → Run workflow** 可立即跑一次。

## 文件清单（本方案相关）
| 文件 | 作用 |
|------|------|
| `.github/workflows/price-update.yml` | 每日定时抓价 → 提交推送，触发 Netlify 部署 |
| `netlify.toml` | 声明发布目录为 `web/`，Netlify 连 Git 时自动读取 |
| `scripts/price-fetch.js` | 抓取 ZOL 价格并重写 `web/data.js` |
| `scripts/versionize.js` | 刷新 `?v=` 缓存版本号，防止浏览器用旧缓存 |

## 常见问题
- **Q：为什么不用沙箱/ Gitee Go 当定时器？** 沙箱会回收、Gitee Pages 已停服，二者都不可靠；GitHub Actions 是免费且常驻的调度器。
- **Q：每天部署会扣费吗？** Netlify 与 GitHub Actions 免费额度对个人站足够，每天一次部署无压力。
- **Q：想立刻看到自动更新？** 手动在 Actions 点 Run workflow；或改一处价格让 `data.js` 变化，次日即自动更新。
- **Q：换平台（Vercel/Cloudflare）？** 工作流只负责「抓价+推送」，部署交给所连平台；把 Netlify 换成 Vercel/Cloudflare 连同一 GitHub 仓库即可，工作流不用改。

# 接入 GitHub 自动部署（定时抓价 → 自动重新部署）

> 场景：把本仓库推送到你自己的 GitHub，之后每天自动抓取中关村在线行情价、生成 `web/data.js` 并提交，由 Vercel / Netlify / GitHub Pages 自动重新部署。你无需任何手动操作。

## 一、把代码还原成可推送的仓库

本项目的开发沙箱无法直连 GitHub，因此交付的是 `git bundle` 离线包（一个 `.bundle` 文件，内含完整 git 历史）。在**能联网 GitHub 的电脑**上执行：

```bash
# 1) 把 bundle 还原为本地仓库
git clone pc-build-github.bundle pc-build
cd pc-build

# 2) 确认内容完整（应含 web/ data/ scripts/ .github/）
ls
```

## 二、推送到你自己的 GitHub

```bash
# 1) 在 github.com 新建一个【空仓库】（不要勾选 README/.gitignore）
# 2) 关联远程并推送
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main      # 若默认分支是 master，用 git push -u origin master
```

## 三、让平台自动部署

任选其一：

- **Vercel（最省事）**：导入该仓库 → Framework 选 `Other` → Build Output 留空 / 或指定 `web` → Deploy。之后每次 `git push` 自动上线。
- **Netlify**：把 `web/` 目录或直接连仓库（Build command 留空，Publish directory 填 `web`）→ Deploy。
- **GitHub Pages**：仓库 Settings → Pages → Source 选 `main` 分支、`/ (root)` 或 `/web` → Save。（注意：若想让"抓价 commit"自动触发 Pages 重新部署，需将工作流的推送 token 换成有写权限的 PAT 或专用 deploy key；详见下方注意事项。）

## 四、开放 Actions 写权限

仓库 **Settings → Actions → General → Workflow permissions** 设为 **Read and write**（否则定时抓价后无法把 `data.js` 推回仓库）。

设好后 Actions 页会出现 `定时更新配件价格` 工作流，默认每日 UTC 18:17（≈北京 02:17）运行，也可在 Actions 页手动 `Run workflow` 立即触发。

## 五、可选：自有服务器定时刷新

若部署在你自己的服务器，可让服务器每天本地抓价并 push（触发平台重部署）：

```bash
sudo bash scripts/install-timer.sh     # 安装 systemd 每日定时器（调用 refresh.sh）
```

---

## 注意事项

1. **数据源覆盖**：抓取源为中关村在线(ZOL)公开列表页，仅收录部分在售型号（如 RTX 40 系、部分 Intel 14 代未被收录），覆盖率约 30/88。未收录型号保留原价并标记为「手动」。要扩大覆盖，可把参考数据对齐到 ZOL 在列型号，或给单品绑定商品 URL。
2. **海外访问 ZOL**：GitHub Actions 运行在海外，抓取国内 ZOL 可能偏慢或不稳定。若某次抓价失败，`data.js` 不变、提交被跳过，站点仍用上次成功的数据，不会"开天窗"。
3. **GitHub Pages 链式触发**：用 `GITHUB_TOKEN` 推送的 commit 默认**不会**再触发其它 workflow。因此若 Pages 部署也依赖 workflow 监听 push，需要改用 PAT / deploy key。Vercel、Netlify 的 Git 集成在自家平台监听 push，不受此限——这是更推荐的组合。
4. **本地沙箱隧道**：`scripts/refresh.sh` 在开发沙箱内会走 `scripts/price-fetch.js --publish` 重发临时链接；一旦检出到 git remote，则自动改为 `git push` 通道，不会误调沙箱发布逻辑。
5. **自定义价格源**：改 `data/parts.js` 即可增删型号或调价；重跑 `node scripts/price-fetch.js` 会重新生成 `web/data.js`。

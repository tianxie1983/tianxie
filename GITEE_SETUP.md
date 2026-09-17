# 装机大师 · Gitee Pages 免费部署指南

纯静态站点（HTML/CSS/JS），可免费托管在 **Gitee Pages**，国内访问快、零费用。
相比 GitHub：本沙箱**无法直接连 GitHub**（返回 `000`），但**能直连 gitee.com**，
所以走 Gitee 反而更省事——无需离线 bundle，可直接推送。

---

## 一、稳定托管（推荐，5 分钟）

1. 在 https://gitee.com 新建一个**空仓库**（仓库名随意，如 `pc-build`）。
2. 拿到仓库地址，例如 `https://gitee.com/你的名/pc-build.git`。
3. 推送代码（任选其一）：
   - **用我们的一键脚本**（沙箱内或本地均可）：
     ```bash
     bash scripts/setup-gitee.sh https://gitee.com/你的名/pc-build.git
     ```
     若想让脚本自动鉴权（不手输密码），可附带私人令牌：
     ```bash
     bash scripts/setup-gitee.sh https://gitee.com/你的名/pc-build.git <你的Gitee私人令牌>
     ```
     > 私人令牌在 Gitee：设置 → 私人令牌 → 生成（勾选 `projects` 权限）。
   - **或手动推送**：
     ```bash
     git remote add gitee https://gitee.com/你的名/pc-build.git
     git push -u gitee main
     ```
4. 在 Gitee 仓库页 → **服务 → Gitee Pages**：
   - 部署分支：`main`
   - 部署目录：`/docs`   （流水线会自动把 `web/` 镜像到 `docs/`；Gitee Pages 个人版仅支持 `/` 与 `/docs`，不支持 `/web`）
   - 勾选「强制使用 HTTPS」→ 点「启动」
5. 得到站点：`https://<你的Gitee用户名>.gitee.io/<仓库名>/`
   手机浏览器直接打开即可，功能与当前线上版一致。

> 自定义域名需 Gitee 实名认证；免费子域名 `*.gitee.io` 已足够。

---

## 二、每日自动更新价格（进阶）

站点文件里 `web/data.js` 的价格由定时脚本 `scripts/price-fetch.js` 生成。
**难点**：Gitee Pages 在每次 push 后**不会自动重建**，必须回到 Pages 面板点「更新」。
要让「每日抓价 → 自动重新部署」全自动，有两个办法：

### 方案 A：Gitee Go 全自动流水线（推荐，已为你写好）

仓库里已放好两个文件，开箱即用：

| 文件 | 作用 |
|------|------|
| `.workflows/gitee-go.yml` | Gitee Go 流水线：监听 `push` + 每日定时触发，跑价格脚本并自动部署 |
| `scripts/deploy-gitee.sh` | 提交 `web/data.js` 并调用 Gitee OpenAPI 触发 Pages 重建 |

**启用步骤：**

1. 先按「一」完成代码推送，并到 **服务 → Gitee Pages** 手动启动一次（分支 `main`、目录 `/docs`）。
   > 必须**先手动启动一次** Pages，之后流水线里的重建接口才会生效。
2. 仓库 → **DevOps → 流水线** → 新建流水线，选择本仓库的 `.workflows/gitee-go.yml`。
3. 流水线「设置 → 变量与密钥」里添加三项：
   - `GITEE_TOKEN`（**密钥**类型）：具备 `projects` 权限的私人令牌
   - `GITEE_OWNER`（变量）：你的 Gitee 用户名 / 组织名
   - `GITEE_REPO`（变量）：仓库名
4. 保存并「运行」，或在 **设置 → 触发规则** 开启定时（默认每天 UTC 10:00 跑一次）。
5. 之后每天：自动抓 ZOL 价 → 更新 `web/data.js` → 推送到 `main` → 自动重建 Pages，手机端刷新即可看到新价。

**防循环机制（已内置）**：`deploy-gitee.sh` 只在 `web/data.js` 真有变化时才提交+推送；
无变化时整段跳过，因此不会形成「提交→触发→再提交」的死循环。Gitee Go 免费额度（每月运行次数/分钟数）对个人小站足够。

> 若你的 Gitee Go 版本 YAML 字段有差异（如镜像名、变量注入语法），以 Gitee 控制台实际报错为准微调即可，核心逻辑不变：`node scripts/price-fetch.js` → `bash scripts/deploy-gitee.sh`。

### 方案 B：沙箱定时脚本 + 手动「更新」（零配置备选）
若暂时不想接 Gitee Go，可保留沙箱里的每日抓价（`scripts/refresh.sh`），它负责重新生成 `data.js` 并推到 Gitee；
你只需偶尔回 Pages 面板点一下「更新」刷新页面。半自动，但零额外配置。

---

## 三、与 GitHub 方案的对比

| 维度 | Gitee Pages | GitHub + Vercel |
|------|-------------|-----------------|
| 国内访问速度 | 快 | 一般（需加速） |
| 沙箱可直连 | ✅ 可 | ❌ 不可（需离线 bundle） |
| 免费静态托管 | ✅ | ✅ |
| push 后自动重建 | ❌ 需点「更新」/ Gitee Go | ✅ Vercel 自动 |
| 每日全自动成本 | Gitee Go 免费额度 | GitHub Actions 免费额度 |

**结论**：只想稳妥地免费长期展示 → Gitee Pages 最省心；想要真正的「每日全自动」→ GitHub+Vercel 更顺。
两者不冲突，可同时部署。

---

## 四、本次已部署仓库备注（Gitee 仅作代码备份）

> ⚠️ **Gitee Pages 已停服（2026-09 实测）**：将仓库设为公开后，「服务」菜单仍无 Gitee Pages 入口，下方 Gitee Pages / Gitee Go 步骤**已失效**，请勿再尝试。站点实际部署改走 **Netlify Drop**（拖 `pc-build-web-deploy.zip` 即上线），Gitee 仓库仅保留作代码备份。
>
> 以下为当前实际部署信息，方便日后维护与回看。

| 项 | 内容 |
|----|------|
| 仓库地址 | `https://gitee.com/shishui_nianhua/tianxie.git` |
| 用户名 / Owner | `shishui_nianhua` |
| 仓库名 / Repo | `tianxie` |
| 推送方式 | **SSH 部署公钥**（已添加到仓库，免令牌推送；公钥标题 `workbuddy-sandbox`） |
| 站点目录 | 开发源在 `web/`，流水线自动镜像到 `docs/` |
| Gitee Pages 部署目录 | **`/docs`**（个人版仅支持 `/` 与 `/docs`，故未用 `/web`） |
| 预期访问地址 | `https://shishui_nianhua.gitee.io/tianxie/` ← **待你在 Pages 面板「启动」后生效** |

### 你还需在 Gitee 网页端做 2 步

**① 启动 Gitee Pages（必做，否则网站打不开）**
1. 仓库 → **服务 → Gitee Pages**
2. 部署分支：`main`、部署目录：**`/docs`**、勾「强制使用 HTTPS」→ 启动
3. 得到上面「预期访问地址」，手机直接打开
> 前置可能卡点：① Gitee Pages **需实名认证**；② **仓库需公开**（私有仓库 Pages 要会员）。

**② 启用 Gitee Go 全自动（可选，但要每日自动更新价就必做）**
1. 仓库 → **DevOps → 流水线** → 新建，选 `.workflows/gitee-go.yml`
2. 「变量与密钥」加三项：
   - `GITEE_TOKEN`（**密钥**）：具备 `projects` 权限的私人令牌（此处仍需令牌，与①的 SSH 部署密钥不冲突）
   - `GITEE_OWNER` = `shishui_nianhua`
   - `GITEE_REPO` = `tianxie`
3. 保存并运行；定时默认每天 UTC 10:00 抓价→更新→重建

### 完成清单

- ✅ 代码已推送 `main`（含 `web/`、`docs/`、`scripts/`、`GITEE_SETUP.md` 等）
- ✅ SSH 部署公钥已添加，推送免令牌
- ⏳ 待你：Gitee Pages「启动」一次（目录 `/docs`）
- ⏳ 待你（如需全自动）：Gitee Go 配置 `GITEE_TOKEN` / `GITEE_OWNER` / `GITEE_REPO`
- ⏳ 启动后把访问地址发我，我帮你核验页面是否正常

> 后续若改了 `web/` 内容，直接 `git push gitee main` 即可；`docs/` 会由部署/流水线自动镜像，无需手改。

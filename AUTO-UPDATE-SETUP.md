# 装机大师 · 自动更新与部署配置指南

> 本文档说明「装机大师」PC 配件价格站如何实现**全平台自动抓价 + 自动部署**，
> 以及首次上线时需要在各平台做的一次性配置。配置完成后，每天 **北京时间 02:17**
> 自动抓取 ZOL 价格、提交、推送并重新部署，**无需本机或人工参与**。

---

## 一、自动更新链路（架构）

```
        ┌─────────────────────┐         ┌─────────────────────┐
        │  GitHub Actions     │         │  Gitee Go           │
        │  (美国 IP · 兜底)    │         │  (国内 IP · 主力)    │
        └─────────┬───────────┘         └─────────┬───────────┘
                  │ 每天 02:17 抓 ZOL 价            │ 每天 02:17 抓 ZOL 价
                  │ 提交 data.js                    │ 提交 data.js
                  └──────────────┬─────────────────┘
                                 │ 推送到
                    ┌────────────┴────────────┐
                    ▼                         ▼
              GitHub 仓库               Gitee 仓库
          (tianxie1983/tianxie)    (shishui_nianhua/tianxie)
                    │
                    │ 推送触发自动部署
                    ▼
              Netlify 站点
          (frolicking-panda-50736e · 发布目录 web)
```

- **GitHub Actions**（`.github/workflows/price-update.yml`）：美国机房 IP，直连 ZOL 偶有限流风险，
  脚本已做「重试 + 退避 + 防覆盖保护」，**互为兜底**。推 GitHub 用内置 `GITHUB_TOKEN`，推 Gitee 用 Secret `GITEE_TOKEN`。
- **Gitee Go**（`.workflow/daily-price-update.yml`）：国内 IP，直连 ZOL 不受限，是**最稳的主力执行器**。
  抓取完整后提交并同步推回 GitHub。
- **Netlify**：连接 GitHub 仓库后，**每次推送自动部署**站点。

---

## 二、首次上线必做（否则站点永远停在旧版本）

> 根因：当前 Netlify 站点是「拖放部署」的旧快照，不随 GitHub 更新。必须把 Netlify 改成
> 「连接仓库自动部署」，推送才会触发重新发布。

1. 打开 [app.netlify.com](https://app.netlify.com) → 进入站点 `frolicking-panda-50736e`
2. **Build & deploy → Connect repository** → 选 GitHub 仓库 `tianxie1983/tianxie`
3. 发布目录（Publish directory）填 **`web`**，构建命令留空，保存
4. 点 **Trigger deploy → Deploy site** 手动触发一次，确认能拉到最新代码
5. 顺手关闭角标：**Site configuration → General → Powered by Netlify badge → 关闭**

> 仅完成这一步，GitHub Actions 这条线即可实现「抓价 → 推 GitHub → Netlify 自动发布」最小闭环。

---

## 三、建议配置（双平台冗余 + 国内 IP 主力更稳）

### 3.1 GitHub Actions 推 Gitee 所需的密钥
1. GitHub 仓库 → **Settings → Secrets and variables → Actions → New repository secret**
2. Name：`GITEE_TOKEN`，Value：你的 Gitee 私人令牌
   （生成：Gitee → 设置 → 私人令牌，勾选 `projects` 权限）
3. 保存。GitHub 推自己用内置 `GITHUB_TOKEN`，无需额外配置。

### 3.2 开启 Gitee Go（国内 IP 主力）
1. Gitee 仓库 `shishui_nianhua/tianxie` → 流水线 / DevOps → 开启 **Gitee Go**
2. 在流水线中配置 4 个环境变量：

   | 变量名            | 值                          | 说明                     |
   |-------------------|-----------------------------|--------------------------|
   | `GITEE_USERNAME`  | `shishui_nianhua`           | 你的 Gitee 用户名         |
   | `GITEE_TOKEN`     | `<你的 Gitee 令牌>`         | projects 权限             |
   | `GITHUB_USERNAME` | `tianxie1983`               | 你的 GitHub 用户名        |
   | `GITHUB_TOKEN`    | `<GitHub PAT>`              | 需 `contents:write` 权限  |

3. 保存后 Gitee Go 每天 02:17 自动抓全 27 款 → 提交 → 推回 GitHub → Netlify 部署。

---

## 四、安全建议（强烈推荐）

之前对话中暴露过 GitHub PAT（`ghp_K2…` 开头）。请尽快处理：
- 去 **GitHub → Settings → Developer settings → Personal access tokens** 将旧令牌**撤销/轮换**
- 新令牌直接填到上面 3.2 的 `GITHUB_TOKEN` 环境变量即可

> 令牌只存放在平台侧（GitHub Secrets / Gitee 环境变量），**不写进仓库代码**，更安全。

---

## 五、如何验证配置成功

- **Netlify**：配置完成后，Deploy 列表是否出现新部署；或直接等次日 02:17，看站点日期是否更新。
- **GitHub Actions**：仓库 → Actions → 「每日自动更新配件价格」→ 右上角 **Run workflow** 手动跑一次，
  查看是否成功提交并推送 Gitee。
- **Gitee Go**：Gitee → 流水线 → 手动触发一次，查看日志中 27/27 抓取与双端推送是否成功。

---

## 六、故障排查

| 现象                         | 可能原因 / 处理                                               |
|------------------------------|--------------------------------------------------------------|
| 站点仍显示旧日期             | Netlify 未连接仓库（见第二章）；或当天价格无变化被跳过        |
| GitHub Actions 报 ZOL 限流   | 美国 IP 被限流属正常；脚本会自动跳过不写数据，次日 Gitee Go 兜底 |
| Gitee 推送失败               | 检查 `GITEE_TOKEN` 是否有效、是否勾 `projects` 权限            |
| GitHub 推送失败              | 检查 `GITHUB_TOKEN` 是否含 `contents:write`                   |
| 角标还在                     | Netlify UI 关闭 badge（第二章第 5 步），比代码 CSP 更可靠     |

---

## 七、关键事实备忘

- GitHub 真实地址：`git@github.com:tianxie1983/tianxie.git`（用户名 `tianxie1983`，非 Gitee 的 `shishui_nianhua`）
- Gitee 真实地址：`git@gitee.com:shishui_nianhua/tianxie.git`
- 定时（UTC）：`17 18 * * *` = 北京时间次日 02:17
- 抓取脚本：`scripts/price-fetch.js`（聚合）、`scripts/zol-fetch.js`（直连抓取，含抗限流）
- 防覆盖保护：抓取成功率 < 0.5 时不写 `data.js`，保留上次完整数据
- 发布目录：**`web`**

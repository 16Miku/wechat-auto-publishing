---
name: wechat-auto-publishing-complete
description: >
  Use this skill for a reproducible WeChat Official Account workflow with dual channels
  (API draft and/or Chrome browser publish) and production default draft_notify_feishu:
  API draft/add then Feishu notify for human formal publish in mp admin (avoids freepublish
  visibility bugs on Linux/OpenClaw). Also covers browser publish, Feishu QR verify push,
  multi-account checks, image/gallery strategy, and archival. Keep secrets outside the package.
---

# WeChat Auto Publishing Complete

本 Skill 用于复现、文档化和运营一套**本地/服务器可交接**的微信公众号发文工作流。

## 发布通道与生产默认

| 通道 | 名称 | 适用场景 |
|------|------|----------|
| **A** | **微信开放平台 API** | 草稿入库、定时、Linux/OpenClaw |
| **B** | **Chrome 操控本地浏览器** | Windows 本机、要与后台「发表」一致的自动化点击 |

| 模式 | 含义 | 推荐场景 |
|------|------|----------|
| **`draft_notify_feishu`** | API 仅草稿 → **飞书待办** → **人手后台发表** | **Linux/OpenClaw 默认生产** |
| `draft_only` | 仅草稿，不通知 | 调试 |
| `browser_full` | 本机浏览器发表 + 可选飞书推验证码 | 有桌面、要少点几次 |
| `api_freepublish` | draft + freepublish | 实验；接受可见性异常 |

> **生产默认（服务器）**：`publish_channel=api` + `publish_mode=draft_notify_feishu`。  
> **不要**在 OpenClaw 日更任务里默认 `freepublish` 当「粉丝可见正发」。

> 安全铁律：Skill 包内**永不**写入真实 AppID/Secret、Cookie、token、飞书密钥。

## Core outcome

1. 环境与密钥外置  
2. 资讯采集与事实核对  
3. 文风写稿  
4. 配图（图库 / AI / 提示词直出）  
5. 当日包 `output/YYYY-MM-DD/`  
6. **API 草稿**（`media_id`）和/或 **Browser 草稿**（`appmsgid`）  
7. **`draft_notify_feishu`**：飞书摘要 + mp 后台入口  
8. 人工后台发表（或本机 Browser 发表 + 扫码）  
9. 归档与可选调度  

## Skill structure

| 文件 | 用途 |
|------|------|
| `references/draft-notify-feishu.md` | **服务器默认：草稿+飞书+人手发表** |
| `references/publishing.md` | 双通道与各 publish_mode 总览 |
| `references/browser-chrome-publish.md` | 通道 B 逐步手册 |
| `references/feishu-qr-notify.md` | 浏览器发表时的**验证码**推送（非草稿待办） |
| `references/multi-account.md` | 多账号自检 |
| `references/session-practices.md` | 实战一页纸 |
| `references/environment-and-config.md` | 环境、代理、部署形态（含为何不做 Linux 无头登录） |
| `references/source-gathering.md` / `writing-style.md` / `image-strategy.md` | 内容与图 |
| `references/scheduling-and-alerting.md` | 定时与告警 |
| `references/security-boundary.md` | 安全边界 |
| `templates/feishu-draft-ready.example.*` | 草稿就绪飞书通知脚本 |
| `templates/feishu-qr-notify.example.*` | 验证码飞书推送脚本 |
| `templates/publish.mjs` | API 备用（注意默认只应用到草稿） |
| `templates/browser-checklist.example.md` | Browser 清单 |
| `templates/env.example.txt` | 环境变量占位 |
| `runbook.md` | 操作员清单 |

## Standard execution flow

### Step 0：选择通道与模式

```text
publish_channel = api | browser | hybrid
publish_mode    = draft_notify_feishu | draft_only | browser_full | api_freepublish
```

| 场景 | 建议 |
|------|------|
| Linux + OpenClaw 日更 | `api` + **`draft_notify_feishu`** |
| 本机 Chrome 要自动点到扫码 | `browser` + `browser_full` |
| 仅调试草稿 | `api` + `draft_only` |
| 实验 freepublish | `api_freepublish` + 书面接受风险 |

### Step 1–5：环境 / 素材 / 写稿 / 配图 / 打包

同既有约定；见各 references。多账号先做自检（`multi-account.md`）。

### Step 6：发布到草稿

- **API**：draft 成功 → 必须有 **`media_id`**；**`draft_notify_feishu` / `draft_only` 下禁止 freepublish**  
- **Browser**：保存草稿 → `appmsgid` /「已保存」  

### Step 7A：draft_notify_feishu（服务器主路径）

1. 清代理  
2. 飞书发送「待发布·草稿已进箱」（账号、标题、摘要、media_id、操作三步、`https://mp.weixin.qq.com/`）  
3. 可选附封面图（相对路径）  
4. 归档 `status=draft_ready_notified`  
5. **本 run 成功 = 草稿 + 通知**；正发由管理员完成  

详见 **`references/draft-notify-feishu.md`**。  
脚本：`templates/feishu-draft-ready.example.sh` / `.ps1`。

### Step 7B：人工 / Browser 正式发表（可选）

- 管理员按飞书指引后台发表；或  
- Windows 上走 `browser-chrome-publish.md`，验证码走 `feishu-qr-notify.md`  

### Step 8：归档

见 `templates/publish-result.example.json`。  
区分 `draft_ready_notified` 与 `published`。

### Step 9：调度

定时任务默认：生成 + API 草稿 + 飞书草稿通知。  
**默认不要**无人值守 freepublish / 服务器无头登录微信。

## 两类飞书消息（勿混淆）

| 类型 | 模式/时机 | 内容 |
|------|-----------|------|
| **草稿就绪** | `draft_notify_feishu`，API 出 media_id 后 | 摘要 + 后台链接 + 操作步骤 |
| **验证码** | Browser 点到「微信验证」后 | 二维码图片 |

## 通道选择（第一性）

| 需求 | 选择 |
|------|------|
| 服务器稳定日更、避开 freepublish 坑 | **draft_notify_feishu** |
| 与后台发表按钮完全一致且本机有 Chrome | Browser full |
| 只要进草稿 | API draft_only / notify |
| 实验 API 正发 | api_freepublish（非默认） |

## 关键坑（必须遵守）

1. **freepublish 可见性 ≠ 后台手动发表**；OpenClaw 默认不要正发 API。  
2. **Linux 不推荐** Xvfb/无头登录 mp 做正发；用飞书喊人手点。  
3. 双 ProseMirror、封面从正文选、代理三分、飞书相对路径——见 `session-practices.md`。  
4. 换号自检作者与 token——见 `multi-account.md`。  
5. 飞书链接优先 `https://mp.weixin.qq.com/`，慎用带 token 深链。  

## Reproduction checklist

- [ ] `draft_notify_feishu` 文档与模板齐全  
- [ ] API 能拿到 media_id  
- [ ] 飞书草稿通知可发送  
- [ ] 管理员清单可执行  
- [ ] freepublish 非默认且有风险说明  
- [ ] Browser / 推码路径仍可选  
- [ ] 无真实密钥进包  

## Final rule

流程写全，秘密不进包。  
**服务器生产 = 草稿自动化 + 飞书触达 + 人正发。**

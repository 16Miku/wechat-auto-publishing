# 微信公众号自动发文完整 Skill

把「环境准备 → 资讯整理 → 写稿 → 配图 → **草稿** → **通知/批准** → **正式发表** → 归档 → 调度」沉淀为可复现工作流。

## 生产默认（服务器 / OpenClaw）

```text
写稿 + 配图
  → 微信 API 仅进草稿箱（media_id）
  → 飞书「待发布·草稿已进箱」+ https://mp.weixin.qq.com/
  → 管理员在后台手点「发表」
```

**配置**：`PUBLISH_CHANNEL=api` + `PUBLISH_MODE=draft_notify_feishu`  

**原因**：`freepublish` 常出现「搜得到、页/列表行为异常」；Linux 无头登录微信成本高。  
**文档**：`references/draft-notify-feishu.md`  
**脚本**：`templates/feishu-draft-ready.example.sh` / `.ps1`

## 双通道（仍保留）

| 通道 | 名称 | 何时用 |
|------|------|--------|
| **A** | 微信开放平台 API | 草稿、定时、服务器 |
| **B** | Chrome DevTools 本机浏览器 | Windows 上自动点到扫码 |

| 模式 | 说明 |
|------|------|
| **draft_notify_feishu** | API 草稿 + 飞书待办 + **人手发表**（服务器默认） |
| draft_only | 仅草稿 |
| browser_full | 本机浏览器发表 + 可选飞书**验证码** |
| api_freepublish | 实验；接受可见性风险 |

## 两类飞书消息

| 类型 | 时机 | 文档/模板 |
|------|------|-----------|
| 草稿就绪 | 有 media_id 后 | `draft-notify-feishu.md` / `feishu-draft-ready.example.*` |
| 验证码 | Browser「微信验证」 | `feishu-qr-notify.md` / `feishu-qr-notify.example.*` |

## 详细入口

- Agent：`SKILL.md`  
- 操作员：`runbook.md`  
- 发布总览：`references/publishing.md`  
- 实战汇总：`references/session-practices.md`  
- 多账号：`references/multi-account.md`  
- Browser：`references/browser-chrome-publish.md`  

## 目录结构

```text
wechat-auto-publishing-complete/
├─ SKILL.md / runbook.md / README.md
├─ references/
│  ├─ draft-notify-feishu.md      ← 服务器默认模式
│  ├─ publishing.md
│  ├─ browser-chrome-publish.md
│  ├─ feishu-qr-notify.md
│  ├─ multi-account.md
│  ├─ session-practices.md
│  └─ …
└─ templates/
   ├─ feishu-draft-ready.example.sh / .ps1
   ├─ feishu-qr-notify.example.sh / .ps1
   ├─ publish.mjs
   ├─ env.example.txt
   └─ …
```

## 快速开始（OpenClaw / Linux）

1. 配置 `WECHAT_*` + `FEISHU_NOTIFY_OPEN_ID` + `PUBLISH_MODE=draft_notify_feishu`  
2. 日更：生成包 → API draft → `feishu-draft-ready` 通知  
3. 管理员按飞书三步在 mp 后台发表  
4. 归档 `status=draft_ready_notified`  

## 实战要点

1. 服务器：**不要**默认 freepublish；**不要**默认 Xvfb 登录微信正发  
2. 飞书链接用稳定首页；慎用 token 深链  
3. 发飞书前清代理；`--image` 相对路径  
4. Browser 双 ProseMirror、封面从正文选、换号自检作者  

## 安全声明

本 Skill 仅含流程、模板、占位配置；不含真实凭证与会话。

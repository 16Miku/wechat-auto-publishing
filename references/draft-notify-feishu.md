# 模式：draft_notify_feishu（API 草稿 + 飞书待办 + 人手发表）

## 定位

**Linux / OpenClaw / 定时任务的默认生产模式。**

```text
写稿 + 配图
  → 微信 API 仅 draft/add（拿到 media_id）
  → 飞书 bot 发送「草稿已就绪」摘要 + 管理后台入口
  → 管理员在浏览器打开 mp 后台，草稿箱审稿并点「发表」
  → （可选）管理员回复已发布 / 次日对账
```

### 解决什么问题

| 问题 | 本模式做法 |
|------|------------|
| `freepublish` 技术成功但公众号页/列表可见性异常 | **不调用 freepublish**；正发走后台真实「发表」 |
| Linux 无头登录微信成本高、易掉登录态 | **不做**服务器浏览器登录；人在自己环境操作 |
| 运营不知道草稿好了 | 飞书主动触达，带标题与操作步骤 |

### 不解决什么

- 不自动点「发表」、不自动过扫码/答题  
- 不保证管理员一定当天处理（可另做催办）  

相关：通道 B 浏览器发表见 `browser-chrome-publish.md`；发表中验证码推送见 `feishu-qr-notify.md`（**另一类飞书消息**）。

---

## 配置

```text
publish_channel = api
publish_mode    = draft_notify_feishu
```

环境变量（仅目标环境，占位见 `templates/env.example.txt`）：

```env
PUBLISH_CHANNEL=api
PUBLISH_MODE=draft_notify_feishu

FEISHU_DRAFT_NOTIFY_ENABLED=true
FEISHU_NOTIFY_OPEN_ID=ou_xxx          # 或 FEISHU_NOTIFY_CHAT_ID=oc_xxx
# 可选：多账号显示名，写入飞书文案
WECHAT_ACCOUNT_DISPLAY_NAME=公众号显示名占位
```

依赖：

- 有效 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` + IP 白名单  
- `lark-cli` bot ready（或等价飞书发消息 API）  
- 发飞书前**清代理**（与推码相同）  

---

## 成功判定

### 技术成功（流水线可标 green）

必须同时满足：

1. 微信 `draft/add` 成功并返回 **`media_id`**  
2. 封面/正文图上传成功（若启用配图）  
3. 飞书消息发送成功（如 `ok: true` / 拿到 `message_id`）  

**没有 `media_id` 或飞书失败 → 整次 run 失败**，应告警，不得假装「已通知」。

### 运营成功（人工）

- 管理员在对应号后台打开该草稿  
- 点「发表」并完成可能的扫码/答题  
- 发表记录状态为 **已发表**，页面可见性正常  

流水线**默认不轮询**运营成功；可选次日催办或人工回「已发布」。

### 明确不作为成功依据

- `freepublish` 的 `publish_id` / `article_url`  
- 「微信搜一搜能搜到」但后台列表/主页行为异常  

---

## 标准步骤

### Step 1：内容与打包

与全局 skill 相同：采集 → 写稿 → 配图 → `output/YYYY-MM-DD/`。

### Step 2：API 仅草稿

使用 `baoyu-post-to-wechat` API 或 `templates/publish.mjs` 时：

- **只执行到 draft**  
- **禁止**自动 `freepublish/submit`（除非 `PUBLISH_MODE=api_freepublish` 且操作员知情）  

代理：调微信 API 前 `unset` 代理变量。

### Step 3：组装飞书文案

必含字段：

| 字段 | 说明 |
|------|------|
| 账号显示名 | 避免多号混淆 |
| 标题 | 便于草稿箱搜索 |
| 摘要 | 一句话 |
| media_id | 技术对账 |
| 时间 | 生成/入库时间 |
| 操作三步 | 打开后台 → 草稿箱 → 按标题发表 |
| 管理后台链接 | 见下节 |

可选：封面图（`lark-cli --image` 相对路径）。

### Step 4：发送飞书

模板脚本：

- `templates/feishu-draft-ready.example.sh`  
- `templates/feishu-draft-ready.example.ps1`  

```bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
# 见模板：--text 或 --markdown + 可选 --image cover
```

### Step 5：归档

```json
{
  "success": true,
  "publish_mode": "draft_notify_feishu",
  "channel": "api",
  "status": "draft_ready_notified",
  "media_id": "…",
  "title": "…",
  "account": "…",
  "feishu_draft_notify": {
    "enabled": true,
    "message_id": "om_xxx",
    "sent_at": "…"
  },
  "formal_publish": false,
  "operational_success": null
}
```

文件建议：`output/YYYY-MM-DD/{slug}-publish-status.json` 或 `draft-notify-result.json`。

---

## 管理后台链接策略

| 链接 | 推荐度 | 说明 |
|------|--------|------|
| `https://mp.weixin.qq.com/` | **默认推荐** | 稳定；管理员本机已登录则直达 |
| 草稿箱 list（无 token） | 可选 | 仍可能跳到登录页，登录后需自己点进草稿箱 |
| 带 `token=` 的深链 | **不推荐进群/日志** | token 短命且敏感；仅私聊且知悉风险时可选 |
| 单篇编辑 URL | 视能力 | API 仅有 `media_id` 时往往对不齐浏览器 `appmsgid` |

**文案必须写清人工路径**，不能只丢一个易失效的 deep link：

```text
1. 打开 https://mp.weixin.qq.com/ （确认右上角是本账号）
2. 内容管理 → 草稿箱
3. 按标题打开本文 → 检查封面/正文 → 发表
```

---

## 与其它模式对照

| 模式 | 机器做什么 | 人做什么 |
|------|------------|----------|
| **draft_notify_feishu** | API 草稿 + 飞书待办 | 后台点发表 |
| draft_only | 仅 API 草稿 | 自己发现草稿 |
| browser_full | 本机自动化点到验证码 | 扫码/批准 |
| api_freepublish | draft + freepublish | 接受可见性风险 |

| 飞书消息类型 | 触发点 | 内容 |
|--------------|--------|------|
| **草稿就绪**（本文） | `media_id` 到手后 | 摘要 + 后台入口 |
| **验证码**（feishu-qr-notify） | 浏览器点发表后 | 二维码图片 |

---

## OpenClaw / 调度对接建议

```text
cron / OpenClaw daily job
  → generate package
  → wechat draft API → media_id
  → feishu draft-ready notify
  → exit 0
```

- 定时任务 **默认不要** `full_publish` / freepublish  
- 失败：draft 失败或飞书失败 → 非 0 退出 + 告警  
- 多账号：每号独立凭证；飞书文案带 `WECHAT_ACCOUNT_DISPLAY_NAME`；可不同 `OPEN_ID`  

---

## 管理员操作清单（可贴飞书置顶）

- [ ] 飞书收到「待发布·草稿已进箱」  
- [ ] 打开 mp 后台，**确认账号正确**  
- [ ] 草稿箱按标题打开  
- [ ] 检查封面、正文、错别字  
- [ ] 点「发表」并完成扫码/答题（若有）  
- [ ] 发表记录确认为「已发表」  

---

## 故障速查

| 现象 | 处理 |
|------|------|
| 无 media_id | 查 IP 白名单、图片格式、token |
| 飞书超时 | 清代理；查 bot 可用范围 |
| 管理员找不到草稿 | 是否登错号；标题是否一致 |
| 误开了 freepublish | 改回 `draft_notify_feishu`；可见性异常属预期风险 |
| 想少点几次鼠标 | 改用 Windows 通道 B，而非 Linux 无头 |

---

## Agent 执行清单

- [ ] `PUBLISH_MODE=draft_notify_feishu`（或用户明确要求此模式）  
- [ ] API 仅 draft，**不** freepublish  
- [ ] 记录 media_id、title、account  
- [ ] 清代理后发飞书  
- [ ] 归档 `status=draft_ready_notified`  
- [ ] 向用户说明：请到后台手动发表；本 run 不以正发完成作为成功条件  

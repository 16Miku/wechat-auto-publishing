# WeChat Auto Publishing Runbook

操作员 / Agent 交接用清单。

## 0. 每次开跑先选模式

```text
publish_channel = api | browser | hybrid
publish_mode    = draft_notify_feishu | draft_only | browser_full | api_freepublish
```

| 场景 | 推荐 |
|------|------|
| **Linux / OpenClaw 日更** | `api` + **`draft_notify_feishu`** |
| Windows 本机自动点发表 | `browser` + `browser_full` |
| 只调试草稿 | `draft_only` |
| 实验 freepublish | `api_freepublish`（非默认） |

**服务器生产不要默认 freepublish**（可见性可能异常）。  
详见 `references/draft-notify-feishu.md`。

---

## 1. Fresh machine checklist

### 通用

- [ ] `python`/`node`/`npm` 可用  
- [ ] 工作目录与 `output/YYYY-MM-DD` 约定清楚  
- [ ] Skill 包内无真实密钥  
- [ ] 目标环境 env 已填（`templates/env.example.txt`）  

### 通道 A（API）— OpenClaw 必查

- [ ] `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 有效  
- [ ] IP 白名单已加  
- [ ] 调微信 API 时清代理  
- [ ] `PUBLISH_MODE=draft_notify_feishu`（或明确 draft_only）  
- [ ] **不会**在定时任务里自动 freepublish  

### 飞书草稿通知（draft_notify_feishu）

- [ ] `lark-cli` bot ready  
- [ ] `FEISHU_NOTIFY_OPEN_ID` 或 `CHAT_ID`  
- [ ] `WECHAT_ACCOUNT_DISPLAY_NAME` 已填（多号必填）  
- [ ] `FEISHU_DRAFT_NOTIFY_ENABLED=true`  
- [ ] 阅读 `references/draft-notify-feishu.md`  
- [ ] 发飞书前清代理；图片用相对路径  

### 通道 B（Chrome，可选）

- [ ] Chrome 已登录目标号 + 换号自检  
- [ ] 阅读 `browser-chrome-publish.md`  
- [ ] 验证码推送见 `feishu-qr-notify.md`（与草稿通知不同）  

---

## 2. Daily execution — 服务器主路径（draft_notify_feishu）

- [ ] 采集 + 写稿 + 配图  
- [ ] 组装当日包  
- [ ] API **仅** draft → 得到 `media_id`  
- [ ] 清代理  
- [ ] 飞书发送「待发布·草稿已进箱」（标题/账号/media_id/三步操作/`mp.weixin.qq.com`）  
- [ ] 可选附封面图  
- [ ] 归档 `status=draft_ready_notified`  
- [ ] **本 run 结束**；等管理员后台发表  

### 管理员收到飞书后

- [ ] 打开 https://mp.weixin.qq.com/ （确认账号）  
- [ ] 草稿箱按标题打开  
- [ ] 检查后点「发表」  
- [ ] 发表记录确认为「已发表」  

---

## 3. Daily execution — 本机 Browser（可选）

- [ ] 多账号自检 + author = 当前显示名  
- [ ] 草稿（API 或 Browser）  
- [ ] 用户批准  
- [ ] 发表弹窗链；微信验证 → 节点截码 → 飞书推码  
- [ ] 本号发表记录「已发表」  
- [ ] `{slug}-publish-status.json`  

---

## 4. Failure checklist

- [ ] 保留日志、当日包  
- [ ] draft 无 media_id → 失败告警  
- [ ] 飞书失败 → 失败告警（即使有 media_id）  
- [ ] 勿狂点发表浪费群发次数  
- [ ] 未确认成功前不消耗图库 used  

---

## 5. 故障速查

| 问题 | 处理 |
|------|------|
| freepublish 搜得到、页上看不到 | 改用 draft_notify_feishu + 手发 |
| API 40164 | 按报错 IP 加白 |
| 飞书 token 超时 | 清代理 |
| 管理员找不到草稿 | 是否登错号；标题是否一致 |
| Linux 想自动正发 | 不推荐无头登录；用飞书喊人手点 |
| 错号 / 旧作者 | multi-account 自检 |

---

## 6. 两类飞书消息

| 类型 | 何时 | 模板 |
|------|------|------|
| 草稿就绪 | media_id 到手 | `feishu-draft-ready.example.*` |
| 验证码 | Browser 微信验证 | `feishu-qr-notify.example.*` |

---

## 7. Distribution checklist

- [ ] 无真实密钥  
- [ ] 默认模式写清为 draft_notify_feishu  
- [ ] freepublish 风险可见  
- [ ] 管理员操作三步在飞书文案中固定  

# WeChat Auto Publishing Runbook

操作员 / Agent 交接用清单。支持 **API** 与 **Chrome 浏览器** 双通道。

## 0. 每次开跑先选通道

```text
publish_channel = api | browser | hybrid
publish_mode    = draft_only | full_publish
approval_gate   = required（默认）
```

- 生产默认：`hybrid` 或 `browser` + `draft_only` + 人工批准后再发  
- 仅当操作员接受 freepublish 可见性差异时，才用 API `full_publish`  

---

## 1. Fresh machine checklist

### 通用

- [ ] `python`/`python3`、`node`、`npm`/`npx` 可用（Bun 可选）  
- [ ] 工作目录与 `output/YYYY-MM-DD` 约定清楚  
- [ ] Skill 包内无真实密钥  
- [ ] 目标环境 `.baoyu-skills/.env` 已填（仅本机）  

### 通道 A（API）

- [ ] `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 有效  
- [ ] IP 白名单已加（以 40164 报错 IP 为准）  
- [ ] `node templates/publish.mjs` 或 baoyu API 脚本可跑  
- [ ] 调微信 API 时已清代理  

### 通道 B（Chrome）

- [ ] Chrome 已登录 `mp.weixin.qq.com` **目标号**  
- [ ] Chrome DevTools MCP `list_pages` 可见公众号页  
- [ ] **换号自检**：顶栏账号名 + URL `token` + 用户确认（`multi-account.md`）  
- [ ] 知悉正式发表可能要**管理员扫码**  
- [ ] 阅读 `references/browser-chrome-publish.md`  

### 飞书推码（可选但推荐）

- [ ] `lark-cli` 已安装，`auth status` 中 **bot: ready**  
- [ ] 已配置 `FEISHU_NOTIFY_OPEN_ID` 或 `FEISHU_NOTIFY_CHAT_ID`（仅本机 env）  
- [ ] 应用可用范围包含接收人  
- [ ] 阅读 `references/feishu-qr-notify.md`  
- [ ] 已知：发飞书前要**清代理**；`--image` 用**相对路径**  

---

## 2. Daily execution checklist

### 内容

- [ ] 采集并过滤资讯（事实可核对）  
- [ ] 压缩市场角度  
- [ ] 按模板写稿 + frontmatter  
- [ ] 区分事实句 / 观点句  

### 图片

- [ ] 确定来源：`user_prompt_direct` / gallery / concept_ai / upload  
- [ ] 产出 `cover.*`、`image1.jpg`、`image2.jpg`  
- [ ] 真实格式校验（非 HEIF 伪装）  
- [ ] 文件落入 `output/YYYY-MM-DD/`  

### 草稿

**API：**

- [ ] 清代理后发布  
- [ ] 拿到 `media_id`  
- [ ] 写 `draft-result.json`  

**Browser：**

- [ ] 再次确认当前账号显示名  
- [ ] `#author` = 当前显示名（非上一号）  
- [ ] 新的创作 → 文章  
- [ ] 标题/正文 ProseMirror **未写混**  
- [ ] 正文字数 > 0  
- [ ] 上传 2 张正文图  
- [ ] 封面从正文选择（或用户已手改）  
- [ ] 保存草稿，记录 `appmsgid`  
- [ ] 写 `{slug}-draft-result.json`  

### 批准门禁

- [ ] 向用户展示标题/摘要/草稿 ID/配图说明  
- [ ] **等待明确批准**（默认）  

### 正式发表

**API full_publish：**

- [ ] freepublish + 轮询  
- [ ] 记录 `publish_id` / `article_url`  
- [ ] 声明仅技术成功，除非已运营验收  

**Browser：**

- [ ] 发表 → 声明/群发 → 继续发表  
- [ ] 若「微信验证」：截 QR →（推荐）清代理后 `lark-cli` 推飞书  
- [ ] 用户手机扫码或回复「已扫码」  
- [ ] **本号**发表记录出现「已发表」  
- [ ] 写 `{slug}-publish-status.json`（含 account、feishu_qr_notify）  

---

## 3. Failure checklist

- [ ] 保留日志、截图、当日包  
- [ ] 未确认成功前不消耗图库 used  
- [ ] 记录失败步骤与通道  
- [ ] 浏览器路径避免连点发表浪费群发次数  
- [ ] 需要时告警  

---

## 4. 故障速查

| 问题 | 处理 |
|------|------|
| API 40164 | 按错误 IP 加白 |
| Bun / simple-xml 报错 | `node publish.mjs` |
| 生图 404/401 | 换模型名或走提示词直出/图库 |
| 40113 图片类型 | 重编码 JPEG/PNG |
| 标题变成全文 | 修 ProseMirror 写入目标 |
| 正文字数 0 | 写入 `.rich_media_content .ProseMirror` |
| freepublish 无主页 | 改浏览器群发路径 |
| 卡在微信验证 | 节点截码推飞书；管理员手机扫 |
| 飞书 token 超时 | 清代理后重发 |
| `--image` 被拒 | 改用相对路径 |
| 运营规则答题 | 账号方完成学习 |
| 发到错号 / 作者是旧号 | 停；按 multi-account 自检重来 |
| 发表记录找不到 | 是否看了另一号的 token/页面 |

详见 `references/publishing.md`、`references/browser-chrome-publish.md`、`references/multi-account.md`、`references/feishu-qr-notify.md`、`references/session-practices.md`。

---

## 5. 推荐日常模式

### 模式 P1（推荐生产）

1. 采集 + 写稿 + 生图  
2. Browser 或 API 入草稿  
3. 人工改封面/审文  
4. 批准后 Browser 发表 + 扫码  
5. 发表记录归档  

### 模式 P2（API 实验）

1. 采集 + 写稿 + 生图  
2. API draft + freepublish  
3. 归档 URL（接受可见性差异）  

### 模式 P3（仅草稿）

1. 到草稿为止  
2. 运营在后台自行点发表  

---

## 6. Multi-account

一号一目录：独立 `.env`、title 历史、cron、output。  
Browser 路径：一号一 Chrome 配置/登录态，避免串号。

---

## 7. Distribution checklist

- [ ] 无真实密钥 / cookie / token  
- [ ] 示例仅为 placeholder  
- [ ] 双通道文档可独立跑通  
- [ ] runbook 与 browser checklist 同步  

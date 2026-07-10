# Publishing（双通道）

发布阶段支持两条路径，可在同一次运行中只选其一，或 hybrid 组合。

| 通道 | 文档 | 入口 |
|------|------|------|
| **A API** | 本文「通道 A」+ `templates/publish.mjs` | `api.weixin.qq.com` |
| **B Browser** | `references/browser-chrome-publish.md` | 本地 Chrome + DevTools MCP |

## 安全配置

Skill 内只允许占位：

```env
WECHAT_APP_ID=fill_in_valid_value_in_target_environment
WECHAT_APP_SECRET=fill_in_valid_value_in_target_environment
GOOGLE_BASE_URL=fill_in_valid_value_in_target_environment
GOOGLE_API_KEY=fill_in_valid_value_in_target_environment
```

真实值放在：

1. 进程环境变量  
2. `<project-dir>/.baoyu-skills/.env`  
3. `~/.baoyu-skills/.env`  

## 发布模式

```text
publish_channel = api | browser | hybrid
publish_mode    = draft_only | full_publish
approval_gate   = required | auto
```

### 生产推荐

```text
内容 + 配图（本地）
  → 草稿（api 或 browser）
  → 人工批准（必选）
  → 正式发表（优先 browser，与后台一致）
  → 发表记录核对
```

### 实验 / 无人值守（需书面接受风险）

```text
内容 + 配图 → API draft → freepublish → 轮询 article_url
```

注意：`freepublish` **技术成功** 不等于后台手动发表的 **运营可见性**。

## 成功判定三层

### 1. 技术成功

- API：token、上传、draft/add、`media_id`、（可选）`publish_id`  
- Browser：编辑器「已保存」、`appmsgid`、图片 `mmbiz.qpic` URL  

### 2. 平台成功

- 草稿箱可见 / 发表记录「已发表」  
- 发布任务状态成功  

### 3. 运营成功

- 用户主页/会话列表符合预期触达  
- 与历史手动发表体验一致  

归档时写明判定到哪一层。

---

## 通道 A：API 发布

### A1. 草稿

成功条件（全部或核心子集）：

- access_token 获取成功  
- 封面 `thumb_media_id` 上传成功  
- 正文图上传成功（若启用）  
- `draft/add` 成功  
- 返回 **`media_id`**  

无 `media_id` → **不得**声称草稿成功。

### A2. 正式发表（可选）

1. `freepublish/submit` + `media_id` → `publish_id`  
2. 轮询 `freepublish/get`：间隔约 3s，最多约 30 次  
3. `publish_status`：`0` 成功，`1` 发表中，`2` 原创审核中  

捕获：`publish_id`、`article_id`、`article_url`。

### A3. 推荐脚本路径

优先：

```bash
# baoyu-post-to-wechat（若环境可用）
bun|npx 路径/wechat-api.ts article.md --theme default
```

备用（零第三方依赖，纯 Node）：

```bash
# 将 templates/publish.mjs 拷到与 article.md 同级
node publish.mjs
```

`publish.mjs` 能力：token → 上传封面/内图 → Markdown→HTML → 草稿 → 可选 freepublish → 写 `output/full_publish_result.json`。

### A4. IP 白名单

- 报错 `40164` 时以**错误信息中的 IP** 加白，勿盲目信 `ifconfig.me`（代理出口不一致）  
- 白名单保存后等 1–2 分钟  

### A5. 代理

```bash
# 调微信 API 前清除代理
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
```

### A6. 图片格式

- 扩展名不可信；HEIF 伪装 png → `40113`  
- 上传前规范为标准 JPEG/PNG  

### A7. HTML 观感（publish.mjs）

- 段落 `line-height: 1.8`  
- 图 `max-width: 100%`  
- 小标题可加左边框强调  

---

## 通道 B：Chrome 操控本地浏览器

完整步骤、DOM 选择器、扫码与失败处理：

→ **`references/browser-chrome-publish.md`**

摘要：

1. `list_pages` 找到已登录 mp  
2. 草稿箱 → 新的创作 → 文章  
3. 正确写入**标题 ProseMirror** 与**正文 ProseMirror**（严禁写混）  
4. 工具栏图片 → `upload_file`  
5. 封面「从正文选择」  
6. 保存为草稿 → **等人批准**  
7. 发表 → 声明/群发/继续发表 → **扫码**  
8. 发表记录确认「已发表」  

草稿成功标志：`appmsgid` 或「已保存」  
发表成功标志：发表记录状态「已发表」  

---

## 人工批准门禁（两通道通用）

在正式发表前向用户提供：

| 字段 | 说明 |
|------|------|
| title | 标题 |
| summary | 摘要 |
| channel | api / browser |
| draft_id | media_id 或 appmsgid |
| package_dir | output/YYYY-MM-DD |
| cover_note | 封面用第几张 |
| risks | 扫码/群发次数/合规 |

仅当用户明确表示批准（如「批准发布」「可以发表」「我已扫码发布」）后继续。

## 打包检查（发布前）

- [ ] `article.md` UTF-8，frontmatter 含 title/summary/cover  
- [ ] `cover.png` 或有效封面源存在  
- [ ] `image1.jpg` / `image2.jpg`（若启用正文图）  
- [ ] 图片真实格式合法  
- [ ] 通道 A：密钥与白名单就绪  
- [ ] 通道 B：Chrome 已登录且 MCP 可连  
- [ ] 代理策略正确  

## 归档

最少字段：

```json
{
  "success": true,
  "channel": "browser",
  "publish_mode": "full_publish",
  "title": "",
  "timestamp": "",
  "media_id": null,
  "appmsgid": "",
  "publish_id": null,
  "article_url": null,
  "publish_state": "已发表",
  "published_at": "",
  "approval": "user_approved",
  "cover_note": "",
  "technical_success": true,
  "platform_success": true,
  "operational_success": null,
  "error": null
}
```

推荐路径：

- `output/YYYY-MM-DD/publish-status.json`  
- `output/YYYY-MM-DD/draft-result.json`  
- `output/full_publish_result.json`（API 全流程）  
- `output/publish_log.jsonl`  

模板见 `templates/publish-result.example.json`。

## 故障速查

| 现象 | 通道 | 处理 |
|------|------|------|
| 40164 IP | A | 按报错 IP 加白 |
| Bun SyntaxError / simple-xml | A | 改用 `node publish.mjs` |
| 40113 图片类型 | A/B | 重编码 JPEG/PNG |
| freepublish 成功但主页无文 | A | 改 browser 手动/群发路径 |
| 标题变成整篇正文 | B | 写错 ProseMirror，见 browser 文档 |
| 正文字数 0 | B | 正文未写入 rich_media_content |
| 发表卡在二维码 | B | 等人扫码，勿重复消耗群发 |
| 历史违规要答题 | B | 账号方完成学习题 |

# 实战沉淀汇总（Session Practices）

本文件汇总已在真实公众号环境验证过的关键实践，供 Agent 与操作员复用。细节仍以各专题 reference 为准。

## 1. 双通道发布

| 通道 | 用途 | 成功标志 |
|------|------|----------|
| A API | 脚本化草稿 / 实验 freepublish | `media_id`；（可选）`publish_id` |
| B Chrome | 与后台一致的草稿与群发 | `appmsgid` /「已保存」；发表记录「已发表」 |

生产推荐：

```text
# Linux / OpenClaw（默认）
写稿 + 配图 → API 草稿 → 飞书「草稿就绪」→ 人手 mp 后台发表

# Windows 本机（可选）
写稿 + 配图 → 草稿 → 批准 → Browser 发表 → 飞书推验证码 → 扫码 → 发表记录
```

见：`draft-notify-feishu.md`、`publishing.md`、`browser-chrome-publish.md`。  
**不要**在服务器上默认 freepublish 或 Xvfb 登录微信正发。

## 2. 多账号自检（换号后必做）

见完整版：`multi-account.md`。

```text
list_pages → 打开 mp 首页/草稿箱
  → 读顶栏账号显示名
  → 读 URL token=
  → 与用户确认「当前是 {name}」
  → #author = 当前显示名（禁止沿用上一号）
  → 归档用 {slug}-publish-status.json
```

同文可跨号复用标题/正文/本地图；**不可**复用 appmsgid、过期 QR、他号发表记录。

## 3. 编辑器 DOM 铁律

| 区域 | 选择器 | 用途 |
|------|--------|------|
| 标题 | `#title` + `.title-editor__input .ProseMirror` | 短标题 ≤64 字 |
| 正文 | `.rich_media_content .ProseMirror` | 唯一正文写入点 |
| 作者 | `#author` | **当前号显示名** |
| 摘要 | `#js_description` | ≤120 字 |

**禁止**对标题 ProseMirror `selectAll` 后灌入全文。  
校验：侧栏「正文字数」> 0，且 `#title` 长度合理。

## 4. 配图实战

1. 用户完整提示词 → **直接** `image_gen`（可不走 baoyu 扩展链路）  
2. 建议 `aspect_ratio: 16:9`  
3. 落盘 `beauty1/2.jpg` 并同步 `image1/2.jpg`  
4. 浏览器：工具栏「图片」→「选择文件」→ `upload_file`（**绝对路径**可用于 MCP upload）  
5. 封面：正文插图后「从正文选择」；用户可手改第 N 张  
6. 替换旧图：先删正文 `img` 容器再传新图  

见：`image-strategy.md`。

## 5. 写稿与事实

- 指数涨跌、成交额、净流入等必须来自检索  
- 观点句（仓位、别追高等）不得伪装成行情事实  
- 写 T-1 收盘须在文中时间线清楚  

见：`writing-style.md`、`source-gathering.md`。

## 6. 正式发表弹窗叠层（Browser，以实测为准）

弹窗可能**同时存在或乱序出现**，不要假设只有一条直线。建议状态机：

```text
点顶栏「发表」
  → [可选] 创作来源：无需声明并发表 | 去声明
  → 群发设置：群发通知 / 今日剩余次数 / 定时
  → 对话框内「发表」
  → [可选] 「继续发表」或「继续群发」
  → [可选] 运营规则学习「开始答题」（账号方完成，Agent 不代答）
  → [可选] 「未授权切换账号」→ 仅点「我知道了」
  → 【关键阻断】微信验证 + 二维码  → 截码推飞书
  → 用户扫码后：发表记录「已发表」
```

**优先级**：只要页面出现 `微信验证` / `微信二维码`，立即停自动点击、截码推送；其它提示可先关「我知道了」，但不要关验证框。

按钮文案可能是「继续发表」或「继续群发」，按可见主按钮点。

## 7. 飞书：两类消息

| 类型 | 时机 | 模板 |
|------|------|------|
| **草稿就绪** | API 得到 media_id | `feishu-draft-ready.example.*` / `draft-notify-feishu.md` |
| **验证码** | Browser「微信验证」 | `feishu-qr-notify.example.*` |

## 7b. 飞书推送验证码（Browser，已测通）

```text
检测「微信验证」
  → take_screenshot(uid=微信二维码 img) 优先   # 清晰可扫
  → 可选：再截整页作对照
  → 落盘 output/.../ {slug}-wechat-verify-qr.png
  → 清代理
  → lark-cli 发文字（含账号名+标题）+ --image 相对路径
  → 记录 text/image message_id 到 publish-status
  → 手机飞书扫码 → 回复「已扫码」→ 核对本号发表记录
```

| 要点 | 内容 |
|------|------|
| CLI | `lark-cli im +messages-send --as bot` |
| 收件人 | `--user-id ou_xxx` 或 `--chat-id oc_xxx` |
| 图片路径 | **仅相对 cwd**，禁绝对路径与 `..` |
| 截图 | **节点截图优先**；整页可选 |
| 代理 | 发飞书前必须清空，否则 token 易超时 |
| 时效 | 必须发**当前**弹出的码，禁止复用历史截图授权 |
| 归档 | `feishu_qr_notify.message_id` 写入账号侧 status 文件 |

见：`feishu-qr-notify.md`、模板 `feishu-qr-notify.example.*`。

## 8. 代理策略总表

| 阶段 | 代理 |
|------|------|
| AI 生图（Google 等） | 常需要代理 |
| 微信 Open API | **必须直连** |
| 飞书 lark-cli | **建议直连**（实测代理易超时） |
| Chrome 打开 mp 后台 | 按本机网络习惯 |

## 9. 批准门禁话术

Agent 在正式发表前应停住，并展示：

- **当前账号显示名**  
- 标题 / 摘要 / 草稿 ID  
- 包路径 / 封面说明  
- 通道与风险（扫码、群发次数）  

用户明确「批准发布 / 可以发表」后再点发表。  
扫码后用户可回「已扫码」触发**本号**发表记录核对。

## 10. 归档最小集

```text
output/YYYY-MM-DD/
  article.md
  cover.* image1.jpg image2.jpg
  {slug}-draft-result.json
  {slug}-publish-status.json
  {slug}-wechat-verify-qr.png   # 可选
  feishu-notify.json            # 可选
```

`publish-status` 应区分：

- `account` / `account_slug` / `author`  
- `technical_success` / `platform_success` / `operational_success`  
- `channel`: api | browser  
- `feishu_qr_notify` 块（若启用，含 message_id）  

## 11. 故障速查（高频）

| 问题 | 动作 |
|------|------|
| 标题变正文 | 检查 ProseMirror 写入目标 |
| 正文字数 0 | 写入 `.rich_media_content .ProseMirror` |
| 40164 | 按报错 IP 加白 |
| 40113 | 图片重编码 JPEG/PNG |
| freepublish 无主页感 | 改 Browser 群发 |
| 飞书 token 超时 | 清代理重试 |
| 扫码图发不出 | 相对路径 + bot ready + 可用范围 |
| 错号 / 旧作者 | multi-account 自检 |

## 12. 明确不做

- Skill 内不存真实 AppSecret / cookie / ticket  
- 不无人值守自动群发（除非书面接受）  
- 不把过期 QR 当有效授权  
- 不代答「运营规则学习」题目  

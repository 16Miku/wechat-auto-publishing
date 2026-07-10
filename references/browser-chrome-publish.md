# Browser Chrome Publish（通道 B）

通过 **Chrome DevTools MCP**（或等价 CDP）操控**本机已登录**的 Chrome，在 `mp.weixin.qq.com` 完成草稿创建与正式发表。

本路径的目标是与运营同学在后台的操作一致，而不是调用 `api.weixin.qq.com`。

## 前置条件

1. 本机 Google Chrome 已打开并登录**目标**公众号后台  
2. Agent 侧 Chrome DevTools MCP 已连接，且 `list_pages` 能看到 `mp.weixin.qq.com` 标签  
3. **多账号自检已通过**（顶栏账号名 + URL `token` + 用户确认）— 见 `multi-account.md`  
4. 当日包已就绪：`article.md`、`cover.*`、`image1.jpg`、`image2.jpg`（路径用绝对路径上传）  
5. 操作员知悉：正式发表可能弹出**管理员扫码验证**  

### 连接自检

```text
1. chrome_devtools.list_pages
2. 确认存在含 mp.weixin.qq.com 的 page
3. 若无：让用户先在 Chrome 打开 https://mp.weixin.qq.com 并登录
4. 读顶栏账号显示名 + URL token= ，确认是目标号
5. 将 #author 设为该显示名（除非用户指定笔名）
```

> 不要在 Skill 中写死 token 查询参数；每次从当前页面 URL 读取 `token=`。

## 总体状态机

```text
草稿箱列表
  → 新的创作 → 文章
  → 编辑器（isNew=1 或 appmsgid=…）
  → 填标题 / 作者 / 摘要 / 正文
  → 上传 image1、image2
  → 设封面（从正文选择）
  → 保存为草稿          ← 可在此暂停等人审
  → [用户批准]
  → 发表
  → 创作来源提示
  → 群发通知确认
  → 继续发表
  → 微信验证扫码（人）
       可选：截图二维码 → 飞书推送给手机扫码（见 feishu-qr-notify.md）
  → 发表记录核对「已发表」
```

## 一、打开新文章编辑器

1. `list_pages`，选中草稿箱页，例如：  
   `.../cgi-bin/appmsg?action=list_card...`  
2. `take_snapshot`，点击 **「新的创作」**  
3. 在菜单中点 **「文章」**（不要点贴图/视频/播客，除非业务需要）  
4. `list_pages` 等待新标签：  
   `.../appmsg_edit...&isNew=1...` 或 `action=edit&appmsgid=...`  
5. `select_page` 切到该编辑器，`bringToFront=true`  

## 二、编辑器 DOM 要点（极易踩坑）

### 2.1 标题

- 隐藏/同步字段：`#title`（textarea）  
- 可视编辑：`.title-editor__input .ProseMirror`  

**必须**同时保证：

- `#title.value` = 短标题（≤64 字）  
- 标题 ProseMirror 文本 = 同一短标题  

推荐写入方式：

```js
// 伪代码：仅示意
const titleText = '你的标题';
const titleEl = document.querySelector('#title');
const titlePm = document.querySelector('.title-editor__input .ProseMirror');
// 1) 清空并 insertText 到 titlePm
// 2) native value setter 写 #title + input/change/blur
```

### 2.2 作者

- `#author` input  
- 示例占位：账号对外显示名（不要写真实隐私）  

### 2.3 摘要

- `#js_description` textarea  
- ≤120 字；可先填后在正文后再确认一次  

### 2.4 正文（真正内容区）

- **只写**：`.rich_media_content .ProseMirror`  
- **禁止**对标题 ProseMirror 执行 `selectAll` + `insertHTML`（会把正文灌进标题）  

推荐：

```js
const bodyPm = document.querySelector('.rich_media_content .ProseMirror');
bodyPm.focus();
// selectNodeContents(bodyPm) → delete → insertHTML 多段 <p>
```

段落策略：短段、口语、编号小节用 `1，` 文本而不是大标题堆砌（与 writing-style 一致）。

### 2.5 正文字数

编辑器侧栏「正文字数」应 > 0。若仍为 0，说明写进了错误节点，立刻自检两个 ProseMirror。

## 三、上传正文配图

### 3.1 光标位置

- **首图**：光标放在正文第一个 `<p>` 之前或之内开头  
- **尾图**：定位到含「各位顺手点个赞」等结尾段的 `<p>`，`setStartBefore`  

### 3.2 上传交互

1. 工具栏点 **「图片」**  
2. 出现「本地上传 / 选择文件」  
3. `upload_file` 指向本地绝对路径，例如：  
   `.../output/2026-07-10/beauty1.jpg`  
4. 等待 3–6 秒；`img[src*="mmbiz.qpic.cn"]` 数量增加即成功  

可替换旧图：先 `remove` 正文中旧 `img` 容器，再重新上传。

### 3.3 质量注意

- 优先 JPEG  
- 单张建议 < 10MB  
- 上传后确认 `naturalWidth > 0`  

## 四、设置封面

后台常见选项：

- 从正文选择  
- 从图片库选择  
- 微信扫码上传  
- AI 配图  

**推荐稳定路径：从正文选择**

1. 点击「拖拽或选择封面」  
2. 点「从正文选择」  
3. 对话框 `appmsg_content_img_item` 中点选目标缩略图（用户可能指定第 2 张）  
4. 点「下一步」  
5. 裁剪后点「确认」  
6. 校验 `.js_cover_preview_new` / `.select-cover__preview` 的 `background-image` 含 `mmbiz.qpic`  

用户可事后在 UI 上手动改封面；Agent 批准发表前应再读一次封面预览。

## 五、保存草稿

1. 点击 **「保存为草稿」**  
2. 成功信号（满足其一即可）：  
   - 文案「已保存」  
   - URL 出现稳定 `appmsgid=数字`  
3. 记录：  

```json
{
  "status": "draft_saved_pending_approval",
  "method": "chrome-devtools",
  "title": "...",
  "appmsgid": "...",
  "formal_publish": false
}
```

4. **停止并请求用户审阅**（默认门禁）  

## 六、正式发表（仅在用户批准后）

### 6.1 入口

在已打开的该草稿编辑器中点 **「发表」**（不要误点预览）。

### 6.2 创作来源声明

可能弹出：

> 涉及时事/公共政策/社会事件或 AI 生成等，需声明创作来源…

选项通常包括：

- **无需声明并发表**  
- **去声明**  

按操作员合规要求选择；若账号策略允许「无需声明」，可直接继续。文档不鼓励隐瞒 AI 生成事实——由操作员决定声明方式。

### 6.3 群发设置

对话框常见项：

- 群发通知（可能显示「今天还有 N 次通知次数」）  
- 分组通知  
- 定时发表  

生产即时发：勾选群发通知（如需要触达）→ 点对话框内 **「发表」**。

### 6.4 二次确认与叠层

可能再提示「已开启群发通知…」→ 点 **「继续发表」** 或 **「继续群发」**（文案因版本而异）。

弹窗可能叠层（实测常见）：

| 顺序（常见） | 处理 |
|--------------|------|
| 创作来源 | 按策略点无需声明 / 去声明 |
| 群发设置 + 对话框「发表」 | 确认次数后点发表 |
| 继续发表 / 继续群发 | 点主按钮继续 |
| 运营规则学习 / 开始答题 | **用户**完成；Agent 可飞书文字提醒，不代答 |
| 未授权切换账号 | 仅「我知道了」 |
| **微信验证 + 二维码** | **最高优先级**：停点、截码、推飞书 |

只要出现「微信验证」，即使其它对话框仍在，也优先处理扫码协作。

### 6.5 微信验证（高频阻断）

弹窗：**微信验证** + 二维码  

- 文案类似：扫码后联系管理员验证  
- 管理员/运营者微信号可直接扫码  
- 图片节点常见名：`微信二维码`；`src` 常含 `safeqrcode?ticket=`  

**Agent 必须暂停**，不得假装已授权。

#### 推荐：截码并推飞书（已实测可行）

完整规范见 **`references/feishu-qr-notify.md`**。摘要：

1. **优先** `take_screenshot(uid=「微信二维码」img)` — 手机可扫性最好  
2. **可选**再截整页作对照  
3. 保存（建议带账号 slug）：  
   `output/YYYY-MM-DD/{slug}-wechat-verify-qr.png`  
4. **清除代理**后发送（文字中写清**账号名 + 标题**）：  

```bash
lark-cli im +messages-send --as bot --user-id "$FEISHU_NOTIFY_OPEN_ID" \
  --text "【公众号发表·{账号显示名}】请管理员微信尽快扫码。标题：…"
lark-cli im +messages-send --as bot --user-id "$FEISHU_NOTIFY_OPEN_ID" \
  --image "output/YYYY-MM-DD/{slug}-wechat-verify-qr.png"   # 必须相对路径
```

5. 将返回的 `message_id` 写入 `{slug}-publish-status.json` 的 `feishu_qr_notify`  
6. 模板脚本：`templates/feishu-qr-notify.example.sh` / `.ps1`  
7. 等待用户手机飞书扫码或回复「已扫码」  

> 禁止把过期历史截图当有效授权码复用。

### 6.6 其他可能阻断

| 弹窗 | 处理 |
|------|------|
| 运营规则学习 / 开始答题 | 需账号方完成答题，Agent 不可跳过 |
| 未授权切换账号 | 点「我知道了」关闭，避免点「退出登录」 |
| 原创校验超时 | 可按提示以非原创样式继续（由操作员决定） |

## 七、发表成功核对（必须做）

打开**当前号**的发表记录（token 与当前会话一致）：

```text
内容管理 → 发表记录
# 或
/cgi-bin/appmsgpublish?sub=list&begin=0&count=10&token={current}&lang=zh_CN
```

成功标准：

- 页眉账号名 = 目标号  
- 列表出现目标标题  
- 状态为 **「已发表」**  
- 时间接近操作时刻  

归档示例：

```json
{
  "status": "published",
  "method": "chrome-devtools",
  "title": "科创暴8%，但别追最热那一下",
  "published_at": "2026-07-10 08:57",
  "publish_state": "已发表",
  "appmsgid": "100001492",
  "cover_note": "用户手动改为第二张图",
  "verified_from": "发表记录页"
}
```

首页卡片若延迟出现，以「发表记录 = 已发表」为平台成功主证据。

## 八、Chrome DevTools 工具映射

| 步骤 | 工具 |
|------|------|
| 列标签 | `list_pages` |
| 切标签 | `select_page` |
| 结构 | `take_snapshot` |
| 点击 | `click` |
| 填复杂字段 | `evaluate_script` |
| 上传 | `upload_file` |
| 截图取证 | `take_screenshot` |
| 键入 | `type_text` / `press_key`（次选） |

## 九、与通道 A（API）对照

| 项目 | API | Browser |
|------|-----|---------|
| 凭证 | AppID/Secret + IP 白名单 | 已登录 Chrome 会话 |
| 草稿成功标志 | `media_id` | `appmsgid` /「已保存」 |
| 正式发表 | freepublish | UI 群发 + 可能扫码 |
| 主页可见性 | 可能与后台手动不一致 | 与手动路径一致 |
| 图片 | material API 上传 | 编辑器本地上传 |
| 人工改封面 | 难 | 易 |
| 无人值守 | 较适合 | 不适合（扫码/答题） |

## 十、失败处理

1. 保留编辑器 URL、`appmsgid`、截图  
2. 不要重复狂点「发表」（消耗群发次数）  
3. 草稿仍在则可修复后重试  
4. 扫码超时：重新点发表拉起新二维码  
5. 写错 ProseMirror：清空标题与正文后按第二节重来  

## 十一、最小可复用检查清单

见 `templates/browser-checklist.example.md`。

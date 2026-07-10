# 实战沉淀汇总（Session Practices）

本文件汇总已在真实公众号环境验证过的关键实践，供 Agent 与操作员复用。细节仍以各专题 reference 为准。

## 1. 双通道发布

| 通道 | 用途 | 成功标志 |
|------|------|----------|
| A API | 脚本化草稿 / 实验 freepublish | `media_id`；（可选）`publish_id` |
| B Chrome | 与后台一致的草稿与群发 | `appmsgid` /「已保存」；发表记录「已发表」 |

生产推荐：

```text
写稿 + 配图 → 草稿（A 或 B）→ 人工批准 → B 正式发表 → 扫码（可飞书推码）→ 发表记录核对
```

见：`publishing.md`、`browser-chrome-publish.md`。

## 2. 编辑器 DOM 铁律

| 区域 | 选择器 | 用途 |
|------|--------|------|
| 标题 | `#title` + `.title-editor__input .ProseMirror` | 短标题 ≤64 字 |
| 正文 | `.rich_media_content .ProseMirror` | 唯一正文写入点 |
| 作者 | `#author` | 显示名 |
| 摘要 | `#js_description` | ≤120 字 |

**禁止**对标题 ProseMirror `selectAll` 后灌入全文。  
校验：侧栏「正文字数」> 0，且 `#title` 长度合理。

## 3. 配图实战

1. 用户完整提示词 → **直接** `image_gen`（可不走 baoyu 扩展链路）  
2. 建议 `aspect_ratio: 16:9`  
3. 落盘 `beauty1/2.jpg` 并同步 `image1/2.jpg`  
4. 浏览器：工具栏「图片」→「选择文件」→ `upload_file`（**绝对路径**可用于 MCP upload）  
5. 封面：正文插图后「从正文选择」；用户可手改第 N 张  
6. 替换旧图：先删正文 `img` 容器再传新图  

见：`image-strategy.md`。

## 4. 写稿与事实

- 指数涨跌、成交额、净流入等必须来自检索  
- 观点句（仓位、别追高等）不得伪装成行情事实  
- 写 T-1 收盘须在文中时间线清楚  

见：`writing-style.md`、`source-gathering.md`。

## 5. 正式发表弹窗链（Browser）

```text
发表
  → 创作来源（无需声明并发表 / 去声明）
  → 群发通知 / 今日剩余次数
  → 对话框「发表」
  → 「继续发表」
  → 微信验证二维码        ← 可截图推飞书
  → （可能）运营规则答题
  → 发表记录「已发表」
```

## 6. 飞书推送验证码（已测通）

```text
检测「微信验证」
  → take_screenshot(QR uid) → output/.../wechat-verify-qr.png
  → 清代理
  → lark-cli bot 发文字 + --image 相对路径
  → 手机飞书扫码
```

| 要点 | 内容 |
|------|------|
| CLI | `lark-cli im +messages-send --as bot` |
| 收件人 | `--user-id ou_xxx` 或 `--chat-id oc_xxx` |
| 图片路径 | **仅相对 cwd**，禁绝对路径与 `..` |
| 代理 | 发飞书前必须清空，否则 token 易超时 |
| 时效 | 必须发**当前**弹出的码，禁止复用历史截图授权 |

见：`feishu-qr-notify.md`、模板 `feishu-qr-notify.example.*`。

## 7. 代理策略总表

| 阶段 | 代理 |
|------|------|
| AI 生图（Google 等） | 常需要代理 |
| 微信 Open API | **必须直连** |
| 飞书 lark-cli | **建议直连**（实测代理易超时） |
| Chrome 打开 mp 后台 | 按本机网络习惯 |

## 8. 批准门禁话术

Agent 在正式发表前应停住，并展示：

- 标题 / 摘要 / 草稿 ID  
- 包路径 / 封面说明  
- 通道与风险（扫码、群发次数）  

用户明确「批准发布 / 可以发表」后再点发表。  
扫码后用户可回「已扫码」触发核对。

## 9. 归档最小集

```text
output/YYYY-MM-DD/
  article.md
  cover.* image1.jpg image2.jpg
  draft-result.json
  publish-status.json
  wechat-verify-qr.png          # 可选
  feishu-notify.json            # 可选
```

`publish-status` 应区分：

- `technical_success` / `platform_success` / `operational_success`  
- `channel`: api | browser  
- `feishu_qr_notify` 块（若启用）  

## 10. 故障速查（高频）

| 问题 | 动作 |
|------|------|
| 标题变正文 | 检查 ProseMirror 写入目标 |
| 正文字数 0 | 写入 `.rich_media_content .ProseMirror` |
| 40164 | 按报错 IP 加白 |
| 40113 | 图片重编码 JPEG/PNG |
| freepublish 无主页感 | 改 Browser 群发 |
| 飞书 token 超时 | 清代理重试 |
| 扫码图发不出 | 相对路径 + bot ready + 可用范围 |

## 11. 明确不做

- Skill 内不存真实 AppSecret / cookie / ticket  
- 不无人值守自动群发（除非书面接受）  
- 不把过期 QR 当有效授权  

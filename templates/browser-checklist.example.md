# 通道 B：Chrome 发布检查清单（可复制）

## 准备

- [ ] 本地 Chrome 已登录目标公众号
- [ ] Chrome DevTools MCP `list_pages` 可见 `mp.weixin.qq.com`
- [ ] 当日包存在：`output/YYYY-MM-DD/article.md` + 图片
- [ ] 图片为标准 JPEG/PNG（非 HEIF 伪装）

## 草稿

- [ ] 草稿箱 → 新的创作 → 文章
- [ ] 标题写入 `#title` + `.title-editor__input .ProseMirror`（短标题）
- [ ] 正文只写入 `.rich_media_content .ProseMirror`
- [ ] 侧栏「正文字数」> 0
- [ ] 作者、摘要已填
- [ ] 上传 image1（文首）、image2（文末互动前）
- [ ] 封面：从正文选择（或用户指定第 N 张）
- [ ] 保存为草稿 → 记录 `appmsgid` /「已保存」
- [ ] **暂停：等待用户批准**

## 发表（仅批准后）

- [ ] 用户明确批准（或已自行扫码完成）
- [ ] 点「发表」
- [ ] 处理创作来源声明
- [ ] 群发通知设置确认
- [ ] 「继续发表」
- [ ] 若出现微信验证二维码：
  - [ ] 截取 QR（优先节点）→ `output/YYYY-MM-DD/wechat-verify-qr.png`
  - [ ] 清代理
  - [ ] `lark-cli` 推文字 + 图片到飞书（见 `feishu-qr-notify.md`）
  - [ ] 用户手机扫码 / 回复「已扫码」
- [ ] 发表记录中状态为「已发表」
- [ ] 写入 `publish-status.json`

## 禁止

- [ ] 未批准就点群发
- [ ] 把正文插入标题编辑器
- [ ] 在 Skill 包写入真实 token/AppSecret
- [ ] 扫码超时后疯狂连点发表（浪费通知次数）

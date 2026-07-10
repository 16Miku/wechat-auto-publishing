# 通道 B：Chrome 发布检查清单（可复制）

## 准备

- [ ] 本地 Chrome 已登录**目标**公众号
- [ ] Chrome DevTools MCP `list_pages` 可见 `mp.weixin.qq.com`
- [ ] **多账号自检**：顶栏显示名 + URL `token` + 用户确认
- [ ] 当日包存在：`output/YYYY-MM-DD/article.md` + 图片
- [ ] 图片为标准 JPEG/PNG（非 HEIF 伪装）
- [ ] 归档 slug 已定（如 `niugu` / `tiancheng`）

## 草稿

- [ ] 草稿箱 → 新的创作 → 文章
- [ ] 标题写入 `#title` + `.title-editor__input .ProseMirror`（短标题）
- [ ] 正文只写入 `.rich_media_content .ProseMirror`
- [ ] 侧栏「正文字数」> 0
- [ ] **作者 = 当前号显示名**（非上一号）
- [ ] 摘要已填
- [ ] 上传 image1（文首）、image2（文末互动前）
- [ ] 封面：从正文选择（或用户指定第 N 张）
- [ ] 保存为草稿 → 记录 `appmsgid` /「已保存」
- [ ] 写 `{slug}-draft-result.json`
- [ ] **暂停：等待用户批准**

## 发表（仅批准后）

- [ ] 用户明确批准（或已自行扫码完成）
- [ ] 点「发表」
- [ ] 处理创作来源声明
- [ ] 群发通知设置确认
- [ ] 「继续发表」
- [ ] 若出现微信验证二维码：
  - [ ] **优先**截 QR 节点 → `output/YYYY-MM-DD/{slug}-wechat-verify-qr.png`
  - [ ] 可选整页对照截图
  - [ ] 清代理
  - [ ] `lark-cli` 推文字（含账号名+标题）+ 图片（见 `feishu-qr-notify.md`）
  - [ ] 记录 message_id
  - [ ] 用户手机扫码 / 回复「已扫码」
- [ ] **本号**发表记录中状态为「已发表」
- [ ] 写入 `{slug}-publish-status.json`（含 account、feishu_qr_notify）

## 禁止

- [ ] 未批准就点群发
- [ ] 把正文插入标题编辑器
- [ ] 在 Skill 包写入真实 token/AppSecret
- [ ] 扫码超时后疯狂连点发表（浪费通知次数）

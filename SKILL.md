---
name: wechat-auto-publishing-complete
description: >
  Use this skill to fully reproduce and operate a local end-to-end WeChat Official Account
  publishing workflow with TWO publish channels: (A) WeChat Open API draft/freepublish, and
  (B) Chrome DevTools MCP controlling an already-logged-in local Chrome session on mp.weixin.qq.com.
  Covers environment setup, source gathering, drafting, image preparation (gallery / AI gen /
  user prompt beauty images), package assembly, human approval gate, draft creation, formal
  publish, QR admin verification handling (optional Feishu/lark-cli push of WeChat verify
  QR for mobile scan), result archive, and scheduling. Use whenever the user wants
  reproducible 公众号自动发文 with API and/or browser control, while keeping all secrets
  outside the skill package.
---

# WeChat Auto Publishing Complete

本 Skill 用于复现、文档化和运营一套**本地可交接**的微信公众号发文工作流。

它同时支持两种发布通道，并要求在正式发表前保留**人工批准门禁**（默认生产模式）：

| 通道 | 名称 | 适用场景 |
|------|------|----------|
| **A** | **API 发布** | 有 AppID/AppSecret、IP 白名单齐全、要脚本化/定时 |
| **B** | **Chrome 操控本地浏览器** | 已登录 mp 后台、要和人工审核一致、可绕过 freepublish 可见性差异 |

> 安全铁律：Skill 包内**永不**写入真实 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` / API Key / Cookie / token / 私人路径。

## Core outcome

完整复用后，工作流应能完成：

1. 新机器环境准备与依赖校验  
2. 当日资讯采集与市场角度压缩  
3. 按账号文风写稿（事实 / 观点分离）  
4. 准备 `cover.png` + `image1.jpg` + `image2.jpg`（图库 / AI 生图 / 用户提示词直出）  
5. 组装当日包 `output/YYYY-MM-DD/`  
6. **通道 A**：API 创建草稿（可选 freepublish）  
7. **通道 B**：Chrome DevTools 操控已登录的本地 Chrome，在草稿箱创建文章、上传配图、设封面  
8. **人工审阅 / 批准**（可改封面、改标题、换图）  
9. 正式发表（API 或浏览器群发；浏览器路径可能要求扫码验证）  
10. **扫码协作（可选）**：截取「微信验证」二维码 → `lark-cli` 推送到飞书 → 手机扫码  
11. 结果归档与可选定时调度  

## Skill structure

按任务阅读：

| 文件 | 用途 |
|------|------|
| `references/environment-and-config.md` | 环境、密钥占位、代理、Chrome / 飞书前提 |
| `references/source-gathering.md` | 资讯采集与角度压缩 |
| `references/writing-style.md` | 写稿与 Markdown 约定 |
| `references/image-strategy.md` | 封面/正文图策略（含美女配图直出） |
| `references/publishing.md` | **双通道**发布总览与成功判定 |
| `references/browser-chrome-publish.md` | **通道 B 逐步操作手册（核心）** |
| `references/feishu-qr-notify.md` | **飞书推送微信验证二维码（已实测）** |
| `references/session-practices.md` | 实战沉淀一页纸汇总 |
| `references/scheduling-and-alerting.md` | 定时与告警 |
| `references/security-boundary.md` | 安全边界 |
| `templates/article-template.md` | 成稿模板 |
| `templates/publish.mjs` | 通道 A 备用纯 Node 发布脚本 |
| `templates/browser-checklist.example.md` | 通道 B 操作检查清单 |
| `templates/feishu-qr-notify.example.sh` | 飞书推码 bash 模板 |
| `templates/feishu-qr-notify.example.ps1` | 飞书推码 PowerShell 模板 |
| `templates/daily-package-layout.example.txt` | 当日包目录约定 |
| `templates/publish-result.example.json` | 结果归档 schema |
| `templates/env.example.txt` | 环境变量占位 |
| `templates/workspace-tree.txt` | 工作区树 |
| `runbook.md` | 操作员每日清单 |

## Standard execution flow（通道无关）

### Step 0: 选择发布通道

在动笔前与操作员确认：

```text
publish_channel = api | browser | hybrid
publish_mode    = draft_only | full_publish
approval_gate   = required（默认）| auto（仅实验）
```

| 值 | 含义 |
|----|------|
| `api` | 仅走微信开放平台 API |
| `browser` | 仅走 Chrome DevTools 操控本地已登录 Chrome |
| `hybrid` | 内容/生图本地完成；草稿可用 API 或浏览器；**正式发表优先浏览器**（与后台一致） |
| `draft_only` | 只到草稿，等人在后台或对话中批准后再发 |
| `full_publish` | 草稿后继续正式发表（仍建议保留批准门禁） |

**生产推荐**：`hybrid` + `draft_only` → 人工批准 → 浏览器「发表」。

### Step 1: 环境准备

见 `references/environment-and-config.md`。

- 通道 A：AppID/Secret、IP 白名单、发布脚本依赖  
- 通道 B：本机 Chrome 已登录 `mp.weixin.qq.com`，Chrome DevTools MCP 可 `list_pages`  

### Step 2: 采集素材

见 `references/source-gathering.md`。

- 8–15 条原始 → 3–5 条保留  
- 压缩市场判断  
- **硬数据必须可核对来源**（不得编造涨跌幅）  

### Step 3: 写稿

见 `references/writing-style.md` + `templates/article-template.md`。

- 情绪开头、短段、操作态度、明日观察、轻互动结尾  
- 区分「事实句」与「观点句」  

### Step 4: 配图

见 `references/image-strategy.md`。

产出固定文件名：

```text
cover.png | cover.jpg
image1.jpg
image2.jpg
```

可选来源：用户指定提示词直出 / 本地 `美女配图` 图库 / 概念风 AI 封面 / 用户上传。

### Step 5: 组装当日包

```text
output/YYYY-MM-DD/
├─ article.md
├─ cover.png
├─ image1.jpg
├─ image2.jpg
├─ beauty1.jpg          # 可选，美女图源文件
├─ beauty2.jpg
├─ draft-result.json
└─ publish-status.json
```

### Step 6: 发布到草稿

- **通道 A**：`baoyu-post-to-wechat` 或 `node templates/publish.mjs`（draft 段）→ 必须拿到 `media_id`  
- **通道 B**：按 `references/browser-chrome-publish.md` 在编辑器填标题/正文/图/封面 →「保存为草稿」→ URL 出现 `appmsgid` 或编辑器提示「已保存」  

### Step 7: 人工批准门禁（默认必做）

向用户展示：

- 标题 / 摘要 / 账号  
- 本地包路径  
- 草稿标识（`media_id` 或 `appmsgid`）  
- 配图说明（哪张作封面）  

**在用户明确说「批准发布 / 可以发表」之前，禁止点正式发表。**

用户可在后台手动改封面、改字；批准后继续。

### Step 8: 正式发表

- **通道 A**：`freepublish/submit` + 轮询；记录 `publish_id` / `article_url`；知悉与后台手动发可能不等价  
- **通道 B**：编辑器「发表」→ 处理创作来源声明 → 群发通知确认 →「继续发表」→ **管理员扫码验证**（常见）  

### Step 8.1: 扫码协作 — 飞书推码（推荐开启）

当出现「微信验证」弹窗时：

1. 截取二维码（优先 QR 节点）→ `output/YYYY-MM-DD/wechat-verify-qr.png`  
2. **清代理**后用 `lark-cli` bot 发文字 + 图片给操作员  
3. 等人在手机飞书扫码，或回复「已扫码」  
4. 再核发表记录  

详见 `references/feishu-qr-notify.md`。  
配置占位：`FEISHU_NOTIFY_OPEN_ID` / `FEISHU_QR_NOTIFY_ENABLED`（见 `templates/env.example.txt`）。

### Step 9: 归档

写入 `output/YYYY-MM-DD/publish-status.json`（字段见模板）。  
成功判定分三层：技术成功 / 平台成功 / 运营可见成功。见 `references/publishing.md`。

### Step 10: 调度（可选）

见 `references/scheduling-and-alerting.md`。  
定时任务默认只跑到草稿 + 通知人工，不要无人值守自动群发（除非操作员书面接受风险）。

## 通道选择原则（第一性）

| 需求 | 更合适的通道 |
|------|----------------|
| 与后台「发表」按钮行为一致、主页可见性 | **Browser** |
| 无 UI、CI/服务器、批量 | **API** |
| 无 IP 白名单 / 无法拿 AppSecret | **Browser** |
| 已登录 Chrome、要审图审文 | **Browser** |
| 只要 media_id 进草稿给别人审 | **API 或 Browser** |

## 本次实战沉淀的关键坑（必须遵守）

1. **WeChat 新版编辑器有两个 ProseMirror**：`.title-editor__input .ProseMirror` 是标题，`.rich_media_content .ProseMirror` 才是正文。写错会导致标题变成整篇正文。  
2. **封面不能直接本地拖到「从正文选择」以外的路径时**：先把图插入正文，再「从正文选择」设封面。  
3. **正式发表常弹「微信验证」二维码**：必须管理员/运营者扫码，Agent 无法代替；**可截图经飞书推到手机**。  
4. **账号若有历史违规**：可能要求「运营规则学习 / 答题」后才能发。  
5. **`freepublish` 技术成功 ≠ 后台手动发表的运营效果**；生产默认 `draft_only` + 人工/浏览器发表。  
6. **图片以真实编码为准**，扩展名不可信（HEIF 伪装 png → 40113）。  
7. **代理策略三分**：生图可代理；**微信 API 与飞书 lark-cli 建议直连**（飞书带代理易 token 超时）。  
8. **`lark-cli --image` 必须相对路径**，绝对路径会被拒绝。  
9. **禁止复用过期 QR 截图**做授权；每次用当前弹窗新码。  

快速索引：`references/session-practices.md`。

## Reproduction checklist

- [ ] 双通道文档齐全且无真实密钥  
- [ ] 通道 A 能 draft（有 media_id）  
- [ ] 通道 B 能 list_pages 并打开草稿编辑器  
- [ ] 写稿/生图/包结构约定明确  
- [ ] 批准门禁写进 runbook  
- [ ] 扫码验证与发表记录核对步骤明确  
- [ ] 飞书 bot ready + 推码命令可跑（若启用）  
- [ ] 结果 JSON schema 可用  

## Final rule

流程可以写全，秘密不能进包。  
**可复用 = 步骤可执行 + 失败可诊断 + 通道可切换 + 批准可审计 + 扫码可协作。**

# 微信公众号自动发文完整 Skill

把「环境准备 → 资讯整理 → 写稿 → 配图 → **草稿** → **人工批准** → **正式发表** → 归档 → 调度」沉淀为可复现工作流。

## 双通道发布（核心升级）

| 通道 | 名称 | 何时用 |
|------|------|--------|
| **A** | **微信开放平台 API** | 有 AppID/Secret、IP 白名单、要脚本/定时 |
| **B** | **Chrome DevTools 操控本地已登录 Chrome** | 要与后台「发表」一致、可人工改图改封面、可处理扫码 |

生产推荐：

```text
写稿 + 配图（本地）
  → 草稿（A 或 B）
  → 人工批准
  → 正式发表（优先 B：后台群发路径）
  → 发表记录核对「已发表」
```

详细步骤：

- 总览：`references/publishing.md`  
- 浏览器逐步手册：`references/browser-chrome-publish.md`  
- 检查清单：`templates/browser-checklist.example.md`  
- 操作员 runbook：`runbook.md`  
- Agent 入口：`SKILL.md`  

---

## 功能概览

1. **环境与安全**：密钥外置、代理分流（生图可代理 / 微信 API 直连）、多账号隔离  
2. **内容**：资讯采集、事实/观点分离、账号向口语文风  
3. **配图**：图库 / 概念 AI / **用户提示词直出** / 上传；封面与正文 2 张约定  
4. **通道 A**：draft/add、`media_id`、可选 freepublish；备用 `templates/publish.mjs`  
5. **通道 B**：草稿箱新建、双 ProseMirror 防写混、本地上传、从正文选封面、保存、发表、扫码、发表记录核对  
6. **门禁**：默认禁止未批准自动群发  
7. **归档**：`output/YYYY-MM-DD/*.json`  
8. **调度**：默认只自动到草稿 + 通知人  

---

## 目录结构

```text
wechat-auto-publishing-complete/
├─ SKILL.md
├─ runbook.md
├─ README.md
├─ references/
│  ├─ environment-and-config.md
│  ├─ source-gathering.md
│  ├─ writing-style.md
│  ├─ image-strategy.md
│  ├─ publishing.md                 ← 双通道总览
│  ├─ browser-chrome-publish.md     ← 通道 B 详细手册
│  ├─ scheduling-and-alerting.md
│  └─ security-boundary.md
└─ templates/
   ├─ article-template.md
   ├─ publish.mjs                   ← 通道 A 纯 Node 备用脚本
   ├─ browser-checklist.example.md  ← 通道 B 清单
   ├─ daily-package-layout.example.txt
   ├─ publish-result.example.json
   ├─ env.example.txt
   ├─ workspace-tree.txt
   ├─ run.sh
   ├─ run.production-example.sh
   ├─ cron.example.txt
   ├─ gallery-config.example.txt
   ├─ cover-image-extend.example.md
   └─ image-gen-extend.example.md
```

---

## 快速开始

1. 读 `SKILL.md` 选通道与模式  
2. `references/environment-and-config.md` 准备环境  
3. 写稿 + 配图 → 放入 `output/YYYY-MM-DD/`  
4. **草稿**  
   - API：`node publish.mjs` 或 baoyu API  
   - Browser：按 `browser-chrome-publish.md`  
5. 等人批准  
6. **发表**并归档 `publish-status.json`  

---

## 实战要点（务必读）

1. Browser 编辑器有两个 ProseMirror：**标题区 ≠ 正文区**  
2. 封面稳定做法：先插入正文图 →「从正文选择」  
3. 正式发表常要 **管理员微信扫码**，Agent 不能代替  
4. `freepublish` 成功 ≠ 后台手动发表的主页效果  
5. 图片看真实编码，不看扩展名  
6. 硬行情数据必须可检索，观点句不要伪装成行情  

---

## 安全声明

本 Skill **只**含流程、模板、占位配置。  
**不含**真实 AppID/Secret、Cookie、token、私人账号与路径。

---

## 适用对象

- 要标准化公众号日更/半自动发文的人  
- 要 API 与人工后台两条腿走路的团队  
- 要把已验证的 Chrome 操控流程固化为可交接 Skill 的人  

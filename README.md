# 微信公众号自动发文完整 Skill

这是一个用于**微信公众号自动发文工作流**的完整 Skill，目标是把“环境准备 → 资讯整理 → 写稿 → 图片准备 → 草稿发布 → 正式发布 → 结果归档 → 定时调度”整理为一套**可复现、可交付、可扩展**的本地工作流。

本 Skill 适用于以下场景：
- 搭建微信公众号自动发文流程
- 将现有公众号运营流程沉淀为标准 Skill
- 在新机器或新环境中复现自动发文链路
- 为定时发布、草稿审核、正式发布和归档提供统一操作规范

---

## 功能概览

本 Skill 覆盖以下核心能力：

### 1. 环境准备与复现
- 新机器初始化与依赖检查
- 运行时环境说明（Python / Node / npm / npx / bun）
- 本地工作目录与推荐结构说明
- 安全配置与占位模板
- 多公众号独立目录结构建议

### 2. 内容准备
- 资讯收集与筛选流程
- 市场角度整理
- 公众号文章写稿规范
- Markdown 成稿约定
- 避免将抓取标题原文直接拼入正文

### 3. 图片处理
- 封面图 `cover.png` 生成策略
- 正文首图 `image1.jpg` / 尾图 `image2.jpg` 处理策略
- 本地图库模式
- 用户提供图片模式
- 自动生成图片模式
- 图片失败回退与质检规则
- 图片真实格式校验与标准化要求（防止 HEIF/HEIC 冒充 png/jpg）

### 4. 公众号发布
- 草稿发布流程说明
- 正式发布流程说明（freepublish 轮询机制）
- 明确说明：`freepublish` 与平台后台手动发布效果不完全等价
- 推荐生产模式：自动入草稿箱 + 人工在平台手动发布
- 备用发布脚本 `publish.mjs`（纯 Node.js，零依赖，解决 Bun 兼容性问题）
- 发布成功判断标准（技术成功 / 平台成功 / 运营可见性成功三层区分）
- 发布结果归档规范
- 常见故障排查（IP 白名单、依赖兼容性、AI 生图 404/401、图片格式错误）

### 5. 自动化与运维
- `run.sh` 模板
- 更贴近实战的 `run.production-example.sh`
- `cron` 示例（含多账号、时区、双模式）
- 失败告警建议
- 运行手册与交接说明
- `draft_only` / `full_publish` 双模式说明

### 6. 安全边界
- Skill 本身不包含真实敏感配置
- 不包含真实 `WECHAT_APP_ID`
- 不包含真实 `WECHAT_APP_SECRET`
- 不包含真实 `GOOGLE_API_KEY`
- 不包含 Token / Cookie / 私人账号信息

---

## 目录结构

```text
wechat-auto-publishing-complete/
├─ SKILL.md
├─ runbook.md
├─ references/
│  ├─ environment-and-config.md
│  ├─ source-gathering.md
│  ├─ writing-style.md
│  ├─ image-strategy.md
│  ├─ publishing.md
│  ├─ scheduling-and-alerting.md
│  └─ security-boundary.md
└─ templates/
   ├─ article-template.md
   ├─ env.example.txt
   ├─ publish.mjs              ← 纯 Node.js 零依赖备用发布脚本
   ├─ run.sh
   ├─ run.production-example.sh ← 更贴近生产环境的脚本模板
   ├─ cron.example.txt
   ├─ publish-result.example.json
   ├─ gallery-config.example.txt
   ├─ cover-image-extend.example.md
   ├─ image-gen-extend.example.md
   └─ workspace-tree.txt
```

---

## 设计原则

本 Skill 的设计目标是：

- **完整性**：覆盖从准备环境到正式发布的完整链路
- **可复现**：适合在新机器、新项目目录中重新搭建
- **可交接**：适合作为团队或个人工作流沉淀后的标准交付物
- **可扩展**：后续可以继续补充脚本、图片策略、发布策略、调度策略
- **安全性**：严格区分“流程说明”和“真实秘密”，避免将私人敏感信息写入 Skill

---

## 使用方式

推荐按以下顺序使用本 Skill：

1. 阅读 `SKILL.md` 了解整体流程
2. 阅读 `references/environment-and-config.md` 准备运行环境
3. 使用 `templates/env.example.txt`、`templates/workspace-tree.txt` 搭建本地目录
4. 按 `references/source-gathering.md` 和 `references/writing-style.md` 准备文章内容
5. 按 `references/image-strategy.md` 准备封面图与正文图片
6. 按 `references/publishing.md` 完成草稿发布与正式发布判断
7. 按 `runbook.md` 做每日执行或交接
8. 如需定时运行，参考 `templates/run.sh`、`templates/run.production-example.sh` 与 `templates/cron.example.txt`

---

## 环境要求

建议运行环境至少具备：

- `python3`（如使用 uv 管理 Python，`python` 命令亦可）
- `node`
- `npm`
- `npx`
- `bun`（Bun 1.3.x 在 Windows 上可能存在兼容性问题，遇到时可用 Node.js 替代）

如果要完整复现工作流，还建议本地具备对应的内容收集、图片处理和公众号发布能力。

> 注意：AI 生图（Google API）可能需要代理，微信 API 必须直连。两个阶段需分别处理代理设置。

---

## 配置说明

本仓库**只提供安全占位模板**，不包含任何真实账号或敏感值。

示例：

```env
WECHAT_APP_ID=fill_in_valid_value_in_target_environment
WECHAT_APP_SECRET=fill_in_valid_value_in_target_environment
GOOGLE_BASE_URL=fill_in_valid_value_in_target_environment
GOOGLE_API_KEY=fill_in_valid_value_in_target_environment
```

请在你自己的目标环境中填写真实值，不要直接提交到仓库。

---

## 推荐适用对象

这个 Skill 适合：

- 想把微信公众号运营流程标准化的人
- 想把公众号写稿/发稿沉淀为可复用工具的人
- 想在本地实现半自动或全自动发文的人
- 想把现有工作流整理成 ClawHub / GitHub 可分发 Skill 的人

---

## 安全声明

本 Skill 只包含：
- 流程说明
- 参考文档
- 模板文件
- 安全占位示例

不包含：
- 真实凭证
- 私人配置
- 私有账号信息
- 真实生产环境秘密

请在使用前自行完成本地配置，并确保遵守目标平台的使用规则与安全要求。

---

## 后续可扩展方向

后续可以继续扩展：
- 更完整的执行脚本
- 更自动化的发布编排
- 更丰富的文章模板
- 更细粒度的图片素材策略
- 更完整的日志与告警体系
- 更适合团队协作的工作流版本

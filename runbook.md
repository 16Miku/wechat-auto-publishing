# WeChat Auto Publishing Runbook

Use this runbook when operating or handing off the workflow.

## 1. Fresh machine checklist

- [ ] `python3`, `node`, `npm`, `npx`, `bun` are installed
- [ ] the required local publishing skill/tool exists
- [ ] the Markdown dependency chain is installed
- [ ] `<project-dir>/.baoyu-skills/.env` exists in the target environment
- [ ] real secrets are supplied outside the skill package
- [ ] WeChat allowlist prerequisites are satisfied
- [ ] image-service access is available if image generation is enabled

## 2. Daily execution checklist

- [ ] gather and filter source material
- [ ] produce the market-angle summary
- [ ] draft the article from the template
- [ ] prepare `cover.png`
- [ ] prepare `image1.jpg` and `image2.jpg` if enabled
- [ ] verify frontmatter and file paths
- [ ] 发布前确认代理设置（生图需要代理，发布需要直连）
- [ ] publish to draft
- [ ] record `media_id`
- [ ] optionally publish formally
- [ ] 发布后检查 `output/full_publish_result.json` 中的 `publish_status` 是否为 0
- [ ] archive outputs

## 3. Failure checklist

If publish fails:
- [ ] preserve logs
- [ ] preserve the article package
- [ ] do not consume gallery images if success was not confirmed
- [ ] record the failed step and error summary
- [ ] send an alert if automation is enabled

## 4. 常见故障排查

### 微信 API 报 40164（IP 不在白名单）

以错误信息中返回的 IP 为准添加白名单，不要依赖 `curl ifconfig.me` 的结果（代理环境下出口 IP 可能不同）。

### baoyu-post-to-wechat 报 SyntaxError（simple-xml-to-json）

Bun 与 `simple-xml-to-json` 包存在兼容性问题。解决方案：
- 使用 `templates/publish.mjs` 备用脚本：`node templates/publish.mjs`
- 或升级 Bun 到最新版本后重试

### AI 生图返回 404

检查 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 或 `.baoyu-skills/baoyu-cover-image/EXTEND.md` 中的模型名是否被代理 API 支持。不同代理支持的模型列表可能不同。

## 5. Distribution checklist

Before sharing the skill package:
- [ ] verify no real secrets are embedded
- [ ] verify no private account identifiers are exposed unintentionally
- [ ] verify example files only contain placeholders
- [ ] verify the package is self-explanatory for a new machine setup

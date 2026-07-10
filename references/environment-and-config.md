# Environment and Configuration

Use this reference when reproducing the workflow on a new machine or validating an existing machine.

## Goal

Make the workflow reproducible without storing any private credentials in the skill package.

## Required runtime

Confirm these are installed and callable:

```bash
python3 --version
node --version
npm -v
npx -v
bun --version
```

Minimum expected tools:
- `python3`
- `node`
- `npm`
- `npx`
- `bun`

### Python 通过 uv 管理的情况

如果用户使用 uv 管理 Python，`python3` 命令可能不存在。检查方式：

```bash
# 检查 uv 管理的 Python 版本
uv python list --installed

# 或直接用 python（不带 3）
python --version
```

如果 `python3` 不可用但 `python` 可用，在脚本中使用 `python` 替代即可。

### Bun 版本兼容性

Bun 1.3.x 在 Windows 上与某些 npm 包（如 `simple-xml-to-json`）存在兼容性问题，可能导致运行时报 `SyntaxError`。

建议：
- 保持 Bun 为最新版本（`bun upgrade`）
- 如果遇到兼容性问题，使用 Node.js 作为备用运行时（`node` 替代 `bun`）

## Dual-channel prerequisites

### Channel A — API

- Valid `WECHAT_APP_ID` / `WECHAT_APP_SECRET` in target env only
- Server egress IP on WeChat allowlist
- `node` available for `templates/publish.mjs` fallback
- Optional: `baoyu-post-to-wechat` skill installed

### Channel B — Chrome DevTools (local browser)

- Google Chrome installed and **already logged in** to the target 公众号 at `https://mp.weixin.qq.com`
- Chrome DevTools MCP (or equivalent CDP bridge) connected to that browser session
- Smoke test: call `list_pages` and confirm at least one `mp.weixin.qq.com` tab
- Operator available for **QR admin verification** at formal publish time
- Do **not** store session cookies or tokens inside this skill package

If MCP attaches to a different Chrome profile than the one with the login session, browser publish will fail even though Chrome is “running”.

### Feishu QR notify (optional, recommended with Channel B)

- `lark-cli` installed; `lark-cli auth status` shows **bot: ready**
- Configure in target env only: `FEISHU_NOTIFY_OPEN_ID` or `FEISHU_NOTIFY_CHAT_ID`
- App availability range must include the recipient
- Before sending: clear HTTP(S) proxy env vars (Feishu token calls often time out behind proxy)
- Image path for `lark-cli --image` must be **cwd-relative** (no absolute paths, no `..`)
- Full guide: `references/feishu-qr-notify.md`

## Required local capabilities

Prefer these local skills or equivalent tooling if available:
- `news-aggregator-skill`
- `baoyu-post-to-wechat`（通道 A）
- Chrome DevTools MCP（通道 B）
- `baoyu-image-gen` / 或 Agent 原生 `image_gen`（用户提示词直出）
- `baoyu-cover-image`
- `investment-advisor`
- `wechat-toolkit`
- optionally `equity-research`, `market-environment-analysis`, `marcus-investment-skill`

## Safe config model

Keep real secrets outside the skill package.

Use placeholders like these in examples only:

```env
WECHAT_APP_ID=fill_in_valid_value_in_target_environment
WECHAT_APP_SECRET=fill_in_valid_value_in_target_environment
GOOGLE_BASE_URL=https://api.ikuncode.cc/
GOOGLE_API_KEY=fill_in_valid_value_in_target_environment
```

## Recommended config placement

Preferred order:
1. process environment
2. `<project-dir>/.baoyu-skills/.env`
3. `~/.baoyu-skills/.env`

## 代理环境处理

如果本地开启了 Clash/V2Ray 等代理工具，需要注意代理变量对不同 API 的影响：

- AI 图片生成（Google API）：可能需要代理才能访问
- 微信 API：必须直连，不能走代理
- 飞书 lark-cli：建议直连；代理下常见 `accounts.feishu.cn` token 超时

建议在脚本开头统一处理代理变量：

```bash
# 清除代理环境变量（微信 API 需要直连）
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# 如果需要代理访问 Google API，在生图阶段单独设置：
# export https_proxy=http://127.0.0.1:7890
```

在生图和发布两个阶段分别处理代理设置，避免代理干扰微信 API 调用。

## Publishing dependency chain

If the Markdown rendering chain is not ready, install it on the target machine:

```bash
cd /root/clawd/skills/baoyu-post-to-wechat/scripts/md
npm install
```

Adjust the path if the publishing skill lives elsewhere in the target environment.

## baoyu-skills 安装

baoyu-skills 是发布流程依赖的核心工具集。

- 仓库地址：https://github.com/jimliu/baoyu-skills
- 安装方式：

```bash
git clone https://github.com/jimliu/baoyu-skills.git
cd baoyu-skills
npm install    # monorepo 结构，主目录安装即可
```

- 如果 `npm install` 后使用 `bun` 运行报错，尝试用 `bun install` 重新安装依赖：

```bash
cd baoyu-skills
bun install
```

## External prerequisites

An operator must manually ensure:
- the server egress IP is in the WeChat allowlist
- the WeChat API credentials are valid in the target environment
- the image service key is valid if image generation is enabled
- the machine can reach WeChat APIs and the configured image service

## Recommended workspace layout

Use a stable project directory in production rather than relying on `/tmp`:

```text
<project-dir>/
├─ .baoyu-skills/
│  ├─ .env                         # 仅目标环境，永不进 skill 包
│  ├─ baoyu-image-gen/
│  │  └─ EXTEND.md
│  └─ baoyu-cover-image/
│     └─ EXTEND.md
├─ 美女配图/                         # 可选本地图库
├─ output/
│  └─ YYYY-MM-DD/                  # 推荐按日分包
│     ├─ article.md
│     ├─ cover.png
│     ├─ image1.jpg
│     ├─ image2.jpg
│     ├─ draft-result.json
│     └─ publish-status.json
├─ article.md                      # 或仅使用当日包内 article.md
├─ cover.png
├─ image1.jpg
├─ image2.jpg
└─ run.sh
```

Also see `templates/daily-package-layout.example.txt` and `templates/workspace-tree.txt`.

## Reproduction rule

If the workflow is being moved to another host, reproduce:
- the runtime
- the skill/tool layout
- the non-secret config structure
- the dependency installation steps
- the file naming conventions
- the publish success criteria

## Multi-account deployment

### API / long-running automation

Use isolated working directories per account.

Example:

```text
/root/wechat-auto-a/
/root/wechat-auto-b/
```

Each directory should own its own:
- `.baoyu-skills/.env`
- `article.md` / article generation scripts
- `run.sh`
- `title_history.txt`
- `cron.log`
- `output/`

### Browser (same Chrome, switch account in MP)

Same project directory is OK for short runs, but Agent **must**:

1. Re-read top-bar account display name  
2. Re-read URL `token=`  
3. Confirm with operator  
4. Set `#author` to current display name  
5. Archive as `{slug}-draft-result.json` / `{slug}-publish-status.json`  

Full checklist: `references/multi-account.md`.

### Why this matters

This avoids:
- credential confusion
- title-history pollution
- log mixing
- accidental cross-account publishing
- wrong author name after switching OA
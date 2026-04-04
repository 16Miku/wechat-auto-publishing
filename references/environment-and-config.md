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

## Required local capabilities

Prefer these local skills or equivalent tooling if available:
- `news-aggregator-skill`
- `baoyu-post-to-wechat`
- `baoyu-image-gen`
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

## Publishing dependency chain

If the Markdown rendering chain is not ready, install it on the target machine:

```bash
cd /root/clawd/skills/baoyu-post-to-wechat/scripts/md
npm install
```

Adjust the path if the publishing skill lives elsewhere in the target environment.

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
│  ├─ .env
│  ├─ baoyu-image-gen/
│  │  └─ EXTEND.md
│  └─ baoyu-cover-image/
│     └─ EXTEND.md
├─ article.md
├─ cover.png
├─ image1.jpg
├─ image2.jpg
├─ output/
└─ run.sh
```

## Reproduction rule

If the workflow is being moved to another host, reproduce:
- the runtime
- the skill/tool layout
- the non-secret config structure
- the dependency installation steps
- the file naming conventions
- the publish success criteria

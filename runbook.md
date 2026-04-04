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
- [ ] publish to draft
- [ ] record `media_id`
- [ ] optionally publish formally
- [ ] archive outputs

## 3. Failure checklist

If publish fails:
- [ ] preserve logs
- [ ] preserve the article package
- [ ] do not consume gallery images if success was not confirmed
- [ ] record the failed step and error summary
- [ ] send an alert if automation is enabled

## 4. Distribution checklist

Before sharing the skill package:
- [ ] verify no real secrets are embedded
- [ ] verify no private account identifiers are exposed unintentionally
- [ ] verify example files only contain placeholders
- [ ] verify the package is self-explanatory for a new machine setup

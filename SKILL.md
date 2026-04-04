---
name: wechat-auto-publishing-complete
description: Use this skill to fully reproduce and operate a local end-to-end WeChat Official Account publishing workflow: prepare the environment, validate dependencies, configure non-sensitive placeholders for credentials, gather source material, draft articles, prepare cover and body images, assemble a WeChat-ready Markdown package, publish to draft, optionally submit for formal publication, poll status, archive outputs, and attach scheduling or alerting. Use whenever the user wants a complete reproducible公众号自动发文 skill with environment setup, templates, runbooks, and execution scaffolding, while keeping all secrets and personal account details outside the skill package.
---

# WeChat Auto Publishing Complete

Use this skill to reproduce, document, and operate a complete local WeChat Official Account auto-publishing workflow without embedding any secrets, private account details, or personal identifiers in the skill package.

This skill is intentionally broader than a minimal workflow note. It includes the operational context needed to reproduce the workflow on a fresh machine, while still keeping all sensitive values external.

## Core outcome

The desired end state is a reusable local workflow that can do the following:

1. prepare the environment on a new machine
2. gather the day’s source material
3. determine the article angle
4. draft the article in a target style
5. prepare `cover.png`, `image1.jpg`, and `image2.jpg`
6. assemble a publishable Markdown package
7. publish to the WeChat draft box
8. optionally complete formal publication
9. archive outputs and execution results
10. optionally attach scheduling and alerting

## Required safety rule

Never store real private values in this skill package.

Do not include:
- real `WECHAT_APP_ID`
- real `WECHAT_APP_SECRET`
- real `GOOGLE_API_KEY`
- any real cookies, tokens, session secrets, API keys, or private IDs
- user-specific公众号 identifiers unless the user explicitly asks for them to be hard-coded
- any private filesystem paths that reveal personal context unless rewritten as placeholders

When documenting configuration, only include:
- variable names
- placeholder values
- lookup order
- validation methods
- safe example file structures

## Skill structure

Read the bundled references depending on what the user is trying to accomplish:

- `references/environment-and-config.md` — use when preparing a new machine or validating prerequisites
- `references/source-gathering.md` — use when collecting the day’s source pool and market angle
- `references/writing-style.md` — use when drafting and formatting the article
- `references/image-strategy.md` — use when preparing cover and body images, including gallery mode
- `references/publishing.md` — use when publishing to draft/final and archiving outputs
- `references/scheduling-and-alerting.md` — use when attaching cron, wrappers, logs, and alerts
- `references/security-boundary.md` — use when checking what the skill must and must not contain
- `templates/article-template.md` — use as the default publishable article skeleton
- `templates/env.example.txt` — use as the safe non-secret environment placeholder file
- `templates/run.sh` — use as a starting point for a local orchestrator script
- `templates/cron.example.txt` — use as a starting point for scheduling
- `templates/publish-result.example.json` — use as a result artifact template
- `templates/gallery-config.example.txt` — use as a local gallery config example
- `templates/cover-image-extend.example.md` — use as a safe cover-image preference example
- `templates/image-gen-extend.example.md` — use as a safe image-gen preference example
- `templates/workspace-tree.txt` — use as a recommended directory layout
- `runbook.md` — use as the operator-facing execution checklist

## Standard execution flow

### Step 1: Prepare environment

Before doing any content work, verify that the environment is reproducible on the target machine.

Confirm:
- runtime dependencies exist
- the publishing script dependency chain exists
- non-sensitive config placeholders are in place
- secrets will be supplied outside the skill package
- external prerequisites such as WeChat IP allowlisting are understood

Read `references/environment-and-config.md`.

### Step 2: Gather source material

Collect raw source material, filter it down, and compress the market angle.

Read `references/source-gathering.md`.

### Step 3: Draft the article

Draft an article in the target style using the publishable Markdown conventions from this skill.

Read `references/writing-style.md` and start from `templates/article-template.md` when useful.

### Step 4: Prepare images

Prepare:
- `cover.png`
- `image1.jpg`
- `image2.jpg`

Choose image sources explicitly:
- user-provided assets
- local gallery mode
- generated images

Read `references/image-strategy.md`.

### Step 5: Assemble the package

Make sure the article package is self-contained and publishable:
- `article.md`
- `cover.png`
- `image1.jpg`
- `image2.jpg`

Use relative paths and UTF-8 encoding.

### Step 6: Publish to draft

Use the local publishing pathway to send the article to WeChat draft.

Do not treat publishing as successful unless the draft step returns a meaningful success result, such as a valid `media_id`.

Read `references/publishing.md`.

### Step 7: Optionally complete formal publication

If the workflow includes final publication, submit, poll, and capture the final URL.

### Step 8: Archive results

Save result artifacts, logs, identifiers, and remaining gallery state where relevant.

### Step 9: Add scheduling and alerting

If the user wants timed operation, attach a wrapper script and scheduler entry.

Read `references/scheduling-and-alerting.md`.

## Workflow principles

### Keep the package explicit

Prefer explicit files and paths over hidden assumptions.

### Keep secrets external

Configuration structure belongs inside the skill. Real credentials do not.

### Keep failure handling visible

If a step fails, preserve enough output and log context for a human operator to understand what happened.

### Keep image behavior configurable

Do not hard-code a single image source assumption. The workflow should make it clear whether the body images come from a local gallery, generated assets, or user-supplied files.

## Reproduction checklist

A fresh-machine reproduction should be able to answer yes to all of these:
- runtime tools are installed
- publishing dependency chain is installed
- safe config placeholders are present
- operator knows where to put real secrets outside the skill package
- source gathering pathway is defined
- article template is available
- image strategy is defined
- publishing checks are defined
- result archive format is defined
- scheduling examples exist if automation is needed

## Final rule

This skill is allowed to be operationally complete, but it must remain secret-free. Every reusable process detail can go into the skill; every real credential and personal account detail must stay outside it.

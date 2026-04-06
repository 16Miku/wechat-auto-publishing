# Publishing

Use this reference when publishing the article package to WeChat draft and optional final publication.

## Safe config rule

Never store real credentials inside the skill package.

Use safe placeholders in examples only:

```env
WECHAT_APP_ID=fill_in_valid_value_in_target_environment
WECHAT_APP_SECRET=fill_in_valid_value_in_target_environment
GOOGLE_BASE_URL=https://api.ikuncode.cc/
GOOGLE_API_KEY=fill_in_valid_value_in_target_environment
```

## Publishing success should be split into 3 layers

### 1. Technical success

Examples:
- access token retrieved
- image upload succeeded
- draft submission succeeded
- `media_id` returned
- `publish_id` returned
- `article_url` returned

### 2. Platform success

Examples:
- draft visible in MP backend
- publish task visible in backend
- publish status reaches success state

### 3. Operational success

Examples:
- article appears where the operator expects in the official account frontend/homepage flow
- article behaves the same way as manual backend publishing

> Important: Technical success does not automatically imply operational success.

## Draft publishing success criteria

Treat draft publishing as successful only if the run returns a meaningful success signal such as:
- successful access token retrieval
- successful image upload
- successful cover upload
- successful draft submission
- returned `media_id`

If no `media_id` is returned, do not mark the draft step as successful.

## Formal publication success criteria

If final publication is enabled, capture:
- `publish_id`
- returned article identifiers if available
- publication status
- final article URL if available

## `freepublish` boundary

`freepublish_submit` is the official API used to submit a draft for publication. In practice, it can successfully return `publish_id`, `article_id`, and `article_url`, but this should not be documented as universally equivalent to manual publishing inside the WeChat MP backend.

### Recommended wording

- `draft/add` = save to draft
- `freepublish_submit` = submit draft for publication
- manual backend publish = platform UI publication behavior

### Recommended production default

Use `draft_only` as the default production mode when homepage visibility consistency matters.

### Recommended testing mode

Use `full_publish` only when the operator explicitly accepts API-publication behavior differences.

## Archive outputs

Save at least:
- title
- execution time
- media_id
- publish_id
- article URL
- success/failure state
- error summary if any
- gallery mutation result if gallery mode is enabled
- publication mode (`draft_only` / `full_publish`)
- whether result is considered technical success only or operationally accepted

Recommended outputs:
- `output/full_publish_result.json`
- `output/publish_log.jsonl`

## Packaging rule before publish

Before publishing, verify:
- `article.md` exists
- `cover.png` exists
- `image1.jpg` and `image2.jpg` exist if body images are enabled
- frontmatter contains `title`, `summary`, and `cover`
- file encoding is UTF-8
- relative file paths resolve correctly
- image real formats are valid for WeChat upload (do not trust extension alone)

## Fallback publish script

When `baoyu-post-to-wechat` fails due to jimp / simple-xml-to-json compatibility issues on Windows + Bun, use `templates/publish.mjs` as a fallback. It is a pure Node.js script with zero third-party dependencies.

Usage:
1. Copy `templates/publish.mjs` to the working directory (same level as `article.md` and `cover.png`)
2. Ensure `.baoyu-skills/.env` contains `WECHAT_APP_ID` and `WECHAT_APP_SECRET`
3. Run: `node publish.mjs`

## IP whitelist notes

- When using a proxy (e.g. Clash), the IP returned by `curl ifconfig.me` or httpbin may not be the real outbound IP
- When WeChat API returns error 40164, the error message includes the actual request IP — use that IP for the whitelist
- After saving the whitelist in the WeChat MP admin console, it may take 1-2 minutes to take effect

## Formal publish flow

`publish.mjs` supports the full publish cycle:
1. Call `freepublish/submit` with the draft `media_id` to submit for publication
2. Poll `freepublish/get` with the returned `publish_id` to check status
3. Poll interval: 3 seconds, max 30 attempts (90 seconds total)
4. `publish_status` values: 0 = success, 1 = publishing, 2 = original content review pending

## HTML rendering optimization

The built-in Markdown-to-HTML converter in `publish.mjs` applies WeChat-friendly styles:
- `h2` headings get a blue left border (`border-left: 4px solid #1e90ff`) with padding for visual emphasis
- Paragraphs get `margin-bottom: 1em` and `line-height: 1.8` for comfortable reading on mobile
- Images get `max-width: 100%` to prevent overflow on small screens

## Image upload validation note

A file extension alone is not enough. Examples of bad cases:
- filename ends with `.png`
- actual file content is HEIF / HEVC
- API rejects upload with `40113 unsupported file type hint`

Therefore, production workflows should include either:
- MIME / magic-byte inspection
- or image re-encoding into standard JPEG / PNG before publish

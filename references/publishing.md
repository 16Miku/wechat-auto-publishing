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

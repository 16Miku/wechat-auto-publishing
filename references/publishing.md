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

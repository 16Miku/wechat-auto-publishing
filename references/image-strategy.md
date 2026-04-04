# Image Strategy

Use this reference when preparing `cover.png`, `image1.jpg`, and `image2.jpg`.

## Output contract

Use these filenames consistently:
- `cover.png`
- `image1.jpg`
- `image2.jpg`

## Cover image

Prefer a dedicated cover-generation path that outputs `cover.png`.

Recommended default characteristics:
- conceptual style
- cool palette
- digital rendering
- little or no text baked into the generated image
- aspect suited for WeChat cover use

The article frontmatter should point to:

```yaml
cover: ./cover.png
```

## Body image sources

Support these sources explicitly:
1. user-provided images
2. local gallery images
3. generated images

The operator may choose the preferred order, but the workflow should make the source explicit.

## Local gallery mode

Recommended gallery layout:

```text
<gallery-root>/
├─ unused/
├─ used/
└─ bad/
```

### Rules

- choose exactly 2 images from `unused/`
- do not select the same image twice in the same article
- only allow supported image formats
- do not mutate gallery state until publish success
- if publish fails, keep selected images in `unused/`
- if fewer than 2 valid images remain, stop the gallery branch and report low stock

### Suggested config model

```text
gallery_enabled = true
gallery_strategy = random
gallery_pick_count = 2
gallery_consume_mode = move_to_used
gallery_low_stock_threshold = 20
gallery_allowed_ext = .jpg,.jpeg,.png,.webp
```

## Generation fallback

If image generation fails, prefer one of these fallback paths if configured:
- local gallery
- user-provided images
- publish without body images only if that is an explicit workflow option

## Additional quality gate

Before inserting images into the article package, check:
- file exists
- file is readable
- image dimensions are valid
- file is not empty or obviously broken

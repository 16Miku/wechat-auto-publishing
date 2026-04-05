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

## AI 生图实践经验

### Google Gemini 模型选择

- EXTEND.md 中配置的默认模型为 `gemini-3.1-flash-image-preview`
- 如果使用代理 API（如 `api.ikuncode.cc`），需确认代理支持的模型列表
- 不同模型名称格式不同，错误的模型名会返回 404 错误
- 建议在 EXTEND.md 中明确记录当前使用的模型名，方便排查

### 代理与直连

AI 生图和微信发布对网络环境的要求不同：

- AI 生图调用 Google API 时可能需要代理才能访问
- 生成图片后上传到微信时必须直连（微信 API 不能走代理）
- 建议在生图和发布两个阶段分别处理代理设置：

```bash
# 生图阶段：开启代理
export https_proxy=http://127.0.0.1:7890

# 发布阶段：关闭代理
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
```

### 图片尺寸建议

- 封面图推荐 2.35:1 宽屏比例（适合微信公众号封面展示）
- 正文配图推荐 3:2 比例
- 生成的图片通常 2-4MB，微信 API 上传限制为 10MB，一般不会超限

## Additional quality gate

Before inserting images into the article package, check:
- file exists
- file is readable
- image dimensions are valid
- file is not empty or obviously broken

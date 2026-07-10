#!/usr/bin/env bash
# 将微信验证二维码图片推送到飞书（bot）
# 用法：
#   export FEISHU_NOTIFY_OPEN_ID=ou_xxx
#   ./feishu-qr-notify.example.sh output/2026-07-10/wechat-verify-qr.png "科创暴8%，但别追最热那一下"
#
# 依赖：lark-cli，bot 身份可用；图片路径必须是相对 cwd 的路径

set -euo pipefail

IMAGE_REL="${1:?usage: $0 <relative-image-path> [article-title]}"
TITLE="${2:-（未命名文章）}"
OPEN_ID="${FEISHU_NOTIFY_OPEN_ID:-}"
CHAT_ID="${FEISHU_NOTIFY_CHAT_ID:-}"

if [[ -z "$OPEN_ID" && -z "$CHAT_ID" ]]; then
  echo "Set FEISHU_NOTIFY_OPEN_ID or FEISHU_NOTIFY_CHAT_ID" >&2
  exit 1
fi

if [[ "$IMAGE_REL" = /* || "$IMAGE_REL" == *..* ]]; then
  echo "Image path must be cwd-relative without .. : $IMAGE_REL" >&2
  exit 1
fi

if [[ ! -f "$IMAGE_REL" ]]; then
  echo "File not found: $IMAGE_REL" >&2
  exit 1
fi

# 发飞书前清除代理，避免 token 请求超时
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY || true

TARGET_ARGS=()
if [[ -n "$OPEN_ID" ]]; then
  TARGET_ARGS=(--user-id "$OPEN_ID")
else
  TARGET_ARGS=(--chat-id "$CHAT_ID")
fi

TEXT="【公众号发表验证】请用管理员微信尽快扫码（二维码有时效）。
标题：${TITLE}
若码失效，请在电脑后台重新点发表以刷新二维码。"

lark-cli im +messages-send --as bot "${TARGET_ARGS[@]}" --text "$TEXT"
lark-cli im +messages-send --as bot "${TARGET_ARGS[@]}" --image "$IMAGE_REL"

echo "Feishu QR notify sent for: $IMAGE_REL"

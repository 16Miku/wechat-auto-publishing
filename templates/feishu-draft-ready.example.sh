#!/usr/bin/env bash
# API 草稿成功后：飞书通知管理员去 mp 后台手动发表
# 用法：
#   export FEISHU_NOTIFY_OPEN_ID=ou_xxx
#   export WECHAT_ACCOUNT_DISPLAY_NAME='账号显示名'
#   ./feishu-draft-ready.example.sh "文章标题" "一句话摘要" "media_id_xxx" [cover-rel-path]
#
# 依赖：lark-cli bot ready；发前清代理

set -euo pipefail

TITLE="${1:?usage: $0 <title> <summary> <media_id> [cover_rel_path]}"
SUMMARY="${2:?}"
MEDIA_ID="${3:?}"
COVER_REL="${4:-}"
ACCOUNT="${WECHAT_ACCOUNT_DISPLAY_NAME:-（未配置账号名）}"
OPEN_ID="${FEISHU_NOTIFY_OPEN_ID:-}"
CHAT_ID="${FEISHU_NOTIFY_CHAT_ID:-}"
MP_HOME="${WECHAT_MP_HOME_URL:-https://mp.weixin.qq.com/}"

if [[ -z "$OPEN_ID" && -z "$CHAT_ID" ]]; then
  echo "Set FEISHU_NOTIFY_OPEN_ID or FEISHU_NOTIFY_CHAT_ID" >&2
  exit 1
fi

unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY || true

TARGET_ARGS=()
if [[ -n "$OPEN_ID" ]]; then
  TARGET_ARGS=(--user-id "$OPEN_ID")
else
  TARGET_ARGS=(--chat-id "$CHAT_ID")
fi

TEXT="【待发布·草稿已进箱】

账号：${ACCOUNT}
标题：${TITLE}
摘要：${SUMMARY}
media_id：${MEDIA_ID}
时间：$(date '+%Y-%m-%d %H:%M:%S')

请管理员：
1. 打开管理后台（确认右上角是本账号）
2. 内容管理 → 草稿箱
3. 按标题打开本文 → 检查封面/正文 → 点「发表」

管理后台：
${MP_HOME}

说明：流水线仅完成 API 草稿 + 本通知，不自动正式发表（避免 freepublish 可见性异常）。"

lark-cli im +messages-send --as bot "${TARGET_ARGS[@]}" --text "$TEXT"

if [[ -n "$COVER_REL" ]]; then
  if [[ "$COVER_REL" = /* || "$COVER_REL" == *..* ]]; then
    echo "Cover path must be cwd-relative without .. : $COVER_REL" >&2
    exit 1
  fi
  if [[ -f "$COVER_REL" ]]; then
    lark-cli im +messages-send --as bot "${TARGET_ARGS[@]}" --image "$COVER_REL"
  fi
fi

echo "draft-ready notify sent: $TITLE"

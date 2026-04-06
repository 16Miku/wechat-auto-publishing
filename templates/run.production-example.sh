#!/usr/bin/env bash
set -euo pipefail

TZ="Asia/Shanghai"
export TZ
TODAY="$(date +%F)"
RUN_SLOT="$(date +%H%M%S)"
WORKDIR="/tmp/wechat_daily_${TODAY}_${RUN_SLOT}"
ARTICLE="$WORKDIR/article.md"
FINANCE_JSON="$WORKDIR/finance.json"
TITLE_HISTORY_FILE="<project-dir>/title_history.txt"
PUBLISH_RESULT_JSON="$WORKDIR/publish_result.json"
FULL_PUBLISH_RESULT_JSON="$WORKDIR/full_publish_result.json"
GALLERY_ROOT="/tmp/wechat-gallery"
UNUSED_DIR="$GALLERY_ROOT/unused"
USED_DIR="$GALLERY_ROOT/used"
BAD_DIR="$GALLERY_ROOT/bad"
LOW_STOCK_THRESHOLD=20
PUBLISH_MODE="${WECHAT_AUTO_PUBLISH_MODE:-draft_only}"

mkdir -p "$WORKDIR" "$UNUSED_DIR" "$USED_DIR" "$BAD_DIR" "$(dirname "$TITLE_HISTORY_FILE")"
export WECHAT_AUTO_TITLE_HISTORY="$TITLE_HISTORY_FILE"

echo "[wechat-auto] WORKDIR=$WORKDIR"
echo "[wechat-auto] PUBLISH_MODE=$PUBLISH_MODE"

# 1) gather source material
# 2) generate article.md
# 3) select 2 gallery images
# 4) validate real image formats before publish
# 5) publish to draft
# 6) if full_publish, run freepublish submit/get
# 7) only mutate gallery state on success

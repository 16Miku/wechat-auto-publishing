#!/usr/bin/env bash
set -euo pipefail

# Safe minimal template only. Replace placeholders in the target environment.
PROJECT_DIR="<project-dir>"
OUTPUT_DIR="$PROJECT_DIR/output"
ARTICLE_PATH="$PROJECT_DIR/article.md"
PUBLISHER_SCRIPT="<path-to-publisher-skill>/scripts/wechat-api.ts"
PUBLISH_MODE="${WECHAT_AUTO_PUBLISH_MODE:-draft_only}"

mkdir -p "$OUTPUT_DIR"
cd "$PROJECT_DIR"

echo "[run.sh] starting workflow at $(date -Iseconds)"
echo "[run.sh] publish_mode=$PUBLISH_MODE"

echo "[run.sh] validate package files"
test -f "$ARTICLE_PATH"
test -f "$PROJECT_DIR/cover.png"

# Body images are optional depending on workflow mode
if [ -f "$PROJECT_DIR/image1.jpg" ]; then echo "image1 present"; fi
if [ -f "$PROJECT_DIR/image2.jpg" ]; then echo "image2 present"; fi

# Example placeholders for a real workflow:
# 1) gather source material
# 2) draft article.md
# 3) prepare cover.png, image1.jpg, image2.jpg
# 4) publish to draft
# 5) if full_publish, run freepublish submit/get
# 6) archive results

# Example draft publishing command:
# npx -y bun "$PUBLISHER_SCRIPT" "$ARTICLE_PATH" --theme default | tee "$OUTPUT_DIR/publish.log"

# Production recommendation:
# default to draft_only unless the operator explicitly chooses full_publish.

echo "[run.sh] workflow template finished"

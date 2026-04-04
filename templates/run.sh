#!/usr/bin/env bash
set -euo pipefail

# Safe template only. Replace placeholders in the target environment.
PROJECT_DIR="<project-dir>"
OUTPUT_DIR="$PROJECT_DIR/output"
ARTICLE_PATH="$PROJECT_DIR/article.md"
PUBLISHER_SCRIPT="<path-to-publisher-skill>/scripts/wechat-api.ts"

mkdir -p "$OUTPUT_DIR"

# Example placeholders for a real workflow:
# 1) gather source material
# 2) draft article.md
# 3) prepare cover.png, image1.jpg, image2.jpg
# 4) publish to draft
# 5) optionally submit for final publication
# 6) archive results

cd "$PROJECT_DIR"

echo "[run.sh] starting workflow at $(date -Iseconds)"

echo "[run.sh] validate package files"
test -f "$ARTICLE_PATH"
test -f "$PROJECT_DIR/cover.png"

# Body images are optional depending on workflow mode
if [ -f "$PROJECT_DIR/image1.jpg" ]; then echo "image1 present"; fi
if [ -f "$PROJECT_DIR/image2.jpg" ]; then echo "image2 present"; fi

# Example draft publishing command:
# npx -y bun "$PUBLISHER_SCRIPT" "$ARTICLE_PATH" --theme default | tee "$OUTPUT_DIR/publish.log"

echo "[run.sh] workflow template finished"

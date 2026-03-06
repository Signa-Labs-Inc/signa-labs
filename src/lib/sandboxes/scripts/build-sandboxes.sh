#!/bin/bash
set -euo pipefail

# Build all CodeForge sandbox images locally
# Usage: ./scripts/build-sandboxes.sh [language]
# Examples:
#   ./scripts/build-sandboxes.sh              # Build all
#   ./scripts/build-sandboxes.sh python       # Build only Python
#   ./scripts/build-sandboxes.sh typescript-react  # Build only TS React

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOXES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

IMAGE_PREFIX="signa-labs-sandbox"

LANGUAGES=(
  "python"
  "javascript"
  "typescript"
  "sql"
  "go"
  "javascript-react"
  "typescript-react"
  "typescript-express"
  "python-web"
  "python-data-science"
  "python-bio"
)

# If a specific language is provided, only build that one
if [ $# -gt 0 ]; then
  LANGUAGES=("$1")
fi

for lang in "${LANGUAGES[@]}"; do
  dockerfile="$SANDBOXES_DIR/$lang/Dockerfile"

  if [ ! -f "$dockerfile" ]; then
    echo "ERROR: No Dockerfile found at $dockerfile"
    exit 1
  fi

  image_name="$IMAGE_PREFIX-$lang"
  echo ""
  echo "=========================================="
  echo "Building $image_name"
  echo "=========================================="

  docker build \
    -t "$image_name:latest" \
    -f "$dockerfile" \
    "$SANDBOXES_DIR/$lang"

  echo "✓ Built $image_name:latest"
done

echo ""
echo "All sandbox images built successfully!"
echo ""
echo "Images:"
for lang in "${LANGUAGES[@]}"; do
  echo "  $IMAGE_PREFIX-$lang:latest"
done
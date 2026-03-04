#!/bin/bash
set -euo pipefail

# Deploy CodeForge sandbox images to Fly.io registry
# Prerequisites:
#   - flyctl installed and authenticated
#   - FLY_ORG set (or passed as argument)
#   - A Fly app created for sandboxes (e.g. "codeforge-sandboxes")
#
# Usage: ./scripts/deploy-sandboxes.sh [language]
# Examples:
#   ./scripts/deploy-sandboxes.sh          # Deploy all
#   ./scripts/deploy-sandboxes.sh python   # Deploy only Python

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SANDBOXES_DIR="$PROJECT_ROOT/sandboxes"

FLY_APP="${FLY_SANDBOX_APP:-codeforge-sandboxes}"
REGISTRY="registry.fly.io"

LANGUAGES=("python" "javascript" "typescript")

if [ $# -gt 0 ]; then
  LANGUAGES=("$1")
fi

# Ensure we're authenticated
if ! fly auth whoami &>/dev/null; then
  echo "ERROR: Not authenticated with Fly.io. Run 'fly auth login' first."
  exit 1
fi

# Ensure the app exists
if ! fly apps list | grep -q "$FLY_APP"; then
  echo "Creating Fly app: $FLY_APP"
  fly apps create "$FLY_APP" --org "${FLY_ORG:-personal}"
fi

echo "Authenticating Docker with Fly.io registry..."
fly auth docker

for lang in "${LANGUAGES[@]}"; do
  local_image="codeforge-sandbox-$lang:latest"
  remote_image="$REGISTRY/$FLY_APP:sandbox-$lang"

  echo ""
  echo "=========================================="
  echo "Deploying $lang sandbox"
  echo "=========================================="

  # Build locally first
  echo "Building image..."
  docker build \
    -t "$local_image" \
    -f "$SANDBOXES_DIR/$lang/Dockerfile" \
    "$SANDBOXES_DIR/$lang"

  # Tag for Fly registry
  docker tag "$local_image" "$remote_image"

  # Push to Fly registry
  echo "Pushing to $remote_image..."
  docker push "$remote_image"

  echo "✓ Deployed $remote_image"
done

echo ""
echo "All sandbox images deployed!"
echo ""
echo "Images in Fly registry:"
for lang in "${LANGUAGES[@]}"; do
  echo "  $REGISTRY/$FLY_APP:sandbox-$lang"
done
echo ""
echo "Use these image references in your exercise_environments table:"
for lang in "${LANGUAGES[@]}"; do
  echo "  $lang -> $REGISTRY/$FLY_APP:sandbox-$lang"
done
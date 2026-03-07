#!/bin/bash
set -euo pipefail

# Deploy sandbox images to Fly.io registry
# Prerequisites:
#   - flyctl installed and authenticated
#   - FLY_ORG set (or passed as argument)
#   - A Fly app created for sandboxes (e.g. "signa-labs-sandboxes")
#
# Usage: ./scripts/deploy-sandboxes.sh [language...]
# Examples:
#   ./scripts/deploy-sandboxes.sh                      # Deploy all (auto-discovered)
#   ./scripts/deploy-sandboxes.sh python               # Deploy only Python
#   ./scripts/deploy-sandboxes.sh python go sql        # Deploy specific sandboxes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOXES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

FLY_APP="${FLY_SANDBOX_APP:-signa-labs-sandboxes}"
REGISTRY="registry.fly.io"

# Auto-discover all sandbox directories that contain a Dockerfile
if [ $# -gt 0 ]; then
  LANGUAGES=("$@")
else
  LANGUAGES=()
  for dir in "$SANDBOXES_DIR"/*/Dockerfile; do
    lang="$(basename "$(dirname "$dir")")"
    LANGUAGES+=("$lang")
  done
fi

if [ ${#LANGUAGES[@]} -eq 0 ]; then
  echo "ERROR: No sandbox directories with Dockerfiles found in $SANDBOXES_DIR"
  exit 1
fi

echo "Sandboxes to deploy: ${LANGUAGES[*]}"

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
  local_image="signa-labs-sandbox-$lang:latest"
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
    "$SANDBOXES_DIR"

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
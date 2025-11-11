#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/frontend-structure"

echo "=== Frontend Structure Fix Script ==="
echo "This script will fix any nested frontend/frontend directory structure"
echo "and prepare the repository for Cloudflare Pages deployment."
echo ""

# Fetch latest changes
echo "Fetching latest changes from origin..."
git fetch origin

# Check if branch exists and switch to it
if git rev-parse --verify --quiet "${BRANCH}" >/dev/null; then
  echo "Branch '${BRANCH}' exists, checking it out..."
  git checkout "${BRANCH}"
else
  echo "Creating new branch '${BRANCH}'..."
  git checkout -b "${BRANCH}"
fi

# Verify frontend directory exists
if [ ! -d "frontend" ]; then
  echo "Error: frontend directory not found"
  exit 1
fi

echo "Checking for nested frontend/frontend directory..."
cd frontend

# Check if nested frontend directory exists
if [ -d "frontend" ]; then
  echo "Found nested frontend/frontend directory, moving contents..."
  
  # Enable dotglob to match hidden files
  shopt -s dotglob 2>/dev/null || true
  
  # Move all files from nested directory to parent
  mv frontend/* . || true
  mv frontend/.* . 2>/dev/null || true
  
  # Remove empty nested directory
  rm -rf frontend
  
  echo "✓ Nested directory contents moved successfully"
else
  echo "✓ No nested frontend/frontend directory found - structure is correct"
fi

cd ..

# Stage all changes
echo "Staging changes..."
git add -A

# Commit if there are changes
if git diff --staged --quiet; then
  echo "✓ No changes to commit - repository structure is already correct"
else
  echo "Committing changes..."
  git commit -m "fix: remove extra nested frontend folder; add CI to validate frontend build" || true
fi

# Push changes
echo "Pushing changes to origin/${BRANCH}..."
git push -u origin "${BRANCH}"

echo ""
echo "=== Done ==="
echo "Branch '${BRANCH}' is ready for Cloudflare Pages deployment."
echo "Configure Cloudflare Pages with:"
echo "  - Root directory: frontend"
echo "  - Build command: npm run build --prefix frontend"
echo "  - Output directory: frontend/build"
echo "  - Node version: 18"

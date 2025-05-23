#!/bin/bash

# Optional: Check if clasp is installed
if ! command -v clasp &> /dev/null; then
  echo "clasp is not installed. Run: npm install -g @google/clasp"
  exit 1
fi

# Optional: Get commit message or use timestamp
msg=${1:-"Deploy on $(date '+%Y-%m-%d %H:%M:%S')"}

echo "🔄 Pushing code to Apps Script..."
clasp push

echo "📌 Creating version with message: \"$msg\""
clasp version "$msg"

echo "🚀 Deploying latest version..."
clasp deploy --description "$msg"

echo "✅ Deployment complete."

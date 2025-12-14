#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Starting frontend from $ROOT_DIR"

if [ ! -f package.json ]; then
  echo "Error: package.json not found in $ROOT_DIR"
  exit 1
fi

# choose package manager: prefer pnpm if available, else npm
if command -v pnpm >/dev/null 2>&1; then
  PKG_MGR=pnpm
else
  PKG_MGR=npm
fi

echo "Using package manager: $PKG_MGR"

if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies"
  $PKG_MGR install
fi

echo "Starting dev server"
$PKG_MGR run dev

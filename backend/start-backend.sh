#!/usr/bin/env bash
# Start backend: create/activate venv, install requirements if present, then run uvicorn
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Starting backend from $ROOT_DIR"

# Choose python binary (default: python3). Fail fast if missing.
PYTHON_BIN="${PYTHON_BIN:-python3}"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Error: $PYTHON_BIN not found. Install Python or set PYTHON_BIN env."
  exit 1
fi

# create venv if missing
if [ ! -d ".venv" ]; then
  echo "Creating virtualenv .venv"
  "$PYTHON_BIN" -m venv .venv
fi

echo "Activating .venv"
# shellcheck source=/dev/null
source .venv/bin/activate

PIP_CMD="$PYTHON_BIN -m pip"

if [ -f requirements.txt ]; then
  echo "Installing Python requirements (requirements.txt)"
  $PIP_CMD install --upgrade pip
  $PIP_CMD install -r requirements.txt
else
  echo "requirements.txt not found, ensuring minimal deps (fastapi, uvicorn, sqlmodel)"
  $PIP_CMD install --upgrade pip
  $PIP_CMD install fastapi uvicorn[standard] sqlmodel
fi

echo "Launching uvicorn (app.main:app)"
$PYTHON_BIN -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

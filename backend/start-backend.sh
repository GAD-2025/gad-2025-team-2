#!/usr/bin/env bash
# Start backend: create/activate venv, install requirements if present, then run uvicorn
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Starting backend from $ROOT_DIR"

# create venv if missing
if [ ! -d ".venv" ]; then
  echo "Creating virtualenv .venv"
  python3 -m venv .venv
fi

echo "Activating .venv"
# shellcheck source=/dev/null
source .venv/bin/activate

if [ -f requirements.txt ]; then
  echo "Installing Python requirements (requirements.txt)"
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "requirements.txt not found, ensuring minimal deps (fastapi, uvicorn, sqlmodel)"
  pip install --upgrade pip
  pip install fastapi uvicorn[standard] sqlmodel
fi

echo "Launching uvicorn (app.main:app)"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

#!/usr/bin/env bash
# Pull latest from origin/main, rebuild, and restart the portal on :3001.
# Run from the server checkout:  ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "== pulling latest =="
git pull --ff-only

echo "== installing dependencies =="
npm ci

echo "== building =="
NODE_ENV=production npm run build

echo "== restarting on :3001 =="
# Kill the existing listener on 3001 (and its npm/sh wrappers) if present.
PID=$(ss -tlnp 2>/dev/null | grep ':3001 ' | grep -oP 'pid=\K[0-9]+' | head -1)
[ -n "${PID:-}" ] && kill "$PID" 2>/dev/null || true
pkill -f "next start -p 3001" 2>/dev/null || true
pkill -f "npm run start -p 3001" 2>/dev/null || true
sleep 2

nohup npx next start -p 3001 >> .next-server.log 2>&1 &
sleep 6

for path in / /conversations /events /appointments; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$path")
  echo "$path -> $code"
done
echo "== done =="

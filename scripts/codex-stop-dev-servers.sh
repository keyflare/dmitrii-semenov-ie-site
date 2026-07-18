#!/bin/sh
set -eu

project_name="dmitrii-semenov-ie-site"
process_marker="/${project_name}/node_modules/.bin/react-router dev"

pids=$(
  ps -axo pid=,command= |
    awk -v marker="$process_marker" '$2 == "node" && index($0, marker) > 0 { print $1 }' |
    sort -u
)

if [ -z "$pids" ]; then
  echo "No dev servers running"
  exit 0
fi

echo "Stopping dev servers:"
echo "$pids" | sed 's/^/  /'
kill $pids 2>/dev/null || true

for _ in 1 2 3 4 5; do
  remaining=""
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      remaining="$remaining $pid"
    fi
  done

  if [ -z "$remaining" ]; then
    exit 0
  fi

  sleep 1
done

remaining=""
for pid in $pids; do
  if kill -0 "$pid" 2>/dev/null; then
    remaining="$remaining $pid"
  fi
done

if [ -n "$remaining" ]; then
  echo "Force stopping dev servers:$remaining"
  kill -9 $remaining 2>/dev/null || true
fi

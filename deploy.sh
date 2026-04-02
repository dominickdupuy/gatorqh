#!/bin/bash
set -e

REPO_DIR="/home/ec2-user/gatorqh"
LOG_FILE="/home/ec2-user/deploy-gatorqh.log"
LOCK_FILE="/tmp/deploy-gatorqh.lock"

# Prevent concurrent deploys
if [ -f "$LOCK_FILE" ]; then
  exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

cd "$REPO_DIR"

LOCAL=$(git rev-parse HEAD)
git fetch origin main -q
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date)] Deploying $REMOTE..." >> "$LOG_FILE"

git pull origin main >> "$LOG_FILE" 2>&1

# Ensure Node 20
if ! node --version 2>/dev/null | grep -q "^v20"; then
  echo "[$(date)] Installing Node 20..." >> "$LOG_FILE"
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - >> "$LOG_FILE" 2>&1
  sudo dnf install -y nodejs --allowerasing >> "$LOG_FILE" 2>&1
fi

npm install --quiet >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1

sudo cp nginx.conf /etc/nginx/conf.d/gqhacks.conf
sudo nginx -t >> "$LOG_FILE" 2>&1
sudo systemctl reload nginx

echo "[$(date)] Deploy complete." >> "$LOG_FILE"

#!/bin/bash
PROJECT_DIR="/root/teleboard"
TRIGGER_FILE="$PROJECT_DIR/data/updates/trigger"
echo "Watcher started..."
while true; do
    if [ -f "$TRIGGER_FILE" ]; then
        echo "$(date): Auto-update triggered"
        rm "$TRIGGER_FILE"
        cd "$PROJECT_DIR"
        # Pull latest code if git is available
        if [ -d ".git" ]; then
            echo "Pulling latest code..."
            git pull origin main || git pull
        fi
        export $(grep -v '^#' .env | xargs)
        if docker compose version > /dev/null 2>&1; then CMD='docker compose'; else CMD='docker-compose'; fi
        $CMD -f docker-compose.prod.yml up --build -d
    fi
    sleep 10
done

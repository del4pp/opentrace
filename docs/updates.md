# System Updates & Maintenance (v1.1.5)

OpenTrace v1.1.5 continues the evolution of our automated update architecture, providing seamless transitions between stable releases with specialized migration logic for ClickHouse and PostgreSQL metadata.

## 1. How it Works

The update process consists of several layers:

1.  **Version Registry**: The system checks `https://version.429toomanyre.quest/version.json` for the latest available version specifically for the `opentrace` project.
2.  **Trigger File**: When you click "Install Update" in Settings, the backend creates a trigger file in `/app/data/updates/trigger`.
3.  **Update Watcher**: A lightweight script (`updater.sh`) running on the host machine monitors this directory.
4.  **Automated Rebuild**: When the trigger is detected:
    -   The system attempts a `git pull` to fetch the latest code.
    -   Docker Compose rebuilds the containers (`up --build -d`).
    -   The system environment is refreshed.

## 2. Setting Up the Update Watcher

If you installed OpenTrace using the `install.sh` script or used the latest `restore_all.py`, the watcher should already be running. 

To manually start the watcher:
```bash
./updater.sh & 
```
*Note: Ensure the script has execution permissions (`chmod +x updater.sh`).*

## 3. Best Practices

-   **Backups**: Before performing an update, it is highly recommended to back up your `data/` directory. While Docker volumes preserve your data during rebuilds, a backup ensures recovery in case of unexpected corruption.
-   **Downtime**: An update typically takes 2-5 minutes depending on your server's performance and internet speed. During this time, the dashboard and tracking API will be unavailable.
-   **SMTP**: Ensure your SMTP settings are configured in **Settings -> SMTP Configuration**. This is critical for recovering access if your session expires during or after an update.

## 4. Manual Updates

If the automatic update fails or if you prefer manual control, run:
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

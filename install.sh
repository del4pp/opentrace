#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    OpenTrace Analytics - Installation Wizard  ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}"
  echo "Please install Docker and Docker Compose first."
  exit 1
fi

# 1. Configuration
echo -e "${GREEN}[1/5] Domain & Connectivity${NC}"
read -p "Enter your domain name (e.g. analytics.example.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Domain name is required.${NC}"
    exit 1
fi

read -p "Enable SSL (Let's Encrypt)? (y/n) [y]: " ENABLE_SSL
ENABLE_SSL=${ENABLE_SSL:-y}

# 2. Database Configuration
echo ""
echo -e "${GREEN}[2/5] Database Configuration${NC}"
read -p "Do you want to use custom database credentials? (y/n) [n]: " CUSTOM_DB
CUSTOM_DB=${CUSTOM_DB:-n}

if [ "$CUSTOM_DB" == "y" ]; then
    read -p "Enter Postgres Username [admin]: " POSTGRES_USER
    read -p "Enter Postgres Password: " POSTGRES_PASSWORD
    read -p "Enter Postgres Database Name [teleboard]: " POSTGRES_DB
    
    read -p "Enter ClickHouse Username [admin]: " CLICKHOUSE_USER
    read -p "Enter ClickHouse Password: " CLICKHOUSE_PASSWORD
else
    POSTGRES_USER="admin"
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    POSTGRES_DB="teleboard"
    
    CLICKHOUSE_USER="admin"
    CLICKHOUSE_PASSWORD=$(openssl rand -hex 16)
fi

POSTGRES_USER=${POSTGRES_USER:-admin}
POSTGRES_DB=${POSTGRES_DB:-teleboard}
CLICKHOUSE_USER=${CLICKHOUSE_USER:-admin}

# 3. Security (Key Generation)
echo ""
echo -e "${GREEN}[3/5] Generating Security Keys${NC}"
SECRET_KEY=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -hex 12)

# 4. Setup Files
echo ""
echo -e "${GREEN}[4/5] Creating Configuration Files${NC}"

# Create .env
PROTOCOL="http"
if [ "$ENABLE_SSL" == "y" ]; then
    PROTOCOL="https"
fi

cat > .env <<EOF
DOMAIN_NAME=$DOMAIN_NAME
API_PROTOCOL=$PROTOCOL
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
CLICKHOUSE_USER=$CLICKHOUSE_USER
CLICKHOUSE_PASSWORD=$CLICKHOUSE_PASSWORD
SECRET_KEY=$SECRET_KEY
ADMIN_INITIAL_PASSWORD=$ADMIN_PASSWORD
EOF

# Create Nginx Config
mkdir -p nginx
if [ "$ENABLE_SSL" == "y" ]; then
    sed "s/\${DOMAIN_NAME}/$DOMAIN_NAME/g" nginx/nginx.ssl.conf.template > nginx/nginx.conf
else
    sed "s/\${DOMAIN_NAME}/$DOMAIN_NAME/g" nginx/nginx.conf.template > nginx/nginx.conf
fi

echo "Configuration files created."

# 5. SSL Installation (if enabled)
if [ "$ENABLE_SSL" == "y" ]; then
    echo ""
    echo -e "${GREEN}[5/5] SSL Certificate Installation${NC}"
    echo "Preparing for Certbot..."
    
    # Create required directories
    mkdir -p certbot/conf
    mkdir -p certbot/www
    
    # Start Nginx temporarily for ACME challenge
    echo "Starting temporary gateway for SSL challenge..."
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    echo "Requesting certificate for $DOMAIN_NAME..."
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@$DOMAIN_NAME --agree-tos --no-eff-email -d $DOMAIN_NAME
    
    echo "Restarting Nginx with SSL config..."
    docker-compose -f docker-compose.prod.yml restart nginx
else
    echo ""
    echo -e "${GREEN}[5/5] Skipping SSL installation${NC}"
fi

# Finalizing
echo ""
echo -e "${GREEN}Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}    Installation Complete! 🚀                 ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "Access your dashboard at: ${GREEN}$PROTOCOL://$DOMAIN_NAME${NC}"
echo -e "Initial Admin User:       ${GREEN}admin@opentrace.io${NC}"
echo -e "Initial Admin Password:   ${GREEN}$ADMIN_PASSWORD${NC}"
echo ""
echo -e "${YELLOW}Please save these credentials!${NC}"
echo ""
echo -e "Postgres User:      $POSTGRES_USER"
echo -e "Postgres Password:  $POSTGRES_PASSWORD"
echo -e "ClickHouse User:    $CLICKHOUSE_USER"
echo -e "ClickHouse Password: $CLICKHOUSE_PASSWORD"
echo ""
echo -e "${BLUE}===============================================${NC}"

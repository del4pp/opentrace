#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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
echo -e "${GREEN}[1/4] Configuration${NC}"
read -p "Enter your domain name (or IP address) [localhost]: " DOMAIN_NAME
DOMAIN_NAME=${DOMAIN_NAME:-localhost}

echo -e "Using domain: ${BLUE}$DOMAIN_NAME${NC}"

# 2. Security (Key Generation)
echo -e "${GREEN}[2/4] Generating Security Keys${NC}"
POSTGRES_PASSWORD=$(openssl rand -hex 16)
SECRET_KEY=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -hex 8)

echo "Generated secure passwords."

# 3. Setup Files
echo -e "${GREEN}[3/4] Creating Configuration Files${NC}"

# Create .env
cat > .env <<EOF
DOMAIN_NAME=$DOMAIN_NAME
POSTGRES_USER=admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=teleboard
SECRET_KEY=$SECRET_KEY
ADMIN_INITIAL_PASSWORD=$ADMIN_PASSWORD
EOF

# Create Nginx Config
mkdir -p nginx
sed "s/\${DOMAIN_NAME}/$DOMAIN_NAME/g" nginx/nginx.conf.template > nginx/nginx.conf

echo "Configuration files created."

# 4. Installation
echo -e "${GREEN}[4/4] Installing & Starting Services${NC}"
echo "This might take a few minutes..."

# Use the production compose file
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}    Installation Complete! 🚀                 ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "Access your dashboard at: ${GREEN}http://$DOMAIN_NAME${NC}"
echo -e "Initial Admin User:       ${GREEN}admin@opentrace.io${NC}"
echo -e "Initial Admin Password:   ${GREEN}$ADMIN_PASSWORD${NC} (SAVE THIS!)"
echo ""
echo -e "Database Password:        $POSTGRES_PASSWORD"
echo -e "Secret Key:               $SECRET_KEY"
echo ""
echo -e "${BLUE}===============================================${NC}"

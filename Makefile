# OpenTrace Analytics - Development Makefile

.PHONY: help install dev prod test lint format clean

help: ## Show this help message
	@echo "OpenTrace Analytics Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up -d

dev-build: ## Build and start development environment
	docker-compose -f docker-compose.dev.yml up -d --build

prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-build: ## Build and start production environment
	docker-compose -f docker-compose.prod.yml up -d --build

test: ## Run tests
	cd backend && python -m pytest tests/ -v

test-cov: ## Run tests with coverage
	cd backend && python -m pytest tests/ --cov=app --cov-report=html

lint: ## Run linting
	cd backend && flake8 app/ tests/
	cd backend && mypy app/

format: ## Format code
	cd backend && black app/ tests/
	cd backend && isort app/ tests/

check: ## Run all checks (lint + test)
	make lint
	make test

clean: ## Clean up containers and volumes
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v

logs: ## Show logs
	docker-compose -f docker-compose.dev.yml logs -f

shell-backend: ## Open shell in backend container
	docker-compose -f docker-compose.dev.yml exec backend bash

shell-frontend: ## Open shell in frontend container
	docker-compose -f docker-compose.dev.yml exec frontend sh

db-migrate: ## Run database migrations (if any)
	@echo "No migrations configured yet"

docs: ## Build documentation
	@echo "Documentation is in docs/ folder"

release: ## Create release (tag and push)
	@echo "Current version: $(shell git describe --tags --abbrev=0 2>/dev/null || echo 'No tags')"
	@read -p "Enter new version: " version; \
	git tag -a v$$version -m "Release v$$version"; \
	git push origin v$$version

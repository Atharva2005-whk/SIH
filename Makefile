# Smart Tourist Safety System - Makefile
# Cross-platform development commands

.PHONY: help install dev build test clean deploy stop lint format check

# Default target
help:
	@echo "Smart Tourist Safety System - Available Commands"
	@echo "================================================"
	@echo ""
	@echo "🏗️  Development:"
	@echo "  install    Install all dependencies"
	@echo "  dev        Start development environment"
	@echo "  build      Build all components"
	@echo "  stop       Stop all development services"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test       Run all tests"
	@echo "  test-watch Run tests in watch mode"
	@echo "  coverage   Generate test coverage report"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  lint       Run linting on all code"
	@echo "  format     Format all code"
	@echo "  check      Run all checks (lint + test + typecheck)"
	@echo "  clean      Clean all build artifacts"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  deploy-local    Deploy contracts to local blockchain"
	@echo "  deploy-testnet  Deploy contracts to testnet"
	@echo "  docker-dev      Start development environment with Docker"
	@echo ""

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm install
	npm run build --workspace=shared

# Development
dev:
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/deploy-dev.ps1
else
	@bash scripts/deploy-dev.sh
endif

stop:
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/stop-dev.ps1
else
	@bash scripts/stop-dev.sh
endif

# Building
build: build-shared build-contracts build-backend build-client

build-shared:
	@echo "🔨 Building shared module..."
	npm run build --workspace=shared

build-contracts:
	@echo "📜 Compiling smart contracts..."
	npm run compile

build-backend:
	@echo "🖥️  Building backend..."
	npm run build --workspace=backend

build-client:
	@echo "🌐 Building client..."
	npm run build --workspace=client

# Testing
test:
	@echo "🧪 Running all tests..."
	npm run test

test-watch:
	@echo "👀 Running tests in watch mode..."
	npm run test:contracts -- --watch &
	npm run test --workspace=backend -- --watch &
	npm run test --workspace=client -- --watch

coverage:
	@echo "📊 Generating test coverage..."
	npm run test:coverage --workspace=backend
	npm run test:coverage --workspace=client

# Code quality
lint:
	@echo "🔍 Running linter..."
	npm run lint

format:
	@echo "✨ Formatting code..."
	npm run format

check: lint test typecheck
	@echo "✅ All checks passed!"

typecheck:
	@echo "🔍 Running TypeScript checks..."
	npm run typecheck

# Cleaning
clean:
	@echo "🧹 Cleaning build artifacts..."
	npm run clean --workspace=shared --if-present
	npm run clean --workspace=backend --if-present
	npm run clean --workspace=client --if-present
	npx hardhat clean

# Deployment
deploy-local:
	@echo "🚀 Deploying to local blockchain..."
	npm run deploy:local

deploy-testnet:
	@echo "🌐 Deploying to testnet..."
	npm run deploy:testnet

deploy-mainnet:
	@echo "🌍 Deploying to mainnet..."
	@echo "⚠️  WARNING: This will deploy to production!"
	@read -p "Are you sure? (y/N): " confirm && [ $$confirm = y ] || exit 1
	npm run deploy:mainnet

# Docker commands
docker-dev:
	@echo "🐳 Starting development environment with Docker..."
	docker-compose up -d

docker-stop:
	@echo "🐳 Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build

# Database commands (if needed)
db-setup:
	@echo "🗄️  Setting up database..."
	# Add database setup commands here if needed

# Utility commands
logs:
	@echo "📋 Showing service logs..."
	@if [ -f ".blockchain.pid" ]; then echo "Blockchain PID: $$(cat .blockchain.pid)"; fi
	@if [ -f ".backend.pid" ]; then echo "Backend PID: $$(cat .backend.pid)"; fi
	@if [ -f ".frontend.pid" ]; then echo "Frontend PID: $$(cat .frontend.pid)"; fi

status:
	@echo "📊 Service Status:"
	@echo "=================="
	@echo -n "Blockchain (8545): "
	@curl -s http://127.0.0.1:8545 > /dev/null && echo "✅ Running" || echo "❌ Stopped"
	@echo -n "Backend API (3000): "
	@curl -s http://localhost:3000/api/health > /dev/null && echo "✅ Running" || echo "❌ Stopped"
	@echo -n "Frontend (5173): "
	@curl -s http://localhost:5173 > /dev/null && echo "✅ Running" || echo "❌ Stopped"

# Environment setup
env-setup:
	@echo "⚙️  Setting up environment..."
	@if [ ! -f ".env" ]; then cp .env.example .env && echo "Created .env file from example"; fi
	@echo "Please edit .env with your configuration"

# Quick start - one command to rule them all
start: install build dev
	@echo "🎉 Smart Tourist Safety System is ready!"

# Production deployment
prod-deploy: clean build deploy-testnet
	@echo "🚀 Production deployment complete!"

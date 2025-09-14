#!/bin/bash

# Smart Tourist Safety System - Stop Development Services Script
set -e

echo "🛑 Stopping development services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)..."
            if kill "$pid" 2>/dev/null; then
                # Wait for process to stop
                sleep 2
                
                # Check if process is still running
                if kill -0 "$pid" 2>/dev/null; then
                    print_warning "$service_name didn't stop gracefully, force killing..."
                    kill -9 "$pid" 2>/dev/null || true
                fi
                
                print_success "$service_name stopped"
            else
                print_warning "Could not stop $service_name (PID: $pid)"
            fi
        else
            print_warning "$service_name is not running (stale PID file)"
        fi
        
        rm "$pid_file"
    else
        print_warning "$service_name PID file not found"
    fi
}

# Stop all development services
main() {
    print_status "Smart Tourist Safety System - Stopping Development Services"
    echo "=============================================================="
    
    # Stop frontend
    stop_service "Frontend" ".frontend.pid"
    
    # Stop backend
    stop_service "Backend API" ".backend.pid"
    
    # Stop blockchain
    stop_service "Blockchain" ".blockchain.pid"
    
    # Kill any remaining node processes that might be related
    print_status "Cleaning up any remaining processes..."
    
    # Kill processes on specific ports
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true  # Vite dev server
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true  # API server
    lsof -ti:8545 | xargs kill -9 2>/dev/null || true  # Hardhat node
    
    print_success "🎉 All development services stopped successfully!"
    
    # Clean up any temporary files
    if [ -f "deployment-info.json" ]; then
        print_status "Keeping deployment-info.json for next restart"
    fi
}

main "$@"

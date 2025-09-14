#!/bin/bash

# Smart Tourist Safety System - Development Deployment Script
set -e

echo "🚀 Starting development deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install workspace dependencies
    npm run build --workspace=shared
    
    print_success "Dependencies installed"
}

# Compile smart contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    
    npm run compile
    
    if [ $? -eq 0 ]; then
        print_success "Smart contracts compiled successfully"
    else
        print_error "Failed to compile smart contracts"
        exit 1
    fi
}

# Start local blockchain
start_blockchain() {
    print_status "Starting local blockchain..."
    
    # Check if blockchain is already running
    if curl -s http://127.0.0.1:8545 > /dev/null 2>&1; then
        print_warning "Blockchain appears to be already running on port 8545"
        return 0
    fi
    
    # Start Hardhat node in background
    npm run node &
    BLOCKCHAIN_PID=$!
    
    # Wait for blockchain to start
    sleep 5
    
    # Verify blockchain is running
    if curl -s http://127.0.0.1:8545 > /dev/null 2>&1; then
        print_success "Local blockchain started (PID: $BLOCKCHAIN_PID)"
        echo $BLOCKCHAIN_PID > .blockchain.pid
    else
        print_error "Failed to start local blockchain"
        exit 1
    fi
}

# Deploy contracts
deploy_contracts() {
    print_status "Deploying smart contracts..."
    
    npm run deploy:local
    
    if [ $? -eq 0 ]; then
        print_success "Smart contracts deployed successfully"
        
        # Check if deployment info was created
        if [ -f "deployment-info.json" ]; then
            print_success "Deployment info saved to deployment-info.json"
        else
            print_warning "deployment-info.json not found"
        fi
    else
        print_error "Failed to deploy smart contracts"
        exit 1
    fi
}

# Start backend API
start_backend() {
    print_status "Starting backend API server..."
    
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd ..
    
    # Wait for API to start
    sleep 3
    
    # Verify API is running
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Backend API started (PID: $BACKEND_PID)"
    else
        print_warning "Backend API may not be fully ready yet"
    fi
}

# Start frontend client
start_frontend() {
    print_status "Starting frontend development server..."
    
    cd client
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    cd ..
    
    print_success "Frontend development server started (PID: $FRONTEND_PID)"
}

# Main deployment flow
main() {
    print_status "Smart Tourist Safety System - Development Deployment"
    echo "=================================================="
    
    check_dependencies
    install_dependencies
    compile_contracts
    start_blockchain
    sleep 2
    deploy_contracts
    start_backend
    start_frontend
    
    echo ""
    print_success "🎉 Development environment is ready!"
    echo ""
    echo "📊 Services:"
    echo "   • Blockchain:  http://localhost:8545"
    echo "   • Backend API: http://localhost:3000"
    echo "   • Frontend:    http://localhost:5173"
    echo ""
    echo "📝 Logs:"
    echo "   • Blockchain PID: $(cat .blockchain.pid 2>/dev/null || echo 'Not found')"
    echo "   • Backend PID:    $(cat .backend.pid 2>/dev/null || echo 'Not found')"
    echo "   • Frontend PID:   $(cat .frontend.pid 2>/dev/null || echo 'Not found')"
    echo ""
    echo "🛑 To stop all services, run: ./scripts/stop-dev.sh"
}

# Handle script interruption
cleanup() {
    print_warning "Script interrupted. Cleaning up..."
    
    if [ -f ".blockchain.pid" ]; then
        kill $(cat .blockchain.pid) 2>/dev/null || true
        rm .blockchain.pid
    fi
    
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    
    exit 1
}

trap cleanup INT TERM

# Run main function
main "$@"

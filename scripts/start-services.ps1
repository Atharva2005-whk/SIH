# Smart Tourist Safety System - Service Management Script
# Usage: ./scripts/start-services.ps1 [service-name]
# Services: frontend, backend, blockchain, all

param(
    [Parameter(Position=0)]
    [string]$Service = "all"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host "`n🚀 $Message" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Gray
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Start-Frontend {
    Write-Header "Starting Frontend (React + Vite)"
    Write-Info "Port: http://localhost:5173"
    Write-Info "Environment: Development"
    
    Set-Location "client"
    npm run dev
}

function Start-Backend {
    Write-Header "Starting Backend (Express API)"
    Write-Info "Port: http://localhost:3000"
    Write-Info "Environment: Development"
    
    Set-Location "backend"
    npm run dev
}

function Start-Blockchain {
    Write-Header "Starting Blockchain Node (Hardhat)"
    Write-Info "Port: http://localhost:8545"
    Write-Info "Network: Local Development"
    
    npm run dev:blockchain
}

function Start-AllServices {
    Write-Header "Starting All Services Concurrently"
    Write-Info "Frontend: http://localhost:5173"
    Write-Info "Backend: http://localhost:3000"
    Write-Info "Blockchain: http://localhost:8545"
    Write-Warning "Press Ctrl+C to stop all services"
    
    npm run dev
}

function Show-Help {
    Write-Host @"
🎯 Smart Tourist Safety System - Service Management

USAGE:
  ./scripts/start-services.ps1 [service]

SERVICES:
  frontend   - Start React frontend only (port 5173)
  backend    - Start Express API only (port 3000)
  blockchain - Start Hardhat node only (port 8545)
  all        - Start all services concurrently (default)

EXAMPLES:
  ./scripts/start-services.ps1                # Start all services
  ./scripts/start-services.ps1 frontend       # Frontend only
  ./scripts/start-services.ps1 backend        # Backend only
  ./scripts/start-services.ps1 blockchain     # Blockchain only

DEVELOPMENT WORKFLOW:
  1. Run 'blockchain' first for smart contract testing
  2. Run 'backend' to start the API server
  3. Run 'frontend' to start the React application
  4. Or use 'all' to start everything at once

ENVIRONMENT FILES:
  📁 backend/.env    - Backend configuration
  📁 client/.env     - Frontend configuration
  📁 .env.example    - Example environment variables

"@ -ForegroundColor White
}

# Main execution
try {
    $originalLocation = Get-Location
    
    switch ($Service.ToLower()) {
        "frontend" { Start-Frontend }
        "backend" { Start-Backend }
        "blockchain" { Start-Blockchain }
        "all" { Start-AllServices }
        "help" { Show-Help }
        "--help" { Show-Help }
        "-h" { Show-Help }
        default {
            if ($Service -ne "all") {
                Write-Warning "Unknown service: $Service"
                Write-Info "Available services: frontend, backend, blockchain, all"
                Show-Help
                exit 1
            }
            Start-AllServices
        }
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Set-Location $originalLocation
}

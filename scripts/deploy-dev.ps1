# Smart Tourist Safety System - Development Deployment Script (PowerShell)
param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting development deployment..." -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    try {
        $nodeVersion = node --version 2>$null
        Write-Verbose "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is required but not installed"
        exit 1
    }
    
    try {
        $npmVersion = npm --version 2>$null
        Write-Verbose "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is required but not installed"
        exit 1
    }
    
    Write-Success "All dependencies are installed"
}

# Install dependencies
function Install-Dependencies {
    if ($SkipBuild) {
        Write-Warning "Skipping dependency installation due to -SkipBuild flag"
        return
    }
    
    Write-Status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install root dependencies"
        exit 1
    }
    
    # Build shared module
    npm run build --workspace=shared
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build shared module"
        exit 1
    }
    
    Write-Success "Dependencies installed"
}

# Compile smart contracts
function Build-Contracts {
    if ($SkipBuild) {
        Write-Warning "Skipping contract compilation due to -SkipBuild flag"
        return
    }
    
    Write-Status "Compiling smart contracts..."
    
    npm run compile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Smart contracts compiled successfully"
    }
    else {
        Write-Error "Failed to compile smart contracts"
        exit 1
    }
}

# Start local blockchain
function Start-Blockchain {
    Write-Status "Starting local blockchain..."
    
    # Check if blockchain is already running
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ContentType "application/json" -TimeoutSec 2
        Write-Warning "Blockchain appears to be already running on port 8545"
        return
    }
    catch {
        # This is expected if blockchain is not running
    }
    
    # Start Hardhat node in background
    $blockchainProcess = Start-Process -FilePath "npm" -ArgumentList "run", "node" -PassThru -WindowStyle Hidden
    $blockchainProcess.Id | Out-File -FilePath ".blockchain.pid" -Encoding ASCII
    
    # Wait for blockchain to start
    Start-Sleep -Seconds 5
    
    # Verify blockchain is running
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ContentType "application/json" -TimeoutSec 5
        Write-Success "Local blockchain started (PID: $($blockchainProcess.Id))"
    }
    catch {
        Write-Error "Failed to start local blockchain"
        exit 1
    }
}

# Deploy contracts
function Deploy-Contracts {
    Write-Status "Deploying smart contracts..."
    
    npm run deploy:local
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Smart contracts deployed successfully"
        
        if (Test-Path "deployment-info.json") {
            Write-Success "Deployment info saved to deployment-info.json"
        }
        else {
            Write-Warning "deployment-info.json not found"
        }
    }
    else {
        Write-Error "Failed to deploy smart contracts"
        exit 1
    }
}

# Start backend API
function Start-Backend {
    Write-Status "Starting backend API server..."
    
    Set-Location "backend"
    $backendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    $backendProcess.Id | Out-File -FilePath "../.backend.pid" -Encoding ASCII
    Set-Location ".."
    
    # Wait for API to start
    Start-Sleep -Seconds 3
    
    # Verify API is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5
        Write-Success "Backend API started (PID: $($backendProcess.Id))"
    }
    catch {
        Write-Warning "Backend API may not be fully ready yet"
    }
}

# Start frontend client
function Start-Frontend {
    Write-Status "Starting frontend development server..."
    
    Set-Location "client"
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    $frontendProcess.Id | Out-File -FilePath "../.frontend.pid" -Encoding ASCII
    Set-Location ".."
    
    Write-Success "Frontend development server started (PID: $($frontendProcess.Id))"
}

# Main deployment flow
function Main {
    Write-Status "Smart Tourist Safety System - Development Deployment"
    Write-Host "==================================================" -ForegroundColor Cyan
    
    Test-Dependencies
    Install-Dependencies
    Build-Contracts
    Start-Blockchain
    Start-Sleep -Seconds 2
    Deploy-Contracts
    Start-Backend
    Start-Frontend
    
    Write-Host ""
    Write-Success "🎉 Development environment is ready!"
    Write-Host ""
    Write-Host "📊 Services:" -ForegroundColor White
    Write-Host "   • Blockchain:  http://localhost:8545" -ForegroundColor Gray
    Write-Host "   • Backend API: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   • Frontend:    http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 Process IDs:" -ForegroundColor White
    
    if (Test-Path ".blockchain.pid") {
        $blockchainPid = Get-Content ".blockchain.pid"
        Write-Host "   • Blockchain PID: $blockchainPid" -ForegroundColor Gray
    }
    
    if (Test-Path ".backend.pid") {
        $backendPid = Get-Content ".backend.pid"
        Write-Host "   • Backend PID:    $backendPid" -ForegroundColor Gray
    }
    
    if (Test-Path ".frontend.pid") {
        $frontendPid = Get-Content ".frontend.pid"
        Write-Host "   • Frontend PID:   $frontendPid" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🛑 To stop all services, run: .\scripts\stop-dev.ps1" -ForegroundColor Yellow
}

# Handle script interruption
function Stop-OnExit {
    Write-Warning "Script interrupted. Cleaning up..."
    
    if (Test-Path ".blockchain.pid") {
        $pid = Get-Content ".blockchain.pid"
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        catch { }
        Remove-Item ".blockchain.pid" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path ".backend.pid") {
        $pid = Get-Content ".backend.pid"
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        catch { }
        Remove-Item ".backend.pid" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path ".frontend.pid") {
        $pid = Get-Content ".frontend.pid"
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        catch { }
        Remove-Item ".frontend.pid" -ErrorAction SilentlyContinue
    }
    
    exit 1
}

# Set up trap for cleanup
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action { Stop-OnExit }

# Run main function
try {
    Main
}
catch {
    Write-Error "Deployment failed: $_"
    Stop-OnExit
}

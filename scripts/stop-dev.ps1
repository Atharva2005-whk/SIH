# Smart Tourist Safety System - Stop Development Services Script (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🛑 Stopping development services..." -ForegroundColor Red

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

# Stop service by PID file
function Stop-Service {
    param(
        [string]$ServiceName,
        [string]$PidFile
    )
    
    if (Test-Path $PidFile) {
        $pid = Get-Content $PidFile
        
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Status "Stopping $ServiceName (PID: $pid)..."
                
                try {
                    Stop-Process -Id $pid -Force
                    Start-Sleep -Seconds 2
                    
                    try {
                        $processStillRunning = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($processStillRunning) {
                            Write-Warning "$ServiceName didn't stop gracefully, force killing..."
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        }
                    }
                    catch {
                        # Process already stopped
                    }
                    
                    Write-Success "$ServiceName stopped"
                }
                catch {
                    Write-Warning "Could not stop $ServiceName (PID: $pid): $_"
                }
            }
            else {
                Write-Warning "$ServiceName is not running (stale PID file)"
            }
        }
        catch {
            Write-Warning "$ServiceName is not running (PID: $pid not found)"
        }
        
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
    else {
        Write-Warning "$ServiceName PID file not found"
    }
}

# Stop all development services
function Main {
    Write-Status "Smart Tourist Safety System - Stopping Development Services"
    Write-Host "==============================================================" -ForegroundColor Cyan
    
    # Stop frontend
    Stop-Service -ServiceName "Frontend" -PidFile ".frontend.pid"
    
    # Stop backend
    Stop-Service -ServiceName "Backend API" -PidFile ".backend.pid"
    
    # Stop blockchain
    Stop-Service -ServiceName "Blockchain" -PidFile ".blockchain.pid"
    
    # Kill any remaining processes by port
    Write-Status "Cleaning up any remaining processes..."
    
    # Find and kill processes by port
    try {
        # Vite dev server (port 5173)
        $viteProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($viteProcess) {
            foreach ($pid in $viteProcess) {
                Write-Host "  Killing process using port 5173 (PID: $pid)" -ForegroundColor Gray
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        # API server (port 3000)
        $apiProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($apiProcess) {
            foreach ($pid in $apiProcess) {
                Write-Host "  Killing process using port 3000 (PID: $pid)" -ForegroundColor Gray
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Hardhat node (port 8545)
        $blockchainProcess = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($blockchainProcess) {
            foreach ($pid in $blockchainProcess) {
                Write-Host "  Killing process using port 8545 (PID: $pid)" -ForegroundColor Gray
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        Write-Warning "Failed to clean up processes by port: $_"
    }
    
    Write-Success "🎉 All development services stopped successfully!"
}

try {
    Main
}
catch {
    Write-Error "Failed to stop services: $_"
    exit 1
}

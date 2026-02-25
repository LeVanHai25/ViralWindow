# ViralWindow API Server - Auto Start Script
# Tự động kill port 3001 và start server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VIRALWINDOW API SERVER - AUTO START" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill processes using port 3001
Write-Host "[1/3] Đang kiểm tra port 3001..." -ForegroundColor Yellow

$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Tìm thấy process đang dùng port 3001: $pid ($($proc.ProcessName))" -ForegroundColor Red
                Write-Host "Đang tắt process..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 500
                Write-Host "✓ Đã tắt process $pid thành công!" -ForegroundColor Green
            }
        } catch {
            Write-Host "Không thể tắt process $pid" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✓ Port 3001 đang trống" -ForegroundColor Green
}

# Step 2: Wait a moment
Write-Host "[2/3] Đang đợi port giải phóng..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 3: Verify port is free
$stillInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($stillInUse) {
    Write-Host "⚠ Cảnh báo: Port 3001 vẫn còn bị chiếm!" -ForegroundColor Red
    Write-Host "Thử kill tất cả node.exe processes..." -ForegroundColor Yellow
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Port 3001 đã sẵn sàng!" -ForegroundColor Green
}

# Step 4: Start server
Write-Host "[3/3] Đang khởi động server..." -ForegroundColor Yellow
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Start server
node server.js

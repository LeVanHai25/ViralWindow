# PowerShell script to fix Aria recovery error
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIX ARIA RECOVERY ERROR (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop MySQL
Write-Host "[1/5] Dang dung MySQL..." -ForegroundColor Yellow
$mysqlProcess = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if ($mysqlProcess) {
    Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
    Write-Host "   Da dung mysqld.exe" -ForegroundColor Green
} else {
    Write-Host "   Khong co mysqld.exe dang chay" -ForegroundColor Gray
}
Start-Sleep -Seconds 2

# Step 2: Delete aria_log files
Write-Host "[2/5] Xoa cac file aria_log..." -ForegroundColor Yellow
$dataPath = "D:\xampp\mysql\data"
if (Test-Path $dataPath) {
    $ariaLogs = Get-ChildItem -Path $dataPath -Filter "aria_log.*" -ErrorAction SilentlyContinue
    if ($ariaLogs) {
        Remove-Item -Path "$dataPath\aria_log.*" -Force -ErrorAction SilentlyContinue
        Write-Host "   Da xoa cac file aria_log" -ForegroundColor Green
    } else {
        Write-Host "   Khong tim thay file aria_log" -ForegroundColor Gray
    }
} else {
    Write-Host "   LOI: Khong tim thay thu muc $dataPath" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# Step 3: Run aria_chk
Write-Host "[3/5] Chay aria_chk de recover..." -ForegroundColor Yellow
$binPath = "D:\xampp\mysql\bin"
$ariaChkPath = "$binPath\aria_chk.exe"
if (Test-Path $ariaChkPath) {
    Write-Host "   Dang chay aria_chk..." -ForegroundColor Gray
    $mysqlDataPath = "D:\xampp\mysql\data\mysql"
    if (Test-Path $mysqlDataPath) {
        Push-Location $binPath
        & .\aria_chk.exe -r -f "$mysqlDataPath\*.MAI" 2>$null
        Pop-Location
        Write-Host "   Da chay aria_chk" -ForegroundColor Green
    } else {
        Write-Host "   Canh bao: Khong tim thay thu muc mysql data" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Canh bao: Khong tim thay aria_chk.exe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Hoan thanh!" -ForegroundColor Green
Write-Host ""
Write-Host "[5/5] Vui long khoi dong lai MySQL trong XAMPP Control Panel" -ForegroundColor Cyan
Write-Host "       Neu van loi, thu xoa cac file aria_log.* thu cong" -ForegroundColor Cyan
Write-Host ""
Read-Host "Nhan Enter de thoat"






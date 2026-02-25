# Script tự động tắt process đang dùng port 3000
$port = 3000
Write-Host "Đang tìm process đang dùng port $port..."

$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($process) {
    $pid = $process.OwningProcess
    $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
    Write-Host "Tìm thấy process: $processName (PID: $pid)"
    Write-Host "Đang tắt process..."
    Stop-Process -Id $pid -Force
    Write-Host "✅ Đã tắt process thành công!" -ForegroundColor Green
    Start-Sleep -Seconds 1
    Write-Host "Port $port đã trống. Bạn có thể khởi động server bằng: node server.js" -ForegroundColor Cyan
} else {
    Write-Host "✅ Port $port đã trống!" -ForegroundColor Green
}







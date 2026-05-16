$f = "d:\ViralWindow_Phan_Mem_Nhom_Kinh\backups\viral_window_db_2026-05-16_14-54.sql"
$content = Get-Content $f -Raw

$tables = @(
    "aluminum_systems",
    "aluminum_warehouse_stock",
    "inventory_warehouses",
    "inventory",
    "users",
    "projects",
    "aluminum_warehouse_catalog_systems"
)

Write-Host "=== XAC MINH CAC BANG QUAN TRONG TRONG BACKUP ===" -ForegroundColor Cyan
foreach ($t in $tables) {
    $insertCount = ([regex]::Matches($content, "INSERT INTO ``$t``")).Count
    $hasStructure = $content.Contains("Table structure for table ``$t``")
    $status = if ($hasStructure) { "OK" } else { "MISSING" }
    Write-Host "  $t | Structure: $status | INSERT rows: $insertCount"
}

Write-Host ""
Write-Host "=== DANH SACH FILE BACKUP ===" -ForegroundColor Cyan
Get-ChildItem "d:\ViralWindow_Phan_Mem_Nhom_Kinh\backups" -Filter "*.sql" | 
    Sort-Object LastWriteTime -Descending |
    ForEach-Object { 
        $sizeMB = [math]::Round($_.Length/1KB, 0)
        Write-Host "  $($_.Name) | $sizeMB KB | $($_.LastWriteTime.ToString('dd/MM/yyyy HH:mm'))"
    }

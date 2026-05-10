$src = "d:\ViralWindow_Phan_Mem_Nhom_Kinh"
$dest = "d:\ViralWindow_Github"

Write-Host "Creating destination folder..."
New-Item -ItemType Directory -Force -Path $dest | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\backend" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\database" | Out-Null

Write-Host "Copying Frontend..."
Copy-Item -Path "$src\FontEnd" -Destination "$dest\frontend" -Recurse -Force

Write-Host "Copying Backend selected folders..."
$folders = @("ai-brain", "assets", "config", "controllers", "data", "helpers", "middleware", "migrations", "routes", "scripts", "services", "sql", "templates", "uploads", "public")
foreach ($folder in $folders) {
    if (Test-Path "$src\backend\$folder") {
        Copy-Item -Path "$src\backend\$folder" -Destination "$dest\backend\$folder" -Recurse -Force
    }
}

Write-Host "Copying Backend core files..."
$files = @("server.js", "package.json", "package-lock.json")
foreach ($file in $files) {
    if (Test-Path "$src\backend\$file") {
        Copy-Item -Path "$src\backend\$file" -Destination "$dest\backend\$file" -Force
    }
}

Write-Host "Copying Database..."
if (Test-Path "$src\viral_window_db (1).sql") {
    Copy-Item -Path "$src\viral_window_db (1).sql" -Destination "$dest\database\viralwindow_schema.sql" -Force
}

Write-Host "Export completed."

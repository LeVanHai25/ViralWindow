@echo off
title ViralWindow Auto-Sync Daemon
color 0A
echo.
echo  =====================================================
echo   VIRALWINDOW AUTO-SYNC: Local MySQL ^<-^> TiDB Cloud
echo  =====================================================
echo.
echo  Daemon dang chay - dong bo moi 30 phut
echo  Nhan Ctrl+C de dung
echo.

cd /d "D:\ViralWindow_Phan_Mem_Nhom_Kinh"
node backend/auto_sync_tidb.js

echo.
echo  Daemon da dung!
pause
